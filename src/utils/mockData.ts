import { SchoolProfile, TeacherProfile, Student, AttendanceRecord, LeaveRequest } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'SD Negeri Merdeka Belajar 01',
  npsn: '20104829',
  address: 'Jl. Pendidikan Karakter No. 45, Kebon Sirih',
  district: 'Menteng',
  city: 'Kota Jakarta Pusat',
  province: 'DKI Jakarta',
  postalCode: '10340',
  phone: '(021) 3920182',
  email: 'sdn.merdekabelajar01@kemdikbud.go.id',
  website: 'https://sdnmerdekabelajar01.sch.id',
  principalName: 'Dra. Hj. Siti Rahmah, M.Pd.',
  principalNip: '19680512 199303 2 004',
  academicYear: '2026/2027',
  semester: '1 (Ganjil)',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
  lateCutoffTime: '07:15',
};

export const initialTeacherProfile: TeacherProfile = {
  id: 'teacher-adam',
  name: 'Adam Baharudin, S.Pd.',
  nip: '19880415 201101 1 003',
  nuptk: '4562766667200002',
  role: 'Guru Kelas & Wali Kelas 5A',
  assignedClass: 'Kelas 5A',
  phone: '0812-8899-7721',
  email: 'adambaharudin80@guru.sd.belajar.id',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  signatureTitle: 'Guru Kelas 5A',
};

export const initialStudents: Student[] = [
  {
    id: 'std-01',
    nisn: '0158492001',
    nis: '5011',
    name: 'Ahmad Rizky Pratama',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-02-14',
    parentName: 'Bambang Pratama',
    parentPhone: '0812-3456-7801',
    parentEmail: 'bambang.pratama@gmail.com',
    address: 'Jl. Cemara No. 14, Menteng',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492001',
  },
  {
    id: 'std-02',
    nisn: '0158492002',
    nis: '5012',
    name: 'Aisyah Putri Azzahra',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-05-19',
    parentName: 'Rudi Hartono & Sri Wahyuni',
    parentPhone: '0812-3456-7802',
    parentEmail: 'sri.wahyuni@gmail.com',
    address: 'Jl. Danau Toba No. 8',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492002',
  },
  {
    id: 'std-03',
    nisn: '0158492003',
    nis: '5013',
    name: 'Bima Satria Wijaya',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-01-22',
    parentName: 'Hendro Wijaya',
    parentPhone: '0812-3456-7803',
    parentEmail: 'hendro.wijaya@gmail.com',
    address: 'Jl. Raden Saleh No. 25',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492003',
  },
  {
    id: 'std-04',
    nisn: '0158492004',
    nis: '5014',
    name: 'Cantika Dewi Larasati',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-07-30',
    parentName: 'Ir. Joko Susanto',
    parentPhone: '0812-3456-7804',
    parentEmail: 'joko.susanto@gmail.com',
    address: 'Jl. Cikini Raya No. 42',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492004',
  },
  {
    id: 'std-05',
    nisn: '0158492005',
    nis: '5015',
    name: 'Daffa Al-Ghifari',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-03-10',
    parentName: 'Drs. Herman Al-Ghifari',
    parentPhone: '0812-3456-7805',
    parentEmail: 'herman.ghifari@gmail.com',
    address: 'Jl. Pegangsaan Timur No. 10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492005',
  },
  {
    id: 'std-06',
    nisn: '0158492006',
    nis: '5016',
    name: 'Fathia Nur Ramadhani',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-09-15',
    parentName: 'Agus Salim',
    parentPhone: '0812-3456-7806',
    parentEmail: 'agus.salim@gmail.com',
    address: 'Jl. Kramat Pulo No. 3',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492006',
  },
  {
    id: 'std-07',
    nisn: '0158492007',
    nis: '5017',
    name: 'Gilang Ramadhan',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-06-25',
    parentName: 'Kurniawan Ramadhan',
    parentPhone: '0812-3456-7807',
    parentEmail: 'kurniawan@gmail.com',
    address: 'Jl. Johar Baru No. 18',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492007',
  },
  {
    id: 'std-08',
    nisn: '0158492008',
    nis: '5018',
    name: 'Hafizha Salma Wardani',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-11-04',
    parentName: 'Dr. Tri Wardana, Sp.A',
    parentPhone: '0812-3456-7808',
    parentEmail: 'tri.wardana@gmail.com',
    address: 'Jl. Salemba Tengah No. 22',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492008',
  },
  {
    id: 'std-09',
    nisn: '0158492009',
    nis: '5019',
    name: 'Ilyas Maulana',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-04-05',
    parentName: 'Maulana Malik',
    parentPhone: '0812-3456-7809',
    parentEmail: 'maulana.malik@gmail.com',
    address: 'Jl. Percetakan Negara No. 9',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492009',
  },
  {
    id: 'std-10',
    nisn: '0158492010',
    nis: '5020',
    name: 'Khadijah Nayla Putri',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-12-18',
    parentName: 'Farid Hidayat',
    parentPhone: '0812-3456-7810',
    parentEmail: 'farid.hidayat@gmail.com',
    address: 'Jl. Rawasari Selatan No. 15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qrCode: '0158492010',
  },
];

