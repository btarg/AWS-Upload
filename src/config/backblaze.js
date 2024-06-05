import dotenv from 'dotenv';
dotenv.config();
import { S3Client } from "@aws-sdk/client-s3";

export const accessKeyId = process.env.S3_ACCESS_KEY_ID;
export const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
export const region = process.env.S3_REGION;
export const Bucket = process.env.S3_BUCKET_NAME;
export const b2Client = new S3Client({
    endpoint: `https://s3.${region}.backblazeb2.com`,
    region: region,
    forcePathStyle: true,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    },
})
