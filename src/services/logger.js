import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

class Logger {
  constructor() {
    this.logCollection = collection(db, 'logs');
  }

  async log(level, message, data = null, userId = null) {
    try {
      const logEntry = {
        level,
        message,
        data,
        userId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      await addDoc(this.logCollection, logEntry);
      
      // Also log to console for development
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    } catch (error) {
      console.error('Failed to log to Firebase:', error);
    }
  }

  async info(message, data = null, userId = null) {
    await this.log('info', message, data, userId);
  }

  async error(message, data = null, userId = null) {
    await this.log('error', message, data, userId);
  }

  async warn(message, data = null, userId = null) {
    await this.log('warn', message, data, userId);
  }

  async debug(message, data = null, userId = null) {
    await this.log('debug', message, data, userId);
  }

  async activity(action, details = null, userId = null) {
    await this.log('activity', `User performed action: ${action}`, details, userId);
  }
}

export const logger = new Logger();
export default logger;