import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_REGION || "us-east-1",
});

const uploadToS3 = async ({ buffer, key }: { buffer: Buffer; key: string }) => {
  try {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME || "some-bucket",
      Key: key,
      Body: buffer,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return true;
  } catch (err) {
    // Reject promise if there's an error
    throw err;
  }
};

const generatePresignedUrl = async ({
  key,
  expiration = 3600, // Expiration time in seconds, default is 1 hour
  bucket = process.env.AWS_BUCKET_NAME || "askair",
}: {
  key: string;
  expiration?: number;
  bucket?: string;
}) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // Generate the presigned URL
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expiration,
    });

    return url;
  } catch (err) {
    throw err; // If there's an error, throw it
  }
};

export const uploadFileAndGetUrl = async ({
  buffer,
  key,
}: {
  buffer: Buffer;
  key: string;
}) => {
  await uploadToS3({ buffer, key });
  return await generatePresignedUrl({ key });
};
