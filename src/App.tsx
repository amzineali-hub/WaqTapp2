import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { ProfessionalView } from './components/ProfessionalView';
import { AdminDirectoryView } from './components/AdminDirectoryView';
import { NotificationModal } from './components/NotificationModal';
import { UpcomingAppointmentAlert } from './components/UpcomingAppointmentAlert';
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
import {
  isAppointmentWithinOneHour,
  getMinutesRemaining,
  getNotified1hAlerts,
  mark1hAlertAsNotified,
  playAlertChime,
  sendBrowserNotification,
} from './utils/appointmentAlerts';
import { ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [activeTab, setActiveTab] = useState<'CITOYEN' | 'PRO' | 'ADMIN'>('CITOYEN');
  const [clientSubTab, setClientSubTab] = useState<'DIRECTORY' | 'MY_APPOINTMENTS'>('DIRECTORY');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [dismissed1hAlertIds, setDismissed1hAlertIds] = useState<number[]>([]);

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

  // Automated 1-hour appointment alert scanner (runs on change and every 20 seconds)
  useEffect(() => {
    const scanAppointmentsFor1hAlert = () => {
      const now = Date.now();
      const notifiedList = getNotified1hAlerts();

      appointments.forEach((app) => {
        if (app.status === 'CONFIRMED' && isAppointmentWithinOneHour(app, now)) {
          // If we haven't triggered the 1-hour alert for this appointment yet
          if (!notifiedList.includes(app.id)) {
            mark1hAlertAsNotified(app.id);

            const minutesLeft = getMinutesRemaining(app, now);
            const timeDiffLabel =
              minutesLeft !== null && minutesLeft > 0 ? `dans ${minutesLeft} min` : 'imminent';
            const timeDiffLabelAr =
              minutesLeft !== null && minutesLeft > 0 ? `خلال ${minutesLeft} دقيقة` : 'الآن';

            // Add visual notification to notifications center
            addNotification(
              `⏰ Rappel 1h : Rendez-vous avec ${app.professionalName}`,
              `⏰ تذكير قبل ساعة : موعدكم مع ${app.professionalName}`,
              `Votre rendez-vous prévu à ${app.time} (${timeDiffLabel}) à ${app.city} approche. Préparez votre départ !`,
              `موعدكم المحدد على الساعة ${app.time} (${timeDiffLabelAr}) بمدينة ${app.city} يقترب. يرجى الاستعداد والتوجه إلى العنوان.`
            );

            // Play alert sound chime
            playAlertChime();

            // Send native browser desktop notification
            sendBrowserNotification(
              `WaqtApp - Rendez-vous dans 1 heure !`,
              `Votre rendez-vous avec ${app.professionalName} commence à ${app.time}.`
            );
          }
        }
      });
    };

    scanAppointmentsFor1hAlert();
    const interval = setInterval(scanAppointmentsFor1hAlert, 20000);
    return () => clearInterval(interval);
  }, [appointments]);

  // Compute urgent appointments (within 1 hour and not dismissed in current view)
  const urgentAppointments = appointments.filter(
    (app) => isAppointmentWithinOneHour(app) && !dismissed1hAlertIds.includes(app.id)
  );

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

  // Helper to simulate an urgent appointment scheduled in 50 minutes (for testing the 1-hour alert)
  const handleSimulateUrgentAppointment = () => {
    const now = new Date();
    const in50m = new Date(now.getTime() + 50 * 60 * 1000);
    const dateStr = in50m.toISOString().split('T')[0];
    const hours = String(in50m.getHours()).padStart(2, '0');
    const mins = String(in50m.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${mins}`;

    const pro = professionals[0] || {
      id: 1,
      name: 'Dr. Ali Alami',
      city: 'Casablanca',
      fees: 300,
      sector: 'HEALTH',
    };

    const testApp: UserAppointment = {
      id: Date.now(),
      professionalId: pro.id,
      professionalName: pro.name,
      sector: pro.sector || 'HEALTH',
      city: pro.city || 'Casablanca',
      date: dateStr,
      time: timeStr,
      userName: 'Karim Idrissi',
      userPhone: '0661223344',
      status: 'CONFIRMED',
      notes: "Rendez-vous test pour démonstration de l'alerte 1 heure avant",
      syncGoogleCalendar: true,
      needsReminders: true,
      cost: pro.fees || 300,
      paymentStatus: 'DEPOSIT_PAID',
      amountPaid: 50,
      createdTimestamp: Date.now(),
    };

    setAppointments((prev) => [testApp, ...prev]);
    setActiveTab('CITOYEN');
    setClientSubTab('MY_APPOINTMENTS');

    // Reset dismissed state for this appointment if needed
    setDismissed1hAlertIds((prev) => prev.filter((id) => id !== testApp.id));
  };

  const handleViewUrgentAppointment = (_app: UserAppointment) => {
    setActiveTab('CITOYEN');
    setClientSubTab('MY_APPOINTMENTS');
  };

  const handleDismissUrgentAlert = (appId: number) => {
    setDismissed1hAlertIds((prev) => [...prev, appId]);
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

      {/* Visual 1-Hour Upcoming Appointment Alert Banner */}
      <UpcomingAppointmentAlert
        urgentAppointments={urgentAppointments}
        currentLang={currentLang}
        onViewAppointment={handleViewUrgentAppointment}
        onDismiss={handleDismissUrgentAlert}
      />

      {/* Demo Mode Notice Banner */}
      <div className="bg-teal-700 text-white text-xs py-2 px-3 sm:px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="leading-snug">
              {currentLang === 'FR'
                ? "Plateforme en Accès Public Libre : Pas d'inscription requise pour tester !"
                : "منصة مفتوحة للجميع بدون تسجيل دخول أو بريد إلكتروني !"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-teal-100 bg-teal-800/60 px-2.5 py-0.5 rounded-full border border-teal-600/60 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>{currentLang === 'FR' ? 'Démo Active' : 'وضع تجريبي نشط'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'CITOYEN' && (
          <ClientView
            professionals={professionals}
            appointments={appointments}
            currentLang={currentLang}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            activeSubTab={clientSubTab}
            onSubTabChange={setClientSubTab}
            onSimulateUrgentAppointment={handleSimulateUrgentAppointment}
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
