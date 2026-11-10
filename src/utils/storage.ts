import { SchoolProfile, TeacherProfile, Student, AttendanceRecord, LeaveRequest } from '../types';
import { initialSchoolProfile, initialTeacherProfile, initialStudents, generateInitialAttendanceRecords, initialLeaveRequests } from './mockData';

const STORAGE_KEYS = {
  SCHOOL: 'sihadir_school_profile',
  TEACHER: 'sihadir_teacher_profile',
  STUDENTS: 'sihadir_students',
  ATTENDANCE: 'sihadir_attendance_records',
  LEAVE: 'sihadir_leave_requests',
};

export const storage = {
  getSchoolProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      return data ? JSON.parse(data) : initialSchoolProfile;
    } catch {
      return initialSchoolProfile;
    }
  },

  saveSchoolProfile(profile: SchoolProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save school profile', e);
    }
  },

  getTeacherProfile(): TeacherProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER);
      return data ? JSON.parse(data) : initialTeacherProfile;
    } catch {
      return initialTeacherProfile;
    }
  },

  saveTeacherProfile(profile: TeacherProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save teacher profile', e);
    }
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : initialStudents;
    } catch {
      return initialStudents;
    }
  },

  saveStudents(students: Student[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students', e);
    }
  },

  getAttendanceRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : generateInitialAttendanceRecords();
    } catch {
      return generateInitialAttendanceRecords();
    }
  },

  saveAttendanceRecords(records: AttendanceRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save attendance records', e);
    }
  },

  getLeaveRequests(): LeaveRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVE);
      return data ? JSON.parse(data) : initialLeaveRequests;
    } catch {
      return initialLeaveRequests;
    }
  },

  saveLeaveRequests(requests: LeaveRequest[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save leave requests', e);
    }
  },

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SCHOOL);
      localStorage.removeItem(STORAGE_KEYS.TEACHER);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.LEAVE);
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  },

  exportFullBackup(): string {
    const backup = {
      school: this.getSchoolProfile(),
      teacher: this.getTeacherProfile(),
      students: this.getStudents(),
      attendance: this.getAttendanceRecords(),
      leaveRequests: this.getLeaveRequests(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.school) this.saveSchoolProfile(parsed.school);
      if (parsed.teacher) this.saveTeacherProfile(parsed.teacher);
      if (parsed.students) this.saveStudents(parsed.students);
      if (parsed.attendance) this.saveAttendanceRecords(parsed.attendance);
      if (parsed.leaveRequests) this.saveLeaveRequests(parsed.leaveRequests);
      return true;
    } catch {
      return false;
    }
  },
};
