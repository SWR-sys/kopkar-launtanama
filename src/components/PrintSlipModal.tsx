import React from 'react';
import { Anggota, Pinjaman } from '../types/koperasi';
import {
  formatRupiah,
  getBadgeLabelKategori,
  getNamaJenisPinjaman,
} from '../utils/koperasiCalculations';
import { Building2, CheckCircle2, Printer, X } from 'lucide-react';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'payroll_slip' | 'loan_contract' | 'savings_card';
  member: Anggota;
  loan?: Pinjaman;
  potonganBulanan?: {
    simpananWajib: number;
    simpananSukarela: number;
    angsuranPinjaman: number;
    totalPotongan: number;
    detailPinjaman: { kode: string; jenis: string; angsuran: number; sisaTenor: number }[];
  };
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  type,
  member,
  loan,
  potonganBulanan,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header (No-Print) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Pratinjau Cetak Dokumen Resmi</h3>
              <p className="text-xs text-slate-400">Koperasi Karyawan Lautanama</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 bg-white text-slate-900 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Kop Surat Koperasi */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase text-slate-900 leading-tight">
                  Koperasi Karyawan Lautanama
                </h1>
                <p className="text-xs text-slate-600">
                  Unit Usaha Simpan Pinjam & Kesejahteraan Karyawan PT Lautanama
                </p>
                <p className="text-[11px] text-slate-500">
                  Badan Hukum Koperasi: No. AHU-001928.AH.01.26 · Gedung Lautanama Lt. 2
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div>Tanggal: {todayStr}</div>
              <div className="text-[11px] text-slate-400">Ref: KL-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Member Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-slate-500">Nama Anggota:</div>
              <div className="font-bold text-slate-900 text-sm">{member.nama}</div>
              <div className="text-slate-600">NIK: {member.nik}</div>
            </div>
            <div>
              <div className="text-slate-500">Nomor Anggota & Status:</div>
              <div className="font-mono font-bold text-slate-900">{member.nomorAnggota}</div>
              <div className="text-slate-600 font-semibold">{getBadgeLabelKategori(member.kategori)}</div>
              <div className="text-slate-500">Dept: {member.departemen}</div>
            </div>
          </div>

          {/* Type 1: Payroll Deduction Slip */}
          {type === 'payroll_slip' && potonganBulanan && (
            <div className="space-y-4">
              <div className="text-center font-bold text-sm uppercase tracking-wider text-slate-800 border-b pb-2">
                SLIP RINCIAN POTONGAN GAJI KOPERASI (PAYROLL)
              </div>
              <p className="text-xs text-slate-600">
                Dokumen ini merupakan bukti rincian potongan berkala dari gaji karyawan yang disetorkan secara kolektif oleh perusahaan kepada Kopkar Lautanama pada tanggal 1 tiap bulan:
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Komponen Iuran / Pinjaman</th>
                      <th className="py-2.5 px-3 text-left">Keterangan / Aturan</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium">Simpanan Wajib</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">
                        {member.kategori === 'pelaksana' ? 'Kategori Pelaksana (Rp 50.000/bln)' : 'Kategori Staff/Management (Rp 100.000/bln)'}
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(potonganBulanan.simpananWajib)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium">Simpanan Sukarela</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">
                        Permintaan Mandiri Anggota
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(potonganBulanan.simpananSukarela)}</td>
                    </tr>
                    {potonganBulanan.detailPinjaman.map((p, idx) => (
                      <tr key={p.kode}>
                        <td className="py-2.5 px-3 font-sans font-medium">
                          Angsuran Pinjaman {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500">
                          {p.kode} ({getNamaJenisPinjaman(p.jenis as any)}) · Sisa Tenor: {p.sisaTenor} bln
                        </td>
                        <td className="py-2.5 px-3 text-right">{formatRupiah(p.angsuran)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold font-sans text-slate-900 border-t-2 border-slate-300">
                      <td className="py-3 px-3 uppercase" colSpan={2}>
                        Total Potongan Gaji Bulan Ini
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                        {formatRupiah(potonganBulanan.totalPotongan)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Type 2: Loan Contract / Bukti Pinjaman */}
          {type === 'loan_contract' && loan && (
            <div className="space-y-4">
              <div className="text-center font-bold text-sm uppercase tracking-wider text-slate-800 border-b pb-2">
                SURAT KONTRAK & JADWAL ANGSURAN PINJAMAN
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border font-mono text-xs">
                <div>
                  <div className="text-slate-500 font-sans text-[11px]">Kode Pinjaman:</div>
                  <div className="font-bold text-slate-900">{loan.kodePinjaman}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-sans text-[11px]">Jenis Fasilitas:</div>
                  <div className="font-bold text-slate-900 font-sans">{getNamaJenisPinjaman(loan.jenisPinjaman)}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-sans text-[11px]">Pokok Pinjaman:</div>
                  <div className="font-bold text-emerald-700">{formatRupiah(loan.jumlahPinjaman)}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-sans text-[11px]">Suku Bunga:</div>
                  <div className="font-bold text-slate-900">{loan.sukuBungaPersen}% / bln (Flat)</div>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div className="font-semibold text-emerald-950">Formula Perhitungan Transparan Kopkar Lautanama:</div>
                <div>• Bunga Pinjaman per Bulan: {formatRupiah(loan.bungaPerBulan)} (Tetap konstan untuk seluruh tenor)</div>
                <div>• Angsuran Pokok per Bulan: {formatRupiah(loan.angsuranPokokPerBulan)}</div>
                <div>• <strong>Total Angsuran per Bulan: {formatRupiah(loan.totalAngsuranPerBulan)}</strong></div>
                <div>• Total Kewajiban Seluruh Tenor ({loan.tenorBulan} bln): {formatRupiah(loan.totalKewajiban)}</div>
                {loan.isTopUp && (
                  <div className="text-amber-900 font-medium pt-1 border-t border-emerald-200">
                    * Pinjaman ini merupakan TOP UP, pelunasan pinjaman lama sebesar {formatRupiah(loan.biayaPelunasanLama || 0)} dipotong langsung, dana bersih yang diterima: <strong>{formatRupiah(loan.jumlahDiterimaBersih)}</strong>.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type 3: Savings Status Card */}
          {type === 'savings_card' && (
            <div className="space-y-4">
              <div className="text-center font-bold text-sm uppercase tracking-wider text-slate-800 border-b pb-2">
                BUKU MUTASI & SALDO SIMPANAN KOPERASI
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <div className="text-slate-500 font-sans text-[11px]">Simpanan Pokok:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(member.totalSimpananPokok)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <div className="text-slate-500 font-sans text-[11px]">Simpanan Wajib:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(member.totalSimpananWajib)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <div className="text-slate-500 font-sans text-[11px]">Simpanan Sukarela:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(member.totalSimpananSukarela)}</div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Total Akumulasi Simpanan:</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {formatRupiah(member.totalSimpananPokok + member.totalSimpananWajib + member.totalSimpananSukarela)}
                  </div>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  <div>Status Hak Suara: Aktif</div>
                  <div>Hak SHU Tahunan: Terdaftar</div>
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
            <div>
              <div className="text-slate-500">Anggota Koperasi,</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-900">
                ( {member.nama} )
              </div>
            </div>
            <div>
              <div className="text-slate-500">Pengurus Kopkar Lautanama,</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-900">
                ( Budi Santoso - Ketua )
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            Dokumen sah ini diterbitkan secara otomatis oleh Sistem Informasi Kopkar Lautanama.
          </div>
        </div>
      </div>
    </div>
  );
};
