import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ChevronRight, X, Bell, MapPin, CheckCircle2 } from 'lucide-react';
import { UserAppointment } from '../types';
import { Language } from '../utils/translations';
import { getMinutesRemaining } from '../utils/appointmentAlerts';

interface UpcomingAppointmentAlertProps {
  urgentAppointments: UserAppointment[];
  currentLang: Language;
  onViewAppointment: (appointment: UserAppointment) => void;
  onDismiss: (appointmentId: number) => void;
}

export const UpcomingAppointmentAlert: React.FC<UpcomingAppointmentAlertProps> = ({
  urgentAppointments,
  currentLang,
  onViewAppointment,
  onDismiss,
}) => {
  const [browserNotifStatus, setBrowserNotifStatus] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  // Re-calculate remaining minutes dynamically every 15 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!urgentAppointments || urgentAppointments.length === 0) return null;

  // Pick the most imminent appointment
  const currentApp = urgentAppointments[0];
  const minutesLeft = getMinutesRemaining(currentApp) ?? 60;
  const isAr = currentLang === 'AR';

  const requestBrowserNotifs = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setBrowserNotifStatus(res);
      } catch (e) {
        console.debug('Notification permission error', e);
      }
    }
  };

  const formattedTimeLabel =
    minutesLeft <= 0
      ? isAr
        ? 'الموعد الآن !'
        : 'Le rendez-vous commence maintenant !'
      : isAr
      ? `يبدأ خلال ${minutesLeft} دقيقة`
      : `Dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg border-b border-amber-400/40 relative z-40 animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Left / Info segment */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* Pulsing clock icon */}
            <div className="relative shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 text-white">
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-rose-500"></span>
              </span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white text-amber-900 px-2 py-0.5 rounded-md shadow-xs">
                  {isAr ? '⏰ تنبيه اقتراب الموعد' : '⏰ Alerte 1 Heure : RDV imminent'}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-amber-100 bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-700/50">
                  {formattedTimeLabel}
                </span>
                {urgentAppointments.length > 1 && (
                  <span className="text-[10px] sm:text-[11px] bg-amber-800/80 px-2 py-0.5 rounded-full">
                    +{urgentAppointments.length - 1} {isAr ? 'موعد آخر' : 'autre'}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap truncate">
                <span className="truncate">{currentApp.professionalName}</span>
                <span className="opacity-75 font-normal">•</span>
                <span className="font-semibold">{currentApp.time}</span>
                <span className="opacity-75 font-normal flex items-center gap-1 text-[11px] sm:text-xs text-amber-100">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {currentApp.city}
                </span>
              </p>
            </div>
          </div>

          {/* Right / Actions segment */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-1.5 md:pt-0 border-t md:border-t-0 border-amber-400/30">
            {browserNotifStatus === 'default' && (
              <button
                onClick={requestBrowserNotifs}
                className="text-[11px] sm:text-xs font-medium text-amber-100 hover:text-white bg-amber-700/60 hover:bg-amber-700 px-2.5 py-1.5 rounded-xl border border-amber-400/30 transition flex items-center gap-1 min-h-[36px] touch-manipulation"
                title={isAr ? 'تفعيل الإشعارات على سطح المكتب' : 'Recevoir une alerte bureau'}
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{isAr ? 'إشعارات المتصفح' : 'Notifications'}</span>
              </button>
            )}

            <button
              onClick={() => onViewAppointment(currentApp)}
              className="flex-1 md:flex-none justify-center text-xs font-bold bg-white text-amber-900 hover:bg-amber-50 px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs transition flex items-center gap-1 min-h-[36px] touch-manipulation shrink-0"
            >
              <span>{isAr ? 'عرض تفاصيل الموعد' : 'Voir le rendez-vous'}</span>
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => onDismiss(currentApp.id)}
              className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-amber-700/50 transition shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
              aria-label={isAr ? 'إغلاق التنبيه' : "Masquer l'alerte"}
              title={isAr ? 'إغلاق التنبيه' : "Masquer l'alerte"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
