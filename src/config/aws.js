import dotenv from 'dotenv';
dotenv.config();

export const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
export const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const region = process.env.S3_REGION;
export const Bucket = process.env.S3_BUCKET_NAME;
