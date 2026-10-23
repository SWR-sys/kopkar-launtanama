export type TipeAnggota = 'tetap' | 'tidak_tetap';

export type KategoriAnggota = 'pelaksana' | 'staff' | 'management' | 'tidak_tetap';

export type MetodePembayaran = 'potong_gaji' | 'transfer_manual';

export type JenisPinjaman = 'uang' | 'barang' | 'bank_jatim' | 'toko';

export type StatusPinjaman = 'pending' | 'disetujui' | 'ditolak' | 'lunas' | 'top_up_ditutup';

export type RoleUser = 'pengurus' | 'anggota';

export interface Anggota {
  id: string;
  nomorAnggota: string;
  nama: string;
  nik: string; // NIK Perusahaan
  departemen: string;
  jabatan: string;
  telepon: string;
  email: string;
  tipe: TipeAnggota;
  kategori: KategoriAnggota;
  metodePembayaran: MetodePembayaran;
  tanggalBergabung: string;
  simpananPokok: number; // 100.000 satu kali saat bergabung
  simpananWajibPerBulan: number; // 50.000 untuk pelaksana, 100.000 untuk staff/management, 0 utk tdk tetap
  simpananSukarelaPerBulan: number; // Pilihan anggota utk autodebet/tambahan
  totalSimpananPokok: number;
  totalSimpananWajib: number;
  totalSimpananSukarela: number;
  nomorRekening?: string;
  namaBank?: string;
}

export interface AngsuranDetail {
  bulanKe: number;
  angsuranPokok: number;
  bungaBulanan: number;
  totalAngsuran: number;
  sisaPokok: number;
  status: 'lunas' | 'belum_bayar' | 'terlambat';
  tanggalJatuhTempo: string;
  tanggalDibayar?: string;
}

export interface Pinjaman {
  id: string;
  kodePinjaman: string;
  anggotaId: string;
  namaAnggota: string;
  kategoriAnggota: KategoriAnggota;
  jenisPinjaman: JenisPinjaman;
  keteranganBarang?: string; // jika jenis = barang atau toko
  jumlahPinjaman: number; // Pokok pinjaman
  tenorBulan: number; // 1, 3, 4, 5, 6, 12, 18, 24
  sukuBungaPersen: number; // 1.0% jika tenor 1 bulan, 1.5% jika tenor > 1 bulan
  bungaPerBulan: number; // jumlahPinjaman * (sukuBungaPersen / 100)
  totalBunga: number; // bungaPerBulan * tenorBulan
  angsuranPokokPerBulan: number; // jumlahPinjaman / tenorBulan
  totalAngsuranPerBulan: number; // angsuranPokokPerBulan + bungaPerBulan
  totalKewajiban: number; // jumlahPinjaman + totalBunga
  sisaPokok: number;
  sisaBunga: number;
  sisaTotalPelunasan: number;
  tenorTerbayar: number;
  sisaTenor: number;
  status: StatusPinjaman;
  tanggalPengajuan: string;
  tanggalPencairan?: string;
  isTopUp?: boolean;
  pinjamanLamaId?: string; // ID pinjaman yang dilunasi jika ini adalah top-up
  biayaPelunasanLama?: number; // Total sisa pinjaman lama + sisa bunga
  jumlahDiterimaBersih: number; // jumlahPinjaman - biayaPelunasanLama (jika top up)
  metodePembayaran: MetodePembayaran;
  angsuranJadwal: AngsuranDetail[];
}

export interface MutasiSimpanan {
  id: string;
  anggotaId: string;
  namaAnggota: string;
  tanggal: string;
  jenisSimpanan: 'pokok' | 'wajib' | 'sukarela';
  tipeMutasi: 'setor' | 'tarik';
  jumlah: number;
  keterangan: string;
  metode: MetodePembayaran;
  buktiTransferUrl?: string;
  statusVerifikasi: 'terverifikasi' | 'pending';
}

export interface RekapPotongGajiKolektif {
  periodeBulan: string; // '2026-10'
  anggotaId: string;
  namaAnggota: string;
  nik: string;
  departemen: string;
  kategori: KategoriAnggota;
  simpananWajib: number;
  simpananSukarela: number;
  angsuranPinjaman1: number;
  keteranganPinjaman1?: string;
  angsuranPinjaman2: number;
  keteranganPinjaman2?: string;
  totalPotonganGaji: number;
  statusPayroll: 'draft' | 'diajukan_ke_hrd' | 'dibayar_kolektif';
}

export interface KonfirmasiTransferManagement {
  id: string;
  anggotaId: string;
  namaAnggota: string;
  tanggalTransfer: string;
  periodeBulan: string;
  bankPengirim: string;
  nomorRekeningPengirim: string;
  bankTujuan: string;
  jumlahTransfer: number;
  rincian: {
    simpananWajib: number;
    simpananSukarela: number;
    angsuranPinjaman: number;
  };
  buktiTransferNote: string;
  status: 'pending' | 'terverifikasi' | 'ditolak';
  catatanPengurus?: string;
}
