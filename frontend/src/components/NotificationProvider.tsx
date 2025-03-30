'use client';

import React, { useEffect, useState } from 'react';
import {
  addNotificationListener,
  removeNotificationListener,
  Notification
} from '../utils/notifications';

/**
 * The UI component for displaying notifications
 */
function NotificationsUI() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Handle new notifications
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      }
    };

    // Register listener
    addNotificationListener(handleNotification);

    // Cleanup
    return () => removeNotificationListener(handleNotification);
  }, []);

  // Remove a notification manually
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Get CSS classes based on notification type
  const getTypeClasses = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-md shadow-md border-l-4 flex items-start ${getTypeClasses(notification.type)}`}
        >
          <div className="flex-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Notification provider component wrapper
 * Accepts children and renders the NotificationsUI alongside them
 */
export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationsUI />
      {children}
    </>
  );
}
