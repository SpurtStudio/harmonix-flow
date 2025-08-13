import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { db, FamilyEvent, FamilyMember } from '../lib/db';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

// Тип для напоминания
interface Reminder {
  id: number;
  title: string;
  date: Date;
  description?: string;
  type: string;
  familyMemberId?: number;
  familyMemberName?: string;
}

const FamilyReminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: new Date(),
    description: '',
    type: '',
    familyMemberId: undefined as number | undefined
  });

  // Загрузка данных о членах семьи и событиях
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загрузка членов семьи
        const loadedMembers = await db.familyMembers.toArray();
        setFamilyMembers(loadedMembers);
        
        // Загрузка событий
        const loadedEvents = await db.familyEvents.toArray();
        
        // Преобразование событий в напоминания
        const reminderList: Reminder[] = loadedEvents.map(event => {
          const member = loadedMembers.find(m => m.id === event.linkedFamilyMemberIds?.[0]);
          return {
            id: event.id || 0,
            title: event.title,
            date: event.date,
            description: event.description,
            type: event.type,
            familyMemberId: member?.id,
            familyMemberName: member?.name
          };
        });
        
        setReminders(reminderList);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    loadData();
  }, []);

  // Обработчик открытия диалога добавления напоминания
  const handleOpenAddDialog = () => {
    setNewReminder({
      title: '',
      date: new Date(),
      description: '',
      type: '',
      familyMemberId: undefined
    });
    setIsAddDialogOpen(true);
  };

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик выбора даты
  const handleDateChange = (value: string) => {
    setNewReminder(prev => ({ ...prev, date: new Date(value) }));
  };

  // Обработчик выбора типа напоминания
  const handleTypeChange = (value: string) => {
    setNewReminder(prev => ({ ...prev, type: value }));
  };

  // Обработчик выбора члена семьи
  const handleMemberChange = (value: string) => {
    setNewReminder(prev => ({ ...prev, familyMemberId: parseInt(value) || undefined }));
  };

  // Обработчик добавления нового напоминания
  const handleAddReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.type.trim()) {
      alert('Название и тип напоминания не могут быть пустыми.');
      return;
    }
    
    try {
      const eventId = await db.familyEvents.add({
        title: newReminder.title,
        date: newReminder.date,
        description: newReminder.description || undefined,
        type: newReminder.type,
        linkedFamilyMemberIds: newReminder.familyMemberId ? [newReminder.familyMemberId] : undefined
      });
      
      // Обновление списка напоминаний
      const loadedEvents = await db.familyEvents.toArray();
      const loadedMembers = await db.familyMembers.toArray();
      const reminderList: Reminder[] = loadedEvents.map(event => {
        const member = loadedMembers.find(m => m.id === event.linkedFamilyMemberIds?.[0]);
        return {
          id: event.id || 0,
          title: event.title,
          date: event.date,
          description: event.description,
          type: event.type,
          familyMemberId: member?.id,
          familyMemberName: member?.name
        };
      });
      setReminders(reminderList);
      
      // Закрытие диалога
      setIsAddDialogOpen(false);
      
      alert('Напоминание добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении напоминания:', error);
      alert('Ошибка при добавлении напоминания.');
    }
  };

  // Фильтрация напоминаний по категориям
  const todayReminders = reminders.filter(reminder => isToday(reminder.date));
  const tomorrowReminders = reminders.filter(reminder => isTomorrow(reminder.date));
  const upcomingReminders = reminders.filter(reminder => 
    !isToday(reminder.date) && 
    !isTomorrow(reminder.date) && 
    reminder.date > addDays(new Date(), 1) && 
    reminder.date <= addDays(new Date(), 7)
  );
  const futureReminders = reminders.filter(reminder => reminder.date > addDays(new Date(), 7));

  // Рендер списка напоминаний
  const renderReminderList = (title: string, reminderList: Reminder[]) => {
    if (reminderList.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <ul className="space-y-2">
          {reminderList.map(reminder => (
            <li key={reminder.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
              <div className="flex justify-between">
                <h4 className="font-medium">{reminder.title}</h4>
                <span className="text-sm text-gray-400">
                  {format(reminder.date, 'dd.MM.yyyy', { locale: ru })}
                </span>
              </div>
              {reminder.familyMemberName && (
                <p className="text-sm text-gray-400">Для: {reminder.familyMemberName}</p>
              )}
              {reminder.description && (
                <p className="text-sm mt-1">{reminder.description}</p>
              )}
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-500 text-white">
                  {reminder.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Напоминания о важных датах</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>Добавить напоминание</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить напоминание</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                name="title"
                placeholder="Название напоминания"
                value={newReminder.title}
                onChange={handleInputChange}
              />
              <Input
                type="date"
                value={format(newReminder.date, 'yyyy-MM-dd')}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <Select onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип напоминания" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">День рождения</SelectItem>
                  <SelectItem value="anniversary">Годовщина</SelectItem>
                  <SelectItem value="holiday">Праздник</SelectItem>
                  <SelectItem value="meeting">Встреча</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={handleMemberChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите члена семьи (опционально)" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map(member => (
                    <SelectItem key={member.id} value={member.id?.toString() || ''}>
                      {member.name} ({member.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                name="description"
                placeholder="Описание (опционально)"
                value={newReminder.description}
                onChange={handleInputChange}
              />
              <Button onClick={handleAddReminder}>Добавить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
            Пока нет напоминаний. Добавьте первое!
          </p>
        ) : (
          <div>
            {renderReminderList("Сегодня", todayReminders)}
            {renderReminderList("Завтра", tomorrowReminders)}
            {renderReminderList("На этой неделе", upcomingReminders)}
            {renderReminderList("В будущем", futureReminders)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyReminders;