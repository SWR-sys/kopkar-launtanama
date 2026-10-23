import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import { JenisPinjaman, Pinjaman } from '../types/koperasi';
import {
  formatRupiah,
  getNamaJenisPinjaman,
  getSukuBunga,
  hitungBiayaPelunasanTopUp,
  hitungSimulasiPinjaman,
  validasiKelayakanPinjaman,
} from '../utils/koperasiCalculations';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle,
  CreditCard,
  Package,
  RefreshCcw,
  ShoppingBag,
  Wallet,
  X,
} from 'lucide-react';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialTenor?: number;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 5000000,
  initialTenor = 6,
}) => {
  const { currentMember, memberLoans, applyLoan } = useKoperasi();

  const [jenisPinjaman, setJenisPinjaman] = useState<JenisPinjaman>('uang');
  const [jumlahPinjaman, setJumlahPinjaman] = useState<number>(initialAmount);
  const [tenorBulan, setTenorBulan] = useState<number>(initialTenor);
  const [keterangan, setKeterangan] = useState<string>('');
  const [isTopUp, setIsTopUp] = useState<boolean>(false);
  const [selectedOldLoanId, setSelectedOldLoanId] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen || !currentMember) return null;

  // Active loans that can be topped up
  const activeLoans = memberLoans.filter((l) => l.status === 'disetujui' && l.sisaPokok > 0);
  const selectedOldLoan = activeLoans.find((l) => l.id === selectedOldLoanId);

  // Auto-select old loan if only 1 active loan exists and isTopUp is toggled
  if (isTopUp && !selectedOldLoanId && activeLoans.length > 0) {
    setSelectedOldLoanId(activeLoans[0].id);
  }

  // Jika anggota sudah memiliki 2 pinjaman aktif, Top Up diwajibkan untuk membuka pinjaman baru
  const mustTopUp = activeLoans.length >= 2;

  // Top up calculation
  let biayaPelunasanLama = 0;
  let sisaPokokLama = 0;
  let sisaBungaLama = 0;

  if (isTopUp && selectedOldLoan) {
    const math = hitungBiayaPelunasanTopUp(selectedOldLoan);
    sisaPokokLama = math.sisaPokok;
    sisaBungaLama = math.sisaBunga;
    biayaPelunasanLama = math.totalPelunasan;
  }

  const simulasi = hitungSimulasiPinjaman(jumlahPinjaman, tenorBulan);
  const jumlahDiterimaBersih = jumlahPinjaman - biayaPelunasanLama;

  const validasi = validasiKelayakanPinjaman(
    currentMember,
    activeLoans,
    jenisPinjaman,
    isTopUp
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validasi.boleh) {
      setFeedback({ success: false, message: validasi.pesan });
      return;
    }

    if (isTopUp && jumlahPinjaman <= biayaPelunasanLama) {
      setFeedback({
        success: false,
        message: `Plafon pinjaman baru (${formatRupiah(jumlahPinjaman)}) harus lebih besar dari total pelunasan pinjaman lama (${formatRupiah(biayaPelunasanLama)}).`,
      });
      return;
    }

    const res = applyLoan({
      anggotaId: currentMember.id,
      jenisPinjaman,
      jumlahPinjaman,
      tenorBulan,
      keterangan: keterangan || `Pengajuan ${getNamaJenisPinjaman(jenisPinjaman)}`,
      isTopUp,
      pinjamanLamaId: isTopUp ? selectedOldLoanId : undefined,
    });

    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1800);
    }
  };

  const loanTypes = [
    {
      id: 'uang' as JenisPinjaman,
      title: 'Pinjaman Kas Koperasi',
      desc: 'Pinjaman dana tunai untuk kebutuhan mendesak / renovasi / modal.',
      icon: Wallet,
      allowed: true,
    },
    {
      id: 'barang' as JenisPinjaman,
      title: 'Pinjaman Barang',
      desc: 'Pengadaan laptop, smartphone, elektronik rumah, atau kendaraan ringan.',
      icon: Package,
      allowed: currentMember.tipe === 'tetap',
      restriction: 'Hanya Anggota Tetap',
    },
    {
      id: 'bank_jatim' as JenisPinjaman,
      title: 'Pinjaman Bank Jatim',
      desc: 'Fasilitas kredit kemitraan channeling dengan plafon lebih tinggi.',
      icon: Building,
      allowed: currentMember.tipe === 'tetap',
      restriction: 'Hanya Anggota Tetap',
    },
    {
      id: 'toko' as JenisPinjaman,
      title: 'Pinjaman Toko (Tempo)',
      desc: 'Belanja konsumtif di toko / minimarket koperasi sistem tempo bayar gajian.',
      icon: ShoppingBag,
      allowed: true,
    },
  ];

  const tenorOptions = [1, 3, 4, 5, 6, 12, 18, 24];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Form Pengajuan Pinjaman</h3>
              <p className="text-xs text-slate-400">
                {currentMember.nama} ({currentMember.nomorAnggota})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Active Loans Notice & 1 Nama 2 Pinjaman Rule */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Status Kuota Pinjaman Anda:</span>
              <span className="font-mono text-emerald-700">
                {activeLoans.length} dari Maks. 2 Pinjaman Aktif Bersamaan
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Kopkar Lautanama mengizinkan <strong>1 nama maksimal 2 pinjaman bersamaan</strong>. Jika Anda sudah
              memiliki 2 pinjaman aktif, Anda wajib memilih opsi <strong>Top Up Pinjaman</strong> untuk melunasi salah satu pinjaman lama.
            </p>
          </div>

          {/* Top Up Toggle Section */}
          {activeLoans.length > 0 && (
            <div className="border border-slate-200 bg-amber-50/40 rounded-xl p-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Opsi Top Up Pinjaman Sebelumnya
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isTopUp || mustTopUp}
                  disabled={mustTopUp}
                  onChange={(e) => setIsTopUp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
              </label>

              {(isTopUp || mustTopUp) && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2 text-xs">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Pilih Pinjaman Lama yang Dilunasi (Top Up):
                  </label>
                  <select
                    value={selectedOldLoanId}
                    onChange={(e) => setSelectedOldLoanId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                  >
                    {activeLoans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {loan.kodePinjaman} ({getNamaJenisPinjaman(loan.jenisPinjaman)}) - Sisa Pokok: {formatRupiah(loan.sisaPokok)} (Sisa {loan.sisaTenor} bln)
                      </option>
                    ))}
                  </select>

                  {selectedOldLoan && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Sisa Pokok Pinjaman Lama:</span>
                        <span>{formatRupiah(sisaPokokLama)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Sisa Bunga Sesuai Tenor ({selectedOldLoan.sisaTenor} bln):</span>
                        <span>{formatRupiah(sisaBungaLama)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-amber-900 border-t border-amber-100 pt-1">
                        <span>Total Wajib Dilunasi untuk Top Up:</span>
                        <span>{formatRupiah(biayaPelunasanLama)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Select Loan Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Pilih Jenis Pinjaman (4 Macam Fasilitas Kopkar)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {loanTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = jenisPinjaman === type.id;
                const disabled = !type.allowed;

                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setJenisPinjaman(type.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : disabled
                        ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : disabled
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {type.title}
                        {disabled && (
                          <span className="text-[10px] font-normal text-rose-500">
                            ({type.restriction})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {type.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loan Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Jumlah Pinjaman Baru (Pokok)
              </label>
              <span className="text-sm font-bold font-mono text-emerald-600">
                {formatRupiah(jumlahPinjaman)}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 rounded-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-mono text-xs">
                Rp
              </span>
              <input
                type="number"
                min="500000"
                max={jenisPinjaman === 'bank_jatim' ? 100000000 : 30000000}
                step="500000"
                value={jumlahPinjaman}
                onChange={(e) => setJumlahPinjaman(Math.max(100000, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tenor Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Pilihan Tenor / Jangka Waktu
              </label>
              <span className="text-[11px] text-slate-500">
                Bunga: {getSukuBunga(tenorBulan)}% flat per bulan
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {tenorOptions.map((t) => {
                const bunga = getSukuBunga(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenorBulan(t)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      tenorBulan === t
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{t} Bln</div>
                    <div className="text-[10px] text-slate-500 font-mono">{bunga}%</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keterangan Barang / Keperluan */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              {jenisPinjaman === 'barang'
                ? 'Rincian Barang yang Diajukan (Merek, Tipe, Spesifikasi)'
                : jenisPinjaman === 'toko'
                ? 'Catatan Belanja Tempo Toko Koperasi'
                : 'Tujuan Penggunaan Dana Pinjaman'}
            </label>
            <input
              type="text"
              required
              placeholder={
                jenisPinjaman === 'barang'
                  ? 'Contoh: Laptop HP Core i5 16GB RAM untuk kebutuhan kerja'
                  : jenisPinjaman === 'toko'
                  ? 'Contoh: Belanja bahan pokok sembako bulanan'
                  : 'Contoh: Biaya pendidikan anak semester awal'
              }
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Real-Time Calculation Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ringkasan Kewajiban Pinjaman</span>
              <span className="text-[11px] font-normal text-slate-400">
                Metode: {currentMember.metodePembayaran === 'potong_gaji' ? 'Potong Gaji Kolektif' : 'Transfer Manual'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-800 p-2 rounded-lg">
                <div className="text-[10px] text-slate-400">Bunga / Bulan</div>
                <div className="font-bold text-white mt-0.5">{formatRupiah(simulasi.bungaPerBulan)}</div>
                <div className="text-[9px] text-slate-500">{simulasi.sukuBungaPersen}% × Pokok</div>
              </div>

              <div className="bg-slate-800 p-2 rounded-lg">
                <div className="text-[10px] text-slate-400">Pokok / Bulan</div>
                <div className="font-bold text-white mt-0.5">{formatRupiah(simulasi.angsuranPokokPerBulan)}</div>
                <div className="text-[9px] text-slate-500">Pokok ÷ {tenorBulan}</div>
              </div>

              <div className="bg-slate-800 p-2 rounded-lg">
                <div className="text-[10px] text-slate-400">Total Angsuran / Bln</div>
                <div className="font-bold text-emerald-400 mt-0.5">{formatRupiah(simulasi.totalAngsuranPerBulan)}</div>
                <div className="text-[9px] text-slate-500">Pokok + Bunga</div>
              </div>

              <div className="bg-slate-800 p-2 rounded-lg">
                <div className="text-[10px] text-slate-400">Total Bunga ({tenorBulan} bln)</div>
                <div className="font-bold text-amber-400 mt-0.5">{formatRupiah(simulasi.totalBunga)}</div>
                <div className="text-[9px] text-slate-500">Bunga × Tenor</div>
              </div>
            </div>

            {/* If Top Up, Show Net Received Breakdown */}
            {(isTopUp || mustTopUp) && selectedOldLoan && (
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between text-xs font-mono gap-2">
                <div>
                  <span className="text-slate-400">Pelunasan Pinjaman Lama: </span>
                  <span className="text-rose-400 font-bold">-{formatRupiah(biayaPelunasanLama)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Dana Bersih Diterima Anggota: </span>
                  <span className="text-emerald-400 font-bold">{formatRupiah(jumlahDiterimaBersih)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!validasi.boleh}
              className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm text-white transition-colors ${
                validasi.boleh
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              Kirim Pengajuan Pinjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
