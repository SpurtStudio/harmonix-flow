import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { db, FamilyEvent } from '../lib/db';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

// Тип для отображаемого события в календаре
interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  description?: string;
  type: string;
  familyMemberIds?: number[];
}

const FamilyCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [familyEvents, setFamilyEvents] = useState<CalendarEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    description: '',
    type: '',
    familyMemberIds: [] as number[]
  });

  // Загрузка данных о семейных событиях
  useEffect(() => {
    const loadFamilyEvents = async () => {
      try {
        const loadedEvents = await db.familyEvents.toArray();
        const calendarEvents: CalendarEvent[] = loadedEvents.map(event => ({
          id: event.id || 0,
          title: event.title,
          date: event.date,
          description: event.description,
          type: event.type,
          familyMemberIds: event.linkedFamilyMemberIds
        }));
        setFamilyEvents(calendarEvents);
      } catch (error) {
        console.error('Ошибка при загрузке семейных событий:', error);
      }
    };
    loadFamilyEvents();
  }, []);

  // Навигация по календарю
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Обработчик открытия диалога добавления события
  const handleOpenAddDialog = () => {
    setNewEvent({
      title: '',
      date: new Date(),
      description: '',
      type: '',
      familyMemberIds: []
    });
    setIsAddDialogOpen(true);
  };

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик выбора даты
  const handleDateChange = (value: string) => {
    setNewEvent(prev => ({ ...prev, date: new Date(value) }));
  };

  // Обработчик выбора типа события
  const handleTypeChange = (value: string) => {
    setNewEvent(prev => ({ ...prev, type: value }));
  };

  // Обработчик добавления нового события
  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.type.trim()) {
      alert('Название и тип события не могут быть пустыми.');
      return;
    }
    
    try {
      const eventId = await db.familyEvents.add({
        title: newEvent.title,
        date: newEvent.date,
        description: newEvent.description || undefined,
        type: newEvent.type
      });
      
      // Обновление списка событий
      const loadedEvents = await db.familyEvents.toArray();
      const calendarEvents: CalendarEvent[] = loadedEvents.map(event => ({
        id: event.id || 0,
        title: event.title,
        date: event.date,
        description: event.description,
        type: event.type,
        familyMemberIds: event.linkedFamilyMemberIds
      }));
      setFamilyEvents(calendarEvents);
      
      // Закрытие диалога
      setIsAddDialogOpen(false);
      
      alert('Событие добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении события:', error);
      alert('Ошибка при добавлении события.');
    }
  };

  // Рендер ячеек календаря
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd', { locale: ru });
        const cloneDay = day;
        
        // Получение событий для текущего дня
        const dayEvents = familyEvents.filter(event => 
          isSameDay(event.date, cloneDay)
        );

        days.push(
          <div
            className={`relative p-2 border rounded min-h-24 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-100 text-gray-400 dark:bg-gray-800' : ''
            }`}
            key={day.toString()}
          >
            <div className="text-sm font-medium">{formattedDate}</div>
            <div className="mt-1 space-y-1">
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="text-xs p-1 bg-blue-100 dark:bg-blue-900 rounded truncate"
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Семейный календарь</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={prevMonth} variant="outline">Назад</Button>
          <h2 className="text-xl font-semibold py-2">
            {format(currentDate, 'MMMM yyyy', { locale: ru })}
          </h2>
          <Button onClick={nextMonth} variant="outline">Вперед</Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddDialog}>Добавить событие</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить событие</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  name="title"
                  placeholder="Название события"
                  value={newEvent.title}
                  onChange={handleInputChange}
                />
                <Input
                  type="date"
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
                <Select onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип события" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">День рождения</SelectItem>
                    <SelectItem value="anniversary">Годовщина</SelectItem>
                    <SelectItem value="holiday">Праздник</SelectItem>
                    <SelectItem value="meeting">Встреча</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  name="description"
                  placeholder="Описание (опционально)"
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
                <Button onClick={handleAddEvent}>Добавить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="calendar">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="text-center font-medium p-2">
                {day}
              </div>
            ))}
          </div>
          {renderCells()}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyCalendar;