import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface NotificationPreferences {
  transferComplete: boolean;
  batchComplete: boolean;
  transferFailed: boolean;
  lowInventory: boolean;
}

interface NotificationContextType {
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  requestPermission: () => Promise<void>;
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  notify: (type: keyof NotificationPreferences, title: string, body: string) => void;
}

const STORAGE_KEY = 'mhe-notification-prefs';

const defaultPreferences: NotificationPreferences = {
  transferComplete: true,
  batchComplete: true,
  transferFailed: true,
  lowInventory: false,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const setPreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const notify = useCallback((type: keyof NotificationPreferences, title: string, body: string) => {
    if (permission !== 'granted') return;
    if (!preferences[type]) return;
    new Notification(title, { body, icon: '/vite.svg' });
  }, [permission, preferences]);

  return (
    <NotificationContext.Provider value={{ permission, preferences, requestPermission, setPreference, notify }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
