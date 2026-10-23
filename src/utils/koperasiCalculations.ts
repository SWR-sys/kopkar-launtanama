import { Anggota, AngsuranDetail, JenisPinjaman, KategoriAnggota, Pinjaman } from '../types/koperasi';

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export const formatAngka = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value || 0);
};

/**
 * Menghitung suku bunga bulanan berdasarkan tenor:
 * - Tenor 1 bulan: 1.0% (Aturan nomor 7)
 * - Tenor > 1 bulan: 1.5% (Aturan nomor 6)
 */
export const getSukuBunga = (tenorBulan: number): number => {
  if (tenorBulan === 1) {
    return 1.0;
  }
  return 1.5;
};

/**
 * Menghitung simpanan wajib default berdasarkan kategori anggota
 * - Pelaksana: Rp 50.000/bulan (Aturan nomor 4)
 * - Staff & Management: Rp 100.000/bulan (Aturan nomor 4)
 * - Tidak Tetap: Rp 0 (opsional sukarela)
 */
export const getSimpananWajibBulanan = (kategori: KategoriAnggota): number => {
  switch (kategori) {
    case 'pelaksana':
      return 50000;
    case 'staff':
    case 'management':
      return 100000;
    case 'tidak_tetap':
      return 0;
    default:
      return 50000;
  }
};

export interface KalkulasiPinjamanResult {
  jumlahPinjaman: number;
  tenorBulan: number;
  sukuBungaPersen: number;
  bungaPerBulan: number;
  angsuranPokokPerBulan: number;
  totalAngsuranPerBulan: number;
  totalBunga: number;
  totalKewajiban: number;
  angsuranJadwal: AngsuranDetail[];
}

export const hitungSimulasiPinjaman = (
  jumlahPinjaman: number,
  tenorBulan: number
): KalkulasiPinjamanResult => {
  const sukuBungaPersen = getSukuBunga(tenorBulan);
  
  // Bunga per bulan = jumlah pinjaman * suku bunga (misal 1.000.000 * 1.5% = 15.000)
  const bungaPerBulan = Math.round(jumlahPinjaman * (sukuBungaPersen / 100));
  
  // Angsuran pokok per bulan = jumlah pinjaman / tenor
  const angsuranPokokPerBulan = Math.round(jumlahPinjaman / tenorBulan);
  
  // Total angsuran per bulan = angsuran pokok + bunga bulanan
  const totalAngsuranPerBulan = angsuranPokokPerBulan + bungaPerBulan;
  
  // Total bunga seluruh tenor
  const totalBunga = bungaPerBulan * tenorBulan;
  
  // Total kewajiban
  const totalKewajiban = jumlahPinjaman + totalBunga;

  // Bangun jadwal angsuran
  const angsuranJadwal: AngsuranDetail[] = [];
  const now = new Date();
  
  for (let i = 1; i <= tenorBulan; i++) {
    const jatuhTempo = new Date(now.getFullYear(), now.getMonth() + i, 1); // tgl 1 tiap bulan saat payroll
    const sisaPokok = Math.max(0, jumlahPinjaman - (angsuranPokokPerBulan * i));
    
    angsuranJadwal.push({
      bulanKe: i,
      angsuranPokok: angsuranPokokPerBulan,
      bungaBulanan: bungaPerBulan,
      totalAngsuran: totalAngsuranPerBulan,
      sisaPokok: sisaPokok,
      status: 'belum_bayar',
      tanggalJatuhTempo: jatuhTempo.toISOString().split('T')[0],
    });
  }

  return {
    jumlahPinjaman,
    tenorBulan,
    sukuBungaPersen,
    bungaPerBulan,
    angsuranPokokPerBulan,
    totalAngsuranPerBulan,
    totalBunga,
    totalKewajiban,
    angsuranJadwal,
  };
};

/**
 * Menghitung biaya pelunasan pinjaman yang ada (sisa pokok + sisa bunga sesuai tenor)
 * Sesuai aturan: "untuk membuka pinjaman baru maka harus melunasi total pinjaman sebelumnya beserta bunganya sesuai tenornya"
 */
export const hitungBiayaPelunasanTopUp = (pinjaman: Pinjaman): {
  sisaPokok: number;
  sisaBunga: number;
  totalPelunasan: number;
} => {
  const sisaPokok = pinjaman.sisaPokok;
  const sisaBunga = pinjaman.bungaPerBulan * pinjaman.sisaTenor;
  const totalPelunasan = sisaPokok + sisaBunga;

  return {
    sisaPokok,
    sisaBunga,
    totalPelunasan,
  };
};

/**
 * Validasi apakah anggota dapat mengajukan pinjaman baru:
 * - Aturan: Maksimal 2 pinjaman aktif bersamaan per nama (1 nama 2 pinjaman bersamaan)
 * - Jika sudah ada 2 pinjaman aktif, harus top-up (melunasi salah satu)
 * - Anggota tidak tetap memiliki pembatasan jenis pinjaman
 */
export const validasiKelayakanPinjaman = (
  anggota: Anggota,
  pinjamanAktif: Pinjaman[],
  jenisPinjamanDipilih: JenisPinjaman,
  isTopUp: boolean
): { boleh: boolean; pesan: string } => {
  // Cek hak akses tipe anggota
  if (anggota.tipe === 'tidak_tetap') {
    if (jenisPinjamanDipilih === 'bank_jatim' || jenisPinjamanDipilih === 'barang') {
      return {
        boleh: false,
        pesan: 'Fasilitas Pinjaman Bank Jatim dan Pinjaman Barang hanya tersedia untuk Anggota Tetap Kopkar Lautanama.',
      };
    }
  }

  // Cek batas pinjaman aktif
  if (!isTopUp && pinjamanAktif.length >= 2) {
    return {
      boleh: false,
      pesan: `Anda sudah memiliki ${pinjamanAktif.length} pinjaman aktif (maksimal 2 pinjaman bersamaan per nama). Silakan pilih opsi Top Up untuk melunasi salah satu pinjaman lama terlebih dahulu.`,
    };
  }

  return {
    boleh: true,
    pesan: 'Memenuhi syarat pengajuan.',
  };
};

export const getNamaJenisPinjaman = (jenis: JenisPinjaman): string => {
  switch (jenis) {
    case 'uang':
      return 'Pinjaman Kas Koperasi';
    case 'barang':
      return 'Pinjaman Barang (Elektronik / Kendaraan / dsb)';
    case 'bank_jatim':
      return 'Pinjaman Bank Jatim (Channeling)';
    case 'toko':
      return 'Pinjaman Toko (Pembelian Tempo)';
    default:
      return 'Pinjaman';
  }
};

export const getBadgeLabelKategori = (kategori: KategoriAnggota): string => {
  switch (kategori) {
    case 'pelaksana':
      return 'Anggota Tetap - Pelaksana';
    case 'staff':
      return 'Anggota Tetap - Staff';
    case 'management':
      return 'Anggota Tetap - Management';
    case 'tidak_tetap':
      return 'Anggota Tidak Tetap';
    default:
      return kategori;
  }
};
