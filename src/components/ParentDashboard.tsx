import React, { useState } from 'react';
import {
  Student,
  SchoolProfile,
  TeacherProfile,
  AttendanceRecord,
  LeaveRequest,
} from '../types';
import {
  calculateStudentMonthlySummary,
  formatIndonesianDate,
} from '../utils/attendance';
import {
  Heart,
  CheckCircle2,
  Clock,
  HeartPulse,
  AlertCircle,
  Calendar,
  Send,
  MessageCircle,
  CreditCard,
  Printer,
  ChevronDown,
  User,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface ParentDashboardProps {
  school: SchoolProfile;
  teacher: TeacherProfile;
  students: Student[];
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onSubmitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => void;
  onOpenPrintCards: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  school,
  teacher,
  students,
  records,
  leaveRequests,
  onSubmitLeaveRequest,
  onOpenPrintCards,
}) => {
  // Active student viewed by parent
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const today = '2026-11-09';
  const todayRecord = records.find(
    (r) => r.studentId === selectedStudent?.id && r.date === today
  );

  // Month navigation for parent
  const [currentMonth, setCurrentMonth] = useState<number>(11); // Nov
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Leave Request Form State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'sakit' | 'izin'>('sakit');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [reason, setReason] = useState<string>('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  if (!selectedStudent) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Belum ada data siswa yang terdaftar.
      </div>
    );
  }

  // Monthly breakdown for selected child
  const summary = calculateStudentMonthlySummary(
    selectedStudent,
    records,
    currentYear,
    currentMonth
  );

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter leave requests submitted for this child
  const childLeaves = leaveRequests.filter(
    (l) => l.studentId === selectedStudent.id
  );

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmitLeaveRequest({
      studentId: selectedStudent.id,
      type: leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      parentName: selectedStudent.parentName,
      parentPhone: selectedStudent.parentPhone,
    });

    setIsLeaveModalOpen(false);
    setReason('');
    setSubmittedNotice('Permohonan izin/sakit berhasil dikirimkan ke Wali Kelas!');
    setTimeout(() => setSubmittedNotice(null), 4000);
  };

  const handleContactTeacherWhatsApp = () => {
    const text = `Halo Bapak ${teacher.name}, saya wali dari ananda ${selectedStudent.name} (${selectedStudent.className}). Ingin berkonsultasi mengenai presensi ananda.`;
    const cleanPhone = teacher.phone.replace(/\D/g, '').replace(/^0/, '62');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Child Selector */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border-2 border-white/20 shrink-0 overflow-hidden shadow-inner">
              {selectedStudent.avatarUrl ? (
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl">
                  {selectedStudent.name[0]}
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-400/20">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" /> Portal Wali Murid
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {selectedStudent.name}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                NISN: <span className="font-mono">{selectedStudent.nisn}</span> &bull;{' '}
                {selectedStudent.className} &bull; {school.name}
              </p>
            </div>
          </div>

          {/* Child Selector Dropdown & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-indigo-200">Ganti Siswa:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer [&>option]:text-slate-900"
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.className})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Ajukan Izin / Sakit
            </button>
          </div>
        </div>
      </div>

      {submittedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{submittedNotice}</span>
        </div>
      )}

      {/* Real-Time Live Status Today Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-slate-900 text-base">
              Status Kehadiran Hari Ini ({formatIndonesianDate(today)})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Wali Kelas: <strong className="text-slate-800">{teacher.name}</strong>
          </span>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
          {/* Big Status Badge */}
          <div className="w-full md:w-auto flex-1">
            {todayRecord?.status === 'hadir' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                      Terverifikasi Hadir
                    </span>
                    <h4 className="text-xl font-black mt-1">
                      Ananda Sudah Tiba di Sekolah
                    </h4>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Waktu scan barcode:{' '}
                      <strong className="font-mono text-white text-sm">
                        {todayRecord.checkInTime} WIB
                      </strong>{' '}
                      (Tepat Waktu).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {todayRecord?.status === 'terlambat' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                      Hadir Terlambat
                    </span>
                    <h4 className="text-xl font-black mt-1">
                      Ananda Tiba Pukul {todayRecord.checkInTime} WIB
                    </h4>
                    <p className="text-xs text-amber-100 mt-0.5">
                      Batas jam masuk sekolah adalah {school.lateCutoffTime} WIB.
                      {todayRecord.notes ? ` Catatan: "${todayRecord.notes}"` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {todayRecord?.status === 'sakit' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                      Keterangan Sakit
                    </span>
                    <h4 className="text-xl font-black mt-1">
                      Sedang Sakit / Dalam Pemulihan
                    </h4>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Semoga ananda lekas sembuh dan beraktivitas kembali.
                      {todayRecord.notes ? ` Catatan: "${todayRecord.notes}"` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {todayRecord?.status === 'izin' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                      Izin Resmi
                    </span>
                    <h4 className="text-xl font-black mt-1">
                      Izin Tidak Masuk Sekolah
                    </h4>
                    <p className="text-xs text-purple-100 mt-0.5">
                      Izin telah disetujui wali kelas.
                      {todayRecord.notes ? ` Alasan: "${todayRecord.notes}"` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!todayRecord && (
              <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 uppercase">
                      Menunggu Presensi
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 mt-1">
                      Belum Tercatat di Sekolah
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gerbang dan pemindai barcode buka mulai pukul 06:30 WIB.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Teacher Direct WhatsApp Card */}
          <div className="w-full md:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                {teacher.name[0]}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-900 truncate">{teacher.name}</h5>
                <p className="text-[11px] text-slate-500 truncate">{teacher.role}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600">
              Ada pertanyaan terkait perkembangan atau presensi ananda?
            </p>
            <button
              type="button"
              onClick={handleContactTeacherWhatsApp}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi Guru via WA
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">Persentase Hadir</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {summary.attendancePercentage}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {summary.attendancePercentage >= 90 ? '🌟 Sangat Disiplin' : 'Perlu Ditingkatkan'}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <span className="text-xs text-emerald-800 font-semibold block">Hadir Tepat Waktu</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">{summary.hadir}</span>
          <span className="text-[11px] text-emerald-700 block mt-1">Hari</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <span className="text-xs text-amber-800 font-semibold block">Terlambat</span>
          <span className="text-2xl font-black text-amber-800 font-mono">
            {summary.terlambat}
          </span>
          <span className="text-[11px] text-amber-700 block mt-1">Hari</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
          <span className="text-xs text-blue-800 font-semibold block">Sakit</span>
          <span className="text-2xl font-black text-blue-800 font-mono">{summary.sakit}</span>
          <span className="text-[11px] text-blue-700 block mt-1">Hari</span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
          <span className="text-xs text-purple-800 font-semibold block">Izin</span>
          <span className="text-2xl font-black text-purple-800 font-mono">{summary.izin}</span>
          <span className="text-[11px] text-purple-700 block mt-1">Hari</span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
          <span className="text-xs text-rose-800 font-semibold block">Alpa</span>
          <span className="text-2xl font-black text-rose-800 font-mono">{summary.alpa}</span>
          <span className="text-[11px] text-rose-700 block mt-1">Hari</span>
        </div>
      </div>

      {/* Monthly Attendance Calendar Heatmap */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kalender Kehadiran Ananda - November 2026
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat presensi harian per tanggal di sekolah
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" /> Hadir
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500" /> Terlambat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-500" /> Sakit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-500" /> Izin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" /> Alpa
            </span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day} className="text-xs font-bold text-slate-400 py-1 uppercase">
              {day}
            </div>
          ))}

          {daysArray.map((day) => {
            const st = summary.dailyStatus[day];
            let badgeBg = 'bg-slate-50 border-slate-200 text-slate-600';
            let label = 'Belum Ada Data';

            if (st === 'hadir') {
              badgeBg = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
              label = 'Hadir Tepat Waktu';
            } else if (st === 'terlambat') {
              badgeBg = 'bg-amber-100 border-amber-300 text-amber-900 font-bold';
              label = 'Terlambat';
            } else if (st === 'sakit') {
              badgeBg = 'bg-blue-100 border-blue-300 text-blue-900 font-bold';
              label = 'Sakit';
            } else if (st === 'izin') {
              badgeBg = 'bg-purple-100 border-purple-300 text-purple-900 font-bold';
              label = 'Izin';
            } else if (st === 'alpa') {
              badgeBg = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
              label = 'Alpa';
            }

            return (
              <div
                key={day}
                className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${badgeBg}`}
                title={`Tanggal ${day} November: ${label}`}
              >
                <span className="text-xs font-mono">{day}</span>
                <span className="text-[10px] font-bold mt-1 uppercase">
                  {st ? st[0] : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Request History */}
      {childLeaves.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Riwayat Surat / Permohonan Izin yang Diajukan
          </h3>
          <div className="space-y-3">
            {childLeaves.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.type === 'sakit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {l.type}
                    </span>
                    <span className="text-slate-500">
                      Periode: {l.startDate} s/d {l.endDate}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 mt-1">"{l.reason}"</p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      l.status === 'disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {l.status === 'disetujui'
                      ? 'Disetujui Guru'
                      : l.status === 'ditolak'
                      ? 'Ditolak'
                      : 'Menunggu Persetujuan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Ajukan Surat Izin / Sakit Ananda</h3>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Permohonan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('sakit')}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      leaveType === 'sakit'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    🤒 Surat Sakit
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('izin')}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      leaveType === 'izin'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ✉️ Permohonan Izin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Keterangan Lengkap</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Ananda demam tinggi sejak kemarin malam dan disarankan dokter istirahat selama 2 hari..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
