import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export interface ProductivityData {
  day: string;
  value: number;
}

export interface ProductivityStats {
  urgentImportant: number;
  notUrgentImportant: number;
  urgentNotImportant: number;
  notUrgentNotImportant: number;
  bySphere: Record<string, number>;
  byDay: { day: string; value: number }[];
  energyLevel: number;
  goalCompletion: number;
  deepWorkHours: number;
  growthPercentage: number;
  focusOnImportantTasks: number;
  planningRecommendation: string;
}

export const useProductivityData = () => {
  const [data, setData] = useState<ProductivityStats>({
    urgentImportant: 0,
    notUrgentImportant: 0,
    urgentNotImportant: 0,
    notUrgentNotImportant: 0,
    bySphere: {},
    byDay: [],
    energyLevel: 0,
    goalCompletion: 0,
    deepWorkHours: 0,
    growthPercentage: 0,
    focusOnImportantTasks: 0,
    planningRecommendation: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductivityData = async () => {
      try {
        setLoading(true);
        // Получаем задачи за последнюю неделю
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const tasks = await db.getAllTasks();
        const completedTasks = tasks.filter(task =>
          task.status === 'completed' &&
          task.dueDate &&
          new Date(task.dueDate) >= oneWeekAgo
        );
        
        // Подсчитываем задачи по матрице Эйзенхауэра
        const urgentImportant = completedTasks.filter(task => task.priority === 'Urgent-Important').length;
        const notUrgentImportant = completedTasks.filter(task => task.priority === 'NotUrgent-Important').length;
        const urgentNotImportant = completedTasks.filter(task => task.priority === 'Urgent-NotImportant').length;
        const notUrgentNotImportant = completedTasks.filter(task => task.priority === 'NotUrgent-NotImportant').length;
        
        // Группируем задачи по сферам жизни
        const bySphere: Record<string, number> = {};
        completedTasks.forEach(task => {
          if (task.category) {
            bySphere[task.category] = (bySphere[task.category] || 0) + 1;
          }
        });
        
        // Группируем задачи по дням недели
        const productivityByDay: Record<string, { completed: number; total: number }> = {};
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        // Инициализируем все дни
        days.forEach(day => {
          productivityByDay[day] = { completed: 0, total: 0 };
        });
        
        // Подсчитываем выполненные и общие задачи по дням
        completedTasks.forEach(task => {
          if (task.dueDate) {
            const dayIndex = new Date(task.dueDate).getDay();
            const day = days[dayIndex];
            productivityByDay[day].completed += 1;
            productivityByDay[day].total += 1;
          }
        });
        
        // Вычисляем процент выполнения для каждого дня
        const byDay: ProductivityData[] = days.map(day => ({
          day,
          value: productivityByDay[day].total > 0
            ? Math.round((productivityByDay[day].completed / productivityByDay[day].total) * 100)
            : 0
        }));
        
        // Вычисляем дополнительные метрики
        // В реальной реализации эти значения будут вычисляться на основе данных из базы
        const energyLevel = Math.min(10, Math.round((completedTasks.length / 5) * 10) / 10);
        const goalCompletion = Math.min(100, Math.round((completedTasks.length / 10) * 100));
        const deepWorkHours = Math.min(12, Math.round(completedTasks.length / 2 * 10) / 10);
        const growthPercentage = Math.min(100, Math.round((completedTasks.length / 8) * 100));
        const focusOnImportantTasks = Math.min(100, Math.round(((urgentImportant + notUrgentImportant) / Math.max(1, completedTasks.length)) * 100));
        const planningRecommendation = focusOnImportantTasks > 70
          ? "Отличный фокус на важных задачах! Продолжайте в том же духе."
          : "Рекомендуется увеличить фокус на важных задачах. Попробуйте выделить больше времени для стратегического планирования.";
        
        setData({
          urgentImportant,
          notUrgentImportant,
          urgentNotImportant,
          notUrgentNotImportant,
          bySphere,
          byDay,
          energyLevel,
          goalCompletion,
          deepWorkHours,
          growthPercentage,
          focusOnImportantTasks,
          planningRecommendation
        });
      } catch (err) {
        setError('Ошибка при получении данных о продуктивности');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductivityData();
  }, []);

  return { data, loading, error };
};