import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db, Task, Habit, JournalEntry } from '../lib/db';
import { useChangePropagation } from '../hooks/use-change-propagation';
import { queryAI } from '../lib/api';
import { useExternalCalendarSync } from '../hooks/useExternalCalendarSync';
import LifeBalanceChart from '../components/LifeBalanceChart';
import { EditHabitDialog } from '../components/EditHabitDialog';
import { ViewEditJournalEntryDialog } from '../components/ViewEditJournalEntryDialog';
import AddTaskDialog from '../components/AddTaskDialog'; // Исправленный импорт
import { AddHabitDialog } from '../components/AddHabitDialog'; // Исправленный импорт
import AddJournalEntryDialog from '../components/AddJournalEntryDialog'; // Новый импорт
import AddProtectedBlockDialog from '../components/AddProtectedBlockDialog';
import EditProtectedBlockDialog from '../components/EditProtectedBlockDialog';

// Интерфейс для защищенного временного блока
interface ProtectedTimeBlock {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'rest' | 'family' | 'work' | 'personal';
  color?: string; // Добавляем цвет для визуального выделения
  isRecurring?: boolean; // Повторяющийся блок
  recurrencePattern?: string; // Паттерн повторения (например, "ежедневно", "по будням")
}

// Унифицированный интерфейс для события календаря
interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'habit' | 'journal' | 'protected' | 'skill' | 'external';
  priority?: 'Urgent-Important' | 'NotUrgent-Important' | 'Urgent-NotImportant' | 'NotUrgent-NotImportant';
  category?: string;
  originalEvent?: any;
}

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [protectedBlocks, setProtectedBlocks] = useState<ProtectedTimeBlock[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]); // Указываем тип Habit[]
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  
  const {
    googleEvents,
    outlookEvents,
    addGoogleEvent,
    addOutlookEvent,
    updateGoogleEvent,
    updateOutlookEvent,
    deleteGoogleEvent,
    deleteOutlookEvent
  } = useExternalCalendarSync();
  const { propagateChange, applyAdjustments } = useChangePropagation();

  const [conflicts, setConflicts] = useState<any[]>([]);
  const [overloadIndicators, setOverloadIndicators] = useState<any[]>([]);
  const [categoryHours, setCategoryHours] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);

  // Состояния для редактирования привычек
  const [isEditHabitDialogOpen, setIsEditHabitDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Состояния для просмотра/редактирования записей дневника
  const [isViewEditJournalEntryDialogOpen, setIsViewEditJournalEntryDialogOpen] = useState(false);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);

  // Состояние для добавления задачи
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Состояние для добавления привычки
  const [isAddHabitDialogOpen, setIsAddHabitDialogOpen] = useState(false);

  // Состояние для добавления записи в дневник
  const [isAddJournalEntryDialogOpen, setIsAddJournalEntryDialogOpen] = useState(false);

  // Состояния для управления защищенными блоками времени
  const [isAddProtectedBlockDialogOpen, setIsAddProtectedBlockDialogOpen] = useState(false);
  const [isEditProtectedBlockDialogOpen, setIsEditProtectedBlockDialogOpen] = useState(false);
  const [selectedProtectedBlock, setSelectedProtectedBlock] = useState<ProtectedTimeBlock | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load Tasks
      try {
        const loadedTasks = await db.tasks.toArray();
        const tasksWithDates = loadedTasks.map(task => ({
          ...task,
          date: task.dueDate ? new Date(task.dueDate) : new Date(),
        }));
        setTasks(tasksWithDates as any);
        const taskEvents: CalendarEvent[] = tasksWithDates.map(task => ({
          id: task.id || 0,
          title: task.name,
          start: task.date,
          end: new Date(task.date.getTime() + 60 * 60 * 1000),
          type: 'task',
          priority: task.priority,
          category: task.category || 'work'
        }));
        setEvents(prev => [...prev, ...taskEvents]);
      } catch (error) {
        console.error('Error loading tasks for calendar:', error);
      }

      // Load Habits
      try {
        const loadedHabits = await db.habits.toArray();
        setHabits(loadedHabits);
        
        // Создаем события привычек для текущей недели
        const habitEvents: CalendarEvent[] = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Воскресенье
        
        loadedHabits.forEach(habit => {
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
              
              habitEvents.push({
                id: `${habit.id!}_day${i}`,
                title: `Привычка: ${habit.name}`,
                start: eventDate,
                end: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 минут
                type: 'habit',
                category: 'habits'
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
            
            habitEvents.push({
              id: `${habit.id!}_weekly`,
              title: `Привычка: ${habit.name}`,
              start: new Date(startOfWeek),
              end: new Date(startOfWeek.getTime() + 30 * 60 * 1000), // 30 минут
              type: 'habit',
              category: 'habits'
            });
          }
        });
        
        setEvents(prev => [...prev, ...habitEvents]);
      } catch (error) {
        console.error('Error loading habits for calendar:', error);
      }

      // Load Journal Entries
      try {
        const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
        setJournalEntries(loadedEntries);
        const entryEvents: CalendarEvent[] = loadedEntries.map(entry => ({
          id: String(entry.id!), // Преобразуем id в строку для уникальности
          title: `Запись в дневнике: ${entry.timestamp.toLocaleDateString()}`,
          start: new Date(entry.timestamp),
          end: new Date(new Date(entry.timestamp).setHours(new Date(entry.timestamp).getHours() + 1)),
          type: 'journal',
          category: 'journal'
        }));
        setEvents(prev => [...prev, ...entryEvents]);
      } catch (error) {
        console.error('Error loading journal entries for calendar:', error);
      }

      // Load Skills
      try {
        const loadedSkills = await db.skills.toArray();
        setSkills(loadedSkills);
        
        // Создаем события для развития навыков на основе их приоритета и целевого уровня
        const skillEvents: CalendarEvent[] = [];
        const today = new Date();
        
        loadedSkills.forEach(skill => {
          // Определяем продолжительность занятия в зависимости от разницы между текущим и целевым уровнем
          const levelDifference = (skill.goal || 100) - skill.level;
          const durationHours = Math.max(0.5, levelDifference / 10); // Минимум 30 минут
          
          // Создаем событие на ближайшие 7 дней
          for (let i = 0; i < 7; i++) {
            // Для высокоприоритетных навыков (уровень > 80) планируем ежедневно
            if (skill.level > 80 && i % 1 === 0) {
              const eventDate = new Date(today);
              eventDate.setDate(today.getDate() + i);
              eventDate.setHours(19, 0, 0, 0); // Вечернее время
              
              skillEvents.push({
                id: `${skill.id!}_day${i}`,
                title: `Развитие навыка: ${skill.name}`,
                start: eventDate,
                end: new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000),
                type: 'skill',
                category: skill.category || 'development'
              });
            }
            // Для среднего приоритета (уровень 50-80) планируем через день
            else if (skill.level > 50 && skill.level <= 80 && i % 2 === 0) {
              const eventDate = new Date(today);
              eventDate.setDate(today.getDate() + i);
              eventDate.setHours(19, 0, 0, 0); // Вечернее время
              
              skillEvents.push({
                id: `${skill.id!}_day${i}`,
                title: `Развитие навыка: ${skill.name}`,
                start: eventDate,
                end: new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000),
                type: 'skill',
                category: skill.category || 'development'
              });
            }
            // Для низкого приоритета (уровень < 50) планируем раз в три дня
            else if (skill.level <= 50 && i % 3 === 0) {
              const eventDate = new Date(today);
              eventDate.setDate(today.getDate() + i);
              eventDate.setHours(19, 0, 0, 0); // Вечернее время
              
              skillEvents.push({
                id: `${skill.id!}_day${i}`,
                title: `Развитие навыка: ${skill.name}`,
                start: eventDate,
                end: new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000),
                type: 'skill',
                category: skill.category || 'development'
              });
            }
          }
        });
        
        setEvents(prev => [...prev, ...skillEvents]);
      } catch (error) {
        console.error('Error loading skills for calendar:', error);
      }

      // Load Protected Blocks
      try {
        // В реальной реализации здесь будет код для загрузки защищенных блоков из IndexedDB
        // const loadedBlocks = await db.protectedBlocks.toArray();
        // setProtectedBlocks(loadedBlocks);
        
        // Пока используем примеры блоков
        const blocks: ProtectedTimeBlock[] = [
          {
            id: 1,
            title: 'Время для семьи',
            start: new Date(new Date().setHours(18, 0, 0, 0)),
            end: new Date(new Date().setHours(20, 0, 0, 0)),
            type: 'family',
            color: '#FF6B6B'
          },
          {
            id: 2,
            title: 'Отдых',
            start: new Date(new Date().setHours(22, 0, 0, 0)),
            end: new Date(new Date().setHours(23, 59, 59, 999)),
            type: 'rest',
            color: '#4ECDC4'
          },
          // Добавляем примеры повторяющихся блоков
          {
            id: 3,
            title: 'Утренняя медитация',
            start: new Date(new Date().setHours(7, 0, 0, 0)),
            end: new Date(new Date().setHours(7, 30, 0, 0)),
            type: 'personal',
            color: '#45B7D1',
            isRecurring: true,
            recurrencePattern: 'ежедневно'
          },
          {
            id: 4,
            title: 'Физическая активность',
            start: new Date(new Date().setHours(19, 0, 0, 0)),
            end: new Date(new Date().setHours(20, 0, 0, 0)),
            type: 'personal',
            color: '#96CEB4',
            isRecurring: true,
            recurrencePattern: 'по будням'
          }
        ];
        setProtectedBlocks(blocks);
        const blockEvents: CalendarEvent[] = blocks.map(block => ({
          id: block.id + 1000,
          title: block.title,
          start: block.start,
          end: block.end,
          type: 'protected',
          category: block.type
        }));
        setEvents(prev => [...prev, ...blockEvents]);
      } catch (error) {
        console.error('Error loading protected blocks for calendar:', error);
      }
    };
    
    loadData();
  }, []);

  // Объединение внутренних и внешних событий
  useEffect(() => {
    setEvents(prevEvents => {
      const externalEvents: CalendarEvent[] = [
        ...googleEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.when?.dateTime || event.when?.date || ''),
          end: new Date(event.when?.end?.dateTime || event.when?.end?.date || event.when?.dateTime || event.when?.date || ''),
          type: 'external' as const,
          originalEvent: event,
          category: 'external'
        })),
        ...outlookEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.when?.dateTime || event.when?.date || ''),
          end: new Date(event.when?.end?.dateTime || event.when?.end?.date || event.when?.dateTime || event.when?.date || ''),
          type: 'external' as const,
          originalEvent: event,
          category: 'external'
        }))
      ];
      const combinedEvents = [...prevEvents, ...externalEvents];
      const uniqueEvents = Array.from(new Map(combinedEvents.map(event => [event.id, event])).values());
      return uniqueEvents;
    });
  }, [googleEvents, outlookEvents]);

  // Проверка на конфликты и расчет categoryHours
  useEffect(() => {
    const checkConflictsAndPrepareChartData = () => {
      const newConflicts: any[] = [];
      const newOverloadIndicators: any[] = [];
      const currentCategoryHours: Record<string, number> = {};
      
      // Проверка конфликтов между событиями
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          if (
            events[i].start < events[j].end &&
            events[j].start < events[i].end
          ) {
            newConflicts.push({
              event1: events[i],
              event2: events[j],
              message: `Конфликт между "${events[i].title}" и "${events[j].title}"`,
              severity: 'high', // Добавляем уровень серьезности
              // Добавляем временные метки для более точного отображения
              time1: `${events[i].start.toLocaleTimeString()} - ${events[i].end.toLocaleTimeString()}`,
              time2: `${events[j].start.toLocaleTimeString()} - ${events[j].end.toLocaleTimeString()}`
            });
          }
        }
      }
      
      // Расчет перегрузки по сферам жизни
      events.forEach(event => {
        if (event.category) {
          currentCategoryHours[event.category] = (currentCategoryHours[event.category] || 0) +
            (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
        }
      });
      setCategoryHours(currentCategoryHours); // Обновляем состояние categoryHours

      Object.entries(currentCategoryHours).forEach(([category, hours]) => {
        if (hours > 10) { // Если больше 10 часов в день на одну сферу
          newOverloadIndicators.push({
            category,
            hours,
            message: `Перегрузка по сфере "${category}": ${hours.toFixed(1)} часов`,
            severity: 'high' // Добавляем уровень серьезности
          });
        } else if (hours > 8) { // Если больше 8 часов в день на одну сферу
          newOverloadIndicators.push({
            category,
            hours,
            message: `Высокая нагрузка по сфере "${category}": ${hours.toFixed(1)} часов`,
            severity: 'medium' // Добавляем уровень серьезности
          });
        }
      });
      
      setConflicts(newConflicts);
      setOverloadIndicators(newOverloadIndicators);
    };
    
    checkConflictsAndPrepareChartData();
  }, [events]);

  // Подготовка данных для графика баланса жизни
  useEffect(() => {
    const prepareChartData = () => {
      // Определяем целевые значения для каждой сферы (в часах в день)
      const targetHours: Record<string, number> = {
        'work': 8,
        'family': 3,
        'personal': 2,
        'health': 2,
        'rest': 8,
        'habits': 1,
        'journal': 0.5,
        'development': 2,
        'external': 1
      };
      
      const dataForChart = Object.entries(categoryHours).map(([key, value]) => ({
        sphere: key,
        load: value,
        target: targetHours[key] || 2 // По умолчанию 2 часа
      }));
      setChartData(dataForChart);
    };

    prepareChartData();
  }, [categoryHours]); // Зависимость от categoryHours

  const getTasksForDate = useCallback((selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate.toDateString() === selectedDate.toDateString();
    });
  }, [tasks]);

  const getTasksForWeek = useCallback((selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Воскресенье
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Суббота
    endOfWeek.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  }, [tasks]);

  const getTasksForMonth = useCallback((selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && 
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [tasks]);

  const renderEvents = useCallback(() => {
    // Фильтруем события по выбранной дате
    let filteredEvents: CalendarEvent[] = [];
    if (date) {
      if (view === 'day') {
        filteredEvents = events.filter(event =>
          event.start.toDateString() === date.toDateString()
        );
      } else if (view === 'week') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filteredEvents = events.filter(event =>
          event.start >= startOfWeek && event.start <= endOfWeek
        );
      } else if (view === 'month') {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        filteredEvents = events.filter(event =>
          event.start >= startOfMonth && event.start <= endOfMonth
        );
      }
    }

    if (filteredEvents.length === 0) {
      return <p className="text-center text-gray-500">Нет событий на выбранный период.</p>;
    }

    return (
      <div className="grid gap-2">
        {filteredEvents.map(event => {
          const isHabit = event.type === 'habit';
          const isJournalEntry = event.type === 'journal';
          const isProtectedBlock = event.type === 'protected';
          const isTask = event.type === 'task';
          
          // Определяем цвет для защищенного блока
          let blockColor = '';
          if (isProtectedBlock) {
            const block = protectedBlocks.find(b => b.id + 1000 === event.id);
            blockColor = block?.color || '#CCCCCC';
          }
          
          return (
            <Card
              key={event.id}
              className={`p-3 cursor-pointer ${isProtectedBlock ? 'border-l-4' : ''} ${isTask ? 'hover:shadow-md transition-shadow' : ''}`}
              style={isProtectedBlock ? { borderLeftColor: blockColor } : {}}
              onClick={() => {
                if (isHabit) {
                  setSelectedHabit(habits.find(h => String(h.id) === String(event.id)) || null);
                  setIsEditHabitDialogOpen(true);
                }
                if (isJournalEntry) {
                  setSelectedJournalEntry(journalEntries.find(j => String(j.id) === String(event.id)) || null);
                  setIsViewEditJournalEntryDialogOpen(true);
                }
                if (isProtectedBlock) {
                  const block = protectedBlocks.find(b => b.id + 1000 === event.id);
                  if (block) {
                    setSelectedProtectedBlock(block);
                    setIsEditProtectedBlockDialogOpen(true);
                  }
                }
              }}
              draggable={isTask}
              onDragStart={(e) => {
                if (isTask) {
                  e.dataTransfer.setData('text/plain', String(event.id));
                }
              }}
              onDragOver={(e) => {
                if (isTask) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                if (isTask) {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId && date) {
                    // Вычисляем новую дату на основе выбранной даты
                    const newDate = new Date(date);
                    newDate.setHours(event.start.getHours(), event.start.getMinutes());
                    handleTaskDrag(Number(taskId), newDate);
                  }
                }
              }}
            >
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {event.start.toLocaleString()} - {event.end.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Тип: {event.type}
                {event.category && `, Категория: ${event.category}`}
                {event.priority && `, Приоритет: ${event.priority}`}
              </p>
              {isProtectedBlock && (
                <p className="text-xs text-gray-500 mt-1">
                  Защищенный блок времени
                </p>
              )}
              {isTask && (
                <p className="text-xs text-blue-500 mt-1">
                  Перетащите для изменения времени
                </p>
              )}
              {isHabit && (
                <div className="mt-2 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Найдем оригинальную привычку по ID события
                      const habitId = typeof event.id === 'string' ? event.id.split('_')[0] : event.id;
                      const habit = habits.find(h => String(h.id) === String(habitId));
                      if (habit) {
                        handleTrackHabitCompletion(habit.id!, true);
                      }
                    }}
                  >
                    Выполнено
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Найдем оригинальную привычку по ID события
                      const habitId = typeof event.id === 'string' ? event.id.split('_')[0] : event.id;
                      const habit = habits.find(h => String(h.id) === String(habitId));
                      if (habit) {
                        handleTrackHabitCompletion(habit.id!, false);
                      }
                    }}
                  >
                    Не выполнено
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Найдем оригинальную привычку по ID события
                      const habitId = typeof event.id === 'string' ? event.id.split('_')[0] : event.id;
                      const habit = habits.find(h => String(h.id) === String(habitId));
                      if (habit) {
                        handleEditHabit(habit);
                      }
                    }}
                  >
                    Редактировать
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }, [view, date, events, habits, journalEntries]);

  // Функция для обработки перетаскивания задачи
  const handleTaskDrag = async (taskId: number, newDate: Date) => {
    try {
      // Находим задачу
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Сохраняем старое значение для анализа изменений
      const oldValue = { ...task };
      
      // Обновляем дату задачи
      const updatedTask = { ...task, dueDate: newDate };
      await db.tasks.update(taskId, { dueDate: newDate });
      
      // Обновляем состояние
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: newDate } : t));
      
      // Обновляем события календаря
      setEvents(prev => prev.map(event =>
        event.id === taskId && event.type === 'task'
          ? { ...event, start: newDate, end: new Date(newDate.getTime() + 60 * 60 * 1000) }
          : event
      ));
      
      // Используем систему оперативных изменений
      const changeResult = await propagateChange({
        type: 'task_due_date_changed',
        entityId: taskId,
        oldValue: oldValue,
        newValue: updatedTask
      });
      
      console.log('Анализ влияния изменения даты задачи:', changeResult);
      
      // Если есть предложенные корректировки, применяем их
      if (changeResult.suggestedAdjustments && changeResult.suggestedAdjustments.length > 0) {
        // Показываем пользователю предложенные корректировки и спрашиваем, хочет ли он их применить
        const adjustmentText = changeResult.suggestedAdjustments.map((adj: string, i: number) => `${i + 1}. ${adj}`).join('\n');
        const confirmed = window.confirm(`Система изменений предлагает следующие корректировки:\n\n${adjustmentText}\n\nПрименить эти корректировки?`);
        
        if (confirmed) {
          const applyResult = await applyAdjustments(changeResult.suggestedAdjustments);
          console.log('Результат применения корректировок:', applyResult);
          
          // Показываем уведомление о примененных изменениях
          if (applyResult.success) {
            alert(`Применены корректировки: ${applyResult.appliedAdjustments.join(', ')}`);
            
            // Обновляем данные в календаре после применения корректировок
            // Перезагружаем задачи
            const loadedTasks = await db.tasks.toArray();
            setTasks(loadedTasks.map(task => ({
              ...task,
              date: task.dueDate ? new Date(task.dueDate) : new Date(),
            })));
            
            // Обновляем события календаря
            const taskEvents: CalendarEvent[] = loadedTasks.map(task => ({
              id: task.id || 0,
              title: task.name,
              start: task.dueDate ? new Date(task.dueDate) : new Date(),
              end: task.dueDate ? new Date(new Date(task.dueDate!).getTime() + 60 * 60 * 1000) : new Date(new Date().getTime() + 60 * 60 * 1000),
              type: 'task',
              priority: task.priority,
              category: task.category || 'work'
            }));
            
            // Объединяем события, заменяя старые события задач на новые
            setEvents(prev => {
              const filteredEvents = prev.filter(event => event.type !== 'task');
              return [...filteredEvents, ...taskEvents];
            });
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при перетаскивании задачи:', error);
      alert('Ошибка при перетаскивании задачи.');
    }
  };

  // Функция для обработки редактирования привычки
  const handleEditHabit = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    setIsEditHabitDialogOpen(true);
  }, []);

  // Функция для сохранения отредактированной привычки
  const handleSaveEditedHabit = useCallback(async (updatedHabit: Habit) => {
    try {
      await db.habits.update(updatedHabit.id!, { name: updatedHabit.name, description: updatedHabit.description, frequency: updatedHabit.frequency, progress: updatedHabit.progress, linkedGoalIds: updatedHabit.linkedGoalIds, linkedTaskIds: updatedHabit.linkedTaskIds, completionTime: updatedHabit.completionTime }); // Исправлено
      setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
      setIsEditHabitDialogOpen(false);
      // Обновить события в календаре, если привычка изменилась
      setEvents(prev => prev.map(event =>
        event.id === updatedHabit.id && event.type === 'habit'
          ? { ...event, title: `Привычка: ${updatedHabit.name}` }
          : event
      ));
      alert('Привычка успешно обновлена!');
    } catch (error) {
      console.error('Ошибка при сохранении привычки:', error);
      alert('Ошибка при сохранении привычки.');
    }
  }, []);

  // Функция для отслеживания выполнения привычки
  const handleTrackHabitCompletion = useCallback(async (habitId: number | string, completed: boolean) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      // Обновляем прогресс привычки
      const updatedProgress = completed ? Math.min(100, (habit.progress || 0) + 10) : Math.max(0, (habit.progress || 0) - 5);
      await db.habits.update(habitId, { progress: updatedProgress });
      
      // Обновляем состояние привычек
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, progress: updatedProgress } : h));
      
      // Обновляем события в календаре
      setEvents(prev => prev.map(event => {
        // Проверяем, что событие относится к привычке
        const eventId = typeof event.id === 'string' ? event.id.split('_')[0] : event.id;
        if (String(eventId) === String(habitId) && event.type === 'habit') {
          return {
            ...event,
            title: `Привычка: ${habit.name} (${completed ? 'Выполнена' : 'Не выполнена'})`,
            // Обновляем стиль события в зависимости от выполнения
            className: completed ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          };
        }
        return event;
      }));
      
      // Добавляем запись в дневник о выполнении привычки
      if (completed) {
        const journalEntry: Omit<JournalEntry, 'id'> = {
          timestamp: new Date(),
          text: `Выполнена привычка: ${habit.name}`,
          psychologicalState: 7,
          emotionalState: 7,
          physicalState: 7
        };
        await db.journalEntries.add(journalEntry);
        
        // Обновляем записи дневника
        const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
        setJournalEntries(loadedEntries);
        
        // Добавляем событие в календарь
        const entryEvent: CalendarEvent = {
          id: String(Date.now()), // Уникальный ID для новой записи
          title: `Запись в дневнике: Выполнена привычка ${habit.name}`,
          start: new Date(),
          end: new Date(new Date().setMinutes(new Date().getMinutes() + 5)), // 5 минут
          type: 'journal',
          category: 'habits'
        };
        setEvents(prev => [...prev, entryEvent]);
      }
      
      alert(completed ? 'Привычка отмечена как выполненная!' : 'Отмена выполнения привычки');
    } catch (error) {
      console.error('Ошибка при отслеживании выполнения привычки:', error);
      alert('Ошибка при отслеживании выполнения привычки.');
    }
  }, [habits, journalEntries]);

  // Функция для обработки просмотра/редактирования записи дневника
  const handleViewEditJournalEntry = useCallback((entry: JournalEntry) => {
    setSelectedJournalEntry(entry);
    setIsViewEditJournalEntryDialogOpen(true);
  }, []);

  // Функция для добавления новой записи в дневник из календаря
  const handleAddJournalEntry = useCallback(async (newEntry: Omit<JournalEntry, 'id'>) => {
    try {
      const newEntryId = await db.journalEntries.add(newEntry);
      const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
      setJournalEntries(loadedEntries);

      // Добавляем новую запись как событие в календарь
      const entryEvent: CalendarEvent = {
        id: String(newEntryId),
        title: `Запись в дневнике: ${newEntry.timestamp.toLocaleDateString()}`,
        start: newEntry.timestamp,
        end: new Date(newEntry.timestamp.getTime() + 60 * 60 * 1000), // Default to 1 hour
        type: 'journal',
        category: 'journal'
      };
      setEvents(prev => [...prev, entryEvent]);
      setIsAddJournalEntryDialogOpen(false);
      alert('Запись в дневник успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении записи в дневник из календаря:', error);
      alert('Ошибка при добавлении записи в дневник из календаря.');
    }
  }, []);

  // Функция для сохранения отредактированной записи дневника
  const handleSaveEditedJournalEntry = useCallback(async (updatedEntry: JournalEntry) => {
    try {
      await db.journalEntries.update(updatedEntry.id!, { timestamp: updatedEntry.timestamp, text: updatedEntry.text, audioUrl: updatedEntry.audioUrl, imageUrl: updatedEntry.imageUrl, psychologicalState: updatedEntry.psychologicalState, emotionalState: updatedEntry.emotionalState, physicalState: updatedEntry.physicalState, linkedVisionId: updatedEntry.linkedVisionId, linkedGlobalGoalIds: updatedEntry.linkedGlobalGoalIds, linkedStrategicGoalIds: updatedEntry.linkedStrategicGoalIds, linkedProjectIds: updatedEntry.linkedProjectIds, linkedSubProjectLevel1Ids: updatedEntry.linkedSubProjectLevel1Ids, linkedSubProjectLevel2Ids: updatedEntry.linkedSubProjectLevel2Ids, linkedTaskIds: updatedEntry.linkedTaskIds, linkedSubTaskIds: updatedEntry.linkedSubTaskIds, formedIdeaIds: updatedEntry.formedIdeaIds }); // Исправлено
      setJournalEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      setIsViewEditJournalEntryDialogOpen(false);
      // Обновить события в календаре, если запись дневника изменилась
      setEvents(prev => prev.map(event =>
        event.id === updatedEntry.id && event.type === 'journal'
          ? { ...event, title: `Запись в дневнике: ${updatedEntry.timestamp.toLocaleDateString()}` }
          : event
      ));
      alert('Запись дневника успешно обновлена!');
    } catch (error) {
      console.error('Ошибка при сохранении записи дневника:', error);
      alert('Ошибка при сохранении записи дневника.');
    }
  }, []);

  // Функция для добавления задачи из календаря
  const handleAddTaskFromCalendar = useCallback(async (newTask: Omit<Task, 'id' | 'status'>) => {
    try {
      const newTaskId = await db.tasks.add({ ...newTask, status: 'Pending' });
      const loadedTasks = await db.tasks.toArray();
      setTasks(loadedTasks);
      
      // Добавляем новую задачу как событие в календарь
      const taskEvent: CalendarEvent = {
        id: newTaskId,
        title: newTask.name,
        start: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
        end: newTask.dueDate ? new Date(new Date(newTask.dueDate).getTime() + 60 * 60 * 1000) : new Date(new Date().getTime() + 60 * 60 * 1000),
        type: 'task',
        priority: newTask.priority,
        category: newTask.category || 'work'
      };
      setEvents(prev => [...prev, taskEvent]);
      setIsAddTaskDialogOpen(false);
      alert('Задача успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении задачи из календаря:', error);
      alert('Ошибка при добавлении задачи из календаря.');
    }
  }, []);

  // Функция для добавления привычки из календаря
  const handleAddHabitFromCalendar = useCallback(async (newHabit: Omit<Habit, 'id' | 'progress'>) => {
    try {
      const newHabitId = await db.habits.add({ ...newHabit, progress: 0 });
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);

      // Добавляем новую привычку как событие в календарь
      const habitEvent: CalendarEvent = {
        id: String(newHabitId),
        title: `Привычка: ${newHabit.name}`,
        start: new Date(),
        end: new Date(new Date().setHours(new Date().getHours() + 1)),
        type: 'habit',
        category: 'habits'
      };
      setEvents(prev => [...prev, habitEvent]);
      setIsAddHabitDialogOpen(false);
      alert('Привычка успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении привычки из календаря:', error);
      alert('Ошибка при добавлении привычки из календаря.');
    }
  }, []);

  // Функция для добавления записи в дневник из календаря
  const handleAddJournalEntryFromCalendar = useCallback(async (newEntry: Omit<JournalEntry, 'id'>) => {
    try {
      const newEntryId = await db.journalEntries.add(newEntry);
      const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
      setJournalEntries(loadedEntries);

      // Добавляем новую запись как событие в календарь
      const entryEvent: CalendarEvent = {
        id: String(newEntryId),
        title: `Запись в дневнике: ${newEntry.timestamp.toLocaleDateString()}`,
        start: newEntry.timestamp,
        end: new Date(newEntry.timestamp.getTime() + 60 * 60 * 1000), // Default to 1 hour
        type: 'journal',
        category: 'journal'
      };
      setEvents(prev => [...prev, entryEvent]);
      setIsAddJournalEntryDialogOpen(false);
      alert('Запись в дневник успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении записи в дневник из календаря:', error);
      alert('Ошибка при добавлении записи в дневник из календаря.');
    }
  }, []);

  // Функция для добавления защищенного блока
  const handleAddProtectedBlock = useCallback(async (newBlock: Omit<ProtectedTimeBlock, 'id'>) => {
    try {
      // Генерируем уникальный ID для нового блока
      const newId = Math.max(...protectedBlocks.map(b => b.id), 0) + 1;
      const blockWithId: ProtectedTimeBlock = { ...newBlock, id: newId };
      
      // Обновляем состояние
      setProtectedBlocks(prev => [...prev, blockWithId]);
      
      // Добавляем блок как событие в календарь
      const blockEvent: CalendarEvent = {
        id: newId + 1000,
        title: blockWithId.title,
        start: blockWithId.start,
        end: blockWithId.end,
        type: 'protected',
        category: blockWithId.type
      };
      setEvents(prev => [...prev, blockEvent]);
      
      setIsAddProtectedBlockDialogOpen(false);
      alert('Защищенный блок успешно добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении защищенного блока:', error);
      alert('Ошибка при добавлении защищенного блока.');
    }
  }, [protectedBlocks]);

  // Функция для сохранения отредактированного защищенного блока
  const handleSaveEditedProtectedBlock = useCallback(async (updatedBlock: ProtectedTimeBlock) => {
    try {
      // Обновляем состояние
      setProtectedBlocks(prev => prev.map(block => block.id === updatedBlock.id ? updatedBlock : block));
      
      // Обновляем событие в календаре
      setEvents(prev => prev.map(event =>
        event.id === updatedBlock.id + 1000 && event.type === 'protected'
          ? { ...event, title: updatedBlock.title, start: updatedBlock.start, end: updatedBlock.end }
          : event
      ));
      
      setIsEditProtectedBlockDialogOpen(false);
      alert('Защищенный блок успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при сохранении защищенного блока:', error);
      alert('Ошибка при сохранении защищенного блока.');
    }
  }, []);

  // Функция для удаления защищенного блока
  const handleDeleteProtectedBlock = useCallback(async (blockId: number) => {
    try {
      // Подтверждение удаления
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот защищенный блок?');
      if (!confirmed) return;
      
      // Обновляем состояние
      setProtectedBlocks(prev => prev.filter(block => block.id !== blockId));
      
      // Удаляем событие из календаря
      setEvents(prev => prev.filter(event => event.id !== blockId + 1000));
      
      setIsEditProtectedBlockDialogOpen(false);
      alert('Защищенный блок успешно удален!');
    } catch (error) {
      console.error('Ошибка при удалении защищенного блока:', error);
      alert('Ошибка при удалении защищенного блока.');
    }
  }, []);

  // Функция для оптимизации расписания через ИИ
  const optimizeSchedule = async () => {
    try {
      const payload = {
        events: events.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          priority: event.priority,
          category: event.category,
          type: event.type
        })),
        // Дополнительные параметры для ИИ
        protectedBlocks: protectedBlocks.map(block => ({
          id: block.id,
          title: block.title,
          start: block.start.toISOString(),
          end: block.end.toISOString(),
          type: block.type
        })),
        categoryHours: categoryHours,
        currentDate: date ? date.toISOString() : new Date().toISOString()
      };
      
      const aiResponse = await queryAI('optimizeSchedule', payload);
      
      // Показываем результаты оптимизации в модальном окне
      if (aiResponse.response) {
        // Парсим ответ ИИ
        let suggestions;
        try {
          suggestions = JSON.parse(aiResponse.response.replace(/```json/g, '').replace(/```/g, ''));
        } catch (parseError) {
          // Если не удалось распарсить JSON, показываем как текст
          alert(`Результат ИИ-оптимизации:\n${aiResponse.response}`);
          return;
        }
        
        // Показываем предложения по оптимизации
        const suggestionText = suggestions.suggestions?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'Нет предложений по оптимизации';
        const confirmation = window.confirm(`ИИ предложил следующие оптимизации:\n\n${suggestionText}\n\nПрименить изменения?`);
        
        if (confirmation && suggestions.recommendedSchedule) {
          // Применяем рекомендованный график
          // Обновляем события в календаре на основе рекомендаций ИИ
          const recommendedEvents = suggestions.recommendedSchedule.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          
          // Объединяем рекомендованные события с существующими
          setEvents(prev => {
            // Фильтруем события, которые не входят в рекомендации
            const filteredEvents = prev.filter(event => {
              // Оставляем внешние события и защищенные блоки
              if (event.type === 'external' || event.type === 'protected') {
                return true;
              }
              
              // Проверяем, есть ли событие в рекомендациях
              const isRecommended = recommendedEvents.some((recEvent: any) =>
                String(recEvent.id) === String(event.id) && recEvent.type === event.type
              );
              
              // Оставляем события, которые не входят в рекомендации (например, привычки, которые не изменялись)
              return !isRecommended;
            });
            
            // Добавляем рекомендованные события
            return [...filteredEvents, ...recommendedEvents];
          });
          
          alert('Рекомендованный график применен!');
        }
      } else {
        alert('ИИ не смог предложить оптимизации для текущего расписания.');
      }
    } catch (error) {
      console.error('Ошибка при ИИ-оптимизации:', error);
      alert('Ошибка при ИИ-оптимизации.');
    }
  };

  // Функция для автоматического создания задач через ИИ
  const suggestNewTasks = async () => {
    try {
      const payload = {
        currentTasks: tasks.map(task => ({ name: task.name, dueDate: task.dueDate?.toISOString() })),
        // Дополнительный контекст для ИИ
        categoryHours: categoryHours,
        currentDate: date ? date.toISOString() : new Date().toISOString()
      };
      const aiResponse = await queryAI('suggestNewTasks', payload);
      
      // Показываем результаты в модальном окне
      if (aiResponse.response) {
        // Парсим ответ ИИ
        let suggestions;
        try {
          suggestions = JSON.parse(aiResponse.response.replace(/```json/g, '').replace(/```/g, ''));
        } catch (parseError) {
          // Если не удалось распарсить JSON, показываем как текст
          alert(`Предложения по новым задачам:\n${aiResponse.response}`);
          return;
        }
        
        // Показываем предложения по новым задачам
        const suggestionText = suggestions.suggestions?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'Нет предложений по новым задачам';
        alert(`ИИ предложил следующие задачи:\n\n${suggestionText}`);
        
        // Если есть рекомендации по новым задачам, можно открыть диалог добавления задачи
        if (suggestions.recommendedTasks && suggestions.recommendedTasks.length > 0) {
          console.log('Рекомендуемые задачи:', suggestions.recommendedTasks);
          // В реальной реализации здесь будет код для открытия диалога добавления задачи
        }
      } else {
        alert('ИИ не смог предложить новые задачи.');
      }
    } catch (error) {
      console.error('Ошибка при запросе новых задач:', error);
      alert('Ошибка при запросе новых задач.');
    }
  };

  
    // Функция для предложений по улучшению баланса через ИИ
    const suggestBalanceImprovements = async () => {
      try {
        const payload = {
          categoryHours: categoryHours,
          overloadIndicators: overloadIndicators,
          // Дополнительный контекст для ИИ
          currentDate: date ? date.toISOString() : new Date().toISOString()
        };
        const aiResponse = await queryAI('suggestBalanceImprovements', payload);
        
        // Показываем результаты в модальном окне
        if (aiResponse.response) {
          // Парсим ответ ИИ
          let suggestions;
          try {
            suggestions = JSON.parse(aiResponse.response.replace(/```json/g, '').replace(/```/g, ''));
          } catch (parseError) {
            // Если не удалось распарсить JSON, показываем как текст
            alert(`Предложения по улучшению баланса:\n${aiResponse.response}`);
            return;
          }
          
          // Показываем предложения по улучшению баланса
          const suggestionText = suggestions.suggestions?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'Нет предложений по улучшению баланса';
          alert(`ИИ предложил следующие улучшения баланса:\n\n${suggestionText}`);
          
          // Если есть рекомендации по перераспределению времени
          if (suggestions.recommendedTimeDistribution) {
            console.log('Рекомендуемое распределение времени:', suggestions.recommendedTimeDistribution);
            // В реальной реализации здесь будет код для визуализации рекомендаций
            // Например, обновление состояния chartData для отображения новых рекомендаций
          }
        } else {
          alert('ИИ не смог предложить улучшения баланса.');
        }
      } catch (error) {
        console.error('Ошибка при запросе предложений по балансу:', error);
        alert('Ошибка при запросе предложений по балансу.');
      }
    };
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Календарь (Интегрированный & Умный)</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Расписание</h2>
        <div className="space-x-2">
          <Button onClick={optimizeSchedule}>Оптимизировать через ИИ</Button>
          <Button onClick={suggestNewTasks}>Предложить задачи</Button>
          <Button onClick={suggestBalanceImprovements}>Улучшить баланс</Button>
          <Button onClick={() => setIsAddTaskDialogOpen(true)}>Добавить задачу</Button>
          <Button onClick={() => setIsAddHabitDialogOpen(true)}>Добавить привычку</Button>
          <Button onClick={() => setIsAddJournalEntryDialogOpen(true)}>Добавить запись в дневник</Button>
          <Button onClick={() => setIsAddProtectedBlockDialogOpen(true)}>Добавить защищенный блок</Button>
        </div>
      </div>

      {/* Индикаторы конфликтов */}
      {conflicts.length > 0 && (
        <Card className="mb-4 bg-red-100 border-red-400">
          <CardHeader>
            <CardTitle className="text-red-800">Конфликты в расписании</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {conflicts.map((conflict, index) => (
                <li key={index} className="text-red-700">
                  <div className="font-semibold">{conflict.message}</div>
                  {conflict.event1 && conflict.event2 && (
                    <div className="text-xs mt-1 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="font-medium">{conflict.event1.title}</span>:
                        <span className="ml-1">{conflict.time1}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-medium">{conflict.event2.title}</span>:
                        <span className="ml-1">{conflict.time2}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={async () => {
                        // Используем ИИ для предложения решения конфликта
                        try {
                          const aiSuggestion = await queryAI('resolveConflict', {
                            conflict: conflict,
                            events: events
                          });
                          alert(`Предложение ИИ по разрешению конфликта: ${aiSuggestion.response}`);
                        } catch (error) {
                          console.error('Ошибка при запросе к ИИ:', error);
                          alert('Функция разрешения конфликта будет реализована позже');
                        }
                      }}
                    >
                      Разрешить (ИИ)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // В реальной реализации здесь будет код для игнорирования конфликта
                        const newConflicts = conflicts.filter((_, i) => i !== index);
                        setConflicts(newConflicts);
                      }}
                    >
                      Игнорировать
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Индикаторы перегрузки */}
      {overloadIndicators.length > 0 && (
        <Card className="mb-4 bg-red-100 border-red-400">
          <CardHeader>
            <CardTitle className="text-red-800">Перегрузка по сферам жизни</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {overloadIndicators.map((indicator, index) => (
                <li key={index} className="text-red-700">
                  {indicator.message}
                  {indicator.severity === 'high' && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Высокая серьезность</span>
                  )}
                  {indicator.severity === 'medium' && (
                    <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Средняя серьезность</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="month" className="w-full" onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="day">День</TabsTrigger>
          <TabsTrigger value="week">Неделя</TabsTrigger>
          <TabsTrigger value="month">Месяц</TabsTrigger>
        </TabsList>
        <TabsContent value="day">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">События на {date?.toLocaleDateString() || 'выбранный день'}</h2>
              {renderEvents()}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="week">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">События на неделю с {date ? (getTasksForWeek(date)[0]?.dueDate ? new Date(getTasksForWeek(date)[0]?.dueDate!).toLocaleDateString() : 'выбранной даты') : 'выбранной даты'}</h2>
              {renderEvents()}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="month">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">События на {date?.toLocaleString('default', { month: 'long', year: 'numeric' }) || 'выбранный месяц'}</h2>
              {renderEvents()}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Дополнительный функционал календаря */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Дополнительный функционал календаря</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ Отображение защищенных временных блоков (отдых, семья).</p>
          <p>✓ Инструменты для планирования и перетаскивания задач (умное перетаскивание с анализом влияния).</p>
          <p>✓ Визуальные подсказки при конфликтах расписания.</p>
          <p>✓ Автоматическое предложение оптимальных альтернатив при изменении условий (через ИИ).</p>
          <p>✓ Индикаторы перегрузки по сферам жизни при добавлении задач.</p>
          <p>○ Синхронизация с внешними календарями через OAuth (в разработке).</p>
          <p>✓ Балансировка рабочих и личных задач (через категории и приоритеты).</p>
          <p>✓ Интеграция с ИИ-ассистентом для оптимизации расписания.</p>
          <p>✓ Интеграция с модулем привычек (отображение привычек).</p>
          <p>✓ Интеграция с дневником (отображение записей).</p>
          <p>✓ Планирование времени для развития навыков.</p>
        </CardContent>
      </Card>

      {/* Визуализация баланса жизни */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Баланс жизни</CardTitle>
        </CardHeader>
        <CardContent>
          <LifeBalanceChart data={chartData} />
        </CardContent>
      </Card>

      <EditHabitDialog
        habit={selectedHabit}
        onSave={handleSaveEditedHabit}
        onClose={() => setIsEditHabitDialogOpen(false)}
        isOpen={isEditHabitDialogOpen && !!selectedHabit}
      />

      {selectedJournalEntry && (
        <ViewEditJournalEntryDialog
          journalEntry={selectedJournalEntry}
          onSave={handleSaveEditedJournalEntry}
          onClose={() => setIsViewEditJournalEntryDialogOpen(false)}
          isOpen={isViewEditJournalEntryDialogOpen}
        />
      )}

      {isAddTaskDialogOpen && (
        <AddTaskDialog
          onSave={handleAddTaskFromCalendar}
          onClose={() => setIsAddTaskDialogOpen(false)}
          isOpen={isAddTaskDialogOpen}
        />
      )}

      {isAddHabitDialogOpen && (
        <AddHabitDialog
          onSave={handleAddHabitFromCalendar}
          onClose={() => setIsAddHabitDialogOpen(false)}
          isOpen={isAddHabitDialogOpen}
        />
      )}

      {isAddJournalEntryDialogOpen && (
        <AddJournalEntryDialog
          onSave={handleAddJournalEntryFromCalendar}
          onClose={() => setIsAddJournalEntryDialogOpen(false)}
          isOpen={isAddJournalEntryDialogOpen}
        />
      )}
      
      {isAddProtectedBlockDialogOpen && (
        <AddProtectedBlockDialog
          onSave={handleAddProtectedBlock}
          onClose={() => setIsAddProtectedBlockDialogOpen(false)}
          isOpen={isAddProtectedBlockDialogOpen}
        />
      )}
      
      {isEditProtectedBlockDialogOpen && selectedProtectedBlock && (
        <EditProtectedBlockDialog
          block={selectedProtectedBlock}
          onSave={handleSaveEditedProtectedBlock}
          onDelete={handleDeleteProtectedBlock}
          onClose={() => setIsEditProtectedBlockDialogOpen(false)}
          isOpen={isEditProtectedBlockDialogOpen}
        />
      )}
    </div>
  );
};

export default CalendarPage;