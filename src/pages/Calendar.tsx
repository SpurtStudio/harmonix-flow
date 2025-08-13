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

// Интерфейс для защищенного временного блока
interface ProtectedTimeBlock {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'rest' | 'family' | 'work' | 'personal';
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
  
  const { googleEvents, outlookEvents } = useExternalCalendarSync();
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
        const habitEvents: CalendarEvent[] = loadedHabits.map(habit => ({
          id: String(habit.id!), // Преобразуем id в строку для уникальности
          title: `Привычка: ${habit.name}`,
          start: new Date(),
          end: new Date(new Date().setHours(new Date().getHours() + 1)),
          type: 'habit',
          category: 'habits'
        }));
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
        const skillEvents: CalendarEvent[] = loadedSkills.map(skill => ({
          id: skill.id! + 4000,
          title: `Развитие навыка: ${skill.name}`,
          start: new Date(),
          end: new Date(new Date().setHours(new Date().getHours() + 1)),
          type: 'skill',
          category: skill.category || 'development'
        }));
        setEvents(prev => [...prev, ...skillEvents]);
      } catch (error) {
        console.error('Error loading skills for calendar:', error);
      }

      // Load Protected Blocks
      const blocks: ProtectedTimeBlock[] = [
        {
          id: 1,
          title: 'Время для семьи',
          start: new Date(new Date().setHours(18, 0, 0, 0)),
          end: new Date(new Date().setHours(20, 0, 0, 0)),
          type: 'family'
        },
        {
          id: 2,
          title: 'Отдых',
          start: new Date(new Date().setHours(22, 0, 0, 0)),
          end: new Date(new Date().setHours(23, 59, 59, 999)),
          type: 'rest'
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
              message: `Конфликт между "${events[i].title}" и "${events[j].title}"`
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
        if (hours > 8) { // Если больше 8 часов в день на одну сферу
          newOverloadIndicators.push({
            category,
            hours,
            message: `Перегрузка по сфере "${category}": ${hours.toFixed(1)} часов`
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
      const dataForChart = Object.entries(categoryHours).map(([key, value]) => ({
        name: key,
        hours: value,
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
          return (
            <Card
              key={event.id}
              className="p-3 cursor-pointer"
              onClick={() => {
                if (isHabit) setSelectedHabit(habits.find(h => h.id === event.id) || null); setIsEditHabitDialogOpen(true);
                if (isJournalEntry) setSelectedJournalEntry(journalEntries.find(j => j.id === event.id) || null); setIsViewEditJournalEntryDialogOpen(true);
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
      if (changeResult.suggestedAdjustments.length > 0) {
        const applyResult = await applyAdjustments(changeResult.suggestedAdjustments);
        console.log('Результат применения корректировок:', applyResult);
      }
    } catch (error) {
      console.error('Ошибка при перетаскивании задачи:', error);
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

  // Функция для обработки просмотра/редактирования записи дневника
  const handleViewEditJournalEntry = useCallback((entry: JournalEntry) => {
    setSelectedJournalEntry(entry);
    setIsViewEditJournalEntryDialogOpen(true);
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

  // Функция для оптимизации расписания через ИИ
  const optimizeSchedule = async () => {
    try {
      const payload = {
        events: events.map(event => ({
          title: event.title,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          priority: event.priority,
          category: event.category
        })),
        // Дополнительные параметры для ИИ, если нужны
      };
      
      const aiResponse = await queryAI('optimizeSchedule', payload);
      alert(`Результат ИИ-оптимизации:\n${aiResponse.response}`);
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
      };
      const aiResponse = await queryAI('suggestNewTasks', payload);
      alert(`Предложения по новым задачам:\n${aiResponse.response}`);
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
      };
      const aiResponse = await queryAI('suggestBalanceImprovements', payload);
      alert(`Предложения по улучшению баланса:\n${aiResponse.response}`);
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
        </div>
      </div>

      {/* Индикаторы конфликтов */}
      {conflicts.length > 0 && (
        <Card className="mb-4 bg-yellow-100 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-yellow-800">Конфликты в расписании</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {conflicts.map((conflict, index) => (
                <li key={index} className="text-yellow-700">
                  {conflict.message}
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
    </div>
  );
};

export default CalendarPage;