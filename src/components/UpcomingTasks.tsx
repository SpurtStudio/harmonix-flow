import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  sphere: string;
  urgent: boolean;
}

const upcomingTasks: UpcomingTask[] = [
  {
    id: '1',
    title: 'Встреча с командой',
    dueDate: 'Сегодня',
    dueTime: '14:00',
    sphere: 'work',
    urgent: true
  },
  {
    id: '2',
    title: 'Медитация',
    dueDate: 'Сегодня',
    dueTime: '19:00',
    sphere: 'spirit',
    urgent: false
  },
  {
    id: '3',
    title: 'Планирование бюджета',
    dueDate: 'Завтра',
    dueTime: '10:00',
    sphere: 'finance',
    urgent: false
  },
  {
    id: '4',
    title: 'Тренировка в зале',
    dueDate: 'Завтра',
    dueTime: '18:30',
    sphere: 'health',
    urgent: false
  }
];

export const UpcomingTasks: React.FC = () => {
  return (
    <div className="space-y-3">
      {upcomingTasks.map((task) => (
        <Button
          key={task.id}
          variant="ghost"
          className={`w-full justify-start p-3 h-auto glass hover:glass-hover ${
            task.urgent ? 'ring-2 ring-harmony-work/30' : ''
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2 rounded-lg sphere-${task.sphere}`}>
              {task.urgent ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {task.title}
                </span>
                {task.urgent && (
                  <span className="text-xs px-2 py-1 bg-harmony-work/20 text-harmony-work rounded-full">
                    Срочно
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{task.dueDate}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{task.dueTime}</span>
              </div>
            </div>
            
            <CheckCircle2 className="w-5 h-5 text-muted-foreground hover:text-harmony-health transition-colors" />
          </div>
        </Button>
      ))}
      
      <Button variant="outline" className="w-full glass hover:glass-hover">
        <Calendar className="w-4 h-4 mr-2" />
        Открыть календарь
      </Button>
    </div>
  );
};