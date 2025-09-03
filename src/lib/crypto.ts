// Minimal crypto module
export const generateKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string): Promise<string> => {
  return btoa(data);
};

export const decryptData = async (data: string): Promise<string> => {
  return atob(data);
};

export const hashPassword = async (password: string): Promise<string> => {
  return btoa(password);
};

export const exportKey = async (): Promise<string> => {
  return 'mock-key';
};

export const importKey = async (): Promise<CryptoKey> => {
  return await generateKey();
};

export const deriveKeyFromPassword = async (): Promise<CryptoKey> => {
  return await generateKey();
};