import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChangePropagation } from '@/hooks/use-change-propagation';
import { db } from '@/lib/db';

interface RecentChange {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
}

export const ChangePropagationSystem: React.FC = () => {
  const { 
    lastChange, 
    impactAnalysis, 
    isAnalyzing,
    propagateChange,
    applyAdjustments
  } = useChangePropagation();
  
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentChanges = async () => {
      try {
        setLoading(true);
        
        // Получаем последние изменения из различных таблиц
        const recentTasks = await db.tasks.orderBy('id').reverse().limit(3).toArray();
        const recentGoals = await db.globalGoals.orderBy('id').reverse().limit(3).toArray();
        const recentProjects = await db.projects.orderBy('id').reverse().limit(3).toArray();
        
        // Формируем список последних изменений
        const changes: RecentChange[] = [
          ...recentTasks.map(task => ({
            id: task.id as number,
            type: 'task',
            description: `Задача: ${task.name}`,
            timestamp: new Date()
          })),
          ...recentGoals.map(goal => ({
            id: goal.id as number,
            type: 'goal',
            description: `Цель: ${goal.name}`,
            timestamp: new Date()
          })),
          ...recentProjects.map(project => ({
            id: project.id as number,
            type: 'project',
            description: `Проект: ${project.name}`,
            timestamp: new Date()
          }))
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5); // Берем только 5 самых свежих изменений
        
        setRecentChanges(changes);
      } catch (error) {
        console.error('Ошибка при получении последних изменений:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChanges();
  }, []);

  const handleWhatIfMode = () => {
    // В реальной реализации здесь будет логика режима "Что-если"
    alert('Режим "Что-если" активирован. Здесь будет возможность моделировать изменения и их последствия.');
  };

  const handleViewHistory = () => {
    // В реальной реализации здесь будет переход к истории корректировок
    alert('Переход к истории корректировок. Здесь будет отображаться история всех изменений и корректировок.');
  };

  const handleApplyAdjustments = async () => {
    if (impactAnalysis && impactAnalysis.suggestedAdjustments.length > 0) {
      const result = await applyAdjustments(impactAnalysis.suggestedAdjustments);
      if (result.success) {
        alert('Корректировки успешно применены.');
      } else {
        alert('Ошибка при применении корректировок: ' + result.message);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Система оперативных изменений</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Загрузка данных...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardHeader>
          <CardTitle>Система оперативных изменений</CardTitle>
        </CardHeader>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Индикаторы недавних изменений */}
        <div>
          <h3 className="text-sm font-medium mb-2">Недавние изменения:</h3>
          {recentChanges.length > 0 ? (
            <ul className="space-y-1">
              {recentChanges.map((change) => (
                <li key={change.id} className="text-sm text-gray-600 dark:text-gray-400">
                  {change.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Нет недавних изменений</p>
          )}
        </div>

        {/* Анализ влияния последнего изменения */}
        {lastChange && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
            <h3 className="text-sm font-medium mb-1">Последнее изменение:</h3>
            <p className="text-sm">
              Тип: {lastChange.type}, Сущность ID: {lastChange.entityId}
            </p>
            {isAnalyzing && <p className="text-sm">Анализ влияния...</p>}
          </div>
        )}

        {/* Рекомендации по корректировке */}
        {impactAnalysis && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
            <h3 className="text-sm font-medium mb-1">Рекомендации по корректировке:</h3>
            <ul className="space-y-1">
              {impactAnalysis.suggestedAdjustments.map((adjustment, index) => (
                <li key={index} className="text-sm">{adjustment}</li>
              ))}
            </ul>
            <div className="mt-2 flex space-x-2">
              <Button size="sm" onClick={handleApplyAdjustments}>
                Применить
              </Button>
              <Button size="sm" variant="outline">
                Игнорировать
              </Button>
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleWhatIfMode}>
            Режим "Что-если"
          </Button>
          <Button variant="outline" onClick={handleViewHistory}>
            История корректировок
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};