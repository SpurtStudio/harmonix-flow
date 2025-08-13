import { useState, useEffect } from 'react';
import { getLifeBalanceRecommendations } from '@/lib/ai';
import { db } from '@/lib/db';

export interface AIInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'positive';
  category: string;
}

export interface AIInsightsData {
  aiInsights: string[];
  lifeBalanceRecommendation: string;
  lifeBalanceRecommendations: string[];
}

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsightsData>({
    aiInsights: [],
    lifeBalanceRecommendation: '',
    lifeBalanceRecommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true);
        
        // Получаем данные о балансе жизни
        const globalGoals = await db.getAllGlobalGoals();
        const lifeSpheres: Record<string, number> = {};
        
        // Подсчитываем прогресс по сферам жизни
        globalGoals.forEach(goal => {
          if (goal.lifeSphere) {
            if (!lifeSpheres[goal.lifeSphere]) {
              lifeSpheres[goal.lifeSphere] = 0;
            }
            lifeSpheres[goal.lifeSphere] += goal.progress;
          }
        });
        
        // Нормализуем значения (среднее по сфере)
        Object.keys(lifeSpheres).forEach(sphere => {
          const goalsInSphere = globalGoals.filter(g => g.lifeSphere === sphere).length;
          if (goalsInSphere > 0) {
            lifeSpheres[sphere] = Math.round(lifeSpheres[sphere] / goalsInSphere);
          }
        });
        
        // Добавляем дополнительные инсайты на основе данных
        const tasks = await db.getAllTasks();
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        // Получаем рекомендации от ИИ
        const recommendation = await getLifeBalanceRecommendations(lifeSpheres);
        
        // Преобразуем рекомендацию в инсайты
        const aiInsightsData: AIInsightsData = {
          aiInsights: [
            recommendation.replace('ИИ-рекомендация: ', '')
          ],
          lifeBalanceRecommendation: recommendation.replace('ИИ-рекомендация: ', ''),
          lifeBalanceRecommendations: [recommendation.replace('ИИ-рекомендация: ', '')]
        };
        
        if (completedTasks.length > 0) {
          aiInsightsData.aiInsights.push(`Вы завершили ${completedTasks.length} задач. Продолжайте в том же духе!`);
        }
        
        setInsights(aiInsightsData);
      } catch (err) {
        setError('Ошибка при получении ИИ-инсайтов');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, []);

  return { insights, loading, error };
};