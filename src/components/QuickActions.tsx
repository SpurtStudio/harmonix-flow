import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  Target, 
  Mic, 
  Camera, 
  Clock 
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      id: 'add-task',
      label: 'Добавить задачу',
      icon: Plus,
      color: 'harmony-work',
      action: () => console.log('Add task')
    },
    {
      id: 'schedule-time',
      label: 'Запланировать время',
      icon: Calendar,
      color: 'harmony-rest',
      action: () => console.log('Schedule time')
    },
    {
      id: 'set-goal',
      label: 'Поставить цель',
      icon: Target,
      color: 'harmony-growth',
      action: () => console.log('Set goal')
    },
    {
      id: 'voice-note',
      label: 'Голосовая запись',
      icon: Mic,
      color: 'harmony-spirit',
      action: () => console.log('Voice note')
    },
    {
      id: 'photo-memory',
      label: 'Фото-память',
      icon: Camera,
      color: 'harmony-hobby',
      action: () => console.log('Photo memory')
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro',
      icon: Clock,
      color: 'harmony-health',
      action: () => console.log('Pomodoro')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Button
            key={action.id}
            variant="ghost"
            onClick={action.action}
            className="h-auto p-3 glass hover:glass-hover flex-col gap-2 transition-all duration-200"
          >
            <div className={`p-2 rounded-lg sphere-${action.color.split('-')[1]}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};