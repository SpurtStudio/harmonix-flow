// src/pages/FamilyFriends.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { db, FamilyMember, FamilyEvent } from '../lib/db'; // Импорт db и интерфейсов
import FamilyTree from '../components/FamilyTree'; // Импорт компонента FamilyTree
import FamilyCalendar from '../components/FamilyCalendar'; // Импорт компонента FamilyCalendar
import FamilyReminders from '../components/FamilyReminders'; // Импорт компонента FamilyReminders

const FamilyFriends: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>([]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState('');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventType, setNewEventType] = useState('');

  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        const loadedMembers = await db.familyMembers.toArray();
        const loadedEvents = await db.familyEvents.toArray();
        setFamilyMembers(loadedMembers);
        setFamilyEvents(loadedEvents);
      } catch (error) {
        console.error('Ошибка при загрузке семейных данных:', error);
      }
    };
    loadFamilyData();
  }, []);

  const handleAddMember = useCallback(async () => {
    if (!newMemberName.trim() || !newMemberRelationship.trim()) {
      alert('Имя и отношение не могут быть пустыми.');
      return;
    }
    try {
      await db.familyMembers.add({
        name: newMemberName,
        relationship: newMemberRelationship,
      });
      setNewMemberName('');
      setNewMemberRelationship('');
      const loadedMembers = await db.familyMembers.toArray();
      setFamilyMembers(loadedMembers);
      alert('Член семьи добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении члена семьи:', error);
      alert('Ошибка при добавлении члена семьи.');
    }
  }, [newMemberName, newMemberRelationship]);

  const handleAddEvent = useCallback(async () => {
    if (!newEventTitle.trim() || !newEventDate.trim() || !newEventType.trim()) {
      alert('Название, дата и тип события не могут быть пустыми.');
      return;
    }
    try {
      await db.familyEvents.add({
        title: newEventTitle,
        date: new Date(newEventDate),
        description: newEventDescription,
        type: newEventType,
      });
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventDescription('');
      setNewEventType('');
      const loadedEvents = await db.familyEvents.toArray();
      setFamilyEvents(loadedEvents);
      alert('Событие добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении события:', error);
      alert('Ошибка при добавлении события.');
    }
  }, [newEventTitle, newEventDate, newEventDescription, newEventType]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Семья/Друзья (Семейный раздел)</h1>

      {/* Добавление нового члена семьи */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить члена семьи/друга</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Имя"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Input
            placeholder="Отношение (например, 'Мать', 'Друг')"
            value={newMemberRelationship}
            onChange={(e) => setNewMemberRelationship(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Button onClick={handleAddMember} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить
          </Button>
        </CardContent>
      </Card>

      {/* Список членов семьи/друзей */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши члены семьи и друзья</CardTitle>
        </CardHeader>
        <CardContent>
          {familyMembers.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Пока никого нет. Добавьте первого!</p>
          ) : (
            <ul className="space-y-2">
              {familyMembers.map(member => (
                <li key={member.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-400">Отношение: {member.relationship}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Добавление нового семейного события */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить семейное событие</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название события"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Input
            placeholder="Тип события (например, 'День рождения', 'Праздник')"
            value={newEventType}
            onChange={(e) => setNewEventType(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Textarea
            placeholder="Описание события (опционально)"
            value={newEventDescription}
            onChange={(e) => setNewEventDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 min-h-[80px]"
          />
          <Button onClick={handleAddEvent} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить событие
          </Button>
        </CardContent>
      </Card>

      {/* Список семейных событий */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши семейные события</CardTitle>
        </CardHeader>
        <CardContent>
          {familyEvents.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Пока нет событий. Добавьте первое!</p>
          ) : (
            <ul className="space-y-2">
              {familyEvents.map(event => (
                <li key={event.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="text-sm text-gray-400">{event.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()} - Тип: {event.type}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Генеалогическое древо */}
      <FamilyTree />

      {/* Семейный календарь */}
      <FamilyCalendar />

      {/* Напоминания о важных датах */}
      <FamilyReminders />
    </div>
  );
};

export default FamilyFriends;