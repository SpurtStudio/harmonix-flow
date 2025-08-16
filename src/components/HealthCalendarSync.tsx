import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db, Habit, HealthIndicator } from '../lib/db';

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  type: 'health-habit' | 'health-indicator';
  category: string;
}

export const HealthCalendarSync: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка привычек здоровья
      const allHabits = await db.habits.toArray();
      const healthHabits = allHabits.filter(habit => 
        habit.name.toLowerCase().includes('здоровье') || 
        habit.name.toLowerCase().includes('здоровья') ||
        habit.name.toLowerCase().includes('физич') ||
        habit.name.toLowerCase().includes('медитаци') ||
        habit.name.toLowerCase().includes('прогулк') ||
        habit.name.toLowerCase().includes('активност') ||
        habit.name.toLowerCase().includes('питани') ||
        habit.name.toLowerCase().includes('сон') ||
        habit.name.toLowerCase().includes('вода') ||
        habit.name.toLowerCase().includes('упражнен') ||
        habit.name.toLowerCase().includes('тренировк')
      );
      setHabits(healthHabits);
      
      // Загрузка показателей здоровья
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
      
      // Создание событий для календаря
      createCalendarEvents(healthHabits, loadedIndicators);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCalendarEvents = (habits: Habit[], indicators: HealthIndicator[]) => {
    const newEvents: CalendarEvent[] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Воскресенье
    
    // Создаем события привычек здоровья для текущей недели
    habits.forEach(habit => {
      // Для ежедневных привычек создаем события на каждый день недели
      if (habit.frequency === 'daily') {
        for (let i = 0; i < 7; i++) {
          const eventDate = new Date(startOfWeek);
          eventDate.setDate(startOfWeek.getDate() + i);
          
          // Используем время выполнения привычки, если оно задано
          if (habit.completionTime) {
            const [hours, minutes] = habit.completionTime.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);
          } else {
            eventDate.setHours(8, 0, 0, 0); // Устанавливаем время по умолчанию на 8:00
          }
          
          newEvents.push({
            id: `${habit.id!}_day${i}`,
            title: `Привычка здоровья: ${habit.name}`,
            start: eventDate,
            end: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 минут
            type: 'health-habit',
            category: 'health'
          });
        }
      }
      // Для еженедельных привычек создаем одно событие в начале недели
      else if (habit.frequency === 'weekly') {
        // Используем время выполнения привычки, если оно задано
        if (habit.completionTime) {
          const [hours, minutes] = habit.completionTime.split(':').map(Number);
          startOfWeek.setHours(hours, minutes, 0, 0);
        } else {
          startOfWeek.setHours(8, 0, 0, 0); // Устанавливаем время по умолчанию на 8:00
        }
        
        newEvents.push({
          id: `${habit.id!}_weekly`,
          title: `Привычка здоровья: ${habit.name}`,
          start: new Date(startOfWeek),
          end: new Date(startOfWeek.getTime() + 30 * 60 * 1000), // 30 минут
          type: 'health-habit',
          category: 'health'
        });
      }
    });
    
    // Создаем события для показателей здоровья (например, напоминания о замерах)
    indicators.forEach(indicator => {
      // Создаем событие на дату показателя
      const eventDate = new Date(indicator.timestamp);
      eventDate.setHours(9, 0, 0, 0); // Устанавливаем время на 9:00
      
      newEvents.push({
        id: `indicator_${indicator.id}`,
        title: `Замер: ${indicator.name}`,
        start: eventDate,
        end: new Date(eventDate.getTime() + 15 * 60 * 1000), // 15 минут
        type: 'health-indicator',
        category: 'health'
      });
    });
    
    setEvents(newEvents);
  };

  // Функция для добавления события в календарь (в реальной реализации будет интеграция с календарем)
  const addToCalendar = async (event: CalendarEvent) => {
    try {
      // В реальной реализации здесь будет код для добавления события в календарь
      console.log('Добавление события в календарь:', event);
      alert(`Событие "${event.title}" добавлено в календарь!`);
    } catch (error) {
      console.error('Ошибка при добавлении события в календарь:', error);
      alert('Ошибка при добавлении события в календарь');
    }
  };

  // Функция для добавления всех событий в календарь
  const addAllToCalendar = async () => {
    try {
      // В реальной реализации здесь будет код для добавления всех событий в календарь
      console.log('Добавление всех событий в календарь:', events);
      alert(`Все события (${events.length}) добавлены в календарь!`);
    } catch (error) {
      console.error('Ошибка при добавлении событий в календарь:', error);
      alert('Ошибка при добавлении событий в календарь');
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка данных для синхронизации с календарем...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Синхронизация с календарем</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadData} variant="outline">
              Обновить данные
            </Button>
            <Button onClick={addAllToCalendar} disabled={events.length === 0}>
              Добавить все в календарь
            </Button>
          </div>
          
          {events.length === 0 ? (
            <p className="text-gray-500">Нет событий для синхронизации с календарем.</p>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold">События для добавления в календарь:</h3>
              <ul className="space-y-2">
                {events.map((event, index) => (
                  <li key={index} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {event.start.toLocaleString()} - {event.end.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Тип: {event.type === 'health-habit' ? 'Привычка здоровья' : 'Показатель здоровья'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addToCalendar(event)}
                      variant="outline"
                    >
                      Добавить
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};