import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db, HealthIndicator, HealthRecommendation } from '../lib/db';

export const HealthRecommendations: React.FC = () => {
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка показателей здоровья
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
      
      // Загрузка рекомендаций
      const loadedRecommendations = await db.healthRecommendations.orderBy('timestamp').reverse().toArray();
      setRecommendations(loadedRecommendations);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setGenerating(true);
      
      // Анализ данных и генерация рекомендаций
      const newRecommendations: string[] = [];
      
      // Анализ веса
      const weightIndicators = indicators.filter(i => i.name === 'weight');
      if (weightIndicators.length > 1) {
        const recentWeight = weightIndicators[0].value;
        const previousWeight = weightIndicators[1].value;
        const weightChange = recentWeight - previousWeight;
        
        if (Math.abs(weightChange) > 1) {
          if (weightChange > 0) {
            newRecommendations.push(`Вы набрали ${weightChange.toFixed(1)} кг за последнее время. Рассмотрите возможность корректировки рациона питания и увеличения физической активности.`);
          } else {
            newRecommendations.push(`Вы потеряли ${Math.abs(weightChange).toFixed(1)} кг за последнее время. Продолжайте в том же духе, если это было запланировано!`);
          }
        }
      }
      
      // Анализ уровня стресса
      const stressIndicators = indicators.filter(i => i.name === 'stressLevel');
      if (stressIndicators.length > 0) {
        const recentStress = stressIndicators[0].value;
        if (recentStress > 7) {
          newRecommendations.push(`Ваш уровень стресса высок (${recentStress}/10). Рекомендуется практиковать техники релаксации, медитацию или йогу.`);
        } else if (recentStress > 5) {
          newRecommendations.push(`Ваш уровень стресса умеренный (${recentStress}/10). Попробуйте найти время для отдыха и расслабления.`);
        }
      }
      
      // Анализ сна
      const sleepIndicators = indicators.filter(i => i.name === 'sleepHours');
      if (sleepIndicators.length > 0) {
        const recentSleep = sleepIndicators[0].value;
        if (recentSleep < 6) {
          newRecommendations.push(`Вы спите менее 6 часов (${recentSleep} ч). Рекомендуется увеличить продолжительность сна до 7-9 часов для лучшего восстановления.`);
        } else if (recentSleep > 9) {
          newRecommendations.push(`Вы спите более 9 часов (${recentSleep} ч). Возможно, это связано с переутомлением или другими факторами. Следите за качеством сна.`);
        }
      }
      
      // Анализ потребления воды
      const waterIndicators = indicators.filter(i => i.name === 'waterIntake');
      if (waterIndicators.length > 0) {
        const recentWater = waterIndicators[0].value;
        if (recentWater < 1.5) {
          newRecommendations.push(`Вы пьете менее 1.5 литров воды в день (${recentWater} л). Рекомендуется увеличить потребление воды до 2-2.5 литров для лучшего самочувствия.`);
        }
      }
      
      // Анализ физической активности (шаги)
      const stepsIndicators = indicators.filter(i => i.name === 'steps');
      if (stepsIndicators.length > 0) {
        const recentSteps = stepsIndicators[0].value;
        if (recentSteps < 5000) {
          newRecommendations.push(`Вы делаете менее 5000 шагов в день (${recentSteps}). Рекомендуется увеличить физическую активность до 7000-10000 шагов в день.`);
        } else if (recentSteps > 15000) {
          newRecommendations.push(`Вы очень активны (${recentSteps} шагов в день)! Не забывайте о восстановлении и отдыхе.`);
        }
      }
      
      // Если нет показателей для анализа
      if (newRecommendations.length === 0) {
        newRecommendations.push('У вас хорошие показатели здоровья! Продолжайте в том же духе.');
      }
      
      // Сохранение рекомендаций в базе данных
      for (const recommendationText of newRecommendations) {
        const recommendation: Omit<HealthRecommendation, 'id'> = {
          text: recommendationText,
          timestamp: new Date()
        };
        await db.healthRecommendations.add(recommendation);
      }
      
      // Перезагрузка рекомендаций
      const loadedRecommendations = await db.healthRecommendations.orderBy('timestamp').reverse().toArray();
      setRecommendations(loadedRecommendations);
    } catch (error) {
      console.error('Ошибка при генерации рекомендаций:', error);
      alert('Ошибка при генерации рекомендаций');
    } finally {
      setGenerating(false);
    }
  };

  const clearRecommendations = async () => {
    try {
      await db.healthRecommendations.clear();
      setRecommendations([]);
    } catch (error) {
      console.error('Ошибка при очистке рекомендаций:', error);
      alert('Ошибка при очистке рекомендаций');
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка рекомендаций...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рекомендации по здоровью</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={generateRecommendations} disabled={generating}>
            {generating ? 'Генерация...' : 'Сгенерировать рекомендации'}
          </Button>
          <Button variant="outline" onClick={loadData}>
            Обновить
          </Button>
          <Button variant="destructive" onClick={clearRecommendations}>
            Очистить
          </Button>
        </div>
        
        {recommendations.length === 0 ? (
          <p className="text-gray-500">Пока нет рекомендаций. Нажмите "Сгенерировать рекомендации" для анализа ваших данных.</p>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                <p className="text-white">{recommendation.text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(recommendation.timestamp).toLocaleString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};