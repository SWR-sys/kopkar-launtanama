import React, { useState } from 'react';
import { useKoperasi } from '../context/KoperasiContext';
import { formatRupiah } from '../utils/koperasiCalculations';
import {
  Building2,
  CheckCircle,
  Copy,
  CreditCard,
  Send,
  Upload,
  X,
} from 'lucide-react';

interface TransferManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferManagementModal: React.FC<TransferManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentMember, memberPotonganBulanan, submitTransferManagement } = useKoperasi();

  const [bankPengirim, setBankPengirim] = useState<string>('Bank Jatim');
  const [rekeningPengirim, setRekeningPengirim] = useState<string>(
    currentMember?.nomorRekening || '001-928172-88'
  );
  const [buktiNote, setBuktiNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !currentMember) return null;

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. '2026-10'
  const totalWajibTransfer = memberPotonganBulanan.totalPotongan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitTransferManagement({
      anggotaId: currentMember.id,
      namaAnggota: currentMember.nama,
      tanggalTransfer: new Date().toISOString().split('T')[0],
      periodeBulan: currentMonth,
      bankPengirim,
      nomorRekeningPengirim: rekeningPengirim,
      bankTujuan: 'Bank Mandiri (No. Rek 142-000-88192 a.n Kopkar Lautanama)',
      jumlahTransfer: totalWajibTransfer,
      rincian: {
        simpananWajib: memberPotonganBulanan.simpananWajib,
        simpananSukarela: memberPotonganBulanan.simpananSukarela,
        angsuranPinjaman: memberPotonganBulanan.angsuranPinjaman,
      },
      buktiTransferNote: buktiNote || 'Konfirmasi transfer via m-Banking',
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Transfer Manual</h3>
              <p className="text-xs text-slate-400">
                Khusus Anggota Kategori Management & Non-Payroll
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {submitted ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Bukti Transfer Berhasil Dikirim!</h4>
              <p className="text-xs text-slate-600">
                Pengurus Kopkar Lautanama akan segera memverifikasi mutasi rekening dan memperbarui buku simpanan & pinjaman Anda.
              </p>
            </div>
          ) : (
            <>
              {/* Rekening Tujuan Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Rekening Resmi Kopkar Lautanama:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('14200088192')}
                    className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Tersalin!' : 'Salin Rekening'}
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono">
                  <div className="font-bold text-slate-900 text-sm">142-000-88192</div>
                  <div className="text-slate-600 font-sans text-xs">Bank Mandiri Cabang Lautanama</div>
                  <div className="text-slate-500 font-sans text-[11px]">a.n. KOPERASI KARYAWAN LAUTANAMA</div>
                </div>
              </div>

              {/* Rincian Tagihan */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
                <div className="text-xs font-bold text-emerald-950 font-sans flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span>Rincian Kewajiban Periode {currentMonth}:</span>
                  <span className="text-emerald-700">{formatRupiah(totalWajibTransfer)}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>• Simpanan Wajib (Management):</span>
                  <span>{formatRupiah(memberPotonganBulanan.simpananWajib)}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>• Simpanan Sukarela:</span>
                  <span>{formatRupiah(memberPotonganBulanan.simpananSukarela)}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>• Angsuran Pinjaman Aktif:</span>
                  <span>{formatRupiah(memberPotonganBulanan.angsuranPinjaman)}</span>
                </div>
              </div>

              {/* Form Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Bank Pengirim
                  </label>
                  <input
                    type="text"
                    required
                    value={bankPengirim}
                    onChange={(e) => setBankPengirim(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    placeholder="BCA / Mandiri / Jatim"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nomor Rekening Pengirim
                  </label>
                  <input
                    type="text"
                    required
                    value={rekeningPengirim}
                    onChange={(e) => setRekeningPengirim(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    placeholder="Contoh: 001-928172"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nomor Referensi Transfer / Catatan
                </label>
                <input
                  type="text"
                  required
                  value={buktiNote}
                  onChange={(e) => setBuktiNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Contoh: Ref #MB-20261001-98218 atas nama Hendra"
                />
              </div>

              <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-700">Lampirkan Bukti Screenshot Transfer</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG atau PDF (Maks. 5MB)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Konfirmasi Transfer
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
