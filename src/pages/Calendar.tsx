import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const mockEvents = [
  { id: 1, title: 'Morning Planning', time: '08:00', duration: 30, type: 'planning' },
  { id: 2, title: 'Deep Work Session', time: '09:00', duration: 120, type: 'work' },
  { id: 3, title: 'Team Meeting', time: '14:00', duration: 60, type: 'meeting' },
  { id: 4, title: 'Exercise', time: '18:00', duration: 60, type: 'health' },
];

const eventTypeColors = {
  planning: 'bg-primary/20 text-primary border-primary/30',
  work: 'bg-secondary/20 text-secondary border-secondary/30',
  meeting: 'bg-accent/20 text-accent-foreground border-accent/30',
  health: 'bg-success/20 text-success border-success/30',
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Календарь</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(currentDate)}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Сегодня
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView(viewType)}
                className="rounded-none"
              >
                {viewType === 'day' ? 'День' : viewType === 'week' ? 'Неделя' : 'Месяц'}
              </Button>
            ))}
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать событие
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Schedule */}
        <div className="lg:col-span-3">
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Расписание дня
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {timeSlots.map((time) => {
                const event = mockEvents.find(e => e.time === time);
                return (
                  <div key={time} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                    <div className="w-16 text-sm text-muted-foreground font-mono">
                      {time}
                    </div>
                    <div className="flex-1">
                      {event ? (
                        <div className={`p-3 rounded-lg border ${eventTypeColors[event.type as keyof typeof eventTypeColors]}`}>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm opacity-80">{event.duration} мин</div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border-2 border-dashed border-border/50 text-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                          + Добавить событие
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Add */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle>Быстрое планирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Запланировать задачу
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Заблокировать время
              </Button>
            </CardContent>
          </Card>

          {/* Protected Time Blocks */}
          <Card className="backdrop-blur-xl bg-surface/80 border-primary/20">
            <CardHeader>
              <CardTitle>Защищенное время</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-success/10 border border-success/20">
                <span className="text-sm">Семья</span>
                <Badge variant="secondary" className="text-xs">18:00-20:00</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm">Спорт</span>
                <Badge variant="secondary" className="text-xs">07:00-08:00</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-sm">Отдых</span>
                <Badge variant="secondary" className="text-xs">21:00-22:00</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}