import React from 'react';
import { Calendar, User, Briefcase, Database, Globe, Bell, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { AppNotification } from '../types';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'CITOYEN' | 'PRO' | 'ADMIN';
  onTabChange: (tab: 'CITOYEN' | 'PRO' | 'ADMIN') => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  notifications,
  onOpenNotifications,
}) => {
  const t = translations[currentLang];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-teal-800">
                  {currentLang === 'FR' ? 'WaqtApp' : 'تطبيق وقت'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.demoBadge}
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Perspective / View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onTabChange('CITOYEN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'CITOYEN'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{t.roleCitoyen}</span>
              <span className="md:hidden">{currentLang === 'FR' ? 'Client' : 'مواطن'}</span>
            </button>

            <button
              onClick={() => onTabChange('PRO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'PRO'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden md:inline">{t.rolePro}</span>
              <span className="md:hidden">{currentLang === 'FR' ? 'Pro' : 'مهني'}</span>
            </button>

            <button
              onClick={() => onTabChange('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden md:inline">{t.roleAdmin}</span>
              <span className="md:hidden">{currentLang === 'FR' ? 'Annuaire' : 'دليل'}</span>
            </button>
          </div>

          {/* Right Controls: Notifications & Language */}
          <div className="flex items-center gap-2">
            
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title={t.notifications.title}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(currentLang === 'FR' ? 'AR' : 'FR')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs md:text-sm font-bold shadow-xs transition"
            >
              <Globe className="w-4 h-4 text-teal-600" />
              <span>{currentLang === 'FR' ? 'العربية' : 'Français'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
