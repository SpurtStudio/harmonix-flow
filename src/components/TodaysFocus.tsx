import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface FocusTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  sphere: string;
  completed: boolean;
}

const todaysTasks: FocusTask[] = [
  {
    id: '1',
    title: 'Завершить презентацию проекта',
    priority: 'high',
    estimatedTime: '2ч',
    sphere: 'work',
    completed: false
  },
  {
    id: '2',
    title: 'Утренняя пробежка',
    priority: 'high',
    estimatedTime: '30м',
    sphere: 'health',
    completed: true
  },
  {
    id: '3',
    title: 'Позвонить родителям',
    priority: 'medium',
    estimatedTime: '20м',
    sphere: 'relationships',
    completed: false
  },
  {
    id: '4',
    title: 'Прочитать главу книги',
    priority: 'low',
    estimatedTime: '45м',
    sphere: 'growth',
    completed: false
  }
];

export const TodaysFocus: React.FC = () => {
  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const totalTasks = todaysTasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'medium':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <Star className="w-3 h-3 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Прогресс дня */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Прогресс дня</span>
          <span className="text-sm text-muted-foreground">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-harmony-health transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {progressPercentage}% выполнено - отличная работа!
        </p>
      </div>

      {/* Список задач */}
      <div className="space-y-3">
        {todaysTasks.map((task) => (
          <Button
            key={task.id}
            variant="ghost"
            className={`w-full justify-start p-3 h-auto glass hover:glass-hover border-l-4 ${getPriorityColor(task.priority)}`}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="mt-0.5">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-harmony-health" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs sphere-${task.sphere}`}>
                  {task.sphere === 'work' && 'Работа'}
                  {task.sphere === 'health' && 'Здоровье'}
                  {task.sphere === 'relationships' && 'Отношения'}
                  {task.sphere === 'growth' && 'Развитие'}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Мотивационное сообщение */}
      <div className="glass p-4 rounded-xl bg-harmony-spirit/5">
        <div className="text-center space-y-2">
          <Star className="w-6 h-6 text-harmony-spirit mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Вы на правильном пути!
          </p>
          <p className="text-xs text-muted-foreground">
            Каждая выполненная задача приближает вас к гармонии
          </p>
        </div>
      </div>
    </div>
  );
};