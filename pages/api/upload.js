import s3 from "@/lib/s3Client";
import {
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "200mb", // or your desired limit
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { fileName, fileType, fileContent } = req.body;
    let bucketName = process.env.AWS_S3_BUCKET;

    // Helper to update .env.local file
    function updateEnvFile(key, value) {
      const envPath = ".env.local";
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(
          new RegExp(`${key}=.*`),
          `${key}=${value}`
        );
      } else {
        envContent += `\n${key}=${value}`;
      }
      fs.writeFileSync(envPath, envContent.trim() + "\n");
    }

    // Check if bucket exists, create if missing and persist
    let bucketExists = true;
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (err) {
      // fallback bucket name
      bucketName = "my-s3-gallery";
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
        updateEnvFile("AWS_S3_BUCKET", bucketName);
      } catch (createErr) {
        console.error("Bucket creation error:", createErr);
        return res
          .status(500)
          .json({ message: "Bucket creation failed", error: createErr });
      }
    }

    // Buffer file content (it’s base64 encoded from frontend)
    const buffer = Buffer.from(fileContent, "base64");

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: fileType,
    });

    await s3.send(command);

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
}
