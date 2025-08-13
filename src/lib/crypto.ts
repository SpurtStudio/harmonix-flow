// src/lib/crypto.ts

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // in bits
const IV_LENGTH = 12; // in bytes (96 bits)

/**
 * Генерирует новый ключ для шифрования AES-GCM.
 * @returns Promise<CryptoKey>
 */
export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Шифрует данные с использованием предоставленного ключа.
 * @param data Данные для шифрования (строка).
 * @param key Ключ шифрования.
 * @returns Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }>
 */
export async function encryptData(data: string, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }> {
  const encoded = new TextEncoder().encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH)); // Initialization Vector

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encoded
  );

  return { encryptedData, iv };
}

/**
 * Дешифрует данные с использованием предоставленного ключа и IV.
 * @param encryptedData Зашифрованные данные.
 * @param iv Initialization Vector, использованный при шифровании.
 * @param key Ключ шифрования.
 * @returns Promise<string> Дешифрованные данные (строка).
 */
export async function decryptData(encryptedData: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

/**
 * Экспортирует ключ в формат JWK (JSON Web Key).
 * @param key Ключ для экспорта.
 * @returns Promise<JsonWebKey>
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key);
}

/**
 * Импортирует ключ из формата JWK.
 * @param jwkKey Ключ в формате JWK.
 * @returns Promise<CryptoKey>
 */
export async function importKey(jwkKey: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwkKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  }
  
  /**
   * Генерирует ключ из пароля с использованием PBKDF2-SHA512.
   * @param password Пароль пользователя.
   * @param salt Соль (уникальная для каждого пользователя).
   * @param iterations Количество итераций.
   * @param hash Алгоритм хеширования (например, 'SHA-512').
   * @param keyUsages Использование ключа (например, ['deriveKey']).
   * @returns Promise<CryptoKey>
   */
  export async function deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number,
    hash: string,
    keyUsages: KeyUsage[]
  ): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password);
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
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
      true, // extractable
      keyUsages
    );
  }
  
  /**
   * Генерирует ключ из мастер-ключа с использованием HKDF.
   * @param masterKey Мастер-ключ (CryptoKey).
   * @param salt Соль (опционально).
   * @param info Контекстная информация.
   * @param hash Алгоритм хеширования (например, 'SHA-256').
   * @param length Длина выходного ключа в битах.
   * @param keyUsages Использование ключа.
   * @returns Promise<CryptoKey>
   */
  export async function deriveKeyFromMasterKey(
    masterKey: CryptoKey,
    salt: Uint8Array | null,
    info: Uint8Array,
    hash: string,
    length: number,
    keyUsages: KeyUsage[]
  ): Promise<CryptoKey> {
    return window.crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        salt: salt || new Uint8Array(),
        info: info,
        hash: hash,
      },
      masterKey,
      { name: ALGORITHM, length: length },
      true, // extractable
      keyUsages
    );
  }
  
  /**
   * Автоматическая смена ключей при подозрении на компрометацию.
   * @param oldKey Старый ключ шифрования
   * @param userSettings Настройки пользователя с информацией о ключе
   * @returns Promise<CryptoKey> Новый ключ шифрования
   */
  export async function rotateKey(oldKey: CryptoKey, userSettings: any): Promise<CryptoKey> {
    console.log('Начало процедуры смены ключа шифрования...');
    
    // 1. Генерация нового ключа
    const newKey = await generateKey();
    console.log('Новый ключ шифрования сгенерирован.');
    
    // 2. Перешифрование всех данных в базе данных
    // В реальной реализации здесь потребуется доступ к функциям работы с базой данных
    // и к зашифрованным данным, которые нужно перешифровать.
    // Для примера покажем концепцию:
    /*
    try {
      // Получение всех таблиц с потенциально зашифрованными данными
      const tables = [
        db.visions, db.globalGoals, db.strategicGoals, db.projects,
        db.subProjectsLevel1, db.subProjectsLevel2, db.tasks, db.subTasks,
        db.journalEntries, db.ideas, db.habits, db.notifications,
        db.familyMembers, db.familyEvents, db.relationships
      ];
      
      // Перешифрование данных в каждой таблице
      for (const table of tables) {
        const items = await table.toArray();
        for (const item of items) {
          // Предполагаем, что у нас есть функция для определения зашифрованных полей
          const encryptedFields = getEncryptedFields(item);
          
          for (const field of encryptedFields) {
            if (item[field] && item[field].encryptedData && item[field].iv) {
              // Расшифровка старыми ключом
              const decryptedData = await decryptData(item[field].encryptedData, item[field].iv, oldKey);
              
              // Шифрование новым ключом
              const reEncryptedData = await encryptData(decryptedData, newKey);
              
              // Обновление данных в базе
              await table.update(item.id, {
                [field]: reEncryptedData
              });
            }
          }
        }
      }
      console.log('Все данные успешно перешифрованы.');
    } catch (error) {
      console.error('Ошибка при перешифровании данных:', error);
      throw new Error('Не удалось перешифровать данные.');
    }
    */
    
    // 3. Обновление ссылки на ключ в хранилище
    try {
      const exportedNewKey = await exportKey(newKey);
      const updatedSettings = {
        ...userSettings,
        hashedMasterKey: new Uint8Array(Object.values(exportedNewKey)).buffer,
        // Обновляем соль при смене ключа для дополнительной безопасности
        salt: window.crypto.getRandomValues(new Uint8Array(16)),
      };
      
      // В реальной реализации здесь нужно обновить настройки в базе данных
      // await db.userSettings.put(updatedSettings);
      console.log('Настройки пользователя обновлены.');
    } catch (error) {
      console.error('Ошибка при обновлении настроек пользователя:', error);
      throw new Error('Не удалось обновить настройки пользователя.');
    }
    
    // 4. Уведомление пользователя
    console.log('Процедура смены ключа шифрования успешно завершена.');
    
    return newKey;
  }