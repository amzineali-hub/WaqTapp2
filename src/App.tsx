import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { ProfessionalView } from './components/ProfessionalView';
import { AdminDirectoryView } from './components/AdminDirectoryView';
import { NotificationModal } from './components/NotificationModal';
import {
  getStoredProfessionals,
  saveStoredProfessionals,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredStaff,
  saveStoredStaff,
  getStoredRoles,
} from './utils/storage';
import { Professional, UserAppointment, AppNotification, StaffMember } from './types';
import { Language } from './utils/translations';
import { ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [activeTab, setActiveTab] = useState<'CITOYEN' | 'PRO' | 'ADMIN'>('CITOYEN');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Core app state
  const [professionals, setProfessionals] = useState<Professional[]>(getStoredProfessionals);
  const [appointments, setAppointments] = useState<UserAppointment[]>(getStoredAppointments);
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications);
  const [staff, setStaff] = useState<StaffMember[]>(getStoredStaff);
  const roles = getStoredRoles();

  // Pick Dr. Ali Alami (ID 1) as the default professional for Pro view
  const currentPro = professionals.find((p) => p.id === 1) || professionals[0];

  // RTL / LTR document effect
  useEffect(() => {
    document.documentElement.dir = currentLang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.toLowerCase();
  }, [currentLang]);

  // Sync to storage
  useEffect(() => {
    saveStoredProfessionals(professionals);
  }, [professionals]);

  useEffect(() => {
    saveStoredAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveStoredStaff(staff);
  }, [staff]);

  // Add notification helper
  const addNotification = (titleFr: string, titleAr: string, messageFr: string, messageAr: string) => {
    const newNotif: AppNotification = {
      id: Date.now(),
      titleFr,
      titleAr,
      messageFr,
      messageAr,
      timestamp: Date.now(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Client actions
  const handleBookAppointment = (data: Omit<UserAppointment, 'id' | 'createdTimestamp'>) => {
    const newApp: UserAppointment = {
      ...data,
      id: Date.now(),
      createdTimestamp: Date.now(),
    };
    setAppointments((prev) => [newApp, ...prev]);

    addNotification(
      "Rendez-vous confirmé !",
      "تم تأكيد الموعد بنجاح !",
      `Votre rendez-vous avec ${data.professionalName} le ${data.date} à ${data.time} est confirmé.`,
      `تم تأكيد موعدكم مع ${data.professionalName} بتاريخ ${data.date} في تمام الساعة ${data.time}.`
    );
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
    );

    addNotification(
      "Rendez-vous annulé",
      "تم إلغاء الموعد",
      "Le rendez-vous a été annulé avec succès.",
      "تم إلغاء الموعد المحدد بنجاح."
    );
  };

  // Pro actions
  const handleUpdateAppointmentStatus = (id: number, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    const statusLabel =
      status === 'CONFIRMED' ? 'confirmé' : status === 'COMPLETED' ? 'terminé' : 'annulé';
    addNotification(
      `Statut de rendez-vous mis à jour`,
      `تم تحديث حالة الموعد`,
      `Le rendez-vous #${id} a été marqué comme ${statusLabel}.`,
      `تم تحديث الموعد #${id} إلى الحالة الجديدة.`
    );
  };

  const handleSubscribe = (plan: 'FREE' | 'MAWID_PRO_MONTHLY' | 'MAWID_PRO_YEARLY') => {
    const updated = professionals.map((p) => {
      if (p.id === currentPro.id) {
        return {
          ...p,
          isSubscribed: plan !== 'FREE',
          subscriptionPlan: plan,
          subscriptionExpiry:
            Date.now() +
            (plan === 'MAWID_PRO_MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000,
        };
      }
      return p;
    });
    setProfessionals(updated);

    addNotification(
      "Abonnement Pro activé !",
      "تم تفعيل اشتراك موعد برو !",
      `Félicitations, votre cabinet bénéficie désormais du badge Partenaire Vérifié avec le plan ${plan}.`,
      `تهانينا، تم ترقية حسابكم المهني وتفعيل شارة الشريك المعتمد بنجاح.`
    );
  };

  const handleAddStaff = (member: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...member,
      id: Date.now(),
    };
    setStaff((prev) => [...prev, newMember]);
    addNotification(
      "Collaborateur ajouté",
      "تمت إضافة عضو جديد للفريق",
      `${member.name} a été ajouté à votre équipe avec succès.`,
      `تمت إضافة ${member.name} إلى فريق العمل بنجاح.`
    );
  };

  const handleDeleteStaff = (id: number) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // Admin actions
  const handleImportProfessionals = (newPros: Professional[]) => {
    setProfessionals((prev) => [...newPros, ...prev]);
    addNotification(
      "Alimentation de l'annuaire réussie",
      "تمت تغذية دليل المهنيين بنجاح",
      `${newPros.length} nouveaux professionnels ont été ajoutés à la base publique.`,
      `تمت إضافة ${newPros.length} مهنيين جدد إلى قاعدة البيانات العامة.`
    );
  };

  const handleUpdateProfessional = (updatedPro: Professional) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === updatedPro.id ? updatedPro : p))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setShowNotificationModal(true)}
      />

      {/* Demo Mode Notice Banner */}
      <div className="bg-teal-700 text-white text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              {currentLang === 'FR'
                ? "Plateforme en Accès Public Libre : Pas d'inscription ni d'e-mail requis pour tester le parcours Citoyen, Pro ou Admin !"
                : "منصة مفتوحة للجميع بدون تسجيل دخول أو بريد إلكتروني: تجربة حرة ومباشرة لكافة الخدمات !"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-teal-100 bg-teal-800/60 px-2.5 py-0.5 rounded-full border border-teal-600/60">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>{currentLang === 'FR' ? 'Démo Active' : 'وضع تجريبي نشط'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'CITOYEN' && (
          <ClientView
            professionals={professionals}
            appointments={appointments}
            currentLang={currentLang}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'PRO' && (
          <ProfessionalView
            currentPro={currentPro}
            appointments={appointments}
            staff={staff}
            roles={roles}
            currentLang={currentLang}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onSubscribe={handleSubscribe}
            onAddStaff={handleAddStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminDirectoryView
            professionals={professionals}
            currentLang={currentLang}
            onImportProfessionals={handleImportProfessionals}
            onUpdateProfessional={handleUpdateProfessional}
          />
        )}
      </main>

      {/* Notifications Modal */}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          currentLang={currentLang}
          onClose={() => setShowNotificationModal(false)}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
          onClearAll={() => setNotifications([])}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            WaqtApp • {currentLang === 'FR' ? "L'Art de Gérer son Temps et ses Rendez-vous au Maroc" : "منصة حجز المواعيد والخدمات في المغرب"}
          </p>
          <p>
            {currentLang === 'FR'
              ? 'Application Web Réactive • Déploiement optimisé pour Vercel'
              : 'تطبيق ويب متجاوب وسريع • جاهز للنشر على منصة Vercel'}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
