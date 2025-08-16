// src/pages/History.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { db } from '../lib/db';
import {
  Target,
  Folder,
  ListTodo,
  ListChecks,
  Lightbulb,
  Users,
  Landmark,
  Heart,
  Calendar,
  Search,
  Trophy,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { LineChart } from '../components/HealthCharts';
import LifeBalanceChart from '../components/LifeBalanceChart';

// Типы для различных событий
type HistoryEvent = {
  id: number | string;
  type: 'goal' | 'project' | 'task' | 'habit' | 'journal' | 'idea' | 'family' | 'finance' | 'health';
  title: string;
  description?: string;
  date: Date;
  status?: string;
  progress?: number;
  category?: string;
  linkedEntityId?: number;
  linkedEntityType?: string;
};

type Achievement = {
  id: number | string;
  title: string;
  description: string;
  date: Date;
  type: 'goal_completed' | 'project_completed' | 'habit_streak' | 'financial_milestone';
  value?: number;
};

// Типы для данных графиков
type ChartData = {
  date: string;
  value: number;
}[];

const History: React.FC = () => {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  
  // Состояния для данных графиков
  const [goalProgressData, setGoalProgressData] = useState<ChartData>([]);
  const [projectProgressData, setProjectProgressData] = useState<ChartData>([]);
  const [habitProgressData, setHabitProgressData] = useState<ChartData>([]);
  const [healthData, setHealthData] = useState<ChartData>([]);
  const [financeData, setFinanceData] = useState<ChartData>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, filterType, filterDate, sortBy]);

  const loadData = async () => {
    try {
      // Загрузка событий из всех модулей
      const [
        globalGoals,
        strategicGoals,
        projects,
        subProjectsLevel1,
        subProjectsLevel2,
        tasks,
        habits,
        journalEntries,
        ideas,
        familyEvents,
        financialTransactions,
        healthIndicators
      ] = await Promise.all([
        db.globalGoals.toArray(),
        db.strategicGoals.toArray(),
        db.projects.toArray(),
        db.subProjectsLevel1.toArray(),
        db.subProjectsLevel2.toArray(),
        db.tasks.toArray(),
        db.habits.toArray(),
        db.journalEntries.toArray(),
        db.ideas.toArray(),
        db.familyEvents.toArray(),
        db.financialTransactions.toArray(),
        db.healthIndicators.toArray()
      ]);

      // Преобразование данных в события истории
      const historyEvents: HistoryEvent[] = [
        // Цели
        ...globalGoals.map(goal => ({
          id: goal.id || Math.random(),
          type: 'goal',
          title: goal.name,
          description: goal.smartFormulation,
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: 'active',
          progress: goal.progress,
          category: goal.lifeSphere,
          linkedEntityId: goal.id,
          linkedEntityType: 'globalGoal'
        } as HistoryEvent)),
        ...strategicGoals.map(goal => ({
          id: goal.id || Math.random(),
          type: 'goal',
          title: goal.name,
          description: goal.krs.join(', '),
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: 'active',
          progress: undefined,
          category: undefined,
          linkedEntityId: goal.id,
          linkedEntityType: 'strategicGoal'
        } as HistoryEvent)),

        // Проекты
        ...projects.map(project => ({
          id: project.id || Math.random(),
          type: 'project',
          title: project.name,
          description: project.description,
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: project.status,
          progress: project.progress,
          category: undefined,
          linkedEntityId: project.id,
          linkedEntityType: 'project'
        } as HistoryEvent)),
        ...subProjectsLevel1.map(project => ({
          id: project.id || Math.random(),
          type: 'project',
          title: project.name,
          description: project.description,
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: project.status,
          progress: undefined,
          category: undefined,
          linkedEntityId: project.id,
          linkedEntityType: 'subProjectLevel1'
        } as HistoryEvent)),
        ...subProjectsLevel2.map(project => ({
          id: project.id || Math.random(),
          type: 'project',
          title: project.name,
          description: project.description,
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: project.status,
          progress: undefined,
          category: undefined,
          linkedEntityId: project.id,
          linkedEntityType: 'subProjectLevel2'
        } as HistoryEvent)),

        // Задачи
        ...tasks.map(task => ({
          id: task.id || Math.random(),
          type: 'task',
          title: task.name,
          description: task.description,
          date: task.dueDate || new Date(), // В реальной реализации нужно использовать дату создания
          status: task.status,
          progress: undefined,
          category: task.category,
          linkedEntityId: typeof task.id === 'number' ? task.id : undefined,
          linkedEntityType: 'task'
        } as HistoryEvent)),

        // Привычки
        ...habits.map(habit => ({
          id: habit.id || Math.random(),
          type: 'habit',
          title: habit.name,
          description: habit.description,
          date: habit.lastCompletedDate || new Date(), // В реальной реализации нужно использовать дату создания
          status: habit.streak && habit.streak > 0 ? 'active' : 'inactive',
          progress: habit.progress,
          category: undefined,
          linkedEntityId: typeof habit.id === 'number' ? habit.id : undefined,
          linkedEntityType: 'habit'
        } as HistoryEvent)),

        // Дневник
        ...journalEntries.map(entry => ({
          id: entry.id || Math.random(),
          type: 'journal',
          title: `Запись от ${format(new Date(entry.timestamp), 'dd MMMM yyyy', { locale: ru })}`,
          description: entry.text.substring(0, 100) + (entry.text.length > 100 ? '...' : ''),
          date: new Date(entry.timestamp),
          status: undefined,
          progress: undefined,
          category: undefined,
          linkedEntityId: typeof entry.id === 'number' ? entry.id : undefined,
          linkedEntityType: 'journalEntry'
        } as HistoryEvent)),

        // Идеи
        ...ideas.map(idea => ({
          id: idea.id || Math.random(),
          type: 'idea',
          title: idea.name,
          description: idea.description,
          date: new Date(), // В реальной реализации нужно использовать дату создания
          status: idea.status,
          progress: undefined,
          category: undefined,
          linkedEntityId: idea.id,
          linkedEntityType: 'idea'
        } as HistoryEvent)),

        // Семейные события
        ...familyEvents.map(event => ({
          id: event.id || Math.random(),
          type: 'family',
          title: event.title,
          description: event.description,
          date: new Date(event.date),
          status: undefined,
          progress: undefined,
          category: event.type,
          linkedEntityId: event.id,
          linkedEntityType: 'familyEvent'
        } as HistoryEvent)),

        // Финансовые транзакции
        ...financialTransactions.map(transaction => ({
          id: transaction.id || Math.random(),
          type: 'finance',
          title: `${transaction.type === 'income' ? 'Доход' : 'Расход'}: ${transaction.category}`,
          description: transaction.description,
          date: new Date(transaction.date),
          status: transaction.type,
          progress: undefined,
          category: transaction.category,
          linkedEntityId: transaction.id,
          linkedEntityType: 'financialTransaction'
        } as HistoryEvent)),

        // Показатели здоровья
        ...healthIndicators.map(indicator => ({
          id: indicator.id || Math.random(),
          type: 'health',
          title: indicator.name,
          description: `${indicator.value} ${indicator.unit}`,
          date: new Date(indicator.timestamp),
          status: undefined,
          progress: undefined,
          category: undefined,
          linkedEntityId: indicator.id,
          linkedEntityType: 'healthIndicator'
        } as HistoryEvent))
      ];

      // Загрузка достижений
      const achievements: Achievement[] = [
        // Завершенные цели
        ...globalGoals
          .filter(goal => goal.progress === 100)
          .map(goal => ({
            id: goal.id || Math.random(),
            title: goal.name,
            description: 'Цель достигнута',
            date: new Date(), // В реальной реализации нужно использовать дату завершения
            type: 'goal_completed'
          } as Achievement)),

        // Завершенные проекты
        ...projects
          .filter(project => project.status === 'Completed')
          .map(project => ({
            id: project.id || Math.random(),
            title: project.name,
            description: 'Проект завершен',
            date: new Date(), // В реальной реализации нужно использовать дату завершения
            type: 'project_completed'
          } as Achievement)),

        // Привычки с хорошей серией
        ...habits
          .filter(habit => (habit.streak || 0) >= 7)
          .map(habit => ({
            id: habit.id || Math.random(),
            title: habit.name,
            description: `Серия: ${habit.streak} дней`,
            date: new Date(), // В реальной реализации нужно использовать дату достижения серии
            type: 'habit_streak',
            value: habit.streak
          } as Achievement)),

        // Финансовые достижения
        ...financialTransactions
          .filter(transaction => transaction.type === 'income' && transaction.amount > 10000)
          .map(transaction => ({
            id: transaction.id || Math.random(),
            title: 'Крупный доход',
            description: `Доход: ${transaction.amount} ${transaction.category}`,
            date: new Date(transaction.date),
            type: 'financial_milestone',
            value: transaction.amount
          } as Achievement))
      ];

      // Подготовка данных для графиков
      // Данные для графика прогресса по целям
      const goalProgressData = globalGoals.map(goal => ({
        date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: goal.progress || 0
      }));

      // Данные для графика прогресса по проектам
      const projectProgressData = projects.map(project => ({
        date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: project.progress || 0
      }));

      // Данные для графика прогресса по привычкам
      const habitProgressData = habits.map(habit => ({
        date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: habit.progress || 0
      }));

      // Данные для графика показателей здоровья
      const healthData = healthIndicators
        .filter(indicator => indicator.name === 'weight') // Пример для веса
        .map(indicator => ({
          date: new Date(indicator.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          value: indicator.value
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Данные для графика финансовых данных
      const financeData = financialTransactions
        .map(transaction => ({
          date: new Date(transaction.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          value: transaction.amount * (transaction.type === 'income' ? 1 : -1)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(historyEvents);
      setAchievements(achievements);
      // Установка данных для графиков
      setGoalProgressData(goalProgressData);
      setProjectProgressData(projectProgressData);
      setHabitProgressData(habitProgressData);
      setHealthData(healthData);
      setFinanceData(financeData);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
    }
  };

  const filterAndSortEvents = () => {
    let result = [...events];

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) || 
        (event.description && event.description.toLowerCase().includes(term))
      );
    }

    // Фильтрация по типу
    if (filterType !== 'all') {
      result = result.filter(event => event.type === filterType);
    }

    // Фильтрация по дате
    if (filterDate !== 'all') {
      const now = new Date();
      result = result.filter(event => {
        const eventDate = new Date(event.date);
        switch (filterDate) {
          case 'today':
            return eventDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return eventDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return eventDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return eventDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Сортировка
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    setFilteredEvents(result);
  };

  const getEventIcon = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'goal': return <Target className="h-4 w-4" />;
      case 'project': return <Folder className="h-4 w-4" />;
      case 'task': return <ListTodo className="h-4 w-4" />;
      case 'habit': return <ListChecks className="h-4 w-4" />;
      case 'journal': return <Calendar className="h-4 w-4" />;
      case 'idea': return <Lightbulb className="h-4 w-4" />;
      case 'family': return <Users className="h-4 w-4" />;
      case 'finance': return <Landmark className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'goal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'task': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'habit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'journal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'idea': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'family': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'finance': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'health': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const groupEventsByDate = (events: HistoryEvent[]) => {
    const groups: Record<string, HistoryEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    // Сортировка групп по дате (от новых к старым)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, events]) => ({
        date: new Date(date),
        events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  const getEntityLink = (event: HistoryEvent) => {
    if (!event.linkedEntityId || !event.linkedEntityType) return null;
    
    switch (event.linkedEntityType) {
      case 'globalGoal':
      case 'strategicGoal':
        return `/goals`;
      case 'project':
      case 'subProjectLevel1':
      case 'subProjectLevel2':
        return `/projects`;
      case 'task':
        return `/tasks`;
      case 'habit':
        return `/habits`;
      case 'journalEntry':
        return `/journal`;
      case 'idea':
        return `/ideas`;
      case 'familyEvent':
        return `/family`;
      case 'financialTransaction':
        return `/finance`;
      case 'healthIndicator':
        return `/health`;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">История</h1>
      
      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по истории..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Тип события" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="goal">Цели</SelectItem>
                <SelectItem value="project">Проекты</SelectItem>
                <SelectItem value="task">Задачи</SelectItem>
                <SelectItem value="habit">Привычки</SelectItem>
                <SelectItem value="journal">Дневник</SelectItem>
                <SelectItem value="idea">Идеи</SelectItem>
                <SelectItem value="family">Семья</SelectItem>
                <SelectItem value="finance">Финансы</SelectItem>
                <SelectItem value="health">Здоровье</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">Последняя неделя</SelectItem>
                <SelectItem value="month">Последний месяц</SelectItem>
                <SelectItem value="year">Последний год</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Дата (новые первые)</SelectItem>
                <SelectItem value="date_asc">Дата (старые первые)</SelectItem>
                <SelectItem value="title_asc">Название (А-Я)</SelectItem>
                <SelectItem value="title_desc">Название (Я-А)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Достижения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
              Пока нет достижений. Продолжайте работать над своими целями!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(achievement.date), 'dd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Исторические события */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Исторические события
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groupedEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
              Нет событий для отображения.
            </p>
          ) : (
            <div className="space-y-8">
              {groupedEvents.map(({ date, events }) => (
                <div key={date.toISOString()} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(date, 'dd MMMM yyyy', { locale: ru })}
                  </h3>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div 
                        key={event.id} 
                        className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {event.title}
                              </h4>
                              {event.linkedEntityId && event.linkedEntityType && (
                                <Link to={getEntityLink(event) || '#'}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Перейти к элементу</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                  </Button>
                                </Link>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className={getEventColor(event.type)}>
                                {event.type === 'goal' && 'Цель'}
                                {event.type === 'project' && 'Проект'}
                                {event.type === 'task' && 'Задача'}
                                {event.type === 'habit' && 'Привычка'}
                                {event.type === 'journal' && 'Дневник'}
                                {event.type === 'idea' && 'Идея'}
                                {event.type === 'family' && 'Семья'}
                                {event.type === 'finance' && 'Финансы'}
                                {event.type === 'health' && 'Здоровье'}
                              </Badge>
                              {event.status && (
                                <Badge variant="outline">
                                  {event.status}
                                </Badge>
                              )}
                              {event.category && (
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                              )}
                              {event.progress !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Progress value={event.progress} className="w-24" />
                                  <span className="text-xs text-gray-500">{event.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
