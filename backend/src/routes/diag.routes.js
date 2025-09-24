import { Router } from "express";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const r = Router();
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION || "us-east-1";
const s3 = new S3Client({ region: REGION });

r.get("/sign-check", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: "key required" });
  try {
    const out = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    console.debug("[diag:head]", {
      key,
      contentType: out.ContentType,
      sse: out.ServerSideEncryption,
      sseKmsKeyId: out.SSEKMSKeyId ? "***kms-key-present***" : null
    });
    res.json({ ok: true, contentType: out.ContentType, sse: out.ServerSideEncryption, hasKmsKey: !!out.SSEKMSKeyId });
  } catch (e) {
    console.error("[diag:head:error]", { key, code: e?.name, message: e?.message });
    res.status(500).json({ ok: false, code: e?.name, message: e?.message });
  }
});

export default r;


