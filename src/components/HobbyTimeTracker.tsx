import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hobby } from '@/lib/db';

interface HobbyTimeTrackerProps {
  hobby: Hobby;
  onSave: (hobby: Hobby) => void;
}

export const HobbyTimeTracker: React.FC<HobbyTimeTrackerProps> = ({ hobby, onSave }) => {
  const [minutes, setMinutes] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const stopTracking = () => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 60000);
      setMinutes(prev => prev + elapsed);
      setElapsedTime(0);
      
      // Обновляем историю времени
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updatedHobby = {
        ...hobby,
        timeSpent: (hobby.timeSpent || 0) + elapsed,
        timeSpentHistory: [
          ...(hobby.timeSpentHistory || []).filter(entry => 
            new Date(entry.date).toDateString() !== today.toDateString()
          ),
          {
            date: today,
            minutes: (hobby.timeSpentHistory?.find(entry => 
              new Date(entry.date).toDateString() === today.toDateString()
            )?.minutes || 0) + elapsed
          }
        ],
        lastTrackedDate: new Date()
      };
      
      onSave(updatedHobby);
    }
    setIsTracking(false);
    setStartTime(null);
  };

  const addMinutes = () => {
    if (minutes > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updatedHobby = {
        ...hobby,
        timeSpent: (hobby.timeSpent || 0) + minutes,
        timeSpentHistory: [
          ...(hobby.timeSpentHistory || []).filter(entry => 
            new Date(entry.date).toDateString() !== today.toDateString()
          ),
          {
            date: today,
            minutes: (hobby.timeSpentHistory?.find(entry => 
              new Date(entry.date).toDateString() === today.toDateString()
            )?.minutes || 0) + minutes
          }
        ],
        lastTrackedDate: new Date()
      };
      
      onSave(updatedHobby);
      setMinutes(0);
    }
  };

  // Обновление времени в реальном времени при активном отслеживании
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 60000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  const totalMinutes = (hobby.timeSpent || 0) + (isTracking ? elapsedTime : 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отслеживание времени: {hobby.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold">
          {hours}ч {remainingMinutes}м
        </div>
        
        {isTracking ? (
          <div className="space-y-2">
            <p>Текущий сеанс: {elapsedTime} минут</p>
            <Button onClick={stopTracking} variant="destructive">
              Остановить
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                placeholder="Минуты"
                min="0"
              />
              <Button onClick={addMinutes}>
                Добавить
              </Button>
            </div>
            <Button onClick={startTracking}>
              Начать отслеживание
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};