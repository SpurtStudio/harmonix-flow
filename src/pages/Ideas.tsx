// src/pages/Ideas.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { db, Idea } from '../lib/db'; // Импорт db и интерфейса Idea

const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdeaName, setNewIdeaName] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const loadedIdeas = await db.ideas.toArray();
        setIdeas(loadedIdeas);
      } catch (error) {
        console.error('Ошибка при загрузке идей:', error);
      }
    };
    loadIdeas();
  }, []);

  const handleAddIdea = useCallback(async () => {
    if (!newIdeaName.trim()) {
      alert('Название идеи не может быть пустым.');
      return;
    }
    try {
      await db.ideas.add({
        name: newIdeaName,
        description: newIdeaDescription,
        status: 'active', // Начальный статус
      });
      setNewIdeaName('');
      setNewIdeaDescription('');
      // Перезагружаем идеи после добавления
      const loadedIdeas = await db.ideas.toArray();
      setIdeas(loadedIdeas);
      alert('Идея добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении идеи:', error);
      alert('Ошибка при добавлении идеи.');
    }
  }, [newIdeaName, newIdeaDescription]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Идеи & Инкубатор</h1>

      {/* Быстрый захват идей */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрый захват идеи</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название идеи"
            value={newIdeaName}
            onChange={(e) => setNewIdeaName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Textarea
            placeholder="Описание идеи (опционально)"
            value={newIdeaDescription}
            onChange={(e) => setNewIdeaDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 min-h-[80px]"
          />
          <Button onClick={handleAddIdea} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить идею
          </Button>
        </CardContent>
      </Card>

      {/* Список идей */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши идеи</CardTitle>
        </CardHeader>
        <CardContent>
          {ideas.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет идей. Добавьте первую!</p>
          ) : (
            <ul className="space-y-2">
              {ideas.map(idea => (
                <li key={idea.id} className="p-3 border rounded-md bg-gray-700 border-gray-600">
                  <h3 className="text-lg font-semibold text-white">{idea.name}</h3>
                  <p className="text-sm text-gray-400">{idea.description}</p>
                  <p className="text-xs text-gray-500">Статус: {idea.status}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Заглушки для других функций идей */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Дополнительный функционал идей (Заглушки)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Теги, категории, связь с целями/проектами/задачами.</p>
          <p>Квадрат Декарта для анализа идей (интерактивный шаблон, ИИ-анализ, визуализация, сохранение результатов, интеграция с целями).</p>
          <p>Система "спящие идеи" с напоминаниями.</p>
          <p>Возможность преобразования идей в действия.</p>
          <p>Система оперативных изменений: автоматическая связь идей с текущими изменениями в планах, предложение интеграции идей в скорректированные планы, анализ влияния изменений на приоритетность идей.</p>
          <p>Интеграция с целями, проектами, задачами, дневником.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ideas;