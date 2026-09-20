import React, { useState } from 'react';
import { Lock, Mail, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { signInProfessional, signUpProfessional } from '../services/auth';
import { Language } from '../utils/translations';

interface AuthGateProps {
  currentLang: Language;
  context: 'PRO' | 'ADMIN';
  onAuthenticated: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ currentLang, context, onAuthenticated }) => {
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const isFr = currentLang === 'FR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'SIGN_IN') {
        await signInProfessional(email, password);
        onAuthenticated();
      } else {
        await signUpProfessional(email, password);
        setSignupDone(true);
      }
    } catch (err: any) {
      setError(err?.message || (isFr ? 'Une erreur est survenue.' : 'حدث خطأ ما.'));
    } finally {
      setLoading(false);
    }
  };

  if (signupDone) {
    return (
      <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
        <ShieldCheck className="w-10 h-10 mx-auto text-teal-600" />
        <p className="text-sm text-slate-700 font-medium">
          {isFr
            ? 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.'
            : 'تم إنشاء الحساب! تحققوا من بريدكم الإلكتروني لتأكيد العنوان قبل تسجيل الدخول.'}
        </p>
        <button
          onClick={() => { setSignupDone(false); setMode('SIGN_IN'); }}
          className="text-xs font-bold text-teal-700 underline"
        >
          {isFr ? "Retour à la connexion" : "العودة لتسجيل الدخول"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="text-center space-y-1">
        <Lock className="w-8 h-8 mx-auto text-teal-600" />
        <h3 className="font-bold text-slate-900">
          {context === 'ADMIN'
            ? (isFr ? 'Connexion Administration' : 'دخول الإدارة')
            : (isFr ? 'Connexion Espace Professionnel' : 'دخول الفضاء المهني')}
        </h3>
        <p className="text-xs text-slate-500">
          {isFr
            ? "Connectez-vous ou créez un compte pour accéder à cet espace."
            : "سجلوا الدخول أو أنشئوا حسابًا للوصول إلى هذا الفضاء."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isFr ? 'Mot de passe' : 'كلمة المرور'}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2"
        >
          {mode === 'SIGN_IN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {loading
            ? (isFr ? 'Patientez...' : 'يرجى الانتظار...')
            : mode === 'SIGN_IN'
            ? (isFr ? 'Se connecter' : 'تسجيل الدخول')
            : (isFr ? 'Créer un compte' : 'إنشاء حساب')}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'); setError(null); }}
        className="w-full text-center text-xs font-semibold text-slate-500 hover:text-teal-700"
      >
        {mode === 'SIGN_IN'
          ? (isFr ? "Pas encore de compte ? Créez-en un" : "ليس لديكم حساب؟ أنشئوا واحدًا")
          : (isFr ? 'Déjà un compte ? Connectez-vous' : 'لديكم حساب بالفعل؟ سجلوا الدخول')}
      </button>
    </div>
  );
};
