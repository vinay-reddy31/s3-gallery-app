import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1", // MinIO ignores region but AWS SDK requires it
  endpoint: process.env.AWS_S3_ENDPOINT,
  forcePathStyle: true, // important for MinIO
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
