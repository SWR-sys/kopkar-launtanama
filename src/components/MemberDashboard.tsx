import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import { Pinjaman } from '../types/koperasi';
import {
  formatRupiah,
  getBadgeLabelKategori,
  getNamaJenisPinjaman,
} from '../utils/koperasiCalculations';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Layers,
  PiggyBank,
  Plus,
  Printer,
  Receipt,
  RefreshCcw,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { LoanApplicationModal } from './LoanApplicationModal';
import { LoanCalculatorModal } from './LoanCalculatorModal';
import { PrintSlipModal } from './PrintSlipModal';
import { SavingsModal } from './SavingsModal';
import { TransferManagementModal } from './TransferManagementModal';

export const MemberDashboard: React.FC = () => {
  const {
    currentMember,
    memberLoans,
    memberMutations,
    memberTotalSimpanan,
    memberTotalPinjamanDiajukan,
    memberTotalPinjamanPending,
    memberTotalPinjamanAktifPlafon,
    memberTotalPinjamanAktif,
    memberTotalSisaKewajibanAktif,
    memberPotonganBulanan,
  } = useKoperasi();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsModalTab, setSavingsModalTab] = useState<'setor' | 'tarik' | 'atur_rutin'>('setor');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'payroll_slip' | 'loan_contract' | 'savings_card'>('payroll_slip');
  const [selectedLoanForPrint, setSelectedLoanForPrint] = useState<Pinjaman | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'savings' | 'mutations'>('overview');

  if (!currentMember) {
    return (
      <div className="p-8 text-center text-slate-500">
        Pilih profil anggota terlebih dahulu di bagian atas.
      </div>
    );
  }

  const activeLoans = memberLoans.filter((l) => l.status === 'disetujui' && l.sisaPokok > 0);
  const totalSisaTenorMax = activeLoans.reduce((max, l) => Math.max(max, l.sisaTenor), 0);

  const handleOpenPrintSlip = () => {
    setPrintType('payroll_slip');
    setSelectedLoanForPrint(undefined);
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintLoan = (loan: Pinjaman) => {
    setPrintType('loan_contract');
    setSelectedLoanForPrint(loan);
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintSavings = () => {
    setPrintType('savings_card');
    setSelectedLoanForPrint(undefined);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Member Hero / Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-semibold">{currentMember.nomorAnggota}</span>
              <span>·</span>
              <span>NIK: {currentMember.nik}</span>
              <span>·</span>
              <span>{currentMember.departemen}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Halo, {currentMember.nama}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-medium">
                {getBadgeLabelKategori(currentMember.kategori)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                Metode Bayar:{' '}
                <strong>
                  {currentMember.metodePembayaran === 'potong_gaji'
                    ? 'Potong Gaji Otomatis (Payroll Kolektif)'
                    : 'Transfer Manual ke Kas Koperasi'}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Ajukan Pinjaman
            </button>
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              Simulasi
            </button>
            {currentMember.metodePembayaran === 'transfer_manual' ? (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Transfer Iuran
              </button>
            ) : (
              <button
                onClick={handleOpenPrintSlip}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                Cetak Slip Potongan
              </button>
            )}
          </div>
        </div>

        {/* Rule Highlight Pill */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Simpanan Wajib:{' '}
              <strong className="text-white font-mono">
                {currentMember.simpananWajibPerBulan > 0
                  ? `${formatRupiah(currentMember.simpananWajibPerBulan)} / bulan`
                  : 'Bebas Simpanan Wajib (Anggota Tidak Tetap)'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Suku Bunga Pinjaman:{' '}
              <strong className="text-emerald-400">1,5% / bulan</strong> (Tenor 1 bln: <strong className="text-emerald-400">1%</strong>)
            </span>
            <span>·</span>
            <span>
              Kuota Pinjaman:{' '}
              <strong className="text-white font-mono">{activeLoans.length} / 2 Pinjaman Bersamaan</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Metric Strip (Zero-Pill, Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Simpanan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Total Simpanan</span>
            <PiggyBank className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight truncate">
            {formatRupiah(memberTotalSimpanan)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 truncate">
            <span className="truncate">Pokok+Wajib+Sukarela</span>
            <button
              onClick={handleOpenPrintSavings}
              className="text-emerald-600 font-semibold hover:underline shrink-0 ml-1"
            >
              Kartu
            </button>
          </div>
        </div>

        {/* Total Pinjaman yang Diajukan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Total Pinjaman Diajukan</span>
            <FileText className="w-4 h-4 text-sky-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-sky-700 tracking-tight truncate">
            {formatRupiah(memberTotalPinjamanDiajukan)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 truncate">
            <span className="truncate">{memberLoans.length} Pengajuan</span>
            {memberTotalPinjamanPending > 0 ? (
              <span className="text-amber-600 font-bold font-mono text-[10px] truncate ml-1">
                {formatRupiah(memberTotalPinjamanPending)} pending
              </span>
            ) : (
              <span className="text-slate-600 font-mono text-[10px] truncate ml-1">Terverifikasi</span>
            )}
          </div>
        </div>

        {/* Total Pinjaman Masih Aktif */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 ring-1 ring-rose-100 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Pinjaman Masih Aktif</span>
            <Wallet className="w-4 h-4 text-rose-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-rose-600 tracking-tight truncate">
            {formatRupiah(memberTotalPinjamanAktif)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 truncate">
            <span className="truncate">{activeLoans.length} Fasilitas Aktif</span>
            <span className="font-mono text-slate-700 font-medium text-[10px] shrink-0 ml-1">Sisa Pokok</span>
          </div>
        </div>

        {/* Potongan / Kewajiban Per Bulan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Potongan Bln Ini</span>
            <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-amber-600 tracking-tight truncate">
            {formatRupiah(memberPotonganBulanan.totalPotongan)}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 truncate">
            {currentMember.metodePembayaran === 'potong_gaji' ? 'Payroll tgl 1 tiap bln' : 'Transfer tgl 1 tiap bln'}
          </div>
        </div>

        {/* Sisa Tenor Berjalan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Sisa Tenor Berjalan</span>
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight truncate">
            {totalSisaTenorMax > 0 ? `${totalSisaTenorMax} Bulan` : 'Tidak Ada'}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between truncate">
            <span className="truncate">Jatuh Tempo: Tgl 1</span>
            {activeLoans.length > 0 && <span className="text-emerald-600 font-semibold shrink-0">Lancar</span>}
          </div>
        </div>
      </div>

      {/* Rincian 3 Komponen Simpanan Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Simpanan Real-Time</h3>
            <p className="text-xs text-slate-500">
              Simpanan Pokok, Wajib (sesuai kategori anggota), dan Sukarela
            </p>
          </div>
          <button
            onClick={() => {
              setSavingsModalTab('setor');
              setIsSavingsModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Setor Sukarela
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Simpanan Pokok */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-xs font-semibold text-slate-600">Simpanan Pokok</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatRupiah(currentMember.totalSimpananPokok)}
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Disetor 1x saat menjadi anggota resmi Kopkar Lautanama.
            </div>
          </div>

          {/* Simpanan Wajib */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Simpanan Wajib</span>
              <span className="font-mono text-slate-500">
                {formatRupiah(currentMember.simpananWajibPerBulan)} / bln
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatRupiah(currentMember.totalSimpananWajib)}
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              {currentMember.kategori === 'pelaksana'
                ? 'Aturan Pelaksana: Rp 50.000 / bulan'
                : currentMember.kategori === 'tidak_tetap'
                ? 'Anggota Tidak Tetap: Bebas Simpanan Wajib'
                : 'Aturan Staff/Management: Rp 100.000 / bulan'}
            </div>
          </div>

          {/* Simpanan Sukarela */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
              <span>Simpanan Sukarela</span>
              <span className="font-mono text-emerald-800">
                Rutin: {formatRupiah(currentMember.simpananSukarelaPerBulan)}/bln
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700">
              {formatRupiah(currentMember.totalSimpananSukarela)}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/60">
              <span className="text-emerald-900">Bebas ditarik / disetor</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSavingsModalTab('tarik');
                    setIsSavingsModalOpen(true);
                  }}
                  className="text-rose-600 font-semibold hover:underline"
                >
                  Tarik
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    setSavingsModalTab('atur_rutin');
                    setIsSavingsModalOpen(true);
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Atur Rutin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loans Section (1 Nama 2 Pinjaman Bersamaan) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Pinjaman Aktif & Tanggungan Anggota</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {activeLoans.length} / 2 Pinjaman Bersamaan
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ketentuan Kopkar: 1 nama dapat memiliki hingga 2 pinjaman aktif sekaligus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeLoans.length < 2 && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Pinjaman Baru
              </button>
            )}
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-slate-600" />
              Kalkulator
            </button>
          </div>
        </div>

        {/* Real-Time Comparative Loan Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
          <div className="overflow-hidden min-w-0">
            <div className="text-[11px] text-slate-400 truncate">Total Pinjaman Diajukan:</div>
            <div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-sky-400 mt-0.5 truncate">
              {formatRupiah(memberTotalPinjamanDiajukan)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {memberLoans.length} total pengajuan tercatat
            </div>
          </div>

          <div className="overflow-hidden min-w-0">
            <div className="text-[11px] text-slate-400 truncate">Plafon Pinjaman Aktif:</div>
            <div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-white mt-0.5 truncate">
              {formatRupiah(memberTotalPinjamanAktifPlafon)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {activeLoans.length} fasilitas disetujui
            </div>
          </div>

          <div className="overflow-hidden min-w-0">
            <div className="text-[11px] text-slate-400 truncate">Pinjaman Masih Aktif:</div>
            <div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-rose-400 mt-0.5 truncate">
              {formatRupiah(memberTotalPinjamanAktif)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              Sisa pokok berjalan
            </div>
          </div>

          <div className="overflow-hidden min-w-0">
            <div className="text-[11px] text-slate-400 truncate">Total Sisa Pelunasan:</div>
            <div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-amber-400 mt-0.5 truncate">
              {formatRupiah(memberTotalSisaKewajibanAktif)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              Sisa Pokok + Sisa Bunga Tenor
            </div>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Tidak Ada Pinjaman Aktif</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Anda saat ini tidak memiliki tanggungan pinjaman berjalan. Anda dapat mengajukan hingga 2 pinjaman (Uang, Barang, Bank Jatim, atau Belanja Toko Tempo).
              </p>
            </div>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              Ajukan Pinjaman Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan, index) => {
              const progressPct = Math.round((loan.tenorTerbayar / loan.tenorBulan) * 100);
              return (
                <div
                  key={loan.id}
                  className="rounded-xl border border-slate-200 p-4.5 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 truncate">
                          {loan.kodePinjaman}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
                          Pinjaman #{index + 1}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {getNamaJenisPinjaman(loan.jenisPinjaman)}
                      </div>
                      {loan.keteranganBarang && (
                        <div className="text-[11px] text-slate-500 truncate">
                          {loan.keteranganBarang}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleOpenPrintLoan(loan)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded border border-slate-200 transition-colors shrink-0"
                      title="Cetak Rincian Pinjaman"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200/80">
                    <div className="overflow-hidden min-w-0">
                      <div className="text-[10px] text-slate-500 font-sans truncate">Pokok Pinjaman:</div>
                      <div className="font-bold text-slate-900 truncate">{formatRupiah(loan.jumlahPinjaman)}</div>
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <div className="text-[10px] text-slate-500 font-sans truncate">Bunga / Bulan (Tetap):</div>
                      <div className="font-bold text-emerald-700 truncate">
                        {formatRupiah(loan.bungaPerBulan)} ({loan.sukuBungaPersen}%)
                      </div>
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <div className="text-[10px] text-slate-500 font-sans truncate">Sisa Pokok:</div>
                      <div className="font-bold text-rose-600 truncate">{formatRupiah(loan.sisaPokok)}</div>
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <div className="text-[10px] text-slate-500 font-sans truncate">Angsuran / Bulan:</div>
                      <div className="font-bold text-slate-900 truncate">{formatRupiah(loan.totalAngsuranPerBulan)}</div>
                    </div>
                  </div>

                  {/* Tenor Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>
                        Terbayar: <strong>{loan.tenorTerbayar}</strong> dari <strong>{loan.tenorBulan}</strong> Bulan
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        Sisa {loan.sisaTenor} Bulan ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Top Up / Pelunasan Quick Action */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500">
                      Pelunasan Top Up: <strong className="font-mono text-slate-800">{formatRupiah(loan.sisaTotalPelunasan)}</strong>
                    </div>
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3 text-amber-700" />
                      Top Up Pinjaman Ini
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs for Loan History & Mutation Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Riwayat Pinjaman ({memberLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('mutations')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'mutations'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Mutasi & Setoran Simpanan ({memberMutations.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            {memberLoans.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada data pengajuan pinjaman.
              </div>
            ) : (
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Jenis Fasilitas</th>
                    <th className="py-2.5 px-3">Jumlah Pokok</th>
                    <th className="py-2.5 px-3">Tenor</th>
                    <th className="py-2.5 px-3">Bunga/Bln</th>
                    <th className="py-2.5 px-3">Angsuran/Bln</th>
                    <th className="py-2.5 px-3">Sisa Tenor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {memberLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{l.kodePinjaman}</td>
                      <td className="py-2.5 px-3 font-sans">{getNamaJenisPinjaman(l.jenisPinjaman)}</td>
                      <td className="py-2.5 px-3">{formatRupiah(l.jumlahPinjaman)}</td>
                      <td className="py-2.5 px-3">{l.tenorBulan} Bln</td>
                      <td className="py-2.5 px-3">{formatRupiah(l.bungaPerBulan)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(l.totalAngsuranPerBulan)}</td>
                      <td className="py-2.5 px-3">{l.sisaTenor} Bln</td>
                      <td className="py-2.5 px-3 font-sans">
                        {l.status === 'disetujui' && (
                          <span className="text-[11px] text-emerald-700 font-semibold">Aktif Berjalan</span>
                        )}
                        {l.status === 'pending' && (
                          <span className="text-[11px] text-amber-700 font-semibold">Menunggu Verifikasi</span>
                        )}
                        {l.status === 'top_up_ditutup' && (
                          <span className="text-[11px] text-slate-500 font-semibold">Ditutup Top Up</span>
                        )}
                        {l.status === 'lunas' && (
                          <span className="text-[11px] text-indigo-700 font-semibold">Lunas</span>
                        )}
                        {l.status === 'ditolak' && (
                          <span className="text-[11px] text-rose-700 font-semibold">Ditolak</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenPrintLoan(l)}
                          className="text-slate-500 hover:text-slate-900 font-sans text-xs underline"
                        >
                          Cetak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'mutations' && (
          <div className="overflow-x-auto">
            {memberMutations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada catatan mutasi simpanan.
              </div>
            ) : (
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Jenis Simpanan</th>
                    <th className="py-2.5 px-3">Mutasi</th>
                    <th className="py-2.5 px-3">Nominal</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {memberMutations.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600">{m.tanggal}</td>
                      <td className="py-2.5 px-3 uppercase text-slate-800 font-sans font-medium">
                        Simpanan {m.jenisSimpanan}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {m.tipeMutasi === 'setor' ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Setor
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Tarik
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(m.jumlah)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 capitalize">
                        {m.metode === 'potong_gaji' ? 'Potong Gaji' : 'Transfer Manual'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">{m.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <LoanApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      <LoanCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyWithValues={(amount, tenor) => {
          setIsApplyModalOpen(true);
        }}
      />

      <SavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        defaultTab={savingsModalTab}
      />

      <TransferManagementModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <PrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type={printType}
        member={currentMember}
        loan={selectedLoanForPrint}
        potonganBulanan={memberPotonganBulanan}
      />
    </div>
  );
};
