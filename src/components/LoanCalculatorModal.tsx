import React, { useState } from 'react';
import {
  formatRupiah,
  getSukuBunga,
  hitungSimulasiPinjaman,
} from '../utils/koperasiCalculations';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

interface LoanCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWithValues?: (amount: number, tenor: number) => void;
}

export const LoanCalculatorModal: React.FC<LoanCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyWithValues,
}) => {
  const [amount, setAmount] = useState<number>(5000000);
  const [tenor, setTenor] = useState<number>(6);

  if (!isOpen) return null;

  const currentSimulasi = hitungSimulasiPinjaman(amount, tenor);

  // Perbandingan untuk tenor-tenor umum
  const availableTenors = [1, 3, 4, 5, 6, 12, 18, 24];

  const quickAmounts = [
    1000000, 2500000, 5000000, 10000000, 20000000, 50000000,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Kalkulator Simulasi Pinjaman</h3>
              <p className="text-xs text-slate-400">
                Transparansi perhitungan bunga resmi Kopkar Lautanama
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Information Rule Box */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 text-emerald-950 text-xs leading-relaxed space-y-1.5">
            <div className="font-semibold flex items-center gap-2 text-emerald-900">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              Ketentuan Bunga Resmi Kopkar Lautanama:
            </div>
            <p>
              • <strong>Tenor 1 Bulan:</strong> Berlaku bunga spesial <strong>1,0%</strong> saja.
            </p>
            <p>
              • <strong>Tenor di atas 1 Bulan (3, 4, 5, 6, 12, 24 bulan):</strong> Bunga flat{' '}
              <strong>1,5% per bulan</strong> dari jumlah pinjaman yang diterima.
              <br />
              <span className="text-emerald-800">
                Contoh: Pinjaman Rp 1.000.000, bunga per bulan = Rp 1.000.000 × 1,5% = <strong>Rp 15.000</strong>.
                Berapapun tenor yang diambil, beban bunga per bulannya tetap konstan Rp 15.000.
              </span>
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-800">
                Jumlah Pengajuan Pinjaman (Pokok)
              </label>
              <span className="text-base font-bold font-mono text-emerald-600">
                {formatRupiah(amount)}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <span className="inline-flex items-center px-3 rounded-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-mono text-sm">
                Rp
              </span>
              <input
                type="number"
                min="500000"
                max="100000000"
                step="500000"
                value={amount}
                onChange={(e) => setAmount(Math.max(100000, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-mono transition-colors ${
                    amount === q
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {q >= 1000000 ? `${q / 1000000} Juta` : formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Tenor Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Pilihan Jangka Waktu / Tenor (Bulan)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {availableTenors.map((t) => {
                const bungaPct = getSukuBunga(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenor(t)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tenor === t
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{t} Bln</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {bungaPct}% /bln
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Highlight Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Rincian Angsuran Tenor Terpilih ({tenor} Bulan · Bunga {currentSimulasi.sukuBungaPersen}%)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400">Total Angsuran / Bulan</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {formatRupiah(currentSimulasi.totalAngsuranPerBulan)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Pokok {formatRupiah(currentSimulasi.angsuranPokokPerBulan)} + Bunga {formatRupiah(currentSimulasi.bungaPerBulan)}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400">Bunga Per Bulan (Tetap)</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {formatRupiah(currentSimulasi.bungaPerBulan)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {currentSimulasi.sukuBungaPersen}% × {formatRupiah(amount)}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400">Total Pengembalian</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {formatRupiah(currentSimulasi.totalKewajiban)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Total Bunga ({tenor} bln): {formatRupiah(currentSimulasi.totalBunga)}
                </div>
              </div>
            </div>
          </div>

          {/* Tenor Comparison Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Tabel Perbandingan Semua Tenor untuk Plafon {formatRupiah(amount)}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Tenor</th>
                    <th className="py-2.5 px-3">Suku Bunga</th>
                    <th className="py-2.5 px-3">Bunga / Bulan</th>
                    <th className="py-2.5 px-3">Pokok / Bulan</th>
                    <th className="py-2.5 px-3">Total Cicilan / Bulan</th>
                    <th className="py-2.5 px-3">Total Bunga</th>
                    <th className="py-2.5 px-3">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {availableTenors.map((t) => {
                    const row = hitungSimulasiPinjaman(amount, t);
                    const isSelected = t === tenor;
                    return (
                      <tr
                        key={t}
                        onClick={() => setTenor(t)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans">
                          <span className="flex items-center gap-1.5">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {t} Bulan {t === 1 && '(Khusus)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{row.sukuBungaPersen}%</td>
                        <td className="py-2.5 px-3">{formatRupiah(row.bungaPerBulan)}</td>
                        <td className="py-2.5 px-3">{formatRupiah(row.angsuranPokokPerBulan)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {formatRupiah(row.totalAngsuranPerBulan)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{formatRupiah(row.totalBunga)}</td>
                        <td className="py-2.5 px-3 text-slate-900">{formatRupiah(row.totalKewajiban)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            Jatuh tempo setiap tanggal 1 tiap bulan (potong payroll perusahaan)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Tutup
            </button>
            {onApplyWithValues && (
              <button
                onClick={() => {
                  onApplyWithValues(amount, tenor);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
              >
                Gunakan Nilai Ini untuk Pengajuan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
