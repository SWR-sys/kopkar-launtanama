import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import { getBadgeLabelKategori } from '../utils/koperasiCalculations';
import {
  Building2,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenCalculator,
}) => {
  const {
    role,
    setRole,
    activeMemberId,
    setActiveMemberId,
    currentMember,
    allMembers,
    allLoans,
    allTransfers,
    resetToDefaultData,
  } = useKoperasi();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const pendingLoansCount = allLoans.filter((l) => l.status === 'pending').length;
  const pendingTransfersCount = allTransfers.filter((t) => t.status === 'pending').length;
  const totalPendingAction = pendingLoansCount + pendingTransfersCount;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white">
      {/* Primary Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Kopkar Lautanama
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400">
                Simpan Pinjam Karyawan
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links based on active Role */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {role === 'anggota' ? (
              <>
                <button
                  onClick={() => onSelectView('dashboard')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Dashboard Saya
                </button>
                <button
                  onClick={() => onSelectView('pinjaman')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'pinjaman' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Pinjaman & Tenor
                </button>
                <button
                  onClick={() => onSelectView('simpanan')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'simpanan' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Simpanan & Mutasi
                </button>
                <button
                  onClick={onOpenCalculator}
                  className="transition-colors whitespace-nowrap text-slate-300 hover:text-emerald-400"
                >
                  Kalkulator Pinjaman
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSelectView('ringkasan')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'ringkasan' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Ringkasan Koperasi
                </button>
                <button
                  onClick={() => onSelectView('persetujuan')}
                  className={`relative transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'persetujuan' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Persetujuan Pinjaman
                  {pendingLoansCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                      {pendingLoansCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onSelectView('payroll')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'payroll' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Rekap Potong Gaji
                </button>
                <button
                  onClick={() => onSelectView('transfer')}
                  className={`relative transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'transfer' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Transfer Management
                  {pendingTransfersCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-sky-500 text-white rounded-full">
                      {pendingTransfersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onSelectView('anggota_list')}
                  className={`transition-colors whitespace-nowrap hover:text-white ${
                    currentView === 'anggota_list' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  Master Anggota
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Role Switcher & User Selector */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => {
                  setRole('anggota');
                  onSelectView('dashboard');
                }}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  role === 'anggota'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode Anggota
              </button>
              <button
                onClick={() => {
                  setRole('pengurus');
                  onSelectView('ringkasan');
                }}
                className={`px-2.5 py-1 rounded font-medium transition-all relative ${
                  role === 'pengurus'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode Pengurus
                {totalPendingAction > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-900 rounded-full">
                    {totalPendingAction}
                  </span>
                )}
              </button>
            </div>

            {/* Switch Active Member Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {role === 'pengurus' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    currentMember?.nama.charAt(0) || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[130px]">
                    {role === 'pengurus' ? 'Pengurus Koperasi' : currentMember?.nama}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {role === 'pengurus'
                      ? 'Administrator'
                      : currentMember
                      ? getBadgeLabelKategori(currentMember.kategori)
                      : 'Pilih Akun'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Simulasi Ganti Profil Akun
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pilih anggota untuk menguji berbagai hak akses, simpanan & pinjaman:
                    </p>
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto">
                    {/* Administrator Option */}
                    <button
                      onClick={() => {
                        setRole('pengurus');
                        onSelectView('ringkasan');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        role === 'pengurus' ? 'bg-slate-800/80 text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Pengurus Kopkar Lautanama</div>
                          <div className="text-[11px] text-slate-400">
                            Akses Penuh Kelola Kas, Pinjaman & Rekap
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Profil Anggota Koperasi
                    </div>

                    {allMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setActiveMemberId(member.id);
                          setRole('anggota');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          role === 'anggota' && activeMemberId === member.id
                            ? 'bg-slate-800/80 text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                            {member.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{member.nama}</div>
                            <div className="text-[11px] text-slate-400">
                              {getBadgeLabelKategori(member.kategori)} · {member.metodePembayaran === 'potong_gaji' ? 'Potong Gaji' : 'Transfer'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-400">
                            SW {member.simpananWajibPerBulan ? `${member.simpananWajibPerBulan / 1000}k` : '0'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800 px-3">
                    <button
                      onClick={() => {
                        resetToDefaultData();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-center px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset ke Data Awal Demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-800 text-xs text-slate-300">
          {role === 'anggota' ? (
            <>
              <button
                onClick={() => onSelectView('dashboard')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onSelectView('pinjaman')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'pinjaman' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Pinjaman & Tenor
              </button>
              <button
                onClick={() => onSelectView('simpanan')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'simpanan' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Simpanan
              </button>
              <button
                onClick={onOpenCalculator}
                className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-emerald-400"
              >
                Simulasi
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectView('ringkasan')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'ringkasan' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => onSelectView('persetujuan')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'persetujuan' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Persetujuan ({pendingLoansCount})
              </button>
              <button
                onClick={() => onSelectView('payroll')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'payroll' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Rekap Gaji
              </button>
              <button
                onClick={() => onSelectView('transfer')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'transfer' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Transfer ({pendingTransfersCount})
              </button>
              <button
                onClick={() => onSelectView('anggota_list')}
                className={`whitespace-nowrap px-2.5 py-1 rounded ${
                  currentView === 'anggota_list' ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                Anggota
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
