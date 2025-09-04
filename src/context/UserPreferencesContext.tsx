import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { encryptData, decryptData, generateKey, exportKey, importKey } from '../lib/crypto';

interface UserPreferencesContextType {
  isBeginnerMode: boolean;
  toggleBeginnerMode: () => void;
  isLowMood: boolean;
  setLowMood: (mood: boolean) => void;
  isPowerSavingMode: boolean;
  togglePowerSavingMode: () => void;
  hideAnxietyElements: boolean;
  toggleHideAnxietyElements: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isBeginnerMode, setIsBeginnerMode] = useState<boolean>(true);
  const [isLowMood, setIsLowMood] = useState<boolean>(false);
  const [isPowerSavingMode, setIsPowerSavingMode] = useState<boolean>(false);
  const [hideAnxietyElements, setHideAnxietyElements] = useState<boolean>(false);

  // Инициализация состояний из localStorage при монтировании компонента (для обратной совместимости)
  useEffect(() => {
    // Если ключ шифрования еще не инициализирован, загружаем данные в открытом виде
    if (!cryptoKey) {
      const savedBeginnerMode = localStorage.getItem('isBeginnerMode');
      if (savedBeginnerMode) {
        try {
          setIsBeginnerMode(JSON.parse(savedBeginnerMode));
        } catch (e) {
          // Если не удалось распарсить, оставляем значение по умолчанию
        }
      }
      
      const savedLowMood = localStorage.getItem('isLowMood');
      if (savedLowMood) {
        try {
          setIsLowMood(JSON.parse(savedLowMood));
        } catch (e) {
          // Если не удалось распарсить, оставляем значение по умолчанию
        }
      }
      
      const savedPowerSavingMode = localStorage.getItem('isPowerSavingMode');
      if (savedPowerSavingMode) {
        try {
          setIsPowerSavingMode(JSON.parse(savedPowerSavingMode));
        } catch (e) {
          // Если не удалось распарсить, оставляем значение по умолчанию
        }
      }
      
      const savedHideAnxietyElements = localStorage.getItem('hideAnxietyElements');
      if (savedHideAnxietyElements) {
        try {
          setHideAnxietyElements(JSON.parse(savedHideAnxietyElements));
        } catch (e) {
          // Если не удалось распарсить, оставляем значение по умолчанию
        }
      }
    }
  }, [cryptoKey]);

  // Инициализация криптографического ключа
  useEffect(() => {
    const initializeCryptoKey = async () => {
      try {
        // Попытка загрузить существующий ключ
        const savedKey = localStorage.getItem('userPreferencesKey');
        if (savedKey) {
          const keyData = JSON.parse(savedKey);
          const importedKey = await importKey(keyData);
          setCryptoKey(importedKey);
        } else {
          // Генерация нового ключа, если его нет
          const newKey = await generateKey();
          const exportedKey = await exportKey(newKey);
          localStorage.setItem('userPreferencesKey', JSON.stringify(exportedKey));
          setCryptoKey(newKey);
        }
      } catch (error) {
        console.error('Ошибка при инициализации криптографического ключа:', error);
        // В случае ошибки генерируем новый ключ
        const newKey = await generateKey();
        const exportedKey = await exportKey(newKey);
        localStorage.setItem('userPreferencesKey', JSON.stringify(exportedKey));
        setCryptoKey(newKey);
      }
    };

    initializeCryptoKey();
  }, []);

  // Загрузка зашифрованных данных при инициализации ключа
  useEffect(() => {
    const loadEncryptedData = async () => {
      if (cryptoKey) {
        const loadedBeginnerMode = await decryptStored('isBeginnerMode');
        if (loadedBeginnerMode !== null) setIsBeginnerMode(loadedBeginnerMode);
        
        const loadedLowMood = await decryptStored('isLowMood');
        if (loadedLowMood !== null) setIsLowMood(loadedLowMood);
        
        const loadedPowerSavingMode = await decryptStored('isPowerSavingMode');
        if (loadedPowerSavingMode !== null) setIsPowerSavingMode(loadedPowerSavingMode);
        
        const loadedHideAnxietyElements = await decryptStored('hideAnxietyElements');
        if (loadedHideAnxietyElements !== null) setHideAnxietyElements(loadedHideAnxietyElements);
      }
    };
    
    loadEncryptedData();
  }, [cryptoKey]);
  // Вспомогательные функции для шифрования/дешифрования
  const encryptAndStore = async (key: string, value: any) => {
    if (cryptoKey) {
      try {
        const stringValue = JSON.stringify(value);
        const encrypted = await encryptData(stringValue);
        const encryptedString = JSON.stringify(encrypted);
        localStorage.setItem(key, encryptedString);
      } catch (error) {
        console.error(`Ошибка при шифровании и сохранении ${key}:`, error);
      }
    } else {
      // Если ключ еще не готов, сохраняем в открытом виде
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const decryptStored = async (key: string) => {
    if (cryptoKey) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Проверяем, зашифрованы ли данные
          if (typeof parsed === 'string') {
            const decrypted = await decryptData(parsed);
            return JSON.parse(decrypted);
          } else {
            // Данные не зашифрованы (для обратной совместимости)
            return parsed;
          }
        }
      } catch (error) {
        console.error(`Ошибка при загрузке и дешифровании ${key}:`, error);
        // В случае ошибки пытаемся загрузить в открытом виде
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      }
    }
    // Если ключ еще не готов, пытаемся загрузить в открытом виде
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  };

  useEffect(() => {
    encryptAndStore('isBeginnerMode', isBeginnerMode);
  }, [isBeginnerMode]);

  useEffect(() => {
    encryptAndStore('isLowMood', isLowMood);
  }, [isLowMood]);

  useEffect(() => {
    encryptAndStore('isPowerSavingMode', isPowerSavingMode);
  }, [isPowerSavingMode]);

  useEffect(() => {
    encryptAndStore('hideAnxietyElements', hideAnxietyElements);
  }, [hideAnxietyElements]);

  const toggleBeginnerMode = () => {
    setIsBeginnerMode(prevMode => !prevMode);
  };

  const setLowMood = (mood: boolean) => {
    setIsLowMood(mood);
  };

  const togglePowerSavingMode = () => {
    setIsPowerSavingMode(prevMode => !prevMode);
  };

  const toggleHideAnxietyElements = () => {
    setHideAnxietyElements(prevMode => !prevMode);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        isBeginnerMode,
        toggleBeginnerMode,
        isLowMood,
        setLowMood,
        isPowerSavingMode,
        togglePowerSavingMode,
        hideAnxietyElements,
        toggleHideAnxietyElements,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};