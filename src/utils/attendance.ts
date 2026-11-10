import { Student, AttendanceRecord, AttendanceStatus, MonthlyStudentSummary } from '../types';

/**
 * Compare check-in time against late cut-off time (e.g. 07:15).
 * If check-in time is after cut-off, status is 'terlambat'.
 */
export function determineStatusByTime(
  checkInTime: string,
  cutoffTime: string = '07:15'
): 'hadir' | 'terlambat' {
  if (!checkInTime) return 'hadir';

  const [inHour, inMin] = checkInTime.split(':').map(Number);
  const [cutHour, cutMin] = cutoffTime.split(':').map(Number);

  if (isNaN(inHour) || isNaN(inMin) || isNaN(cutHour) || isNaN(cutMin)) {
    return 'hadir';
  }

  const inMinutes = inHour * 60 + inMin;
  const cutMinutes = cutHour * 60 + cutMin;

  return inMinutes > cutMinutes ? 'terlambat' : 'hadir';
}

/**
 * Match a scanned barcode or QR payload with students.
 * Supports:
 * - Direct NISN match (e.g., "0123456789")
 * - Direct NIS match (e.g., "5021")
 * - Direct ID match (e.g., "std-1")
 * - Formatted JSON or URL string (e.g., "NISN:0123456789" or "https://school.id/qr/0123456789")
 */
export function parseBarcodePayload(
  rawPayload: string,
  students: Student[]
): { found: boolean; student?: Student; cleanedCode: string } {
  if (!rawPayload || !rawPayload.trim()) {
    return { found: false, cleanedCode: '' };
  }

  const cleaned = rawPayload.trim();

  // Try extracting if prefix like NISN: or STD: exists
  let targetCode = cleaned;
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    targetCode = parts[parts.length - 1].trim();
  } else if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    targetCode = parts[parts.length - 1].trim();
  }

  // Match against NISN, NIS, ID, or qrCode field
  const student = students.find(
    (s) =>
      s.nisn.toLowerCase() === targetCode.toLowerCase() ||
      s.nis.toLowerCase() === targetCode.toLowerCase() ||
      s.id.toLowerCase() === targetCode.toLowerCase() ||
      s.qrCode.toLowerCase() === targetCode.toLowerCase() ||
      s.name.toLowerCase() === cleaned.toLowerCase()
  );

  return {
    found: Boolean(student),
    student,
    cleanedCode: targetCode,
  };
}

/**
 * Calculates a single student's monthly breakdown and attendance percentage.
 * month is 1-indexed (1 = Jan, 12 = Dec).
 */
export function calculateStudentMonthlySummary(
  student: Student,
  records: AttendanceRecord[],
  year: number,
  month: number
): MonthlyStudentSummary {
  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyStatus: Record<number, AttendanceStatus | null> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    dailyStatus[day] = null;
  }

  // Filter records for this student and this month/year
  const monthStr = String(month).padStart(2, '0');
  const targetPrefix = `${year}-${monthStr}-`;

  const studentRecords = records.filter(
    (r) => r.studentId === student.id && r.date.startsWith(targetPrefix)
  );

  let hadir = 0;
  let terlambat = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  studentRecords.forEach((record) => {
    const day = parseInt(record.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailyStatus[day] = record.status;

      switch (record.status) {
        case 'hadir':
          hadir++;
          break;
        case 'terlambat':
          terlambat++;
          break;
        case 'sakit':
          sakit++;
          break;
        case 'izin':
          izin++;
          break;
        case 'alpa':
          alpa++;
          break;
      }
    }
  });

  // Effective days where attendance is expected (excluding future days in current month or weekends)
  let effectiveDaysCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    // Elementary schools in Indonesia typically have school Mon-Sat (or Mon-Fri). Let's count Mon-Fri as standard.
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      effectiveDaysCount++;
    }
  }

  // Count attendance: Hadir and Terlambat are counted as attending
  const totalAttended = hadir + terlambat;
  // If no recorded days, calculate based on total recorded entries or standard effective days
  const activeDays = hadir + terlambat + sakit + izin + alpa;
  const denominator = activeDays > 0 ? activeDays : effectiveDaysCount;
  const percentage = denominator > 0 ? Math.round((totalAttended / denominator) * 100) : 0;

  return {
    student,
    dailyStatus,
    hadir,
    terlambat,
    sakit,
    izin,
    alpa,
    totalHariEfektif: activeDays,
    attendancePercentage: percentage,
  };
}

