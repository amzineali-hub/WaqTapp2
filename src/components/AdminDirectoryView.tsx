import React, { useState } from 'react';
import { Database, Sparkles, Upload, Edit3, Save, CheckCircle, Trash2, ArrowRight } from 'lucide-react';
import { Professional, SectorType } from '../types';
import { Language, translations } from '../utils/translations';
import { Button, Card, Badge, Input, Select, Textarea } from './ui';

interface AdminDirectoryViewProps {
  professionals: Professional[];
  currentLang: Language;
  onImportProfessionals: (newPros: Omit<Professional, 'id' | 'ownerUserId'>[]) => void;
  onUpdateProfessional: (updatedPro: Professional) => void;
}

interface ParsedItem {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  fees: number;
}

export const AdminDirectoryView: React.FC<AdminDirectoryViewProps> = ({
  professionals,
  currentLang,
  onImportProfessionals,
  onUpdateProfessional,
}) => {
  const t = translations[currentLang];
  const a = t.adminDashboard;

  // Parser state
  const [targetSector, setTargetSector] = useState<SectorType>('ADMIN');
  const [rawText, setRawText] = useState(
    `Maître Rachid Berrada\nNotaire Casablanca\nAdresse: 45 Boulevard Zerktouni, Étage 2, Casablanca\nTél: 0522294050\nTarif: 450 DH\n\nMaître Samira Chraibi\nNotaire & Adoul Rabat\nAdresse: 18 Avenue Allal Ben Abdellah, Rabat\nTél: 0537701122\nTarif: 500 DH`
  );
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Editor state
  const [selectedProId, setSelectedProId] = useState<string>(professionals[0]?.id || '');
  const selectedPro = professionals.find((p) => p.id === selectedProId) || professionals[0];

  const [editName, setEditName] = useState(selectedPro?.name || '');
  const [editTitleFr, setEditTitleFr] = useState(selectedPro?.titleFr || '');
  const [editTitleAr, setEditTitleAr] = useState(selectedPro?.titleAr || '');
  const [editAddressFr, setEditAddressFr] = useState(selectedPro?.addressFr || '');
  const [editAddressAr, setEditAddressAr] = useState(selectedPro?.addressAr || '');
  const [editPhone, setEditPhone] = useState(selectedPro?.phone || '');
  const [editCity, setEditCity] = useState(selectedPro?.city || 'Casablanca');
  const [editFees, setEditFees] = useState(selectedPro?.fees || 300);

  // When selected pro changes in dropdown
  const handleSelectProChange = (id: string) => {
    setSelectedProId(id);
    const target = professionals.find((p) => p.id === id);
    if (target) {
      setEditName(target.name);
      setEditTitleFr(target.titleFr);
      setEditTitleAr(target.titleAr);
      setEditAddressFr(target.addressFr);
      setEditAddressAr(target.addressAr);
      setEditPhone(target.phone);
      setEditCity(target.city);
      setEditFees(target.fees);
    }
  };

  // Parser algorithm for Moroccan directory text
  const parseRawText = () => {
    if (!rawText.trim()) return;

    const blocks = rawText.split(/\n\s*\n/);
    const results: ParsedItem[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      let name = lines[0] || 'Professionnel Inconnu';
      let phone = '0522000000';
      let address = 'Centre Ville, Maroc';
      let city = 'Casablanca';
      let fees = 250;

      lines.forEach((line) => {
        // Phone match
        const phoneMatch = line.match(/(?:Tél|Tel|Fixe|Gsm|Phone)?[:\s]*(0[5-7][0-9]{8})/i);
        if (phoneMatch) {
          phone = phoneMatch[1];
        }

        // City match
        if (/Casablanca/i.test(line)) city = 'Casablanca';
        else if (/Rabat/i.test(line)) city = 'Rabat';
        else if (/Marrakech/i.test(line)) city = 'Marrakech';
        else if (/Tanger/i.test(line)) city = 'Tanger';
        else if (/Fès|Fes/i.test(line)) city = 'Fès';

        // Address match
        if (/(?:Adresse|Adr|Rue|Avenue|Bd|Boulevard)[:\s]*/i.test(line)) {
          address = line.replace(/(?:Adresse|Adr)[:\s]*/i, '').trim();
        }

        // Fee match
        const feeMatch = line.match(/(\d+)\s*(?:DH|Dirhams)/i);
        if (feeMatch) {
          fees = parseInt(feeMatch[1], 10);
        }
      });

      results.push({
        id: Date.now() + idx,
        name,
        phone,
        address,
        city,
        fees,
      });
    });

    setParsedItems(results);
  };

  // Execute Batch Import
  const handleBatchImport = () => {
    if (parsedItems.length === 0) return;

    const sectorLabelFr =
      targetSector === 'ADMIN'
        ? 'Notaire & Adoul'
        : targetSector === 'HEALTH'
        ? 'Santé'
        : targetSector === 'BEAUTY'
        ? 'Beauté & Spa'
        : targetSector === 'AUTO'
        ? 'Auto & Mécanique'
        : 'Artisans';

    const sectorLabelAr =
      targetSector === 'ADMIN'
        ? 'التوثيق والعدول'
        : targetSector === 'HEALTH'
        ? 'الصحية'
        : targetSector === 'BEAUTY'
        ? 'الجمال والراحة'
        : targetSector === 'AUTO'
        ? 'ميكانيك السيارات'
        : 'الحرف والأعمال';

    const newPros: Omit<Professional, 'id' | 'ownerUserId'>[] = parsedItems.map((item) => ({
      name: item.name,
      sector: targetSector,
      sectorFr: sectorLabelFr,
      sectorAr: sectorLabelAr,
      titleFr: `${sectorLabelFr} Agréé - ${item.city}`,
      titleAr: `${sectorLabelAr} معتمد - ${item.city}`,
      city: item.city,
      addressFr: item.address,
      addressAr: item.address,
      rating: 4.8,
      reviewsCount: 12,
      phone: item.phone,
      fees: item.fees,
      isSubscribed: false,
      subscriptionPlan: 'FREE',
      subscriptionExpiry: 0,
    }));

    onImportProfessionals(newPros);
    setImportSuccessMsg(
      `${parsedItems.length} professionnels importés avec succès dans la base de données !`
    );
    setParsedItems([]);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Save manual edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPro) return;

    const updated: Professional = {
      ...selectedPro,
      name: editName,
      titleFr: editTitleFr,
      titleAr: editTitleAr,
      addressFr: editAddressFr,
      addressAr: editAddressAr,
      phone: editPhone,
      city: editCity,
      fees: Number(editFees),
    };

    onUpdateProfessional(updated);
    setImportSuccessMsg(`Informations de ${updated.name} mises à jour avec succès !`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Alert toast if any */}
      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 1: Dynamic Directory Importer */}
      <Card padding="md" className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-500">{a.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Controls: Target sector & Raw text */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {a.targetSector}
              </label>
              <Select
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value as SectorType)}
                className="text-xs font-semibold text-slate-800"
              >
                <option value="ADMIN">📜 Notaire & Adoul (التوثيق والعدول)</option>
                <option value="HEALTH">🩺 Santé & Médecins (الصحة والأطباء)</option>
                <option value="BEAUTY">✨ Beauté & Salons (الجمال والراحة)</option>
                <option value="AUTO">🚗 Mécanique & Auto (السيارات)</option>
                <option value="ARTISAN">🔧 Artisans & Travaux (الحرف والأعمال)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {a.rawTextLabel}
              </label>
              <Textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={a.rawTextPlaceholder}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={parseRawText}>
                <Sparkles className="w-3.5 h-3.5" />
                {a.parseBtn}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRawText('');
                  setParsedItems([]);
                }}
              >
                {a.clearBtn}
              </Button>
            </div>
          </div>

          {/* Extracted Preview Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  {a.detectedPros} ({parsedItems.length})
                </span>
                {parsedItems.length > 0 && (
                  <Badge variant="primary" size="sm">Prêt à importer</Badge>
                )}
              </div>

              {parsedItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Collez le texte et cliquez sur "Analyser" pour extraire les fiches.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {parsedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-0.5 shadow-2xs"
                    >
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 text-[11px]">{item.address} ({item.city})</div>
                      <div className="text-teal-700 font-semibold text-[11px]">
                        Tél: {item.phone} • {item.fees} DH
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {parsedItems.length > 0 && (
              <Button variant="success" fullWidth onClick={handleBatchImport} className="mt-3">
                <CheckCircle className="w-4 h-4" />
                {a.importBtn} ({parsedItems.length})
              </Button>
            )}
          </div>

        </div>
      </Card>

      {/* SECTION 2: Live Professional Data Editor */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{a.editSectionTitle}</h3>
            <p className="text-xs text-slate-500">
              Mettez à jour les libellés bilingues (FR/AR), coordonnées et tarifs enregistrés
            </p>
          </div>
        </div>

        {/* Dropdown to select professional */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-slate-700 mb-1">{a.selectPro}</label>
          <Select
            value={selectedProId}
            onChange={(e) => handleSelectProChange(e.target.value)}
            className="text-xs font-bold text-slate-800"
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city} - {p.sectorFr})
              </option>
            ))}
          </Select>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.nameLabel}</label>
            <Input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.phoneLabel}</label>
            <Input
              type="tel"
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.titleFrLabel}</label>
            <Input
              type="text"
              value={editTitleFr}
              onChange={(e) => setEditTitleFr(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.titleArLabel}</label>
            <Input
              type="text"
              value={editTitleAr}
              dir="rtl"
              onChange={(e) => setEditTitleAr(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.addressFrLabel}</label>
            <Input
              type="text"
              value={editAddressFr}
              onChange={(e) => setEditAddressFr(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.addressArLabel}</label>
            <Input
              type="text"
              value={editAddressAr}
              dir="rtl"
              onChange={(e) => setEditAddressAr(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.cityLabel}</label>
            <Select
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              className="text-xs bg-white"
            >
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Tanger">Tanger</option>
              <option value="Fès">Fès</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{a.feesLabel}</label>
            <Input
              type="number"
              value={editFees}
              onChange={(e) => setEditFees(Number(e.target.value))}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button type="submit">
              <Save className="w-4 h-4" />
              {a.saveChanges}
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
};
