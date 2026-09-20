import { UserAppointment } from '../types';

const NOTIFIED_KEY = 'waqtapp_notified_1h_alerts';

/**
 * Parses appointment date & time safely into a JavaScript Date object.
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  try {
    let year = 0;
    let month = 0;
    let day = 0;

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-').map(Number);
      if (parts[0] > 1000) {
        [year, month, day] = parts;
      } else {
        [day, month, year] = parts;
      }
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/').map(Number);
      [day, month, year] = parts;
    } else {
      return null;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

/**
 * Calculates how many minutes remain until the appointment.
 * Returns null if parsing fails.
 * Positive number = minutes in the future.
 * Negative number = minutes in the past.
 */
export function getMinutesRemaining(app: UserAppointment, now = Date.now()): number | null {
  const dt = parseAppointmentDateTime(app.date, app.time);
  if (!dt) return null;
  const diffMs = dt.getTime() - now;
  return Math.floor(diffMs / (60 * 1000));
}

/**
 * Checks if an appointment is scheduled within the 1-hour window (<= 60 mins away and not finished).
 */
export function isAppointmentWithinOneHour(app: UserAppointment, now = Date.now()): boolean {
  if (app.status !== 'CONFIRMED') return false;
  const minutes = getMinutesRemaining(app, now);
  if (minutes === null) return false;
  // Trigger between 60 minutes before and up to 10 minutes after scheduled start
  return minutes <= 60 && minutes >= -10;
}

/**
 * Retrieve list of appointment IDs for which the 1-hour notification has already been triggered.
 */
export function getNotified1hAlerts(): number[] {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record that an appointment has had its 1-hour notification triggered.
 */
export function mark1hAlertAsNotified(id: number) {
  try {
    const list = getNotified1hAlerts();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Plays an alert audio chime using Web Audio API (no external asset needed).
 */
export function playAlertChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Melodic two-tone ping (D5 -> A5)
    playTone(587.33, 0, 0.35);
    playTone(880.0, 0.18, 0.55);
  } catch (e) {
    console.debug('Audio chime unable to play', e);
  }
}

/**
 * Sends a native browser desktop notification if permission is granted.
 */
export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/logo.svg',
      });
    } catch (e) {
      console.debug('Browser notification failed', e);
    }
  }
}
