import { NextResponse } from "next/server";
import forge from "node-forge";
import CryptoJS from "crypto-js";

const encryptionKey = process.env.ENCRYPTION_KEY!;

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

    const encryptedPrivateKeyServer = CryptoJS.AES.encrypt(
      decryptedPrivateKey,
      encryptionKey
    ).toString();

    return NextResponse.json({
      encryptedPrivateKey: encryptedPrivateKeyServer,
    });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
