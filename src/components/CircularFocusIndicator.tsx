import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface FocusTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  sphere: string;
  angle: number;
}

const focusTasks: FocusTask[] = [
  { id: '1', title: 'Презентация', completed: false, priority: 'high', sphere: 'work', angle: 0 },
  { id: '2', title: 'Пробежка', completed: true, priority: 'high', sphere: 'health', angle: 60 },
  { id: '3', title: 'Звонок родителям', completed: false, priority: 'medium', sphere: 'relationships', angle: 120 },
  { id: '4', title: 'Чтение', completed: false, priority: 'low', sphere: 'development', angle: 180 },
  { id: '5', title: 'Медитация', completed: false, priority: 'medium', sphere: 'spirituality', angle: 240 },
  { id: '6', title: 'Планирование', completed: false, priority: 'low', sphere: 'finance', angle: 300 }
];

const CircularFocusIndicator: React.FC = () => {
  const completedTasks = focusTasks.filter(task => task.completed).length;
  const totalTasks = focusTasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  const centerRadius = 80;
  const taskRadius = 120;
  const taskSize = 40;

  const getTaskPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const x = centerRadius + taskRadius * Math.cos(radian);
    const y = centerRadius + taskRadius * Math.sin(radian);
    return { x: x - taskSize / 2, y: y - taskSize / 2 };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500';
      default: return 'bg-blue-500/20 border-blue-500';
    }
  };

  return (
    <div className="relative w-full flex justify-center items-center min-h-[320px]">
      <svg width="320" height="320" className="relative">
        {/* Прогресс кольцо */}
        <circle
          cx={centerRadius}
          cy={centerRadius}
          r="50"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          className="opacity-20"
        />
        
        <circle
          cx={centerRadius}
          cy={centerRadius}
          r="50"
          fill="none"
          stroke="hsl(var(--harmony-health))"
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 50}`}
          strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
          className="transition-all duration-500 ease-out"
          transform={`rotate(-90 ${centerRadius} ${centerRadius})`}
        />

        {/* Центральный индикатор прогресса */}
        <circle
          cx={centerRadius}
          cy={centerRadius}
          r="35"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        
        <text
          x={centerRadius}
          y={centerRadius - 5}
          textAnchor="middle"
          className="text-lg font-space font-bold fill-foreground"
        >
          {progressPercentage}%
        </text>
        
        <text
          x={centerRadius}
          y={centerRadius + 10}
          textAnchor="middle"
          className="text-xs fill-muted-foreground"
        >
          {completedTasks}/{totalTasks}
        </text>
      </svg>

      {/* Задачи вокруг центра */}
      {focusTasks.map((task) => {
        const position = getTaskPosition(task.angle);
        return (
          <Button
            key={task.id}
            variant="ghost"
            size="icon"
            className={`absolute w-10 h-10 rounded-full glass hover:glass-hover border-2 transition-all duration-300 transform hover:scale-110 ${getPriorityColor(task.priority)}`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            title={task.title}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-harmony-health" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default CircularFocusIndicator;