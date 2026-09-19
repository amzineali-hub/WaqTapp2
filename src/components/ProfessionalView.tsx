import React, { useState } from 'react';
import { Briefcase, Calendar, CheckCircle, Clock, DollarSign, Users, Shield, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { Professional, UserAppointment, StaffMember, RolePermission } from '../types';
import { Language, translations } from '../utils/translations';

interface ProfessionalViewProps {
  currentPro: Professional;
  appointments: UserAppointment[];
  staff: StaffMember[];
  roles: RolePermission[];
  currentLang: Language;
  onUpdateAppointmentStatus: (id: number, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => void;
  onSubscribe: (plan: 'FREE' | 'MAWID_PRO_MONTHLY' | 'MAWID_PRO_YEARLY') => void;
  onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff: (id: number) => void;
}

export const ProfessionalView: React.FC<ProfessionalViewProps> = ({
  currentPro,
  appointments,
  staff,
  roles,
  currentLang,
  onUpdateAppointmentStatus,
  onSubscribe,
  onAddStaff,
  onDeleteStaff,
}) => {
  const t = translations[currentLang];
  const p = t.proDashboard;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('ROLE_STAFF');

  // Filter appointments for this professional (or all for demo)
  const proAppointments = appointments.filter(
    (a) => a.professionalId === currentPro.id || a.professionalName === currentPro.name
  );

  const confirmedCount = proAppointments.filter((a) => a.status === 'CONFIRMED').length;
  const estimatedRevenue = proAppointments
    .filter((a) => a.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + (curr.cost || currentPro.fees), 0);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    onAddStaff({
      name: newStaffName.trim(),
      phone: newStaffPhone.trim() || '0660000000',
      email: newStaffEmail.trim(),
      roleId: newStaffRole,
    });
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setShowAddStaffModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-900/80 border border-teal-700 inline-block mb-2">
              {currentLang === 'FR' ? currentPro.titleFr : currentPro.titleAr}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold">{currentPro.name}</h2>
            <p className="text-teal-100/80 text-xs mt-1">
              {currentPro.addressFr} • {currentPro.city}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-teal-200 block">{p.currentPlan}</span>
              <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                {currentPro.subscriptionPlan === 'MAWID_PRO_YEARLY'
                  ? p.yearlyPlan
                  : currentPro.subscriptionPlan === 'MAWID_PRO_MONTHLY'
                  ? p.monthlyPlan
                  : p.freePlan}
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg transition text-center touch-manipulation min-h-[40px] flex items-center justify-center"
            >
              {p.upgradeBtn}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">{p.totalAppointments}</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {proAppointments.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">{p.confirmedAppointments}</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {confirmedCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">{p.estimatedRevenue}</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {estimatedRevenue} {t.dh}
            </div>
          </div>
        </div>

      </div>

      {/* Appointments Management List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              {currentLang === 'FR' ? 'Gestion des Rendez-vous Clients' : 'إدارة مواعيد الزبناء'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentLang === 'FR'
                ? 'Mettez à jour les statuts en direct (Confirmé, Terminé, Annulé)'
                : 'تحديث حالة المواعيد في الوقت الفعلي'}
            </p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2.5 py-1 rounded-lg">
            {proAppointments.length} {currentLang === 'FR' ? 'rendez-vous' : 'موعد'}
          </span>
        </div>

        {proAppointments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>{currentLang === 'FR' ? 'Aucun rendez-vous pour ce professionnel.' : 'لا توجد مواعيد لهذا المهني حالياً.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs text-slate-600 min-w-[580px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{currentLang === 'FR' ? 'Client' : 'الزبون'}</th>
                  <th className="py-3 px-4">{currentLang === 'FR' ? 'Date & Heure' : 'التاريخ والتوقيت'}</th>
                  <th className="py-3 px-4">{currentLang === 'FR' ? 'Remarques' : 'ملاحظات'}</th>
                  <th className="py-3 px-4">{currentLang === 'FR' ? 'Statut' : 'الحالة'}</th>
                  <th className="py-3 px-4 text-right">{p.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{app.userName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{app.userPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.date}</div>
                      <div className="text-teal-700 font-bold">{app.time}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {app.notes || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.appointmentStatus[app.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {app.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(app.id, 'CONFIRMED')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-bold text-[11px] transition"
                        >
                          {p.statusConfirmed}
                        </button>
                      )}
                      {app.status !== 'COMPLETED' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(app.id, 'COMPLETED')}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold text-[11px] transition"
                        >
                          {p.statusCompleted}
                        </button>
                      )}
                      {app.status !== 'CANCELLED' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(app.id, 'CANCELLED')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-bold text-[11px] transition"
                        >
                          {p.statusCancelled}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team & Role Permissions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              {p.teamSection}
            </h3>
            <p className="text-xs text-slate-500">
              {currentLang === 'FR'
                ? 'Gérez vos collaborateurs, secrétaires et leurs droits d’accès'
                : 'إدارة المساعدين وموظفي الاستقبال وصلاحياتهم'}
            </p>
          </div>
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {p.addStaff}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staff.map((member) => {
            const roleObj = roles.find((r) => r.id === member.roleId);
            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 inline-block mt-1">
                        {roleObj
                          ? currentLang === 'FR'
                            ? roleObj.roleNameFr
                            : roleObj.roleNameAr
                          : member.roleId}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteStaff(member.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div>📞 {member.phone}</div>
                    {member.email && <div>✉️ {member.email}</div>}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-teal-600" />
                    <span>RDV: {roleObj?.canManageAppointments ? '✅ Autorisé' : '❌ Non'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-teal-600" />
                    <span>Coordonnées: {roleObj?.canViewClientInfo ? '✅ Visible' : '❌ Masqué'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {p.upgradeBtn} (Démo Gratuite)
            </h3>
            <p className="text-xs text-slate-600">
              {currentLang === 'FR'
                ? "Choisissez votre formule pour activer le badge vérifié et débloquer les réservations illimitées :"
                : 'اختر خطة الاشتراك لتفعيل شارة الشريك المعتمد وحجز المواعيد بدون قيود:'}
            </p>

            <div className="space-y-3">
              <div
                onClick={() => {
                  onSubscribe('MAWID_PRO_MONTHLY');
                  setShowUpgradeModal(false);
                }}
                className="p-4 rounded-xl border-2 border-teal-500 bg-teal-50/50 hover:bg-teal-50 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-teal-900">Mawid Pro Mensuel</h4>
                  <p className="text-xs text-teal-700">290 DH / mois • Sans engagement</p>
                </div>
                <span className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-lg">
                  Choisir
                </span>
              </div>

              <div
                onClick={() => {
                  onSubscribe('MAWID_PRO_YEARLY');
                  setShowUpgradeModal(false);
                }}
                className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">Mawid Pro Annuel</h4>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      -20%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">2 900 DH / an (2 mois offerts)</p>
                </div>
                <span className="px-3 py-1.5 bg-amber-500 text-slate-900 font-bold text-xs rounded-lg">
                  Choisir
                </span>
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              {p.addStaff}
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{p.staffName}</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Ex: Sara Mansouri"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{p.staffPhone}</label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{p.staffEmail}</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="collaborateur@cabinet.ma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{p.staffRole}</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {currentLang === 'FR' ? r.roleNameFr : r.roleNameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