// Helper to generate realistic historical records for November 2026
export function generateInitialAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = '2026-11-09';

  // Seed dates: 2026-11-02 (Mon), 2026-11-03 (Tue), 2026-11-04 (Wed), 2026-11-05 (Thu), 2026-11-06 (Fri)
  const pastDates = [
    '2026-11-02',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
  ];

  pastDates.forEach((date, dateIdx) => {
    initialStudents.forEach((std, stdIdx) => {
      // Deterministic mix of status
      let status: 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa' = 'hadir';
      let checkIn = '06:50';

      if ((stdIdx + dateIdx) % 11 === 0) {
        status = 'terlambat';
        checkIn = '07:22';
      } else if (stdIdx === 3 && dateIdx === 1) {
        status = 'sakit';
        checkIn = '';
      } else if (stdIdx === 7 && dateIdx === 3) {
        status = 'izin';
        checkIn = '';
      }

      records.push({
        id: `rec-hist-${date}-${std.id}`,
        studentId: std.id,
        date,
        checkInTime: checkIn,
        checkOutTime: status === 'hadir' || status === 'terlambat' ? '12:30' : undefined,
        status,
        method: 'barcode',
        notes: status === 'sakit' ? 'Demam flu' : status === 'izin' ? 'Acara keluarga' : '',
      });
    });
  });

  // Seed Today's Attendance (2026-11-09) with 7 already checked in, 1 late, 1 sick, 1 not yet checked in
  const todayStatuses: { id: string; status: 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa'; time: string; method: 'barcode' | 'manual'; notes?: string }[] = [
    { id: 'std-01', status: 'hadir', time: '06:42', method: 'barcode' },
    { id: 'std-02', status: 'hadir', time: '06:48', method: 'barcode' },
    { id: 'std-03', status: 'hadir', time: '06:55', method: 'barcode' },
    { id: 'std-04', status: 'terlambat', time: '07:23', method: 'barcode', notes: 'Terjebak macet' },
    { id: 'std-05', status: 'hadir', time: '07:02', method: 'barcode' },
    { id: 'std-06', status: 'hadir', time: '07:05', method: 'barcode' },
    { id: 'std-07', status: 'sakit', time: '', method: 'manual', notes: 'Surat dokter terlampir' },
    { id: 'std-08', status: 'hadir', time: '06:50', method: 'barcode' },
    { id: 'std-09', status: 'hadir', time: '07:10', method: 'barcode' },
    // std-10 (Khadijah) is belum hadir yet, ready to be scanned!
  ];

  todayStatuses.forEach((item) => {
    records.push({
      id: `rec-${today}-${item.id}`,
      studentId: item.id,
      date: today,
      checkInTime: item.time,
      status: item.status,
      method: item.method,
      notes: item.notes || '',
    });
  });

  return records;
}

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    studentId: 'std-07',
    type: 'sakit',
    startDate: '2026-11-09',
    endDate: '2026-11-10',
    reason: 'Ananda Gilang sedang sakit demam berdarah dan perlu istirahat dokter.',
    status: 'disetujui',
    parentName: 'Kurniawan Ramadhan',
    parentPhone: '0812-3456-7807',
    createdAt: '2026-11-09 06:15',
  },
  {
    id: 'leave-2',
    studentId: 'std-04',
    type: 'izin',
    startDate: '2026-11-12',
    endDate: '2026-11-12',
    reason: 'Izin menghadiri pernikahan kakak kandung di luar kota.',
    status: 'menunggu',
    parentName: 'Ir. Joko Susanto',
    parentPhone: '0812-3456-7804',
    createdAt: '2026-11-09 07:30',
  },
];
