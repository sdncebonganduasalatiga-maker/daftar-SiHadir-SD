import React, { useState } from 'react';
import {
  Student,
  SchoolProfile,
  TeacherProfile,
  AttendanceRecord,
  AttendanceStatus,
  LeaveRequest,
  MonthlyStudentSummary,
} from '../types';
import {
  calculateClassOverallStats,
  calculateStudentMonthlySummary,
  formatIndonesianDate,
  formatWhatsAppMessage,
  formatWhatsAppMonthlyReport,
} from '../utils/attendance';
import {
  Users,
  CheckCircle,
  Clock,
  HeartPulse,
  AlertOctagon,
  Calendar,
  FileText,
  Printer,
  QrCode,
  Search,
  MessageSquare,
  UserCheck,
  Send,
  Plus,
  Edit2,
  Trash2,
  School,
  Building,
  Check,
  X,
  CreditCard,
  Settings,
  MailCheck,
  UserPlus,
} from 'lucide-react';

interface TeacherDashboardProps {
  school: SchoolProfile;
  teacher: TeacherProfile;
  students: Student[];
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onOpenScanner: () => void;
  onOpenPrintReport: (month: number, year: number) => void;
  onOpenPrintCards: () => void;
  onUpdateStatus: (studentId: string, status: AttendanceStatus, time?: string, notes?: string) => void;
  onUpdateSchool: (profile: SchoolProfile) => void;
  onUpdateTeacher: (profile: TeacherProfile) => void;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onApproveLeave: (leaveId: string, approve: boolean) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  school,
  teacher,
  students,
  records,
  leaveRequests,
  onOpenScanner,
  onOpenPrintReport,
  onOpenPrintCards,
  onUpdateStatus,
  onUpdateSchool,
  onUpdateTeacher,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onApproveLeave,
}) => {
  const [activeTab, setActiveTab] = useState<'harian' | 'laporan' | 'izin' | 'profil'>('harian');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-09');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  // Month & Year selector for monthly report
  const [reportMonth, setReportMonth] = useState<number>(11); // November
  const [reportYear, setReportYear] = useState<number>(2026);

  // Profile Management State
  const [profileSubTab, setProfileSubTab] = useState<'sekolah' | 'guru' | 'siswa'>('sekolah');
  const [schoolForm, setSchoolForm] = useState<SchoolProfile>(school);
  const [teacherForm, setTeacherForm] = useState<TeacherProfile>(teacher);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Student Add/Edit Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    nisn: '',
    nis: '',
    gender: 'L' as 'L' | 'P',
    className: teacher.assignedClass,
    birthDate: '2015-01-01',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    avatarUrl: '',
    qrCode: '',
  });

  // Quick Edit Name State
  const [quickEditStudent, setQuickEditStudent] = useState<Student | null>(null);
  const [quickEditName, setQuickEditName] = useState<string>('');

  const openQuickEditName = (std: Student) => {
    setQuickEditStudent(std);
    setQuickEditName(std.name);
  };

  const handleQuickEditNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditStudent || !quickEditName.trim()) return;

    onEditStudent({
      ...quickEditStudent,
      name: quickEditName.trim(),
    });

    setSaveSuccessMsg(`Nama siswa berhasil diubah menjadi "${quickEditName.trim()}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
    setQuickEditStudent(null);
  };

  // Calculate day stats
  const dailyStats = calculateClassOverallStats(students, records, selectedDate);

  // Calculate monthly summaries for all students
  const monthlySummaries: MonthlyStudentSummary[] = students.map((std) =>
    calculateStudentMonthlySummary(std, records, reportYear, reportMonth)
  );

  // Filter students for daily attendance table
  const filteredDailyStudents = students.filter((std) => {
    const matchesSearch =
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.nisn.includes(searchQuery) ||
      std.nis.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'semua') return true;

    const record = records.find((r) => r.studentId === std.id && r.date === selectedDate);
    const currentStatus = record ? record.status : 'belum_hadir';

    return currentStatus === statusFilter;
  });

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(schoolForm);
    setSaveSuccessMsg('Profil sekolah berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacher(teacherForm);
    setSaveSuccessMsg('Profil guru berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      nisn: '',
      nis: '',
      gender: 'L',
      className: teacher.assignedClass,
      birthDate: '2015-01-01',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      avatarUrl: '',
      qrCode: '',
    });
    setIsStudentModalOpen(true);
  };

  const openEditStudent = (std: Student) => {
    setEditingStudent(std);
    setStudentForm({
      name: std.name,
      nisn: std.nisn,
      nis: std.nis,
      gender: std.gender,
      className: std.className,
      birthDate: std.birthDate,
      parentName: std.parentName,
      parentPhone: std.parentPhone,
      parentEmail: std.parentEmail || '',
      address: std.address,
      avatarUrl: std.avatarUrl || '',
      qrCode: std.qrCode,
    });
    setIsStudentModalOpen(true);
  };

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.nisn) return;

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        ...studentForm,
        qrCode: studentForm.qrCode || studentForm.nisn,
      });
    } else {
      onAddStudent({
        ...studentForm,
        qrCode: studentForm.qrCode || studentForm.nisn,
      });
    }
    setIsStudentModalOpen(false);
  };

  const handleSendWhatsAppDaily = (std: Student, record?: AttendanceRecord) => {
    const currentRecord = record || {
      id: `temp-${std.id}`,
      studentId: std.id,
      date: selectedDate,
      checkInTime: '-',
      status: 'alpa',
    };
    const message = formatWhatsAppMessage(std, currentRecord, school.name);
    const cleanPhone = std.parentPhone.replace(/\D/g, '').replace(/^0/, '62');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendWhatsAppMonthly = (summary: MonthlyStudentSummary) => {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const message = formatWhatsAppMonthlyReport(
      summary.student,
      summary,
      monthNames[reportMonth - 1],
      reportYear,
      school.name
    );
    const cleanPhone = summary.student.parentPhone.replace(/\D/g, '').replace(/^0/, '62');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border-2 border-white/20 shrink-0 overflow-hidden shadow-inner">
              {teacher.avatarUrl ? (
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl">
                  {teacher.name[0]}
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1 border border-emerald-400/20">
                <UserCheck className="w-3.5 h-3.5" /> Dashboard Guru Aktif
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Selamat Datang, {teacher.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                {teacher.role} &bull; {school.name} &bull; NIP: {teacher.nip}
              </p>
            </div>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenScanner}
              type="button"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Mulai Scan Kamera</span>
            </button>
            <button
              onClick={() => onOpenPrintReport(reportMonth, reportYear)}
              type="button"
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Cetak Rekap</span>
            </button>
            <button
              onClick={onOpenPrintCards}
              type="button"
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>Cetak Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Daily Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Siswa</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{dailyStats.totalStudents}</span>
            <span className="text-[11px] text-slate-400 font-mono">100%</span>
          </div>
        </div>

        {/* Hadir */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Hadir Tepat Waktu</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{dailyStats.hadir}</span>
            <span className="text-[11px] font-semibold text-emerald-600">
              {dailyStats.totalStudents > 0
                ? Math.round((dailyStats.hadir / dailyStats.totalStudents) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Terlambat</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{dailyStats.terlambat}</span>
            <span className="text-[11px] text-amber-600 font-medium">
              &gt; {school.lateCutoffTime}
            </span>
          </div>
        </div>

        {/* Sakit / Izin */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">Sakit & Izin</span>
            <HeartPulse className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-700">
              {dailyStats.sakit + dailyStats.izin}
            </span>
            <span className="text-[11px] text-blue-600">
              S:{dailyStats.sakit} I:{dailyStats.izin}
            </span>
          </div>
        </div>

        {/* Belum Hadir / Alpa */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">Belum Hadir</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{dailyStats.belumHadir}</span>
            <span className="text-[11px] text-rose-600 font-semibold">
              {dailyStats.alpa > 0 ? `Alpa: ${dailyStats.alpa}` : 'Menunggu'}
            </span>
          </div>
        </div>

        {/* Persentase Kehadiran */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-2xl text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-semibold">Tingkat Kehadiran</span>
            <span className="text-xs font-mono text-emerald-400">Hari Ini</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              {dailyStats.attendancePercentage}%
            </span>
            <span className="text-[11px] text-slate-400">
              {dailyStats.hadir + dailyStats.terlambat}/{dailyStats.totalStudents} Siswa
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 overflow-x-auto gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('harian')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'harian'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Presensi Harian Real-Time</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Rekap Bulanan Otomatis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('izin')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === 'izin'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MailCheck className="w-4 h-4" />
            <span>Permohonan Izin Wali Murid</span>
            {leaveRequests.filter((l) => l.status === 'menunggu').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {leaveRequests.filter((l) => l.status === 'menunggu').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profil'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Manajemen Profil & Data Siswa</span>
          </button>
        </div>

        {/* TAB 1: PRESENSI HARIAN REAL-TIME */}
        {activeTab === 'harian' && (
          <div className="p-6 space-y-6">
            {/* Filter and Date Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Picker */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="hadir">Hadir Tepat Waktu</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpa">Alpa</option>
                  <option value="belum_hadir">Belum Hadir</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Nama Siswa & NISN</th>
                    <th className="px-4 py-3.5 w-24">Waktu Masuk</th>
                    <th className="px-4 py-3.5 w-32">Status Kehadiran</th>
                    <th className="px-4 py-3.5 min-w-[150px]">Keterangan</th>
                    <th className="px-4 py-3.5 w-36 text-center">Ubah Status Cepat</th>
                    <th className="px-4 py-3.5 w-24 text-right">Notifikasi WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDailyStudents.map((std, idx) => {
                    const record = records.find(
                      (r) => r.studentId === std.id && r.date === selectedDate
                    );
                    const currentStatus: AttendanceStatus | 'belum_hadir' = record
                      ? record.status
                      : 'belum_hadir';

                    return (
                      <tr
                        key={std.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-4 py-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {std.avatarUrl ? (
                                <img
                                  src={std.avatarUrl}
                                  alt={std.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                  {std.name[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 group/name">
                                <span className="font-bold text-slate-900 truncate">
                                  {std.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openQuickEditName(std)}
                                  className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                                  title={`Edit nama siswa: ${std.name}`}
                                  aria-label={`Edit nama siswa: ${std.name}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                <span>NISN: {std.nisn}</span>
                                <span>&bull;</span>
                                <span>L/P: {std.gender}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {record?.checkInTime ? (
                            <span className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {record.checkInTime}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {currentStatus === 'hadir' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Hadir
                            </span>
                          )}
                          {currentStatus === 'terlambat' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" /> Terlambat
                            </span>
                          )}
                          {currentStatus === 'sakit' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              <HeartPulse className="w-3 h-3 text-blue-600" /> Sakit
                            </span>
                          )}
                          {currentStatus === 'izin' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                              <FileText className="w-3 h-3 text-purple-600" /> Izin
                            </span>
                          )}
                          {currentStatus === 'alpa' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <AlertOctagon className="w-3 h-3 text-rose-600" /> Alpa
                            </span>
                          )}
                          {currentStatus === 'belum_hadir' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              Belum Masuk
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">
                          {record?.notes || (
                            <span className="text-slate-400 italic text-[11px]">Tidak ada catatan</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {/* 1-Click Status Toggles */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(std.id, 'hadir', '06:50')}
                              title="Tandai Hadir Tepat Waktu"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                currentStatus === 'hadir'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              H
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(std.id, 'terlambat', '07:25')}
                              title="Tandai Terlambat"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                currentStatus === 'terlambat'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-amber-100 text-amber-800'
                              }`}
                            >
                              T
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(std.id, 'sakit', '', 'Sakit flu')}
                              title="Tandai Sakit"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                currentStatus === 'sakit'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-blue-100 text-blue-800'
                              }`}
                            >
                              S
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(std.id, 'izin', '', 'Izin keluarga')}
                              title="Tandai Izin"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                currentStatus === 'izin'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-purple-100 text-purple-800'
                              }`}
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(std.id, 'alpa', '', 'Tanpa keterangan')}
                              title="Tandai Alpa"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                currentStatus === 'alpa'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-rose-100 text-rose-800'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppDaily(std, record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[11px] font-semibold border border-emerald-200 transition-all cursor-pointer active:scale-95"
                            title={`Kirim WA ke ${std.parentName} (${std.parentPhone})`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kirim WA</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN REKAP BULANAN OTOMATIS */}
        {activeTab === 'laporan' && (
          <div className="p-6 space-y-6">
            {/* Month & Year Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div>
                  <label htmlFor="bulan-presensi-select" className="block text-[11px] font-bold text-slate-500 uppercase">
                    Bulan Presensi
                  </label>
                  <select
                    id="bulan-presensi-select"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {[
                      'Januari',
                      'Februari',
                      'Maret',
                      'April',
                      'Mei',
                      'Juni',
                      'Juli',
                      'Agustus',
                      'September',
                      'Oktober',
                      'November',
                      'Desember',
                    ].map((name, i) => (
                      <option key={name} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tahun-presensi-select" className="block text-[11px] font-bold text-slate-500 uppercase">
                    Tahun
                  </label>
                  <select
                    id="tahun-presensi-select"
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="mt-0.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenPrintReport(reportMonth, reportYear)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Rekap Resmi (PDF/Print)</span>
                </button>
              </div>
            </div>

            {/* Monthly Summary Cards Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Nama Siswa & Wali Murid</th>
                    <th className="px-3 py-3.5 text-center text-emerald-800 bg-emerald-50/50">Hadir</th>
                    <th className="px-3 py-3.5 text-center text-amber-800 bg-amber-50/50">Terlambat</th>
                    <th className="px-3 py-3.5 text-center text-blue-800 bg-blue-50/50">Sakit</th>
                    <th className="px-3 py-3.5 text-center text-purple-800 bg-purple-50/50">Izin</th>
                    <th className="px-3 py-3.5 text-center text-rose-800 bg-rose-50/50">Alpa</th>
                    <th className="px-4 py-3.5 text-center">Persentase</th>
                    <th className="px-4 py-3.5 text-right">Kirim Rapor WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlySummaries.map((sum, idx) => (
                    <tr key={sum.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 group/name">
                          <span className="font-bold text-slate-900">{sum.student.name}</span>
                          <button
                            type="button"
                            onClick={() => openQuickEditName(sum.student)}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                            title={`Edit nama siswa: ${sum.student.name}`}
                            aria-label={`Edit nama siswa: ${sum.student.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Wali: {sum.student.parentName} &bull; {sum.student.parentPhone}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-700 font-mono">
                        {sum.hadir}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-amber-700 font-mono">
                        {sum.terlambat}
                      </td>
                      <td className="px-3 py-3 text-center text-blue-700 font-mono">{sum.sakit}</td>
                      <td className="px-3 py-3 text-center text-purple-700 font-mono">{sum.izin}</td>
                      <td className="px-3 py-3 text-center text-rose-700 font-mono">{sum.alpa}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-black font-mono px-2 py-0.5 rounded-full text-[11px] ${
                              sum.attendancePercentage >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : sum.attendancePercentage >= 75
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sum.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppMonthly(sum)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Rapor WA</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PERMOHONAN IZIN DARI WALI MURID */}
        {activeTab === 'izin' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Permohonan Izin / Sakit Masuk
                </h3>
                <p className="text-xs text-slate-500">
                  Pemberitahuan resmi dari orang tua siswa dengan status dan konfirmasi wali kelas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveRequests.map((leave) => {
                const std = students.find((s) => s.id === leave.studentId);

                return (
                  <div
                    key={leave.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            leave.type === 'sakit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {leave.type === 'sakit' ? 'Surat Sakit' : 'Permohonan Izin'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {std ? std.name : 'Siswa'} ({std?.className})
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Dari: <strong>{leave.parentName}</strong> ({leave.parentPhone})
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          leave.status === 'disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {leave.status === 'disetujui'
                          ? 'Disetujui'
                          : leave.status === 'ditolak'
                          ? 'Ditolak'
                          : 'Menunggu'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100">
                      <p className="italic font-medium">"{leave.reason}"</p>
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>
                          Tanggal: <strong>{leave.startDate}</strong> s/d{' '}
                          <strong>{leave.endDate}</strong>
                        </span>
                        <span>Diajukan: {leave.createdAt}</span>
                      </div>
                    </div>

                    {leave.status === 'menunggu' && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onApproveLeave(leave.id, false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveLeave(leave.id, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui Presensi
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MANAJEMEN DATA PROFIL (SEKOLAH, GURU, SISWA) */}
        {activeTab === 'profil' && (
          <div className="p-6 space-y-6">
            {/* Sub-Tabs: Profil Sekolah vs Profil Guru vs Data Siswa */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
              <button
                type="button"
                onClick={() => setProfileSubTab('sekolah')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  profileSubTab === 'sekolah'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profil Sekolah
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab('guru')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  profileSubTab === 'guru'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profil Guru
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab('siswa')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  profileSubTab === 'siswa'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Data Siswa ({students.length})
              </button>
            </div>

            {/* Notification Banner */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* SUBTAB A: PROFIL SEKOLAH */}
            {profileSubTab === 'sekolah' && (
              <form onSubmit={handleSchoolSubmit} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Pokok Sekolah Nasional (NPSN)
                    </label>
                    <input
                      type="text"
                      value={schoolForm.npsn}
                      onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Batas Jam Masuk (Terlambat)
                    </label>
                    <input
                      type="time"
                      value={schoolForm.lateCutoffTime}
                      onChange={(e) =>
                        setSchoolForm({ ...schoolForm, lateCutoffTime: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolForm.address}
                      onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kecamatan & Kota
                    </label>
                    <input
                      type="text"
                      value={`${schoolForm.district}, ${schoolForm.city}`}
                      onChange={(e) => {
                        const [dist, ...rest] = e.target.value.split(',');
                        setSchoolForm({
                          ...schoolForm,
                          district: dist.trim(),
                          city: rest.join(',').trim() || schoolForm.city,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tahun Ajaran & Semester
                    </label>
                    <input
                      type="text"
                      value={schoolForm.academicYear}
                      onChange={(e) =>
                        setSchoolForm({ ...schoolForm, academicYear: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolForm.principalName}
                      onChange={(e) =>
                        setSchoolForm({ ...schoolForm, principalName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolForm.principalNip}
                      onChange={(e) =>
                        setSchoolForm({ ...schoolForm, principalNip: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Simpan Profil Sekolah
                  </button>
                </div>
              </form>
            )}

            {/* SUBTAB B: PROFIL GURU */}
            {profileSubTab === 'guru' && (
              <form onSubmit={handleTeacherSubmit} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Guru (dengan Gelar)
                    </label>
                    <input
                      type="text"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Induk Pegawai (NIP)
                    </label>
                    <input
                      type="text"
                      value={teacherForm.nip}
                      onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NUPTK
                    </label>
                    <input
                      type="text"
                      value={teacherForm.nuptk || ''}
                      onChange={(e) => setTeacherForm({ ...teacherForm, nuptk: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan / Peran
                    </label>
                    <input
                      type="text"
                      value={teacherForm.role}
                      onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kelas Binaan
                    </label>
                    <input
                      type="text"
                      value={teacherForm.assignedClass}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, assignedClass: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Guru
                    </label>
                    <input
                      type="text"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Belajar.id Guru
                    </label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Simpan Profil Guru
                  </button>
                </div>
              </form>
            )}

            {/* SUBTAB C: DATA SISWA */}
            {profileSubTab === 'siswa' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Daftar Siswa {teacher.assignedClass}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Kelola biodata siswa, NISN, kontak wali murid, dan barcode kartu presensi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddStudent}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Tambah Siswa Baru
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center">No</th>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3 font-mono">NISN / NIS</th>
                        <th className="px-4 py-3">Wali Murid</th>
                        <th className="px-4 py-3 font-mono">No. WhatsApp Wali</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((std, idx) => (
                        <tr key={std.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5 group/name">
                              <span>{std.name} ({std.gender})</span>
                              <button
                                type="button"
                                onClick={() => openQuickEditName(std)}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                                title={`Edit nama siswa: ${std.name}`}
                                aria-label={`Edit nama siswa: ${std.name}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {std.nisn} / {std.nis}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{std.parentName}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{std.parentPhone}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openQuickEditName(std)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                title="Ubah nama siswa"
                                aria-label={`Ubah nama ${std.name}`}
                              >
                                <Edit2 className="w-3 h-3 text-emerald-600" />
                                <span>Edit Nama</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditStudent(std)}
                                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                                title="Edit Biodata Lengkap Siswa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteStudent(std.id)}
                                className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {isStudentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentFormSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  placeholder="Contoh: Ahmad Rizky"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    placeholder="Contoh: 0158492001"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    placeholder="Contoh: 5011"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={studentForm.className}
                    onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, parentName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Nama bapak/ibu"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, parentPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    placeholder="0812-xxxx-xxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Rumah</label>
                <input
                  type="text"
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Jl. ..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit Student Name Modal */}
      {quickEditStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-student-name-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="edit-student-name-title" className="font-bold text-base">
                    Edit Nama Siswa
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Perbarui nama resmi siswa untuk presensi & laporan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditStudent(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup dialog edit nama"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickEditNameSubmit} className="p-6 space-y-4 text-xs">
              {/* Student identity preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                  {quickEditStudent.avatarUrl ? (
                    <img src={quickEditStudent.avatarUrl} alt={quickEditStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    quickEditStudent.name[0]
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-[11px]">
                    NISN: <span className="font-mono font-bold text-slate-900">{quickEditStudent.nisn}</span> &bull; {quickEditStudent.className}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Wali: {quickEditStudent.parentName}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="edit-student-name-input" className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Nama Lengkap Siswa (Sesuai Akta Kelahiran / Rapor)
                </label>
                <input
                  id="edit-student-name-input"
                  type="text"
                  value={quickEditName}
                  onChange={(e) => setQuickEditName(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-slate-900 shadow-xs"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Perubahan nama akan otomatis diperbarui di seluruh presensi real-time, laporan bulanan, kartu barcode, dan portal wali murid.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickEditStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!quickEditName.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Simpan Nama Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
