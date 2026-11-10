export type AttendanceStatus = 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa';

export type UserRole = 'guru' | 'orang_tua';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  avatarUrl?: string;
  qrCode: string; // usually NISN or unique ID
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  semester: '1 (Ganjil)' | '2 (Genap)';
  logoUrl?: string;
  lateCutoffTime: string; // e.g. "07:15"
}

export interface TeacherProfile {
  id: string;
  name: string;
  nip: string;
  nuptk?: string;
  role: string; // e.g. "Guru Kelas 5A"
  assignedClass: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  signatureTitle?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss or HH:mm
  checkOutTime?: string; // HH:mm
  status: AttendanceStatus;
  notes?: string;
  recordedBy?: string;
  method?: 'barcode' | 'manual' | 'izin_ortu';
}

export interface MonthlyStudentSummary {
  student: Student;
  dailyStatus: Record<number, AttendanceStatus | null>; // day 1..31 -> status
  hadir: number;
  terlambat: number;
  sakit: number;
  izin: number;
  alpa: number;
  totalHariEfektif: number;
  attendancePercentage: number;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  type: 'sakit' | 'izin';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  parentName: string;
  parentPhone: string;
  createdAt: string;
}
