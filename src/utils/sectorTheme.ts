import { SectorType } from '../types';
import { BadgeVariant } from '../components/ui';

interface SectorTheme {
  badge: BadgeVariant;
  /** 3D pill classes for the selected/active state (gradient + border + solid drop shadow) */
  pillActive: string;
  /** Tinted vivid classes for the idle (unselected) pill state — always colored, not just on selection */
  pillIdle: string;
}

// Une couleur vive et distincte par secteur métier, pour repérer les
// catégories au premier coup d'œil (pastilles de filtre + badges des fiches).
export const SECTOR_THEME: Record<SectorType, SectorTheme> = {
  ALL: {
    badge: 'primary',
    pillActive: 'bg-gradient-to-b from-teal-600 to-teal-700 text-white border-teal-800/40 shadow-[0_2px_0_0_#0f766e]',
    pillIdle: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
  },
  HEALTH: {
    badge: 'rose',
    pillActive: 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-800/40 shadow-[0_2px_0_0_#be123c]',
    pillIdle: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
  },
  BEAUTY: {
    badge: 'fuchsia',
    pillActive: 'bg-gradient-to-b from-fuchsia-500 to-fuchsia-600 text-white border-fuchsia-700/40 shadow-[0_2px_0_0_#a21caf]',
    pillIdle: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-100',
  },
  ADMIN: {
    badge: 'majorelle',
    pillActive:
      'bg-gradient-to-b from-waqt-majorelle-600 to-waqt-majorelle-700 text-white border-waqt-majorelle-800/40 shadow-[0_2px_0_0_#412fa0]',
    pillIdle: 'bg-waqt-majorelle-50 text-waqt-majorelle-800 border-waqt-majorelle-200 hover:bg-waqt-majorelle-100',
  },
  AUTO: {
    badge: 'sky',
    pillActive: 'bg-gradient-to-b from-sky-600 to-sky-700 text-white border-sky-800/40 shadow-[0_2px_0_0_#0369a1]',
    pillIdle: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
  },
  ARTISAN: {
    badge: 'orange',
    pillActive: 'bg-gradient-to-b from-orange-600 to-orange-700 text-white border-orange-800/40 shadow-[0_2px_0_0_#c2410c]',
    pillIdle: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
  },
};
