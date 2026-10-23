import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import { formatRupiah } from '../utils/koperasiCalculations';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  PiggyBank,
  Settings,
  X,
} from 'lucide-react';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'setor' | 'tarik' | 'atur_rutin';
}

export const SavingsModal: React.FC<SavingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'setor',
}) => {
  const {
    currentMember,
    depositSukarela,
    withdrawSukarela,
    updateSimpananSukarelaRutin,
  } = useKoperasi();

  const [activeTab, setActiveTab] = useState<'setor' | 'tarik' | 'atur_rutin'>(defaultTab);
  const [amount, setAmount] = useState<number>(100000);
  const [keterangan, setKeterangan] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !currentMember) return null;

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    depositSukarela(
      currentMember.id,
      amount,
      keterangan || 'Setor Simpanan Sukarela'
    );
    setFeedback({
      success: true,
      message: `Setoran simpanan sukarela sebesar ${formatRupiah(amount)} berhasil ditambahkan ke saldo!`,
    });
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const res = withdrawSukarela(
      currentMember.id,
      amount,
      keterangan || 'Penarikan Simpanan Sukarela'
    );
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    }
  };

  const handleUpdateRutin = (e: React.FormEvent) => {
    e.preventDefault();
    updateSimpananSukarelaRutin(currentMember.id, amount);
    setFeedback({
      success: true,
      message: `Nominal simpanan sukarela rutin bulanan berhasil diperbarui menjadi ${formatRupiah(
        amount
      )} / bulan.`,
    });
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kelola Simpanan Sukarela</h3>
              <p className="text-xs text-slate-400">
                Saldo Saat Ini: {formatRupiah(currentMember.totalSimpananSukarela)}
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

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('setor');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'setor'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />
            Setor Sukarela
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('tarik');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tarik'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" />
            Tarik Sukarela
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('atur_rutin');
              setAmount(currentMember.simpananSukarelaPerBulan);
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'atur_rutin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
            Atur Iuran Bulanan
          </button>
        </div>

        <div className="p-6">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 mb-4 ${
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

          {activeTab === 'setor' && (
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-950">
                Simpanan Sukarela tidak memiliki batasan minimal/maksimal dan bebas disetor kapan saja. Saldo ini memperoleh pembagian SHU pada akhir tahun buku.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Nominal Setor (Rp)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tabungan persiapan hari raya"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                  Konfirmasi Setor
                </button>
              </div>
            </form>
          )}

          {activeTab === 'tarik' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-950">
                Dana simpanan sukarela dapat ditarik sewaktu-waktu. Penarikan akan ditransfer ke rekening bank Anda: <strong>{currentMember.namaBank} ({currentMember.nomorRekening || '-'})</strong>.
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Nominal Tarik (Rp)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(currentMember.totalSimpananSukarela)}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Tarik Semua ({formatRupiah(currentMember.totalSimpananSukarela)})
                  </button>
                </div>
                <input
                  type="number"
                  min="10000"
                  max={currentMember.totalSimpananSukarela}
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Keperluan Penarikan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kebutuhan darurat keluarga"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={currentMember.totalSimpananSukarela <= 0}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 rounded-lg shadow-sm"
                >
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          )}

          {activeTab === 'atur_rutin' && (
            <form onSubmit={handleUpdateRutin} className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950">
                Sesuai aturan Kopkar Lautanama: <strong>Simpanan Sukarela bersifat opsional tergantung permintaan masing-masing anggota</strong>. Anda dapat mengatur nominal yang dipotong rutin setiap bulan bersama simpanan wajib.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Nominal Simpanan Sukarela Rutin Tiap Bulan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan 0 jika tidak ingin menyetor simpanan sukarela bulanan secara otomatis.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
