import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import {
  Anggota,
  JenisPinjaman,
  KategoriAnggota,
  Pinjaman,
  TipeAnggota,
} from '../types/koperasi';
import {
  formatRupiah,
  getBadgeLabelKategori,
  getNamaJenisPinjaman,
  getSimpananWajibBulanan,
} from '../utils/koperasiCalculations';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  Package,
  PiggyBank,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { PrintSlipModal } from './PrintSlipModal';

export const AdminDashboard: React.FC<{ activeViewTab?: string }> = ({ activeViewTab = 'ringkasan' }) => {
  const {
    allMembers,
    allLoans,
    allMutations,
    allTransfers,
    adminTotalPinjamanDiajukan,
    adminTotalPinjamanAktif,
    adminTotalPinjamanPending,
    approveLoan,
    rejectLoan,
    verifyTransferManagement,
    getRekapPotongGajiKolektif,
    processPayrollBatch,
    addNewMember,
  } = useKoperasi();

  const [currentTab, setCurrentTab] = useState<
    'ringkasan' | 'persetujuan' | 'payroll' | 'transfer' | 'anggota_list' | 'portfolio'
  >(activeViewTab as any);

  // Sync tab with header selection if changed
  React.useEffect(() => {
    if (activeViewTab) {
      setCurrentTab(activeViewTab as any);
    }
  }, [activeViewTab]);

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchMember, setSearchMember] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterJenisPinjaman, setFilterJenisPinjaman] = useState<string>('all');
  const [batchProcessedMessage, setBatchProcessedMessage] = useState<string | null>(null);

  // Add member modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newDept, setNewDept] = useState('Produksi');
  const [newJabatan, setNewJabatan] = useState('');
  const [newTelepon, setNewTelepon] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTipe, setNewTipe] = useState<TipeAnggota>('tetap');
  const [newKategori, setNewKategori] = useState<KategoriAnggota>('pelaksana');
  const [newSimpananSukarela, setNewSimpananSukarela] = useState<number>(0);

  // Print slip state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printLoan, setPrintLoan] = useState<Pinjaman | undefined>(undefined);
  const [printMember, setPrintMember] = useState<Anggota | undefined>(undefined);

  // Calculations for Admin KPIs
  const totalSimpananPokok = allMembers.reduce((sum, m) => sum + m.totalSimpananPokok, 0);
  const totalSimpananWajib = allMembers.reduce((sum, m) => sum + m.totalSimpananWajib, 0);
  const totalSimpananSukarela = allMembers.reduce((sum, m) => sum + m.totalSimpananSukarela, 0);
  const totalSeluruhSimpanan = totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela;

  const activeLoans = allLoans.filter((l) => l.status === 'disetujui' && l.sisaPokok > 0);
  const totalPiutangPinjaman = activeLoans.reduce((sum, l) => sum + l.sisaPokok, 0);
  const totalPendapatanBungaBulanan = activeLoans.reduce((sum, l) => sum + l.bungaPerBulan, 0);
  const totalAngsuranMasukBulanan = activeLoans.reduce((sum, l) => sum + l.totalAngsuranPerBulan, 0);

  const pendingLoans = allLoans.filter((l) => l.status === 'pending');
  const pendingTransfers = allTransfers.filter((t) => t.status === 'pending');

  const rekapPayroll = getRekapPotongGajiKolektif(selectedMonth);
  const totalPayrollPotongan = rekapPayroll.reduce((sum, r) => sum + r.totalPotonganGaji, 0);

  // Filter members
  const filteredMembers = allMembers.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.nik.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.nomorAnggota.toLowerCase().includes(searchMember.toLowerCase());
    const matchKategori = filterKategori === 'all' || m.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const handleProcessPayroll = () => {
    processPayrollBatch(selectedMonth);
    setBatchProcessedMessage(
      `Berhasil memproses pembayaran kolektif payroll PT Lautanama periode ${selectedMonth} untuk ${rekapPayroll.length} anggota staf dan pelaksana!`
    );
    setTimeout(() => setBatchProcessedMessage(null), 3000);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const swBulanan = getSimpananWajibBulanan(newKategori);
    const metode = newKategori === 'management' || newTipe === 'tidak_tetap' ? 'transfer_manual' : 'potong_gaji';

    addNewMember({
      nama: newNama,
      nik: newNik,
      departemen: newDept,
      jabatan: newJabatan || 'Karyawan',
      telepon: newTelepon,
      email: newEmail,
      tipe: newTipe,
      kategori: newKategori,
      metodePembayaran: metode,
      tanggalBergabung: new Date().toISOString().split('T')[0],
      simpananPokok: newTipe === 'tetap' ? 100000 : 0,
      simpananWajibPerBulan: swBulanan,
      simpananSukarelaPerBulan: newSimpananSukarela,
    });

    setIsAddMemberOpen(false);
    // Reset form
    setNewNama('');
    setNewNik('');
    setNewJabatan('');
    setNewTelepon('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Portal Administrator Pengurus
            </span>
            <span>·</span>
            <span>Koperasi Karyawan Lautanama</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Dashboard Pengurus Koperasi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen simpanan, persetujuan pinjaman, rekap payroll kolektif, dan transfer management
          </p>
        </div>

        {/* Tab Navigation Pill in Header */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setCurrentTab('ringkasan')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentTab === 'ringkasan'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ringkasan Kas
          </button>
          <button
            onClick={() => setCurrentTab('persetujuan')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all relative ${
              currentTab === 'persetujuan'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Persetujuan
            {pendingLoans.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-900 rounded-full">
                {pendingLoans.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('payroll')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentTab === 'payroll'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Rekap Payroll
          </button>
          <button
            onClick={() => setCurrentTab('transfer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all relative ${
              currentTab === 'transfer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Transfer Mgt
            {pendingTransfers.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-sky-400 text-slate-900 rounded-full">
                {pendingTransfers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('anggota_list')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentTab === 'anggota_list'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Anggota ({allMembers.length})
          </button>
          <button
            onClick={() => setCurrentTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentTab === 'portfolio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            4 Jenis Pinjaman
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Simpanan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Total Simpanan</span>
            <PiggyBank className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight truncate">
            {formatRupiah(totalSeluruhSimpanan)}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between truncate">
            <span className="truncate">{allMembers.length} Anggota</span>
            <span className="font-mono text-emerald-700 text-[10px] shrink-0 ml-1">SW: {formatRupiah(totalSimpananWajib)}</span>
          </div>
        </div>

        {/* Total Pinjaman yang Diajukan */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Total Pinjaman Diajukan</span>
            <Building className="w-4 h-4 text-sky-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-sky-700 tracking-tight truncate">
            {formatRupiah(adminTotalPinjamanDiajukan)}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between truncate">
            <span className="truncate">{allLoans.length} Berkas Total</span>
            {adminTotalPinjamanPending > 0 ? (
              <span className="text-amber-600 font-bold font-mono text-[10px] shrink-0 ml-1 truncate">
                {formatRupiah(adminTotalPinjamanPending)} pending
              </span>
            ) : (
              <span className="text-slate-600 font-mono text-[10px] shrink-0 ml-1">Terverifikasi</span>
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
            {formatRupiah(adminTotalPinjamanAktif)}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between truncate">
            <span className="truncate">{activeLoans.length} Fasilitas Aktif</span>
            <span className="font-mono text-slate-700 font-medium text-[10px] shrink-0 ml-1">Sisa Pokok</span>
          </div>
        </div>

        {/* Kolektif Payroll */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Payroll PT Lautanama</span>
            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-amber-600 tracking-tight truncate">
            {formatRupiah(totalPayrollPotongan)}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between truncate">
            <span className="truncate">{rekapPayroll.length} Staf & Pelaksana</span>
            <span className="text-amber-800 font-semibold text-[10px] shrink-0 ml-1">Tgl 1 tiap bln</span>
          </div>
        </div>

        {/* Antrian Verifikasi */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Antrian Verifikasi</span>
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight truncate">
            {pendingLoans.length + pendingTransfers.length} Berkas
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between truncate">
            <span className="truncate">Pinjaman: {pendingLoans.length}</span>
            <span className="shrink-0 ml-1">Transfer: {pendingTransfers.length}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: PERSATUAN PINJAMAN & TOP UP */}
      {currentTab === 'persetujuan' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Persetujuan & Verifikasi Pengajuan Pinjaman</h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan syarat 1 nama maksimal 2 pinjaman bersamaan & perhitungan pelunasan Top Up
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {pendingLoans.length} Menunggu Persetujuan
            </span>
          </div>

          {pendingLoans.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Tidak ada antrian pengajuan pinjaman baru saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{loan.namaAnggota}</span>
                        <span className="text-[11px] font-mono text-slate-500">({loan.kodePinjaman})</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {getBadgeLabelKategori(loan.kategoriAnggota)}
                        </span>
                        {loan.isTopUp && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <RefreshCcw className="w-3 h-3" /> Top Up Pinjaman
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Fasilitas: <strong>{getNamaJenisPinjaman(loan.jenisPinjaman)}</strong> · Keperluan: {loan.keteranganBarang}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectLoan(loan.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => approveLoan(loan.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Setujui & Cairkan
                      </button>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Plafon Pengajuan:</div>
                      <div className="font-bold text-slate-900">{formatRupiah(loan.jumlahPinjaman)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Tenor & Bunga:</div>
                      <div className="font-bold text-slate-900">
                        {loan.tenorBulan} Bln ({loan.sukuBungaPersen}% /bln)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Angsuran / Bulan:</div>
                      <div className="font-bold text-emerald-700">{formatRupiah(loan.totalAngsuranPerBulan)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Total Bunga Koperasi:</div>
                      <div className="font-bold text-amber-600">{formatRupiah(loan.totalBunga)}</div>
                    </div>
                  </div>

                  {loan.isTopUp && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono space-y-1">
                      <div className="font-bold text-amber-950 font-sans flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Perhitungan Otomatis Top Up (Pelunasan Pinjaman Lama):
                      </div>
                      <div className="flex justify-between text-slate-700 text-[11px]">
                        <span>• Pelunasan Pokok & Bunga Pinjaman Lama:</span>
                        <span className="text-rose-700 font-bold">-{formatRupiah(loan.biayaPelunasanLama || 0)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold text-xs pt-1 border-t border-amber-200">
                        <span>• Dana Bersih Diterima Anggota:</span>
                        <span className="text-emerald-700">{formatRupiah(loan.jumlahDiterimaBersih)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP POTONG GAJI KOLEKTIF (PAYROLL PERUSAHAAN) */}
      {currentTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Rekap Potongan Gaji Kolektif (PT Lautanama)
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Staf & Pelaksana
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sesuai aturan Kopkar: Anggota staf dan pelaksana dipotong gaji otomatis lewat payroll perusahaan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Periode:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs font-semibold"
                />
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                Cetak Rekap HRD
              </button>

              <button
                onClick={handleProcessPayroll}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Proses Bayar Kolektif
              </button>
            </div>
          </div>

          {batchProcessedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {batchProcessedMessage}
            </div>
          )}

          {/* Payroll Summary Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NIK</th>
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Departemen</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Simpanan Wajib</th>
                  <th className="py-2.5 px-3 text-right">Simpanan Sukarela</th>
                  <th className="py-2.5 px-3 text-right">Angsuran Pinjaman 1</th>
                  <th className="py-2.5 px-3 text-right">Angsuran Pinjaman 2</th>
                  <th className="py-2.5 px-3 text-right">Total Potong Gaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {rekapPayroll.map((r) => (
                  <tr key={r.anggotaId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600">{r.nik}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{r.namaAnggota}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{r.departemen}</td>
                    <td className="py-2.5 px-3 font-sans capitalize">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {r.kategori === 'pelaksana' ? 'Pelaksana (50k)' : 'Staff (100k)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">{formatRupiah(r.simpananWajib)}</td>
                    <td className="py-2.5 px-3 text-right">{formatRupiah(r.simpananSukarela)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {r.angsuranPinjaman1 > 0 ? formatRupiah(r.angsuranPinjaman1) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {r.angsuranPinjaman2 > 0 ? formatRupiah(r.angsuranPinjaman2) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {formatRupiah(r.totalPotonganGaji)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold font-sans text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3 uppercase" colSpan={4}>
                    Total Kolektif Transfer dari PT Lautanama
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(rekapPayroll.reduce((s, r) => s + r.simpananWajib, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(rekapPayroll.reduce((s, r) => s + r.simpananSukarela, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(rekapPayroll.reduce((s, r) => s + r.angsuranPinjaman1, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(rekapPayroll.reduce((s, r) => s + r.angsuranPinjaman2, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                    {formatRupiah(totalPayrollPotongan)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER MANUAL MANAGEMENT */}
      {currentTab === 'transfer' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Verifikasi Transfer Manual Kategori Management
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  Non-Payroll
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sesuai aturan: Anggota kategori management melakukan pembayaran iuran & angsuran lewat transfer manual.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
              {pendingTransfers.length} Menunggu Konfirmasi
            </span>
          </div>

          {allTransfers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              Belum ada data konfirmasi transfer manual.
            </div>
          ) : (
            <div className="space-y-3">
              {allTransfers.map((trf) => (
                <div
                  key={trf.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{trf.namaAnggota}</span>
                      <span className="text-xs font-mono text-slate-500">Tgl: {trf.tanggalTransfer}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          trf.status === 'terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trf.status === 'ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {trf.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-mono">
                      Pengirim: {trf.bankPengirim} ({trf.nomorRekeningPengirim}) → {trf.bankTujuan}
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 inline-block font-mono">
                      SW: {formatRupiah(trf.rincian.simpananWajib)} · SS: {formatRupiah(trf.rincian.simpananSukarela)} · Angsuran: {formatRupiah(trf.rincian.angsuranPinjaman)} = <strong>{formatRupiah(trf.jumlahTransfer)}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Catatan: {trf.buktiTransferNote}
                    </div>
                  </div>

                  {trf.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => verifyTransferManagement(trf.id, false, 'Mutasi bank belum ditemukan')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => verifyTransferManagement(trf.id, true, 'Dana masuk kas tervalidasi')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Verifikasi Masuk Kas
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MASTER DATA ANGGOTA */}
      {currentTab === 'anggota_list' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Data Anggota Kopkar Lautanama</h3>
              <p className="text-xs text-slate-500">
                Pembedaan hak akses Anggota Tetap (Pelaksana, Staff, Management) vs Anggota Tidak Tetap
              </p>
            </div>

            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Tambah Anggota Baru
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau nomor anggota..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="all">Semua Kategori Anggota</option>
                <option value="pelaksana">Pelaksana (SW 50k · Potong Gaji)</option>
                <option value="staff">Staff (SW 100k · Potong Gaji)</option>
                <option value="management">Management (SW 100k · Transfer Manual)</option>
                <option value="tidak_tetap">Anggota Tidak Tetap</option>
              </select>
            </div>
          </div>

          {/* Member Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Anggota</th>
                  <th className="py-2.5 px-3">Nama & NIK</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Metode Bayar</th>
                  <th className="py-2.5 px-3 text-right">Simpanan Pokok</th>
                  <th className="py-2.5 px-3 text-right">Simpanan Wajib</th>
                  <th className="py-2.5 px-3 text-right">Simpanan Sukarela</th>
                  <th className="py-2.5 px-3 text-right">Total Simpanan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredMembers.map((m) => {
                  const total = m.totalSimpananPokok + m.totalSimpananWajib + m.totalSimpananSukarela;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-700 font-bold">{m.nomorAnggota}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-900">{m.nama}</div>
                        <div className="text-[11px] text-slate-500">{m.nik} · {m.departemen}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[11px] font-semibold text-slate-800">
                          {getBadgeLabelKategori(m.kategori)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">
                        {m.metodePembayaran === 'potong_gaji' ? 'Potong Gaji' : 'Transfer Manual'}
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.totalSimpananPokok)}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.totalSimpananWajib)}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.totalSimpananSukarela)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {formatRupiah(total)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => {
                            setPrintMember(m);
                            setIsPrintModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-slate-900 underline text-[11px]"
                        >
                          Cetak Kartu
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PORTOFOLIO 4 JENIS PINJAMAN */}
      {(currentTab === 'ringkasan' || currentTab === 'portfolio') && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Portofolio 4 Jenis Pinjaman Kopkar Lautanama
              </h3>
              <p className="text-xs text-slate-500">
                1. Pinjaman Kas Uang · 2. Pinjaman Barang · 3. Pinjaman Bank Jatim · 4. Pinjaman Toko Tempo
              </p>
            </div>
            <div className="flex gap-1.5 text-xs">
              {(['all', 'uang', 'barang', 'bank_jatim', 'toko'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterJenisPinjaman(t)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    filterJenisPinjaman === t
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Pinjaman</th>
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3">Jenis Fasilitas</th>
                  <th className="py-2.5 px-3">Pokok Pinjaman</th>
                  <th className="py-2.5 px-3">Tenor</th>
                  <th className="py-2.5 px-3">Bunga / Bln (Tetap)</th>
                  <th className="py-2.5 px-3">Angsuran / Bln</th>
                  <th className="py-2.5 px-3">Sisa Pokok</th>
                  <th className="py-2.5 px-3">Sisa Tenor</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {allLoans
                  .filter((l) => filterJenisPinjaman === 'all' || l.jenisPinjaman === filterJenisPinjaman)
                  .map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{l.kodePinjaman}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{l.namaAnggota}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {getNamaJenisPinjaman(l.jenisPinjaman)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{formatRupiah(l.jumlahPinjaman)}</td>
                      <td className="py-2.5 px-3">{l.tenorBulan} Bln</td>
                      <td className="py-2.5 px-3 text-emerald-700">{formatRupiah(l.bungaPerBulan)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(l.totalAngsuranPerBulan)}</td>
                      <td className="py-2.5 px-3 text-rose-600">{formatRupiah(l.sisaPokok)}</td>
                      <td className="py-2.5 px-3">{l.sisaTenor} Bln</td>
                      <td className="py-2.5 px-3 font-sans">
                        {l.status === 'disetujui' && <span className="text-emerald-700 font-semibold">Aktif</span>}
                        {l.status === 'pending' && <span className="text-amber-700 font-semibold">Pending</span>}
                        {l.status === 'top_up_ditutup' && <span className="text-slate-500 font-semibold">Ditutup Top Up</span>}
                        {l.status === 'lunas' && <span className="text-indigo-700 font-semibold">Lunas</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Anggota Baru */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Registrasi Anggota Baru</h3>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    NIK Perusahaan
                  </label>
                  <input
                    type="text"
                    required
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="EMP-0511"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    required
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="Produksi / HR / Keuangan"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Tipe Keanggotaan
                  </label>
                  <select
                    value={newTipe}
                    onChange={(e) => {
                      const t = e.target.value as TipeAnggota;
                      setNewTipe(t);
                      if (t === 'tidak_tetap') setNewKategori('tidak_tetap');
                      else setNewKategori('pelaksana');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="tetap">Anggota Tetap</option>
                    <option value="tidak_tetap">Anggota Tidak Tetap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Kategori Jabatan (Aturan Simpanan Wajib)
                  </label>
                  <select
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value as KategoriAnggota)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    {newTipe === 'tetap' ? (
                      <>
                        <option value="pelaksana">Pelaksana (SW Rp 50.000 / bln)</option>
                        <option value="staff">Staff (SW Rp 100.000 / bln)</option>
                        <option value="management">Management (SW Rp 100.000 · Transfer)</option>
                      </>
                    ) : (
                      <option value="tidak_tetap">Tidak Tetap (Bebas SW)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Simpanan Sukarela Rutin (Opsional Sesuai Permintaan Anggota)
                </label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={newSimpananSukarela}
                  onChange={(e) => setNewSimpananSukarela(Number(e.target.value))}
                  placeholder="0 jika tidak ada"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1 font-mono">
                <div className="font-semibold text-emerald-950 font-sans">Konfirmasi Ketentuan Anggota:</div>
                <div className="text-slate-700">• Simpanan Pokok: {newTipe === 'tetap' ? 'Rp 100.000 (Awal Gabung)' : 'Rp 0'}</div>
                <div className="text-slate-700">• Simpanan Wajib: {formatRupiah(getSimpananWajibBulanan(newKategori))} / bulan</div>
                <div className="text-slate-700">
                  • Metode Bayar:{' '}
                  {newKategori === 'management' || newTipe === 'tidak_tetap'
                    ? 'Transfer Manual'
                    : 'Potong Gaji Kolektif'}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {isPrintModalOpen && printMember && (
        <PrintSlipModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          type="savings_card"
          member={printMember}
        />
      )}
    </div>
  );
};
