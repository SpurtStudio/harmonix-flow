import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { db, JournalEntry, Habit } from '@/lib/db';

interface EnergyLevelData {
  currentLevel: number;
  basedOn: string; // Основание для расчета (дневник, привычки и т.д.)
  lastUpdated: Date;
}

export const EnergyLevelIndicator: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyLevelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        setLoading(true);
        
        // Получаем последние записи дневника
        const journalEntries = await db.journalEntries.orderBy('timestamp').reverse().limit(5).toArray();
        
        // Получаем привычки, связанные с энергией
        const allHabits = await db.habits.toArray();
        const energyHabits = allHabits.filter(habit => 
          habit.name.toLowerCase().includes('энерг') || 
          habit.name.toLowerCase().includes('сон') ||
          habit.name.toLowerCase().includes('медитаци') ||
          habit.name.toLowerCase().includes('физич') ||
          habit.name.toLowerCase().includes('активност')
        );
        
        // Вычисляем уровень энергии на основе данных дневника
        let energyLevel = 50; // Начальное значение по умолчанию
        let basedOn = 'Недостаточно данных';
        
        if (journalEntries.length > 0) {
          // Средний уровень энергии из последних записей дневника
          const avgPhysicalState = journalEntries.reduce((sum, entry) => sum + entry.physicalState, 0) / journalEntries.length;
          energyLevel = Math.round((avgPhysicalState / 10) * 100); // Преобразуем из шкалы 1-10 в 0-100
          basedOn = 'Ваш дневник и активность';
        } else if (energyHabits.length > 0) {
          // Средний прогресс привычек, связанных с энергией
          const avgHabitProgress = energyHabits.reduce((sum, habit) => sum + (habit.progress || 0), 0) / energyHabits.length;
          energyLevel = Math.round(avgHabitProgress);
          basedOn = 'Ваши привычки здоровья';
        }
        
        setEnergyData({
          currentLevel: energyLevel,
          basedOn,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Ошибка при получении данных об уровне энергии:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Состояние энергии</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Загрузка данных...</p>
        </CardContent>
      </Card>
    );
  }

  if (!energyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Состояние энергии</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  // Определяем цвет индикатора в зависимости от уровня энергии
  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Определяем текстовое описание уровня энергии
  const getEnergyDescription = (level: number) => {
    if (level >= 80) return 'Высокий уровень энергии';
    if (level >= 60) return 'Хороший уровень энергии';
    if (level >= 40) return 'Средний уровень энергии';
    return 'Низкий уровень энергии';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Состояние энергии</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{energyData.currentLevel}%</span>
            <span className="text-sm text-muted-foreground">{getEnergyDescription(energyData.currentLevel)}</span>
          </div>
          <Progress 
            value={energyData.currentLevel} 
            className={`w-full ${getEnergyColor(energyData.currentLevel)}`} 
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Основано на: {energyData.basedOn}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};