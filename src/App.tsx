import React, { useState, useEffect } from 'react';
import {
  UserRole,
  SchoolProfile,
  TeacherProfile,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  LeaveRequest,
} from './types';
import { storage } from './utils/storage';
import { calculateStudentMonthlySummary } from './utils/attendance';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { PrintReportModal } from './components/PrintReportModal';
import { StudentCardsPrintModal } from './components/StudentCardsPrintModal';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Shield,
  Download,
  Upload,
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('guru');
  const [school, setSchool] = useState<SchoolProfile>(() => storage.getSchoolProfile());
  const [teacher, setTeacher] = useState<TeacherProfile>(() => storage.getTeacherProfile());
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => storage.getAttendanceRecords());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => storage.getLeaveRequests());

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [isPrintCardsOpen, setIsPrintCardsOpen] = useState<boolean>(false);
  const [printMonth, setPrintMonth] = useState<number>(11);
  const [printYear, setPrintYear] = useState<number>(2026);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist to storage on changes
  useEffect(() => {
    storage.saveSchoolProfile(school);
  }, [school]);

  useEffect(() => {
    storage.saveTeacherProfile(teacher);
  }, [teacher]);

  useEffect(() => {
    storage.saveStudents(students);
  }, [students]);

  useEffect(() => {
    storage.saveAttendanceRecords(records);
  }, [records]);

  useEffect(() => {
    storage.saveLeaveRequests(leaveRequests);
  }, [leaveRequests]);

  // Handler for Recording Attendance (via Barcode or Manual)
  const handleRecordAttendance = (
    student: Student,
    checkInTime: string,
    status: 'hadir' | 'terlambat'
  ) => {
    const today = '2026-11-09';
    const newRecordId = `rec-${today}-${student.id}`;

    setRecords((prev) => {
      // Check if record for today already exists
      const existingIdx = prev.findIndex((r) => r.studentId === student.id && r.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          checkInTime: checkInTime || updated[existingIdx].checkInTime,
          status,
          method: 'barcode',
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: newRecordId,
          studentId: student.id,
          date: today,
          checkInTime,
          status,
          method: 'barcode',
        };
        return [newRecord, ...prev];
      }
    });

    showToast(`Presensi ${student.name} berhasil dicatat (${status === 'hadir' ? 'Hadir Tepat Waktu' : 'Terlambat'})!`);
  };

  // Handler for Manual Status Toggle on Teacher Dashboard
  const handleUpdateStatus = (
    studentId: string,
    status: AttendanceStatus,
    time: string = '',
    notes: string = ''
  ) => {
    const today = '2026-11-09';
    const student = students.find((s) => s.id === studentId);

    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.studentId === studentId && r.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          checkInTime: time || updated[existingIdx].checkInTime,
          notes: notes !== undefined ? notes : updated[existingIdx].notes,
          method: 'manual',
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `rec-${today}-${studentId}`,
          studentId,
          date: today,
          checkInTime: time,
          status,
          notes,
          method: 'manual',
        };
        return [newRecord, ...prev];
      }
    });

    if (student) {
      showToast(`Status ${student.name} diubah menjadi: ${status.toUpperCase()}`);
    }
  };

  // Open Monthly Print Modal
  const handleOpenPrintReport = (month: number, year: number) => {
    setPrintMonth(month);
    setPrintYear(year);
    setIsPrintReportOpen(true);
  };

  // Student CRUD
  const handleAddStudent = (newStdData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStdData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Siswa ${newStudent.name} berhasil ditambahkan!`);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    showToast(`Biodata ${updatedStudent.name} berhasil diperbarui!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const std = students.find((s) => s.id === studentId);
    if (!std) return;
    if (confirm(`Apakah Anda yakin ingin menghapus siswa ${std.name}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast(`Siswa ${std.name} telah dihapus.`);
    }
  };

  // Leave Requests Handlers
  const handleSubmitLeaveRequest = (
    data: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newRequest: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      status: 'menunggu',
      createdAt: '2026-11-09 08:00',
    };
    setLeaveRequests((prev) => [newRequest, ...prev]);
    showToast('Permohonan izin berhasil diajukan dan dikirim ke Wali Kelas!');
  };

  const handleApproveLeave = (leaveId: string, approve: boolean) => {
    const leave = leaveRequests.find((l) => l.id === leaveId);
    if (!leave) return;

    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === leaveId ? { ...l, status: approve ? 'disetujui' : 'ditolak' } : l
      )
    );

    // If approved, update attendance status for today
    if (approve) {
      handleUpdateStatus(
        leave.studentId,
        leave.type === 'sakit' ? 'sakit' : 'izin',
        '',
        leave.reason
      );
    }

    showToast(
      approve
        ? 'Permohonan izin disetujui & presensi siswa diperbarui!'
        : 'Permohonan izin ditolak.'
    );
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke pengaturan awal (contoh SD Negeri Merdeka Belajar)?')) {
      storage.resetToDefault();
      setSchool(storage.getSchoolProfile());
      setTeacher(storage.getTeacherProfile());
      setStudents(storage.getStudents());
      setRecords(storage.getAttendanceRecords());
      setLeaveRequests(storage.getLeaveRequests());
      showToast('Data aplikasi berhasil dikembalikan ke standar awal.');
    }
  };

  // Calculate monthly summaries for print
  const printSummaries = students.map((std) =>
    calculateStudentMonthlySummary(std, records, printYear, printMonth)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-300 no-print">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        school={school}
        teacher={teacher}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'guru' ? (
          <TeacherDashboard
            school={school}
            teacher={teacher}
            students={students}
            records={records}
            leaveRequests={leaveRequests}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenPrintReport={handleOpenPrintReport}
            onOpenPrintCards={() => setIsPrintCardsOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateSchool={setSchool}
            onUpdateTeacher={setTeacher}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onApproveLeave={handleApproveLeave}
          />
        ) : (
          <ParentDashboard
            school={school}
            teacher={teacher}
            students={students}
            records={records}
            leaveRequests={leaveRequests}
            onSubmitLeaveRequest={handleSubmitLeaveRequest}
            onOpenPrintCards={() => setIsPrintCardsOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SiHadir SD</span>
            <span>&bull;</span>
            <span>Sistem Presensi Siswa Real-Time & Rekap Bulanan Otomatis</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset ke data awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Contoh</span>
            </button>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-slate-400">
              v1.0 &bull; SD Negeri Merdeka Belajar 01
            </span>
          </div>
        </div>
      </footer>

      {/* Barcode / QR Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        school={school}
        onRecordAttendance={handleRecordAttendance}
      />

      {/* Official Monthly Report Print Sheet */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        school={school}
        teacher={teacher}
        month={printMonth}
        year={printYear}
        summaries={printSummaries}
      />

      {/* Student Cards Print Modal */}
      <StudentCardsPrintModal
        isOpen={isPrintCardsOpen}
        onClose={() => setIsPrintCardsOpen(false)}
        students={students}
        school={school}
      />
    </div>
  );
}
