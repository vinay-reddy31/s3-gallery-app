import s3 from "@/lib/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { key } = req.query;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    // Create a temporary signed URL (valid for 60 seconds)
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json({ url });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ message: "Download failed", error });
  }
}
