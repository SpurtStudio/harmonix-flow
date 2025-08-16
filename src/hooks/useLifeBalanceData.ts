import { useState, useEffect } from 'react';
import { db } from '../lib/db';

interface LifeSphere {
  id: string;
  name: string;
  value: number;
}

export const useLifeBalanceData = () => {
  const [lifeSpheres, setLifeSpheres] = useState<LifeSphere[]>([]);
  const [averageBalance, setAverageBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLifeBalanceData = async () => {
      try {
        setLoading(true);
        
        // Получаем глобальные цели
        const globalGoals = await db.getAllGlobalGoals();
        
        // Подсчитываем прогресс по сферам жизни
        const sphereProgress: Record<string, { total: number; count: number }> = {};
        
        globalGoals.forEach(goal => {
          if (goal.lifeSphere) {
            if (!sphereProgress[goal.lifeSphere]) {
              sphereProgress[goal.lifeSphere] = { total: 0, count: 0 };
            }
            sphereProgress[goal.lifeSphere].total += goal.progress;
            sphereProgress[goal.lifeSphere].count += 1;
          }
        });
        
        // Определяем все сферы жизни
        const allSpheres = [
          { id: 'work', name: 'Работа' },
          { id: 'health', name: 'Здоровье' },
          { id: 'relationships', name: 'Отношения' },
          { id: 'growth', name: 'Развитие' },
          { id: 'hobby', name: 'Хобби' },
          { id: 'rest', name: 'Отдых' },
          { id: 'finance', name: 'Финансы' },
          { id: 'spirit', name: 'Духовность' }
        ];
        
        // Обновляем значения сфер жизни
        const updatedSpheres = allSpheres.map(sphere => {
          const progressData = sphereProgress[sphere.id];
          const value = progressData 
            ? Math.round(progressData.total / progressData.count)
            : 0;
            
          return {
            ...sphere,
            value
          };
        });
        
        setLifeSpheres(updatedSpheres);
        
        // Вычисляем средний баланс
        const average = Math.round(
          updatedSpheres.reduce((sum, sphere) => sum + sphere.value, 0) / updatedSpheres.length
        );
        setAverageBalance(average);
      } catch (error) {
        console.error('Ошибка при получении данных баланса жизни:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeBalanceData();
  }, []);

  return {
    lifeSpheres,
    averageBalance,
    loading
  };
};