import React from 'react';
import { X, Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';
import { Language, translations } from '../utils/translations';

interface NotificationModalProps {
  notifications: AppNotification[];
  currentLang: Language;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  currentLang,
  onClose,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const t = translations[currentLang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">{t.notifications.title}</h3>
            {notifications.length > 0 && (
              <span className="text-xs bg-teal-600 px-2 py-0.5 rounded-full font-semibold">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>{t.notifications.empty}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`pt-3 first:pt-0 ${
                  !n.isRead ? 'bg-teal-50/50 -mx-4 px-4 py-3 rounded-lg' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />}
                    {currentLang === 'FR' ? n.titleFr : n.titleAr}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentLang === 'FR' ? n.messageFr : n.messageAr}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold transition"
            >
              <Check className="w-3.5 h-3.5" />
              {t.notifications.markAllRead}
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.notifications.clearAll}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
