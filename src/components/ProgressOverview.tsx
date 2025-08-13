import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3 
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: string;
  sphere: string;
  timeframe: string;
}

const currentGoals: Goal[] = [
  {
    id: '1',
    title: 'Изучение TypeScript',
    progress: 75,
    target: '100%',
    sphere: 'growth',
    timeframe: 'Месяц'
  },
  {
    id: '2',
    title: 'Пробежать 10км',
    progress: 60,
    target: '10км',
    sphere: 'health',
    timeframe: '3 месяца'
  },
  {
    id: '3',
    title: 'Накопить на отпуск',
    progress: 45,
    target: '100 000₽',
    sphere: 'finance',
    timeframe: '6 месяцев'
  },
  {
    id: '4',
    title: 'Выучить испанский',
    progress: 30,
    target: 'B2 уровень',
    sphere: 'growth',
    timeframe: 'Год'
  }
];

import { useUserPreferences } from '@/context/UserPreferencesContext';

export const ProgressOverview = React.memo(() => {
  const { hideAnxietyElements, isPowerSavingMode } = useUserPreferences();

  if (hideAnxietyElements) {
    return null; // Скрываем весь компонент, если включена опция
  }

  const averageProgress = Math.round(
    currentGoals.reduce((sum, goal) => sum + goal.progress, 0) / currentGoals.length
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-harmony-health';
    if (progress >= 60) return 'text-harmony-work';
    if (progress >= 40) return 'text-harmony-growth';
    return 'text-muted-foreground';
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 80) return 'bg-harmony-health';
    if (progress >= 60) return 'bg-harmony-work';
    if (progress >= 40) return 'bg-harmony-growth';
    return 'bg-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Общий прогресс */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-harmony-work" />
          <span className="font-medium text-foreground">Общий прогресс</span>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-foreground">{averageProgress}%</div>
          <div className="text-sm text-muted-foreground">
            Средний прогресс по всем целям
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${isPowerSavingMode ? '' : 'transition-all duration-500 ease-out'} ${getProgressBg(averageProgress)}`}
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Список целей */}
      <div className="space-y-3">
        {currentGoals.map((goal) => (
          <Button
            key={goal.id}
            variant="ghost"
            className="w-full justify-start p-3 h-auto glass hover:glass-hover"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`p-2 rounded-lg sphere-${goal.sphere}`}>
                <Target className="w-4 h-4" />
              </div>
              
              <div className="flex-1 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {goal.title}
                  </span>
                  <span className={`text-sm font-bold ${getProgressColor(goal.progress)}`}>
                    {goal.progress}%
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isPowerSavingMode ? '' : 'transition-all duration-500 ease-out'} ${getProgressBg(goal.progress)}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Цель: {goal.target}</span>
                  <span>{goal.timeframe}</span>
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Достижения */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-5 h-5 text-harmony-spirit" />
          <span className="font-medium text-foreground">Недавние достижения</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-harmony-health"></div>
            <span className="text-muted-foreground">Выполнили 7 дней подряд утренней зарядки</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-harmony-growth"></div>
            <span className="text-muted-foreground">Завершили курс по React</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full glass hover:glass-hover">
        <BarChart3 className="w-4 h-4 mr-2" />
        Подробная аналитика
      </Button>
    </div>
  );
});