/**
 * Calculates overall class daily stats for a specific date (YYYY-MM-DD).
 */
export function calculateClassOverallStats(
  students: Student[],
  records: AttendanceRecord[],
  dateStr: string
) {
  const dayRecords = records.filter((r) => r.date === dateStr);
  const recordedStudentIds = new Set(dayRecords.map((r) => r.studentId));

  let hadir = 0;
  let terlambat = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  dayRecords.forEach((r) => {
    if (r.status === 'hadir') hadir++;
    else if (r.status === 'terlambat') terlambat++;
    else if (r.status === 'sakit') sakit++;
    else if (r.status === 'izin') izin++;
    else if (r.status === 'alpa') alpa++;
  });

  const totalStudents = students.length;
  const belumHadir = Math.max(0, totalStudents - recordedStudentIds.size);
  const presentCount = hadir + terlambat;
  const attendancePercentage =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return {
    totalStudents,
    hadir,
    terlambat,
    sakit,
    izin,
    alpa,
    belumHadir,
    attendancePercentage,
  };
}

/**
 * Formats YYYY-MM-DD to Indonesian human date e.g. "Senin, 10 November 2026".
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate formatted WhatsApp notification message to parents for daily attendance check-in.
 */
export function formatWhatsAppMessage(
  student: Student,
  record: AttendanceRecord,
  schoolName: string
): string {
  const statusLabels: Record<AttendanceStatus, string> = {
    hadir: '✅ HADIR (Tepat Waktu)',
    terlambat: '⏰ TERLAMBAT',
    sakit: '🤒 SAKIT',
    izin: '✉️ IZIN',
    alpa: '❌ ALPA (Tanpa Keterangan)',
  };

  const statusText = statusLabels[record.status] || record.status;
  const timeInfo = record.checkInTime ? `Pukul: ${record.checkInTime} WIB` : '';
  const noteInfo = record.notes ? `\nCatatan: ${record.notes}` : '';

  return `*PEMBERITAHUAN KEHADIRAN SISWA*
${schoolName}
----------------------------------------
Yth. Bapak/Ibu Wali dari:
*${student.name}*
Kelas: ${student.className}
NISN: ${student.nisn}

Status: *${statusText}*
Tanggal: ${formatIndonesianDate(record.date)}
${timeInfo}${noteInfo}

Terima kasih atas kerja sama Bapak/Ibu dalam mendukung kedisiplinan dan proses belajar ananda.

_Pesan otomatis dikirim melalui Sistem Presensi SiHadir SD_`;
}

/**
 * Generate formatted WhatsApp monthly report summary for parents.
 */
export function formatWhatsAppMonthlyReport(
  student: Student,
  summary: MonthlyStudentSummary,
  monthName: string,
  year: number,
  schoolName: string
): string {
  return `*LAPORAN REKAP KEHADIRAN BULANAN SISWA*
${schoolName}
Periode: *${monthName} ${year}*
----------------------------------------
Nama Siswa: *${student.name}*
Kelas: ${student.className}
NISN: ${student.nisn}
Nama Wali: ${student.parentName}

📊 *Ringkasan Kehadiran:*
• Hadir Tepat Waktu: ${summary.hadir} hari
• Terlambat: ${summary.terlambat} hari
• Sakit: ${summary.sakit} hari
• Izin: ${summary.izin} hari
• Alpa: ${summary.alpa} hari
• Persentase Kehadiran: *${summary.attendancePercentage}%*

${summary.attendancePercentage >= 90 ? '🌟 Pertahankan kehadiran yang luar biasa ini!' : 'ℹ️ Mohon tingkatkan kehadiran ananda pada bulan berikutnya.'}

Salam hangat,
Wali Kelas & Guru ${schoolName}`;
}
