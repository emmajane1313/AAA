import { NextResponse } from "next/server";
import forge from "node-forge";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 12;

export async function POST(req: Request) {
  try {
    const { encryptedPrivateKey } = await req.json();

    const privateKey = forge.pki.privateKeyFromPem(
      (global as any).privateKeyPem
    );
    const decryptedPrivateKey = privateKey.decrypt(
      forge.util.decode64(encryptedPrivateKey),
      "RSA-OAEP"
    );

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(decryptedPrivateKey, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag();

    return NextResponse.json({
      encryptionDetails: JSON.stringify({
        encrypted: encrypted,
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64"),
      }),
    });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
