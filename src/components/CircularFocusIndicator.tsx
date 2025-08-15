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
  
  const centerSize = 100; // Размер центрального индикатора
  const taskSize = Math.round(centerSize / 1.5); // Размер задач в 1.5 раза меньше
  const taskRadius = 140; // Расстояние от центра до задач

  const getTaskPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const x = 180 + taskRadius * Math.cos(radian);
    const y = 180 + taskRadius * Math.sin(radian);
    return { x: x - taskSize / 2, y: y - taskSize / 2 };
  };

  const getPriorityColor = (priority: string, sphere: string) => {
    switch (priority) {
      case 'high': return `bg-red-500/20 border-red-500`;
      case 'medium': return `bg-yellow-500/20 border-yellow-500`;
      default: return `bg-blue-500/20 border-blue-500`;
    }
  };

  const getSphereColor = (sphere: string) => {
    const sphereColors: {[key: string]: string} = {
      work: 'harmony-work',
      health: 'harmony-health',
      relationships: 'harmony-relationships',
      development: 'harmony-growth',
      spirituality: 'harmony-spirit',
      finance: 'harmony-finance'
    };
    return sphereColors[sphere] || 'harmony-work';
  };

  return (
    <div className="relative w-full flex justify-center items-center min-h-[360px]">
      <svg width="360" height="360" className="absolute">
        {/* Фоновый круг прогресса */}
        <circle
          cx="180"
          cy="180"
          r="45"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="6"
          className="opacity-20"
        />
        
        {/* Прогресс кольцо */}
        <circle
          cx="180"
          cy="180"
          r="45"
          fill="none"
          stroke="hsl(var(--harmony-health))"
          strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
          className="transition-all duration-500 ease-out"
          transform="rotate(-90 180 180)"
        />

        {/* Центральный круг прогресса дня */}
        <circle
          cx="180"
          cy="180"
          r={centerSize / 2}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        <text
          x="180"
          y="175"
          textAnchor="middle"
          className="text-2xl font-space font-bold fill-foreground"
        >
          {progressPercentage}%
        </text>
        
        <text
          x="180"
          y="190"
          textAnchor="middle"
          className="text-xs fill-muted-foreground"
        >
          Прогресс дня
        </text>
        
        <text
          x="180"
          y="200"
          textAnchor="middle"
          className="text-xs fill-muted-foreground"
        >
          {completedTasks}/{totalTasks}
        </text>
      </svg>

      {/* Круглые задачи вокруг центрального прогресса */}
      {focusTasks.map((task) => {
        const position = getTaskPosition(task.angle);
        const sphereColor = getSphereColor(task.sphere);
        
        return (
          <Button
            key={task.id}
            variant="ghost"
            className={`absolute rounded-full glass hover:glass-hover transition-all duration-300 transform hover:scale-110 cursor-pointer flex items-center justify-center`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${taskSize}px`,
              height: `${taskSize}px`,
              backgroundColor: task.completed 
                ? `hsl(var(--harmony-health) / 0.2)` 
                : `hsl(var(--${sphereColor}) / 0.1)`,
              border: `2px solid ${task.completed 
                ? `hsl(var(--harmony-health))` 
                : `hsl(var(--${sphereColor}))`}`,
            }}
            title={task.title}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-harmony-health" />
            ) : (
              <Circle className="w-6 h-6" style={{ color: `hsl(var(--${sphereColor}))` }} />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default CircularFocusIndicator;