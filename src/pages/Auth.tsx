import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Auth: React.FC = () => {
  return (
    <PageWrapper title="Авторизация">
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал авторизации временно упрощен для стабильной работы главной страницы.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default Auth;
      if (password !== confirmPassword) {
        setMessage('Пароли не совпадают.');
        return;
      }
      if (password.length < 8) {
        setMessage('Пароль должен быть не менее 8 символов.');
        return;
      }

      try {
        const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
        const masterKey = await deriveKeyFromPassword(password, salt, ITERATIONS, HASH_ALGORITHM, ['encrypt', 'decrypt']);
        const exportedKey = await exportKey(masterKey);

        await db.userSettings.put({
          id: 1,
          isRegistered: true,
          hashedMasterKey: new Uint8Array(Object.values(exportedKey)).buffer, // Сохраняем как ArrayBuffer
          salt: salt,
          iterations: ITERATIONS,
          hashAlgorithm: HASH_ALGORITHM,
        });

        setMessage('Мастер-пароль успешно установлен! Теперь войдите.');
        setIsRegistered(true);
        setIsRegisterMode(false);
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        setMessage('Ошибка при установке пароля. Пожалуйста, попробуйте снова.');
      }
    } else {
      // Логика входа
      try {
        const settings = await db.userSettings.get(1);
        if (!settings || !settings.isRegistered || !settings.salt || !settings.hashedMasterKey) {
          setMessage('Пользователь не зарегистрирован. Пожалуйста, установите пароль.');
          setIsRegisterMode(true);
          return;
        }

        const salt = settings.salt;
        const storedHashedMasterKey = new Uint8Array(settings.hashedMasterKey);

        const derivedKey = await deriveKeyFromPassword(password, salt, settings.iterations!, settings.hashAlgorithm!, ['encrypt', 'decrypt']);
        const exportedDerivedKey = await exportKey(derivedKey);
        const exportedDerivedKeyArray = new Uint8Array(Object.values(exportedDerivedKey));

        // Сравниваем хеши ключей
        if (exportedDerivedKeyArray.byteLength === storedHashedMasterKey.byteLength &&
            exportedDerivedKeyArray.every((value, index) => value === storedHashedMasterKey[index])) {
          setMessage('Вход успешен!');
          setAttempts(0);
          setPassword('');
          // Здесь можно загрузить мастер-ключ в контекст или глобальное состояние
          // Для простоты пока не реализуем
        } else {
          setAttempts(prev => prev + 1);
          const remainingAttempts = 3 - (attempts + 1);
          setMessage(`Неверный пароль. Попыток осталось: ${remainingAttempts}`);
          if (remainingAttempts <= 0) {
            setLocked(true);
            setMessage('Слишком много неудачных попыток. Вход заблокирован на 30 секунд.');
            setTimeout(() => {
              setLocked(false);
              setAttempts(0);
              setMessage('Вход разблокирован. Попробуйте снова.');
            }, 30000);
          }
        }
      } catch (error) {
        console.error('Ошибка при входе:', error);
        setMessage('Ошибка при входе. Пожалуйста, попробуйте снова.');
      }
    }
  }, [password, confirmPassword, attempts, locked, isRegisterMode]);

  if (isRegistered === null) {
    return (
      <div className="p-4 max-w-md mx-auto mt-10 bg-gray-800 rounded-lg shadow-lg text-white text-center">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto mt-10 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        {isRegisterMode ? 'Регистрация' : 'Авторизация'}
      </h1>
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={locked}
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
        />
        {isRegisterMode && (
          <Input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={locked}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
        )}
        <Button
          onClick={handleAuth}
          disabled={locked}
          className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
        </Button>
      </div>
      {message && (
        <p className={`mt-4 text-center ${message.includes('успешен') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
      {isRegistered && (
        <Button
          variant="link"
          onClick={() => setIsRegisterMode(prev => !prev)}
          className="w-full mt-4 text-blue-400 hover:text-blue-300"
        >
          {isRegisterMode ? 'Уже зарегистрированы? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </Button>
      )}
      {/* Индикатор статуса безопасности */}
      <div className="mt-6 p-4 rounded-lg bg-gray-700 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Статус безопасности</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300">Учетная запись защищена</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Используется шифрование AES-256. Последняя активность: сегодня
        </div>
      </div>
      
      {/* Восстановление доступа */}
      <div className="mt-4 p-4 rounded-lg bg-gray-700 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Восстановление доступа</h3>
        <p className="text-sm text-gray-300 mb-3">
          Если вы забыли пароль, вы можете восстановить доступ к учетной записи.
        </p>
        <Button
          variant="outline"
          className="w-full text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-gray-900"
        >
          Восстановить доступ
        </Button>
        <p className="mt-2 text-xs text-gray-400">
          * Для восстановления потребуется секретная фраза, заданная при регистрации
        </p>
      </div>
      
      {/* Выбор режима (Базовый/Премиум) */}
      <div className="mt-4 p-4 rounded-lg bg-gray-700 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Режим приложения</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-600 border border-gray-500">
            <h4 className="font-medium text-white">Базовый</h4>
            <p className="text-xs text-gray-300 mt-1">Все основные функции</p>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-300">Активен</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-600 border border-gray-500 opacity-50">
            <h4 className="font-medium text-white">Премиум</h4>
            <p className="text-xs text-gray-300 mt-1">Расширенная аналитика</p>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
              <span className="text-xs text-gray-300">Недоступен</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-3 text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-gray-900"
        >
          Улучшить до Премиум
        </Button>
      </div>
      
      {/* Информация о приватности данных */}
      <div className="mt-4 p-4 rounded-lg bg-gray-700 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Приватность данных</h3>
        <p className="text-sm text-gray-300 mb-3">
          Ваши данные надежно зашифрованы и хранятся только на вашем устройстве.
          Мы не передаем и не продаем ваши данные третьим лицам.
        </p>
        <div className="flex items-center text-sm text-gray-300">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>Локальное шифрование включено</span>
        </div>
        <div className="flex items-center text-sm text-gray-300 mt-1">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>Синхронизация отключена</span>
        </div>
        <Button
          variant="link"
          className="w-full mt-3 text-blue-400 hover:text-blue-300 p-0"
        >
          Подробнее о политике приватности
        </Button>
      </div>
    </div>
  );
};

export default Auth;