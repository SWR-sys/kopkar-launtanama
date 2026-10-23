/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { LoanCalculatorModal } from './components/LoanCalculatorModal';
import { MemberDashboard } from './components/MemberDashboard';
import { KoperasiProvider, useKoperasi } from './context/KoperasiContext';
import {
  Building2,
  Calculator,
  CreditCard,
  FileSpreadsheet,
  HeartHandshake,
  HelpCircle,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { role } = useKoperasi();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {role === 'anggota' ? (
          <MemberDashboard />
        ) : (
          <AdminDashboard activeViewTab={currentView} />
        )}
      </main>

      {/* Floating Loan Calculator Quick Trigger Button */}
      <div className="fixed bottom-6 right-6 z-20 no-print">
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700/80 transition-all hover:scale-105 active:scale-95 text-xs font-semibold"
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Kalkulator Bunga (1% & 1,5%)</span>
        </button>
      </div>

      {/* Calculator Modal */}
      <LoanCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Kopkar Lautanama</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px] max-w-md">
                Koperasi Karyawan Simpan Pinjam Lautanama berkomitmen menyejahterakan anggota melalui pengelolaan simpanan yang transparan, pinjaman berbunga rendah (1% - 1,5%), dan sistem integrasi potong gaji kolektif.
              </p>
              <div className="text-[11px] text-slate-500">
                Badan Hukum No: AHU-001928.AH.01.26 · Anggota Resmi Dekopin
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-white font-semibold text-xs">4 Jenis Layanan Pinjaman</div>
              <ul className="space-y-1 text-[11px]">
                <li>• Pinjaman Kas Koperasi (Uang Tunai)</li>
                <li>• Pinjaman Pengadaan Barang</li>
                <li>• Pinjaman Kemitraan Bank Jatim</li>
                <li>• Pinjaman Toko (Belanja Tempo)</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <div className="text-white font-semibold text-xs">Ketentuan Pokok Anggota</div>
              <ul className="space-y-1 text-[11px]">
                <li>• Pelaksana: Simpanan Wajib Rp 50.000/bln (Potong Gaji)</li>
                <li>• Staff: Simpanan Wajib Rp 100.000/bln (Potong Gaji)</li>
                <li>• Management: Simpanan Wajib Rp 100.000/bln (Transfer Manual)</li>
                <li>• Maks. 2 Pinjaman Aktif Bersamaan (Bisa Top Up)</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © {new Date().getFullYear()} Kopkar Lautanama. Seluruh hak cipta dilindungi.
            </div>
            <div className="flex items-center gap-4">
              <span>Sistem Simpan Pinjam Real-Time v2.4</span>
              <span>·</span>
              <span>PT Lautanama Group</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <KoperasiProvider>
      <AppContent />
    </KoperasiProvider>
  );
}
