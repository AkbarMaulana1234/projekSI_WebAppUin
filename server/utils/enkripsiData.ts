import crypto from "crypto-ts";

const config = useRuntimeConfig();

export function createEnkripsi(data: string): string {
  if (!data) return "";
  const encryptedText = crypto.AES.encrypt(data, config.EnrkripsiKey);
  return encryptedText.toString();
}

export function showDekripsi(encryptedData: string): string {
  if (!encryptedData) return "";
  try {
    const bytes = crypto.AES.decrypt(encryptedData, config.EnrkripsiKey);
    const originalText = bytes.toString(crypto.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error("Gagal melakukan dekripsi data", error);
    return "";
  }
}
