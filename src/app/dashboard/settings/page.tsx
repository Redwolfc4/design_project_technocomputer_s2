'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SettingService } from '@/lib/modules/settings/setting.service';
import { WorkspaceSettings } from '@/types';
import { SettingsIcon, CheckIcon } from '@/components/ui/icons';
import { WebhookConfigSection } from '@/components/dashboard/settings/WebhookConfigSection';

export default function WorkspaceSettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => SettingService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    SettingService.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Pengaturan Workspace & Aturan AI"
        subtitle="Konfigurasi parameter ambang batas auto-approval, tarif PPN default, dan URL Webhook"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Pengaturan Workspace & Aturan AI"
          subtitle="Konfigurasi parameter ambang batas auto-approval, tarif PPN default, dan URL Webhook integrasi."
          badge={{ label: 'Konfigurasi Sistem', variant: 'neutral' }}
        />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-6">
          <SectionHeader
            title="Parameter Workspace Enterprise"
            description="Perubahan pengaturan ini disimpan secara lokal ke peramban demo."
          />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#475569]">Nama Workspace</label>
              <input
                type="text"
                value={settings.workspaceName}
                onChange={(e) => setSettings({ ...settings, workspaceName: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569]">Nama Perusahaan PKP</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569]">NPWP Perusahaan</label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569]">Ambang Batas Auto-Approval (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settings.autoApproveConfidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, autoApproveConfidenceThreshold: parseInt(e.target.value) || 95 })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                />
                <span className="text-[11px] text-[#64748B]">Dokumen dengan skor keyakinan di atas nilai ini langsung disetujui.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569]">Tarif Default PPN (%)</label>
                <input
                  type="number"
                  value={settings.defaultTaxRatePercent}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRatePercent: parseInt(e.target.value) || 11 })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                />
                <span className="text-[11px] text-[#64748B]">Dapat dikonfigurasi adaptif 11% atau 12% sesuai regulasi.</span>
              </div>
            </div>

            <WebhookConfigSection
              initialUrl={settings.webhookUrl}
              onChange={(cfg) =>
                setSettings((prev) => ({
                  ...prev,
                  webhookUrl: cfg.url,
                  webhookConfig: cfg,
                }))
              }
            />
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan berhasil disimpan ke penyimpanan lokal browser!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

