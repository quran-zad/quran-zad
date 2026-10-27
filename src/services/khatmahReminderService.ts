// Khatmah Reminder and Notification Service
import { KhatmahPlan } from '../types';

const LAST_REMINDER_DATE_KEY = 'nur_quran_last_khatmah_reminder_date';
const LAST_COMPLETION_ALERT_DATE_KEY = 'nur_quran_last_khatmah_completion_alert_date';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export const KhatmahReminderService = {
  getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionStatus;
  },

  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      return result as NotificationPermissionStatus;
    } catch {
      return Notification.permission as NotificationPermissionStatus;
    }
  },

  playGentleTone(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Islamic bell / gentle melody
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + index * 0.15;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
    } catch {}
  },

  sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      this.playGentleTone();
      const n = new Notification(title, {
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        dir: 'rtl',
        lang: 'ar',
        ...options,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
      return true;
    } catch (e) {
      console.warn('Could not dispatch browser notification:', e);
      return false;
    }
  },

  sendTestNotification(plan?: KhatmahPlan | null): boolean {
    const pagesLeftToday = plan 
      ? Math.max(0, plan.dailyPagesTarget - (plan.todayPagesRead || 0)) 
      : 20;

    return this.sendBrowserNotification('تذكير ورد الختمة القرآنية 📖', {
      body: `أهلاً بك! هذا تذكير تجريبي لوردك اليومي. متبقي لك اليوم ${pagesLeftToday} صفحة لإتمام هدفك. نسأل الله لك التوفيق والبركة.`,
      tag: 'khatmah-test-reminder',
    });
  },

  checkAndTriggerDailyReminder(plan: KhatmahPlan, onInAppAlert?: (message: string) => void): boolean {
    if (!plan || plan.status !== 'active' || !plan.reminderEnabled) return false;

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastReminderDate = localStorage.getItem(LAST_REMINDER_DATE_KEY);

    // If already reminded today, don't repeat
    if (lastReminderDate === todayStr) return false;

    // Check if user already completed today's target
    if (plan.todayPagesRead >= plan.dailyPagesTarget) return false;

    // Check current time against reminderTime
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentMinutesTotal = currentHours * 60 + currentMinutes;

    const [remindH, remindM] = (plan.reminderTime || '20:00').split(':').map(n => parseInt(n) || 0);
    const targetMinutesTotal = remindH * 60 + remindM;

    // If current time is at or past scheduled reminder time
    if (currentMinutesTotal >= targetMinutesTotal) {
      const remainingToday = Math.max(0, plan.dailyPagesTarget - (plan.todayPagesRead || 0));
      const title = 'تذكير ورد الختمة القرآنية اليومي 📖';
      const body = `السلام عليكم ورحمة الله، حان وقت وردك اليومي! متبقي لك اليوم ${remainingToday} صفحة من وردك (الصفحة الحالية ${plan.currentPage}).`;

      localStorage.setItem(LAST_REMINDER_DATE_KEY, todayStr);
      
      let sent = false;
      if (this.getPermissionStatus() === 'granted') {
        sent = this.sendBrowserNotification(title, {
          body,
          tag: 'khatmah-daily-reminder',
        });
      }

      if (onInAppAlert) {
        onInAppAlert(body);
      }
      return sent;
    }

    return false;
  },

  triggerCompletionCelebration(plan: KhatmahPlan, onInAppToast?: (msg: string) => void): void {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastAlert = localStorage.getItem(LAST_COMPLETION_ALERT_DATE_KEY);

    if (lastAlert === todayStr) return; // already celebrated today
    localStorage.setItem(LAST_COMPLETION_ALERT_DATE_KEY, todayStr);

    const title = 'مبارك! أتممت وردك القرآني اليوم بنجاح 🌟';
    const body = `هنيئاً لك! أنجزت اليوم ${plan.todayPagesRead} صفحة من خطتك المباركة. جعله الله نوراً لك وشفيعاً يوم القيامة.`;

    this.playGentleTone();

    if (this.getPermissionStatus() === 'granted') {
      this.sendBrowserNotification(title, {
        body,
        tag: 'khatmah-daily-completion',
      });
    }

    if (onInAppToast) {
      onInAppToast(body);
    }
  }
};
