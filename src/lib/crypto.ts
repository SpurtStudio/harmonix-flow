// Minimal crypto module
export const generateKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string, key?: CryptoKey, iv?: Uint8Array): Promise<any> => {
  return { encryptedData: btoa(data), iv: new Uint8Array(16) };
};

export const decryptData = async (data: any, iv?: Uint8Array, key?: CryptoKey): Promise<string> => {
  return typeof data === 'string' ? atob(data) : atob(data.toString());
};

export const hashPassword = async (password: string): Promise<string> => {
  return btoa(password);
};

export const exportKey = async (key?: CryptoKey): Promise<string> => {
  return 'mock-key';
};

export const importKey = async (keyData?: any): Promise<CryptoKey> => {
  return await generateKey();
};

export const deriveKeyFromPassword = async (): Promise<CryptoKey> => {
  return await generateKey();
};