import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { db, Notification } from '../lib/db'; // Импорт db и интерфейса Notification

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotificationTitle, setNewNotificationTitle] = useState('');
  const [newNotificationDescription, setNewNotificationDescription] = useState('');
  const [newNotificationType, setNewNotificationType] = useState('system_message'); // Заглушка для типа

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const loadedNotifications = await db.notifications.orderBy('timestamp').reverse().toArray();
        setNotifications(loadedNotifications);
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    };
    loadNotifications();
  }, []);

  const handleAddNotification = useCallback(async () => {
    if (!newNotificationTitle.trim() || !newNotificationDescription.trim()) {
      alert('Заголовок и описание уведомления не могут быть пустыми.');
      return;
    }
    try {
      await db.notifications.add({
        title: newNotificationTitle,
        description: newNotificationDescription,
        timestamp: new Date(),
        read: false,
        type: newNotificationType,
      });
      setNewNotificationTitle('');
      setNewNotificationDescription('');
      setNewNotificationType('system_message');
      // Перезагружаем уведомления после добавления
      const loadedNotifications = await db.notifications.orderBy('timestamp').reverse().toArray();
      setNotifications(loadedNotifications);
      alert('Уведомление добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении уведомления:', error);
      alert('Ошибка при добавлении уведомления.');
    }
  }, [newNotificationTitle, newNotificationDescription, newNotificationType]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Уведомления и напоминания</h1>

      {/* Добавление нового уведомления (базовая форма) */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить новое уведомление (Заглушка)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Заголовок уведомления"
            value={newNotificationTitle}
            onChange={(e) => setNewNotificationTitle(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Textarea
            placeholder="Описание уведомления"
            value={newNotificationDescription}
            onChange={(e) => setNewNotificationDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 min-h-[80px]"
          />
          <Button onClick={handleAddNotification} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить уведомление
          </Button>
        </CardContent>
      </Card>

      {/* Список уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет уведомлений.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map(notification => (
                <li key={notification.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
                  <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()} - Тип: {notification.type} - Прочитано: {notification.read ? 'Да' : 'Нет'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Заглушки для других функций уведомлений */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Дополнительный функционал уведомлений (Заглушки)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Централизованная система уведомлений.</p>
          <p>Настройки типов уведомлений (планы, задачи, привычки, события).</p>
          <p>Гибкие настройки интервалов и методов доставки.</p>
          <p>Автоматическая привязка к целям и сферам жизни.</p>
          <p>Интеграция с календарем для добавления событий.</p>
          <p>Интеграция с мессенджерами (Telegram, WhatsApp).</p>
          <p>Интеллектуальное управление: ИИ-анализ важности, предложение оптимального времени, фильтрация, автоматическое подавление несвоевременных уведомлений.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;