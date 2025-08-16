// src/pages/Hobbies.tsx
import React, { useState, useEffect } from 'react';
import { db, Hobby } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AddHobbyDialog } from '../components/AddHobbyDialog';
import { EditHobbyDialog } from '../components/EditHobbyDialog';
import { HobbyTimeTracker } from '../components/HobbyTimeTracker';
import { HobbyStats } from '../components/HobbyStats';

const Hobbies: React.FC = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [isAddHobbyDialogOpen, setIsAddHobbyDialogOpen] = useState(false);
  const [isEditHobbyDialogOpen, setIsEditHobbyDialogOpen] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [selectedHobbyForTracking, setSelectedHobbyForTracking] = useState<Hobby | null>(null);

  useEffect(() => {
    const loadHobbies = async () => {
      try {
        const loadedHobbies = await db.hobbies.toArray();
        setHobbies(loadedHobbies);
      } catch (error) {
        console.error('Ошибка при загрузке хобби:', error);
      }
    };
    loadHobbies();
  }, []);

  const handleAddHobby = async (hobbyData: {
    name: string;
    description: string;
    category: string;
    goal?: string;
    reminderTime?: string;
    reminderEnabled?: boolean;
  }) => {
    if (!hobbyData.name.trim()) {
      alert('Название хобби не может быть пустым.');
      return;
    }
    try {
      const newHobby: Omit<Hobby, 'id'> = {
        name: hobbyData.name,
        description: hobbyData.description,
        category: hobbyData.category,
        timeSpent: 0,
        timeSpentHistory: [],
        goal: hobbyData.goal,
        goalProgress: 0,
        reminderEnabled: hobbyData.reminderEnabled,
        reminderTime: hobbyData.reminderTime,
      };
      
      await db.hobbies.add(newHobby);
      
      // Перезагружаем хобби после добавления
      const loadedHobbies = await db.hobbies.toArray();
      setHobbies(loadedHobbies);
      alert('Хобби добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении хобби:', error);
      alert('Ошибка при добавлении хобби.');
    }
  };

  const handleEditHobby = (hobby: Hobby) => {
    setSelectedHobby(hobby);
    setIsEditHobbyDialogOpen(true);
  };

  const handleSaveEditedHobby = async (updatedHobby: Hobby) => {
    try {
      await db.hobbies.update(updatedHobby.id!, updatedHobby);
      
      // Обновляем состояние хобби
      const loadedHobbies = await db.hobbies.toArray();
      setHobbies(loadedHobbies);
      setIsEditHobbyDialogOpen(false);
      alert('Хобби обновлено!');
    } catch (error) {
      console.error('Ошибка при обновлении хобби:', error);
      alert('Ошибка при обновлении хобби.');
    }
  };

  const handleDeleteHobby = async (hobbyId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это хобби?')) {
      try {
        await db.hobbies.delete(hobbyId);
        
        // Обновляем состояние хобби
        const loadedHobbies = await db.hobbies.toArray();
        setHobbies(loadedHobbies);
        alert('Хобби удалено!');
      } catch (error) {
        console.error('Ошибка при удалении хобби:', error);
        alert('Ошибка при удалении хобби.');
      }
    }
  };

  const handleSaveHobbyTime = async (updatedHobby: Hobby) => {
    try {
      await db.hobbies.update(updatedHobby.id!, updatedHobby);
      
      // Обновляем состояние хобби
      const loadedHobbies = await db.hobbies.toArray();
      setHobbies(loadedHobbies);
    } catch (error) {
      console.error('Ошибка при обновлении времени хобби:', error);
      alert('Ошибка при обновлении времени хобби.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Хобби</h1>

      {/* Добавление нового хобби */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить новое хобби</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setIsAddHobbyDialogOpen(true)} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить хобби
          </Button>
        </CardContent>
      </Card>

      {/* Список хобби */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши хобби</CardTitle>
        </CardHeader>
        <CardContent>
          {hobbies.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет хобби. Добавьте первое!</p>
          ) : (
            <ul className="space-y-4">
              {hobbies.map(hobby => (
                <li key={hobby.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{hobby.name}</h3>
                      <p className="text-sm text-gray-400">{hobby.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Категория: {hobby.category}</p>
                      {hobby.goal && (
                        <p className="text-xs text-gray-500 mt-1">Цель: {hobby.goal}</p>
                      )}
                      {hobby.reminderEnabled && (
                        <p className="text-xs text-gray-500 mt-1">Напоминание: {hobby.reminderTime}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedHobbyForTracking(hobby)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Отслеживать
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditHobby(hobby)}
                        variant="outline"
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteHobby(hobby.id!)}
                        variant="destructive"
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-300">
                      Всего времени: {Math.floor((hobby.timeSpent || 0) / 60)}ч {(hobby.timeSpent || 0) % 60}м
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Отслеживание времени для выбранного хобби */}
      {selectedHobbyForTracking && (
        <HobbyTimeTracker
          hobby={selectedHobbyForTracking}
          onSave={(updatedHobby) => {
            handleSaveHobbyTime(updatedHobby);
            setSelectedHobbyForTracking(null);
          }}
        />
      )}

      {/* Статистика для выбранного хобби */}
      {selectedHobby && (
        <HobbyStats hobby={selectedHobby} />
      )}

      <AddHobbyDialog
        isOpen={isAddHobbyDialogOpen}
        onClose={() => setIsAddHobbyDialogOpen(false)}
        onSave={handleAddHobby}
      />
      
      <EditHobbyDialog
        hobby={selectedHobby}
        isOpen={isEditHobbyDialogOpen}
        onClose={() => setIsEditHobbyDialogOpen(false)}
        onSave={handleSaveEditedHobby}
      />
    </div>
  );
};

export default Hobbies;