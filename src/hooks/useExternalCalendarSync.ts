import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  when: {
    dateTime?: string;
    date?: string;
    end?: { dateTime?: string; date?: string };
  };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

interface UseExternalCalendarSyncOptions {
  googleCalendarId?: string;
  outlookCalendarId?: string;
  syncInterval?: number; // in milliseconds
}

// В реальной реализации здесь будет код для работы с Google Calendar API и Outlook Calendar API
// Пока используем моковые данные для демонстрации
const mockGoogleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Встреча с командой',
    description: 'Еженедельная встреча для обсуждения прогресса проекта',
    when: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
      end: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString() }
    },
    location: 'Конференц-зал A',
    attendees: [{ email: 'team@example.com' }]
  },
  {
    id: '2',
    title: 'Обзор квартального отчета',
    description: 'Анализ результатов прошедшего квартала',
    when: {
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Послезавтра
      end: { dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString() }
    },
    location: 'Онлайн (Zoom)',
    attendees: [{ email: 'management@example.com' }]
  }
];

const mockOutlookEvents: CalendarEvent[] = [
  {
    id: '3',
    title: 'Врачебный осмотр',
    description: 'Ежегодный медицинский осмотр',
    when: {
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Через 3 дня
      end: { dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString() }
    },
    location: 'Медицинский центр "Здоровье"',
    attendees: [{ email: 'doctor@clinic.com' }]
  }
];

export const useExternalCalendarSync = (options: UseExternalCalendarSyncOptions = {}) => {
  const { googleCalendarId = 'primary', outlookCalendarId, syncInterval = 300000 } = options; // 5 минут по умолчанию
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [outlookEvents, setOutlookEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleCalendarEvents = async () => {
    try {
      // В реальной реализации здесь будет код для получения событий из Google Calendar API
      // Например, использование gapi.client.calendar.events.list()
      console.log('Fetching Google Calendar events...');
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoogleEvents(mockGoogleEvents);
    } catch (err) {
      console.error('Error fetching Google Calendar events:', err);
      setError('Failed to fetch Google Calendar events.');
    }
  };

  const fetchOutlookCalendarEvents = async () => {
    try {
      // В реальной реализации здесь будет код для получения событий из Outlook Calendar API
      // Например, использование Microsoft Graph API или Nylas SDK
      console.log('Fetching Outlook Calendar events...');
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutlookEvents(mockOutlookEvents);
    } catch (err) {
      console.error('Error fetching Outlook Calendar events:', err);
      setError('Failed to fetch Outlook Calendar events.');
    }
  };

  const syncCalendars = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchGoogleCalendarEvents(),
        outlookCalendarId ? fetchOutlookCalendarEvents() : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Error syncing calendars:', err);
      setError('Failed to sync calendars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncCalendars(); // Initial sync

    // Set up interval for periodic syncing
    const intervalId = setInterval(syncCalendars, syncInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [googleCalendarId, outlookCalendarId, syncInterval]);

  // Функция для добавления события в Google Calendar
  const addGoogleEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      // В реальной реализации здесь будет код для добавления события в Google Calendar
      // Например, использование gapi.client.calendar.events.insert()
      console.log('Adding event to Google Calendar:', event);
      // Генерируем ID для нового события
      const newEvent: CalendarEvent = {
        ...event,
        id: `google-${Date.now()}`
      };
      setGoogleEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error adding Google Calendar event:', err);
      throw new Error('Failed to add Google Calendar event.');
    }
  };

  // Функция для добавления события в Outlook Calendar
  const addOutlookEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      // В реальной реализации здесь будет код для добавления события в Outlook Calendar
      // Например, использование Microsoft Graph API или Nylas SDK
      console.log('Adding event to Outlook Calendar:', event);
      // Генерируем ID для нового события
      const newEvent: CalendarEvent = {
        ...event,
        id: `outlook-${Date.now()}`
      };
      setOutlookEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error adding Outlook Calendar event:', err);
      throw new Error('Failed to add Outlook Calendar event.');
    }
  };

  // Функция для обновления события в Google Calendar
  const updateGoogleEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      // В реальной реализации здесь будет код для обновления события в Google Calendar
      // Например, использование gapi.client.calendar.events.update()
      console.log('Updating Google Calendar event:', eventId, updates);
      setGoogleEvents(prev =>
        prev.map(event => event.id === eventId ? { ...event, ...updates } : event)
      );
    } catch (err) {
      console.error('Error updating Google Calendar event:', err);
      throw new Error('Failed to update Google Calendar event.');
    }
  };

  // Функция для обновления события в Outlook Calendar
  const updateOutlookEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      // В реальной реализации здесь будет код для обновления события в Outlook Calendar
      // Например, использование Microsoft Graph API или Nylas SDK
      console.log('Updating Outlook Calendar event:', eventId, updates);
      setOutlookEvents(prev =>
        prev.map(event => event.id === eventId ? { ...event, ...updates } : event)
      );
    } catch (err) {
      console.error('Error updating Outlook Calendar event:', err);
      throw new Error('Failed to update Outlook Calendar event.');
    }
  };

  // Функция для удаления события из Google Calendar
  const deleteGoogleEvent = async (eventId: string) => {
    try {
      // В реальной реализации здесь будет код для удаления события из Google Calendar
      // Например, использование gapi.client.calendar.events.delete()
      console.log('Deleting Google Calendar event:', eventId);
      setGoogleEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Error deleting Google Calendar event:', err);
      throw new Error('Failed to delete Google Calendar event.');
    }
  };

  // Функция для удаления события из Outlook Calendar
  const deleteOutlookEvent = async (eventId: string) => {
    try {
      // В реальной реализации здесь будет код для удаления события из Outlook Calendar
      // Например, использование Microsoft Graph API или Nylas SDK
      console.log('Deleting Outlook Calendar event:', eventId);
      setOutlookEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Error deleting Outlook Calendar event:', err);
      throw new Error('Failed to delete Outlook Calendar event.');
    }
  };

  return {
    googleEvents,
    outlookEvents,
    loading,
    error,
    refetch: syncCalendars,
    addGoogleEvent,
    addOutlookEvent,
    updateGoogleEvent,
    updateOutlookEvent,
    deleteGoogleEvent,
    deleteOutlookEvent
  };
};