import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_ANGGOTA, INITIAL_MUTASI, INITIAL_PINJAMAN, INITIAL_TRANSFER_MANAGEMENT } from '../data/initialData';
import {
  Anggota,
  JenisPinjaman,
  KonfirmasiTransferManagement,
  MutasiSimpanan,
  Pinjaman,
  RekapPotongGajiKolektif,
  RoleUser,
} from '../types/koperasi';
import {
  hitungBiayaPelunasanTopUp,
  hitungSimulasiPinjaman,
} from '../utils/koperasiCalculations';

interface KoperasiContextType {
  role: RoleUser;
  setRole: (role: RoleUser) => void;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  currentMember: Anggota | undefined;
  allMembers: Anggota[];
  allLoans: Pinjaman[];
  allMutations: MutasiSimpanan[];
  allTransfers: KonfirmasiTransferManagement[];
  
  // Member actions
  // Member loan statistics
  memberLoans: Pinjaman[];
  memberMutations: MutasiSimpanan[];
  memberTotalSimpanan: number;
  memberTotalPinjamanDiajukan: number; // Akumulasi total seluruh pinjaman yang diajukan
  memberTotalPinjamanPending: number; // Total pinjaman yang baru diajukan & sedang diproses
  memberTotalPinjamanAktifPlafon: number; // Total plafon awal dari pinjaman yang masih aktif
  memberTotalPinjamanAktif: number; // Sisa pokok pinjaman yang masih aktif berjalan
  memberTotalSisaKewajibanAktif: number; // Total sisa kewajiban pelunasan (pokok + bunga) aktif
  memberPotonganBulanan: {
    simpananWajib: number;
    simpananSukarela: number;
    angsuranPinjaman: number;
    totalPotongan: number;
    detailPinjaman: { kode: string; jenis: JenisPinjaman; angsuran: number; sisaTenor: number }[];
  };

  // Cooperative / Admin overall stats
  adminTotalPinjamanDiajukan: number;
  adminTotalPinjamanAktif: number;
  adminTotalPinjamanPending: number;
  
  // Action methods
  applyLoan: (params: {
    anggotaId: string;
    jenisPinjaman: JenisPinjaman;
    jumlahPinjaman: number;
    tenorBulan: number;
    keterangan: string;
    isTopUp: boolean;
    pinjamanLamaId?: string;
  }) => { success: boolean; message: string; pinjamanId?: string };
  
  approveLoan: (pinjamanId: string) => void;
  rejectLoan: (pinjamanId: string, alasan?: string) => void;
  
  depositSukarela: (anggotaId: string, jumlah: number, keterangan: string) => void;
  withdrawSukarela: (anggotaId: string, jumlah: number, keterangan: string) => { success: boolean; message: string };
  updateSimpananSukarelaRutin: (anggotaId: string, nominalBaru: number) => void;

  submitTransferManagement: (data: Omit<KonfirmasiTransferManagement, 'id' | 'status'>) => void;
  verifyTransferManagement: (id: string, isApproved: boolean, catatan?: string) => void;
  
  getRekapPotongGajiKolektif: (periodeBulan: string) => RekapPotongGajiKolektif[];
  processPayrollBatch: (periodeBulan: string) => void;

  addNewMember: (data: Omit<Anggota, 'id' | 'nomorAnggota' | 'totalSimpananPokok' | 'totalSimpananWajib' | 'totalSimpananSukarela'>) => void;
  resetToDefaultData: () => void;
}

const KoperasiContext = createContext<KoperasiContextType | undefined>(undefined);

const STORAGE_KEY_MEMBERS = 'kopkar_lautanama_members_v1';
const STORAGE_KEY_LOANS = 'kopkar_lautanama_loans_v1';
const STORAGE_KEY_MUTATIONS = 'kopkar_lautanama_mutations_v1';
const STORAGE_KEY_TRANSFERS = 'kopkar_lautanama_transfers_v1';

