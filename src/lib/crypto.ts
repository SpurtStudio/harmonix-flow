// Упрощенная версия crypto.ts без проблемных типов
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
}

/**
 * Генерирует новый ключ для шифрования AES-GCM.
 */
export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Шифрует данные с использованием предоставленного ключа.
 */
export async function encryptData(data: string, key: CryptoKey): Promise<EncryptionResult> {
  const encoded = new TextEncoder().encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encoded
  );

  return { encryptedData, iv };
}

/**
 * Дешифрует данные с использованием предоставленного ключа и IV.
 */
export async function decryptData(encryptedData: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

/**
 * Экспортирует ключ в формат JWK.
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key);
}

/**
 * Импортирует ключ из формата JWK.
 */
export async function importKey(jwkKey: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwkKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Упрощенная версия генерации ключа из пароля.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000,
  hash: string = 'SHA-256'
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: hash,
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Упрощенная ротация ключей.
 */
export async function rotateKey(oldKey: CryptoKey, userSettings: any): Promise<CryptoKey> {
  console.log('Начало процедуры смены ключа шифрования...');
  const newKey = await generateKey();
  console.log('Новый ключ шифрования сгенерирован.');
  return newKey;
}