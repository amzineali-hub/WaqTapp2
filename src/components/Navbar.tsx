import React from 'react';
import { Calendar, User, Briefcase, Database, Globe, Bell, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { AppNotification } from '../types';
import { Badge } from './ui';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shrink-0 border border-teal-700/30 shadow-[0_3px_0_0_#115e59,0_4px_8px_-2px_rgba(13,148,136,0.4)]">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white bg-gradient-to-b from-teal-500 to-teal-600 px-2.5 py-0.5 rounded-lg border border-teal-700/30 shadow-[0_2px_0_0_#115e59]">
                  {currentLang === 'FR' ? 'WaqtApp' : 'وقتاب'}
                </span>
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">{t.demoBadge}</span>
                  <span className="xs:hidden">Démo</span>
                </Badge>
              </div>
              <p className="hidden md:block text-xs text-slate-500 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Perspective / View Mode Switcher (Desktop: Centered) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-0.5">
            <button
              onClick={() => onTabChange('CITOYEN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 ${
                activeTab === 'CITOYEN'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59,0_3px_6px_-1px_rgba(13,148,136,0.4)] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.roleCitoyen}</span>
            </button>

            <button
              onClick={() => onTabChange('PRO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 ${
                activeTab === 'PRO'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59,0_3px_6px_-1px_rgba(13,148,136,0.4)] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{t.rolePro}</span>
            </button>

            <button
              onClick={() => onTabChange('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 ${
                activeTab === 'ADMIN'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59,0_3px_6px_-1px_rgba(13,148,136,0.4)] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{t.roleAdmin}</span>
            </button>
          </div>

          {/* Right Controls: Notifications & Language */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-[0_2px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#94a3b8] active:translate-y-[2px] active:shadow-none transition-all duration-150 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={t.notifications.title}
              aria-label={t.notifications.title}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 text-[10px] font-bold bg-gradient-to-b from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center border border-amber-600/40 shadow-[0_1px_0_0_#b45309] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(currentLang === 'FR' ? 'AR' : 'FR')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-[0_2px_0_0_#cbd5e1] hover:shadow-[0_2px_0_0_#94a3b8] active:translate-y-[2px] active:shadow-none transition-all duration-150 touch-manipulation min-h-[40px]"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
              <span>{currentLang === 'FR' ? 'العربية' : 'Français'}</span>
            </button>

          </div>

        </div>

        {/* Perspective Switcher (Mobile & Tablet: Dedicated Full-Width Bar) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onTabChange('CITOYEN')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all duration-150 touch-manipulation ${
                activeTab === 'CITOYEN'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="truncate">{currentLang === 'FR' ? 'Citoyen' : 'مواطن'}</span>
            </button>

            <button
              onClick={() => onTabChange('PRO')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all duration-150 touch-manipulation ${
                activeTab === 'PRO'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate">{currentLang === 'FR' ? 'Pro' : 'مهني'}</span>
            </button>

            <button
              onClick={() => onTabChange('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all duration-150 touch-manipulation ${
                activeTab === 'ADMIN'
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-[0_2px_0_0_#115e59] border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="truncate">{currentLang === 'FR' ? 'Annuaire' : 'دليل'}</span>
            </button>
          </div>
        </div>

      </div>
      {/* Fin liseré tricolore — touche marocaine discrète (teal / amber / bleu Majorelle) */}
      <div className="h-[2px] bg-gradient-to-r from-teal-500 via-amber-400 to-waqt-majorelle-400" />
    </header>
  );
};
