import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.REACT_APP_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.REACT_APP_R2_BUCKET_NAME;
export const R2_PUBLIC_URL = (process.env.REACT_APP_R2_PUBLIC_URL || "").replace(/\/$/, "");

export async function uploadToR2(key, body) {
    await client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: "image/jpeg",
    }));
    return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(url) {
    if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return;
    const key = url.slice(R2_PUBLIC_URL.length + 1);
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
