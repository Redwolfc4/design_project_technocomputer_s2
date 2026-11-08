'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DocumentRecord } from '@/types';
import { formatIDR, formatDate, getStatusBadgeInfo, getDocumentTypeLabel } from '@/lib/utils/formatters';
import { ArrowRightIcon, FileTextIcon } from '@/components/ui/icons';

export default function DocumentRepositoryPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setDocuments(MockDocumentService.getDocuments());
  }, []);

  const filteredDocs = documents.filter((doc) => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNumber = doc.fileNumber.toLowerCase().includes(q);
      const matchVendor = doc.vendorName.toLowerCase().includes(q);
      const matchTitle = doc.title.toLowerCase().includes(q);
      if (!matchNumber && !matchVendor && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Repositori Dokumen Enterprise"
        subtitle="Kelola, telusuri, dan saring seluruh arsip faktur, invoice, dan kontrak perusahaan"
        onSearch={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        {/* Filters Bar */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
              >
                <option value="all">Semua Status</option>
                <option value="needs_review">Perlu Verifikasi</option>
                <option value="approved">Telah Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B]">Jenis Dokumen:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
              >
                <option value="all">Semua Tipe</option>
                <option value="tax_invoice">Faktur Pajak (e-Faktur)</option>
                <option value="commercial_invoice">Invoice Komersial</option>
                <option value="purchase_order">Purchase Order (PO)</option>
                <option value="contract">Kontrak Perjanjian</option>
                <option value="withholding_tax">Bukti Potong PPh 23</option>
                <option value="receipt">Kuitansi / Nota</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-[#64748B]">
            Menampilkan <strong className="text-[#0F172A]">{filteredDocs.length}</strong> dari {documents.length} dokumen
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Nomor & File</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5">Vendor / Lawan Transaksi</th>
                  <th className="py-3 px-5">Tanggal Masuk</th>
                  <th className="py-3 px-5">Total Nominal</th>
                  <th className="py-3 px-5">Akurasi</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {filteredDocs.map((doc) => {
                  const badge = getStatusBadgeInfo(doc.status);
                  return (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0F172A]">{doc.fileNumber}</div>
                        <div className="text-[11px] text-[#64748B]">{doc.fileName}</div>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-[#475569]">
                        {getDocumentTypeLabel(doc.documentType)}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#0F172A]">
                        {doc.vendorName}
                      </td>
                      <td className="py-3.5 px-5 text-[#64748B]">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#0F172A]">
                        {formatIDR(doc.totalAmount)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`font-bold ${
                            doc.confidence >= 90
                              ? 'text-[#059669]'
                              : doc.confidence >= 75
                              ? 'text-[#F59E0B]'
                              : 'text-[#E11D48]'
                          }`}
                        >
                          {doc.confidence}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/dashboard/verification?docId=${doc.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[11px] font-bold text-[#0F172A] shadow-xs transition-colors"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRightIcon className="w-3 h-3 text-[#4F46E5]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

