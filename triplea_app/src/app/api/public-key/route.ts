import { NextResponse } from "next/server";
import forge from "node-forge";

const rsa = forge.pki.rsa;
const keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
(global as any).privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

export async function GET() {
  return NextResponse.json({ publicKey: publicKeyPem });
}