export const KoperasiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<RoleUser>('anggota');
  const [activeMemberId, setActiveMemberId] = useState<string>('agt-001'); // Default Joko Susilo (Pelaksana)

  const [allMembers, setAllMembers] = useState<Anggota[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_ANGGOTA;
  });

  const [allLoans, setAllLoans] = useState<Pinjaman[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOANS);
    return saved ? JSON.parse(saved) : INITIAL_PINJAMAN;
  });

  const [allMutations, setAllMutations] = useState<MutasiSimpanan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MUTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_MUTASI;
  });

  const [allTransfers, setAllTransfers] = useState<KonfirmasiTransferManagement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSFER_MANAGEMENT;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(allMembers));
  }, [allMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(allLoans));
  }, [allLoans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MUTATIONS, JSON.stringify(allMutations));
  }, [allMutations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(allTransfers));
  }, [allTransfers]);

  const currentMember = allMembers.find((m) => m.id === activeMemberId);

  // Loans belonging to current member (active + history)
  const memberLoans = allLoans.filter((l) => l.anggotaId === activeMemberId);
  const memberMutations = allMutations.filter((m) => m.anggotaId === activeMemberId);

  const memberTotalSimpanan = currentMember
    ? currentMember.totalSimpananPokok + currentMember.totalSimpananWajib + currentMember.totalSimpananSukarela
    : 0;

  // Pinjaman aktif (status disetujui dan sisaPokok > 0)
  const activeLoans = memberLoans.filter((l) => l.status === 'disetujui' && l.sisaPokok > 0);
  const pendingLoans = memberLoans.filter((l) => l.status === 'pending');

  // Akumulasi total nominal yang diajukan oleh anggota (seluruh riwayat)
  const memberTotalPinjamanDiajukan = memberLoans.reduce((acc, curr) => acc + curr.jumlahPinjaman, 0);

  // Total nominal pinjaman yang sedang diajukan dan masih pending
  const memberTotalPinjamanPending = pendingLoans.reduce((acc, curr) => acc + curr.jumlahPinjaman, 0);

  // Plafon awal pinjaman yang saat ini masih aktif
  const memberTotalPinjamanAktifPlafon = activeLoans.reduce((acc, curr) => acc + curr.jumlahPinjaman, 0);

  // Sisa pokok pinjaman yang masih aktif (belum lunas)
  const memberTotalPinjamanAktif = activeLoans.reduce((acc, curr) => acc + curr.sisaPokok, 0);

  // Total sisa kewajiban pelunasan (sisa pokok + sisa bunga tenor)
  const memberTotalSisaKewajibanAktif = activeLoans.reduce((acc, curr) => acc + curr.sisaTotalPelunasan, 0);

  // Total pinjaman koperasi (Admin scope)
  const adminTotalPinjamanDiajukan = allLoans.reduce((acc, curr) => acc + curr.jumlahPinjaman, 0);
  const adminTotalPinjamanAktif = allLoans
    .filter((l) => l.status === 'disetujui' && l.sisaPokok > 0)
    .reduce((acc, curr) => acc + curr.sisaPokok, 0);
  const adminTotalPinjamanPending = allLoans
    .filter((l) => l.status === 'pending')
    .reduce((acc, curr) => acc + curr.jumlahPinjaman, 0);

  // Potongan bulanan real-time: Simpanan Wajib + Simpanan Sukarela + Total Angsuran dari semua pinjaman aktif
  const memberPotonganBulanan = React.useMemo(() => {
    if (!currentMember) {
      return {
        simpananWajib: 0,
        simpananSukarela: 0,
        angsuranPinjaman: 0,
        totalPotongan: 0,
        detailPinjaman: [],
      };
    }

    const sw = currentMember.simpananWajibPerBulan;
    const ss = currentMember.simpananSukarelaPerBulan;

    const detail = activeLoans.map((l) => ({
      kode: l.kodePinjaman,
      jenis: l.jenisPinjaman,
      angsuran: l.totalAngsuranPerBulan,
      sisaTenor: l.sisaTenor,
    }));

    const totalAngsuran = detail.reduce((acc, d) => acc + d.angsuran, 0);
    const total = sw + ss + totalAngsuran;

    return {
      simpananWajib: sw,
      simpananSukarela: ss,
      angsuranPinjaman: totalAngsuran,
      totalPotongan: total,
      detailPinjaman: detail,
    };
  }, [currentMember, activeLoans]);

  // Apply loan with Top Up support and max 2 active loans validation
  const applyLoan = ({
    anggotaId,
    jenisPinjaman,
    jumlahPinjaman,
    tenorBulan,
    keterangan,
    isTopUp,
    pinjamanLamaId,
  }: {
    anggotaId: string;
    jenisPinjaman: JenisPinjaman;
    jumlahPinjaman: number;
    tenorBulan: number;
    keterangan: string;
    isTopUp: boolean;
    pinjamanLamaId?: string;
  }) => {
    const member = allMembers.find((m) => m.id === anggotaId);
    if (!member) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const currentActiveLoans = allLoans.filter(
      (l) => l.anggotaId === anggotaId && l.status === 'disetujui' && l.sisaPokok > 0
    );

    // Validasi aturan: maksimal 2 pinjaman bersamaan
    if (!isTopUp && currentActiveLoans.length >= 2) {
      return {
        success: false,
        message: 'Anda telah mencapai batas maksimal 2 pinjaman aktif bersamaan. Silakan pilih opsi Top Up untuk melunasi salah satu pinjaman sebelumnya.',
      };
    }

    // Hitung kalkulasi pinjaman baru sesuai rumus (1% untuk tenor 1 bln, 1.5% untuk tenor > 1 bln)
    const kalkulasi = hitungSimulasiPinjaman(jumlahPinjaman, tenorBulan);

    let biayaPelunasanLama = 0;
    if (isTopUp && pinjamanLamaId) {
      const pinjamanLama = allLoans.find((l) => l.id === pinjamanLamaId);
      if (pinjamanLama) {
        const topUpMath = hitungBiayaPelunasanTopUp(pinjamanLama);
        biayaPelunasanLama = topUpMath.totalPelunasan;
        
        if (jumlahPinjaman <= biayaPelunasanLama) {
          return {
            success: false,
            message: `Jumlah pinjaman baru (${jumlahPinjaman}) harus lebih besar dari total pelunasan pinjaman lama (sisa pokok + bunga: ${biayaPelunasanLama}).`,
          };
        }
      }
    }

    const cleanReceived = jumlahPinjaman - biayaPelunasanLama;
    const newCode = `PJ-${jenisPinjaman.toUpperCase()}-${new Date().getFullYear()}-${String(
      allLoans.length + 1
    ).padStart(3, '0')}`;

    const newLoan: Pinjaman = {
      id: `pjm-${Date.now()}`,
      kodePinjaman: newCode,
      anggotaId: member.id,
      namaAnggota: member.nama,
      kategoriAnggota: member.kategori,
      jenisPinjaman,
      keteranganBarang: keterangan,
      jumlahPinjaman,
      tenorBulan,
      sukuBungaPersen: kalkulasi.sukuBungaPersen,
      bungaPerBulan: kalkulasi.bungaPerBulan,
      totalBunga: kalkulasi.totalBunga,
      angsuranPokokPerBulan: kalkulasi.angsuranPokokPerBulan,
      totalAngsuranPerBulan: kalkulasi.totalAngsuranPerBulan,
      totalKewajiban: kalkulasi.totalKewajiban,
      sisaPokok: jumlahPinjaman,
      sisaBunga: kalkulasi.totalBunga,
      sisaTotalPelunasan: kalkulasi.totalKewajiban,
      tenorTerbayar: 0,
      sisaTenor: tenorBulan,
      status: 'pending', // Menunggu persetujuan pengurus
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      isTopUp,
      pinjamanLamaId: isTopUp ? pinjamanLamaId : undefined,
      biayaPelunasanLama: isTopUp ? biayaPelunasanLama : 0,
      jumlahDiterimaBersih: cleanReceived,
      metodePembayaran: member.metodePembayaran,
      angsuranJadwal: kalkulasi.angsuranJadwal,
    };

    setAllLoans((prev) => [newLoan, ...prev]);

    return {
      success: true,
      message: isTopUp
        ? `Pengajuan Top Up berhasil dikirim! Menunggu verifikasi pengurus. Sisa pinjaman lama sebesar Rp ${biayaPelunasanLama.toLocaleString('id-ID')} akan dilunasi otomatis saat pencairan.`
        : 'Pengajuan pinjaman baru berhasil dikirim dan menunggu verifikasi pengurus koperasi.',
      pinjamanId: newLoan.id,
    };
  };

  // Approve loan by Admin
  const approveLoan = (pinjamanId: string) => {
    const loan = allLoans.find((l) => l.id === pinjamanId);
    if (!loan) return;

    // Jika ini adalah top up, update status pinjaman lama menjadi 'top_up_ditutup' atau 'lunas'
    let updatedLoans = [...allLoans];
    if (loan.isTopUp && loan.pinjamanLamaId) {
      updatedLoans = updatedLoans.map((l) => {
        if (l.id === loan.pinjamanLamaId) {
          return {
            ...l,
            status: 'top_up_ditutup' as const,
            sisaPokok: 0,
            sisaBunga: 0,
            sisaTotalPelunasan: 0,
            sisaTenor: 0,
          };
        }
        return l;
      });
    }

    updatedLoans = updatedLoans.map((l) => {
      if (l.id === pinjamanId) {
        return {
          ...l,
          status: 'disetujui' as const,
          tanggalPencairan: new Date().toISOString().split('T')[0],
        };
      }
      return l;
    });

    setAllLoans(updatedLoans);
  };

  // Reject loan
  const rejectLoan = (pinjamanId: string) => {
    setAllLoans((prev) =>
      prev.map((l) => (l.id === pinjamanId ? { ...l, status: 'ditolak' as const } : l))
    );
  };

  // Deposit Simpanan Sukarela
  const depositSukarela = (anggotaId: string, jumlah: number, keterangan: string) => {
    const member = allMembers.find((m) => m.id === anggotaId);
    if (!member || jumlah <= 0) return;

    const newMutation: MutasiSimpanan = {
      id: `mut-${Date.now()}`,
      anggotaId: member.id,
      namaAnggota: member.nama,
      tanggal: new Date().toISOString().split('T')[0],
      jenisSimpanan: 'sukarela',
      tipeMutasi: 'setor',
      jumlah,
      keterangan: keterangan || 'Setor Simpanan Sukarela Mandiri',
      metode: member.metodePembayaran,
      statusVerifikasi: 'terverifikasi',
    };

    setAllMutations((prev) => [newMutation, ...prev]);
    setAllMembers((prev) =>
      prev.map((m) =>
        m.id === anggotaId
          ? { ...m, totalSimpananSukarela: m.totalSimpananSukarela + jumlah }
          : m
      )
    );
  };

  // Withdraw Simpanan Sukarela
  const withdrawSukarela = (anggotaId: string, jumlah: number, keterangan: string) => {
    const member = allMembers.find((m) => m.id === anggotaId);
    if (!member) return { success: false, message: 'Anggota tidak ditemukan.' };

    if (member.totalSimpananSukarela < jumlah) {
      return {
        success: false,
        message: `Saldo Simpanan Sukarela tidak mencukupi. Saldo saat ini: Rp ${member.totalSimpananSukarela.toLocaleString('id-ID')}`,
      };
    }

    const newMutation: MutasiSimpanan = {
      id: `mut-${Date.now()}`,
      anggotaId: member.id,
      namaAnggota: member.nama,
      tanggal: new Date().toISOString().split('T')[0],
      jenisSimpanan: 'sukarela',
      tipeMutasi: 'tarik',
      jumlah,
      keterangan: keterangan || 'Penarikan Simpanan Sukarela',
      metode: member.metodePembayaran,
      statusVerifikasi: 'terverifikasi',
    };

    setAllMutations((prev) => [newMutation, ...prev]);
    setAllMembers((prev) =>
      prev.map((m) =>
        m.id === anggotaId
          ? { ...m, totalSimpananSukarela: m.totalSimpananSukarela - jumlah }
          : m
      )
    );

    return { success: true, message: 'Penarikan simpanan sukarela berhasil diproses.' };
  };

  const updateSimpananSukarelaRutin = (anggotaId: string, nominalBaru: number) => {
    setAllMembers((prev) =>
      prev.map((m) =>
        m.id === anggotaId ? { ...m, simpananSukarelaPerBulan: Math.max(0, nominalBaru) } : m
      )
    );
  };

  // Submit transfer manual for management members
  const submitTransferManagement = (data: Omit<KonfirmasiTransferManagement, 'id' | 'status'>) => {
    const newTransfer: KonfirmasiTransferManagement = {
      ...data,
      id: `trf-${Date.now()}`,
      status: 'pending',
    };
    setAllTransfers((prev) => [newTransfer, ...prev]);
  };

  // Verify transfer manual by pengurus
  const verifyTransferManagement = (id: string, isApproved: boolean, catatan?: string) => {
    const transfer = allTransfers.find((t) => t.id === id);
    if (!transfer) return;

    setAllTransfers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: isApproved ? 'terverifikasi' : 'ditolak', catatanPengurus: catatan }
          : t
      )
    );

    if (isApproved) {
      // Tambahkan mutasi simpanan wajib & sukarela
      if (transfer.rincian.simpananWajib > 0) {
        setAllMutations((prev) => [
          {
            id: `mut-${Date.now()}-sw`,
            anggotaId: transfer.anggotaId,
            namaAnggota: transfer.namaAnggota,
            tanggal: transfer.tanggalTransfer,
            jenisSimpanan: 'wajib',
            tipeMutasi: 'setor',
            jumlah: transfer.rincian.simpananWajib,
            keterangan: `Simpanan Wajib Transfer Manual Periode ${transfer.periodeBulan}`,
            metode: 'transfer_manual',
            statusVerifikasi: 'terverifikasi',
          },
          ...prev,
        ]);

        setAllMembers((prev) =>
          prev.map((m) =>
            m.id === transfer.anggotaId
              ? { ...m, totalSimpananWajib: m.totalSimpananWajib + transfer.rincian.simpananWajib }
              : m
          )
        );
      }

      if (transfer.rincian.simpananSukarela > 0) {
        setAllMutations((prev) => [
          {
            id: `mut-${Date.now()}-ss`,
            anggotaId: transfer.anggotaId,
            namaAnggota: transfer.namaAnggota,
            tanggal: transfer.tanggalTransfer,
            jenisSimpanan: 'sukarela',
            tipeMutasi: 'setor',
            jumlah: transfer.rincian.simpananSukarela,
            keterangan: `Simpanan Sukarela Transfer Manual Periode ${transfer.periodeBulan}`,
            metode: 'transfer_manual',
            statusVerifikasi: 'terverifikasi',
          },
          ...prev,
        ]);

        setAllMembers((prev) =>
          prev.map((m) =>
            m.id === transfer.anggotaId
              ? {
                  ...m,
                  totalSimpananSukarela:
                    m.totalSimpananSukarela + transfer.rincian.simpananSukarela,
                }
              : m
          )
        );
      }

      // Potong tenor & pokok pinjaman aktif anggota jika ada
      if (transfer.rincian.angsuranPinjaman > 0) {
        setAllLoans((prev) =>
          prev.map((l) => {
            if (l.anggotaId === transfer.anggotaId && l.status === 'disetujui' && l.sisaTenor > 0) {
              const newTenorTerbayar = l.tenorTerbayar + 1;
              const newSisaTenor = Math.max(0, l.tenorBulan - newTenorTerbayar);
              const newSisaPokok = Math.max(0, l.sisaPokok - l.angsuranPokokPerBulan);
              const newSisaBunga = l.bungaPerBulan * newSisaTenor;
              return {
                ...l,
                tenorTerbayar: newTenorTerbayar,
                sisaTenor: newSisaTenor,
                sisaPokok: newSisaPokok,
                sisaBunga: newSisaBunga,
                sisaTotalPelunasan: newSisaPokok + newSisaBunga,
                status: newSisaTenor === 0 ? 'lunas' : l.status,
              };
            }
            return l;
          })
        );
      }
    }
  };

  // Generate Rekap Potong Gaji Kolektif untuk HRD (Hanya untuk Staff & Pelaksana)
  const getRekapPotongGajiKolektif = (periodeBulan: string): RekapPotongGajiKolektif[] => {
    // Sesuai aturan: sistem pembayaran staf dan pelaksana melalui potong gaji lewat perusahaan
    const payrollMembers = allMembers.filter(
      (m) => m.metodePembayaran === 'potong_gaji' && (m.kategori === 'pelaksana' || m.kategori === 'staff')
    );

    return payrollMembers.map((member) => {
      const activeMemberLoans = allLoans.filter(
        (l) => l.anggotaId === member.id && l.status === 'disetujui' && l.sisaPokok > 0
      );

      const p1 = activeMemberLoans[0];
      const p2 = activeMemberLoans[1];

      const angsuranP1 = p1 ? p1.totalAngsuranPerBulan : 0;
      const angsuranP2 = p2 ? p2.totalAngsuranPerBulan : 0;

      const totalPotongan =
        member.simpananWajibPerBulan +
        member.simpananSukarelaPerBulan +
        angsuranP1 +
        angsuranP2;

      return {
        periodeBulan,
        anggotaId: member.id,
        namaAnggota: member.nama,
        nik: member.nik,
        departemen: member.departemen,
        kategori: member.kategori,
        simpananWajib: member.simpananWajibPerBulan,
        simpananSukarela: member.simpananSukarelaPerBulan,
        angsuranPinjaman1: angsuranP1,
        keteranganPinjaman1: p1 ? `${p1.kodePinjaman} (${p1.jenisPinjaman})` : '-',
        angsuranPinjaman2: angsuranP2,
        keteranganPinjaman2: p2 ? `${p2.kodePinjaman} (${p2.jenisPinjaman})` : '-',
        totalPotonganGaji: totalPotongan,
        statusPayroll: 'dibayar_kolektif',
      };
    });
  };

  // Process collective payroll batch deduction (simulates monthly deduction by company)
  const processPayrollBatch = (periodeBulan: string) => {
    const rekap = getRekapPotongGajiKolektif(periodeBulan);
    const today = new Date().toISOString().split('T')[0];

    // Tambah mutasi simpanan untuk semua anggota potong gaji
    const newMutations: MutasiSimpanan[] = [];
    rekap.forEach((item) => {
      if (item.simpananWajib > 0) {
        newMutations.push({
          id: `mut-${Date.now()}-${item.anggotaId}-sw`,
          anggotaId: item.anggotaId,
          namaAnggota: item.namaAnggota,
          tanggal: today,
          jenisSimpanan: 'wajib',
          tipeMutasi: 'setor',
          jumlah: item.simpananWajib,
          keterangan: `Simpanan Wajib Payroll Periode ${periodeBulan}`,
          metode: 'potong_gaji',
          statusVerifikasi: 'terverifikasi',
        });
      }
      if (item.simpananSukarela > 0) {
        newMutations.push({
          id: `mut-${Date.now()}-${item.anggotaId}-ss`,
          anggotaId: item.anggotaId,
          namaAnggota: item.namaAnggota,
          tanggal: today,
          jenisSimpanan: 'sukarela',
          tipeMutasi: 'setor',
          jumlah: item.simpananSukarela,
          keterangan: `Simpanan Sukarela Payroll Periode ${periodeBulan}`,
          metode: 'potong_gaji',
          statusVerifikasi: 'terverifikasi',
        });
      }
    });

    setAllMutations((prev) => [...newMutations, ...prev]);

    // Update akumulasi simpanan anggota
    setAllMembers((prev) =>
      prev.map((m) => {
        const item = rekap.find((r) => r.anggotaId === m.id);
        if (!item) return m;
        return {
          ...m,
          totalSimpananWajib: m.totalSimpananWajib + item.simpananWajib,
          totalSimpananSukarela: m.totalSimpananSukarela + item.simpananSukarela,
        };
      })
    );

    // Update status tenor pinjaman potong gaji
    setAllLoans((prev) =>
      prev.map((loan) => {
        const item = rekap.find((r) => r.anggotaId === loan.anggotaId);
        if (item && loan.status === 'disetujui' && loan.sisaTenor > 0) {
          const newTenorTerbayar = loan.tenorTerbayar + 1;
          const newSisaTenor = Math.max(0, loan.tenorBulan - newTenorTerbayar);
          const newSisaPokok = Math.max(0, loan.sisaPokok - loan.angsuranPokokPerBulan);
          const newSisaBunga = loan.bungaPerBulan * newSisaTenor;
          return {
            ...loan,
            tenorTerbayar: newTenorTerbayar,
            sisaTenor: newSisaTenor,
            sisaPokok: newSisaPokok,
            sisaBunga: newSisaBunga,
            sisaTotalPelunasan: newSisaPokok + newSisaBunga,
            status: newSisaTenor === 0 ? 'lunas' : loan.status,
          };
        }
        return loan;
      })
    );
  };

  const addNewMember = (
    data: Omit<
      Anggota,
      'id' | 'nomorAnggota' | 'totalSimpananPokok' | 'totalSimpananWajib' | 'totalSimpananSukarela'
    >
  ) => {
    const count = allMembers.length + 1;
    const year = new Date().getFullYear();
    const nomorAnggota = `KOP-${year}-${String(count).padStart(4, '0')}`;
    const newMember: Anggota = {
      ...data,
      id: `agt-${Date.now()}`,
      nomorAnggota,
      totalSimpananPokok: data.simpananPokok,
      totalSimpananWajib: 0,
      totalSimpananSukarela: 0,
    };

    setAllMembers((prev) => [...prev, newMember]);
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY_MEMBERS);
    localStorage.removeItem(STORAGE_KEY_LOANS);
    localStorage.removeItem(STORAGE_KEY_MUTATIONS);
    localStorage.removeItem(STORAGE_KEY_TRANSFERS);
    setAllMembers(INITIAL_ANGGOTA);
    setAllLoans(INITIAL_PINJAMAN);
    setAllMutations(INITIAL_MUTASI);
    setAllTransfers(INITIAL_TRANSFER_MANAGEMENT);
    setActiveMemberId('agt-001');
    setRole('anggota');
  };

  return (
    <KoperasiContext.Provider
      value={{
        role,
        setRole,
        activeMemberId,
        setActiveMemberId,
        currentMember,
        allMembers,
        allLoans,
        allMutations,
        allTransfers,
        memberLoans,
        memberMutations,
        memberTotalSimpanan,
        memberTotalPinjamanDiajukan,
        memberTotalPinjamanPending,
        memberTotalPinjamanAktifPlafon,
        memberTotalPinjamanAktif,
        memberTotalSisaKewajibanAktif,
        memberPotonganBulanan,
        adminTotalPinjamanDiajukan,
        adminTotalPinjamanAktif,
        adminTotalPinjamanPending,
        applyLoan,
        approveLoan,
        rejectLoan,
        depositSukarela,
        withdrawSukarela,
        updateSimpananSukarelaRutin,
        submitTransferManagement,
        verifyTransferManagement,
        getRekapPotongGajiKolektif,
        processPayrollBatch,
        addNewMember,
        resetToDefaultData,
      }}
    >
      {children}
    </KoperasiContext.Provider>
  );
};

export const useKoperasi = () => {
  const context = useContext(KoperasiContext);
  if (!context) {
    throw new Error('useKoperasi must be used within a KoperasiProvider');
  }
  return context;
};
