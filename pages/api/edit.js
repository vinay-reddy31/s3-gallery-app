import s3 from "@/lib/s3Client";
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { oldKey, newKey } = req.body;
  if (!oldKey || !newKey) {
    return res.status(400).json({ message: "Missing oldKey or newKey" });
  }

  try {
    // Copy the object to the new key
    await s3.send(
      new CopyObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        CopySource: `${process.env.AWS_S3_BUCKET}/${oldKey}`,
        Key: newKey,
      })
    );
    // Delete the old object
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: oldKey,
      })
    );
    return res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.error("Edit error:", error);
    return res.status(500).json({ message: "Edit failed", error });
  }
}
