import React, { useState } from 'react';
import { Lock, Mail, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { signInProfessional, signUpProfessional } from '../services/auth';
import { Language } from '../utils/translations';
import { Button, Card, Input } from './ui';

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
      <Card padding="lg" className="max-w-sm mx-auto mt-10 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 mx-auto text-teal-600" />
        <p className="text-sm text-slate-700 font-medium">
          {isFr
            ? 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.'
            : 'تم إنشاء الحساب! تحققوا من بريدكم الإلكتروني لتأكيد العنوان قبل تسجيل الدخول.'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSignupDone(false); setMode('SIGN_IN'); }}
          className="text-teal-700 hover:text-teal-800 underline mx-auto"
        >
          {isFr ? "Retour à la connexion" : "العودة لتسجيل الدخول"}
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="max-w-sm mx-auto mt-10 space-y-4">
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
        <Input
          type="email"
          required
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
        />
        <Input
          type="password"
          required
          minLength={6}
          icon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isFr ? 'Mot de passe' : 'كلمة المرور'}
        />

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          {!loading && (mode === 'SIGN_IN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
          {loading
            ? (isFr ? 'Patientez...' : 'يرجى الانتظار...')
            : mode === 'SIGN_IN'
            ? (isFr ? 'Se connecter' : 'تسجيل الدخول')
            : (isFr ? 'Créer un compte' : 'إنشاء حساب')}
        </Button>
      </form>

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => { setMode(mode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'); setError(null); }}
        className="text-slate-500 hover:text-waqt-majorelle-700 font-semibold"
      >
        {mode === 'SIGN_IN'
          ? (isFr ? "Pas encore de compte ? Créez-en un" : "ليس لديكم حساب؟ أنشئوا واحدًا")
          : (isFr ? 'Déjà un compte ? Connectez-vous' : 'لديكم حساب بالفعل؟ سجلوا الدخول')}
      </Button>
    </Card>
  );
};
