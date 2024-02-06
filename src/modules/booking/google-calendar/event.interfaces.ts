export type EventData = {
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees: string[];
  reminders: {
    useDefault: boolean;
    overrides: { method: string; minutes: number }[];
  };
};

export type Event = {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees: string[];
  reminders: {
    useDefault: boolean;
    overrides: { method: string; minutes: number }[];
  };
};
