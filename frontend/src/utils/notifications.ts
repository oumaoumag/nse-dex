/**
 * Notification utilities for consistent user feedback
 */

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// Event-based notification system
const listeners: ((notification: Notification) => void)[] = [];

/**
 * Show a notification
 * 
 * @param type - Notification type
 * @param title - Title
 * @param message - Message
 * @param duration - Duration in ms (default: 5000)
 * @returns Notification ID
 */
export function showNotification(
  type: NotificationType,
  title: string,
  message: string,
  duration: number = 5000
): string {
  const id = Date.now().toString();
  const notification: Notification = {
    id,
    type,
    title,
    message,
    duration
  };
  
  // Notify all listeners
  listeners.forEach(listener => listener(notification));
  
  return id;
}

/**
 * Success notification
 * 
 * @param title - Title
 * @param message - Message
 * @returns Notification ID
 */
export function showSuccess(title: string, message: string): string {
  return showNotification('success', title, message);
}

/**
 * Error notification
 * 
 * @param title - Title
 * @param message - Message
 * @returns Notification ID
 */
export function showError(title: string, message: string): string {
  return showNotification('error', title, message);
}

/**
 * Info notification
 * 
 * @param title - Title
 * @param message - Message
 * @returns Notification ID
 */
export function showInfo(title: string, message: string): string {
  return showNotification('info', title, message);
}

/**
 * Warning notification
 * 
 * @param title - Title
 * @param message - Message
 * @returns Notification ID
 */
export function showWarning(title: string, message: string): string {
  return showNotification('warning', title, message);
}

/**
 * Add a notification listener
 * 
 * @param listener - Listener function
 */
export function addNotificationListener(
  listener: (notification: Notification) => void
): void {
  listeners.push(listener);
}

/**
 * Remove a notification listener
 * 
 * @param listener - Listener function
 */
export function removeNotificationListener(
  listener: (notification: Notification) => void
): void {
  const index = listeners.indexOf(listener);
  if (index > -1) {
    listeners.splice(index, 1);
  }
}
