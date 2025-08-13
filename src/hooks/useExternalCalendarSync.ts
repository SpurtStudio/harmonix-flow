import { useState, useEffect } from 'react';
import Nylas from 'nylas';
import { google } from 'googleapis';

// TODO: Replace with actual Google Calendar API client initialization
const googleCalendarClient = google.calendar({ version: 'v3', auth: process.env.GOOGLE_CALENDAR_API_KEY });

// TODO: Replace with actual Nylas SDK client initialization
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
});

interface CalendarEvent {
  id: string;
  title: string; // Changed from summary
  description?: string; // Added description
  when: {
    dateTime?: string; // Changed from start.dateTime
    date?: string;     // Changed from start.date
    end?: { dateTime?: string; date?: string }; // Added end time
  };
  // Add other relevant event properties
}

interface UseExternalCalendarSyncOptions {
  googleCalendarId?: string; // e.g., 'primary' or a specific calendar ID
  outlookCalendarId?: string; // Nylas uses identifier for calendars, might be an email address or a specific ID
  syncInterval?: number; // in milliseconds
}

export const useExternalCalendarSync = (options: UseExternalCalendarSyncOptions = {}) => {
  const { googleCalendarId = 'primary', outlookCalendarId, syncInterval = 60000 } = options;
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [outlookEvents, setOutlookEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleCalendarEvents = async () => {
    try {
      // TODO: Implement proper authentication for Google Calendar API
      const response = await googleCalendarClient.events.list({
        calendarId: googleCalendarId,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      setGoogleEvents(response.data.items as CalendarEvent[]);
    } catch (err) {
      console.error('Error fetching Google Calendar events:', err);
      setError('Failed to fetch Google Calendar events.');
      // Consider more specific error handling
    }
  };

  const fetchOutlookCalendarEvents = async () => {
    if (!outlookCalendarId) return; // Assuming outlookCalendarId is a grantId for Nylas
    try {
      // TODO: Implement proper authentication for Nylas API
      // The identifier for events.list should be a grantId.
      const response = await nylas.events.list({
        identifier: outlookCalendarId, // Use grantId here
        limit: 10,
        // Add other parameters as needed, e.g., timeMin, timeMax
      });

      // Map Nylas event structure to our CalendarEvent interface
      const mappedEvents: CalendarEvent[] = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        when: event.when, // This should match the structure of CalendarEvent.when
      }));
      setOutlookEvents(mappedEvents);
    } catch (err) {
      console.error('Error fetching Outlook Calendar events:', err);
      setError('Failed to fetch Outlook Calendar events.');
      // Consider more specific error handling
    }
  };

  useEffect(() => {
    const syncCalendars = async () => {
      setLoading(true);
      setError(null);
      await fetchGoogleCalendarEvents();
      if (outlookCalendarId) {
        await fetchOutlookCalendarEvents();
      }
      setLoading(false);
    };

    syncCalendars(); // Initial sync

    // Set up interval for periodic syncing
    const intervalId = setInterval(syncCalendars, syncInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [googleCalendarId, outlookCalendarId, syncInterval]); // Re-run effect if these options change

  return {
    googleEvents,
    outlookEvents,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      await fetchGoogleCalendarEvents();
      if (outlookCalendarId) {
        await fetchOutlookCalendarEvents();
      }
      setLoading(false);
    },
  };
};