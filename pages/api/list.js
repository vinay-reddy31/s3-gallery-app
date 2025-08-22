import s3 from "@/lib/s3Client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
    });

    const data = await s3.send(command);

    const files =
      data.Contents?.map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      })) || [];

    return res.status(200).json({ files });
  } catch (error) {
    console.error("List error:", error);
    return res.status(500).json({ message: "Listing failed", error });
  }
}
