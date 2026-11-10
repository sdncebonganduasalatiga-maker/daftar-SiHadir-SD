import test from 'node:test';
import assert from 'node:assert/strict';
import {
  determineStatusByTime,
  parseBarcodePayload,
  calculateStudentMonthlySummary,
  calculateClassOverallStats,
  formatIndonesianDate,
  formatWhatsAppMessage,
} from './attendance';
import { Student, AttendanceRecord } from '../types';

const mockStudents: Student[] = [
  {
    id: 's1',
    nisn: '0012345678',
    nis: '4011',
    name: 'Ahmad Fauzi',
    gender: 'L',
    className: 'Kelas 5A',
    birthDate: '2015-04-12',
    parentName: 'Bambang Sudiro',
    parentPhone: '081234567890',
    address: 'Jl. Melati No. 12',
    qrCode: '0012345678',
  },
  {
    id: 's2',
    nisn: '0012345679',
    nis: '4012',
    name: 'Siti Aisyah',
    gender: 'P',
    className: 'Kelas 5A',
    birthDate: '2015-08-20',
    parentName: 'Hendra Gunawan',
    parentPhone: '081298765432',
    address: 'Jl. Kenanga No. 5',
    qrCode: '0012345679',
  },
];

test('determineStatusByTime detects on-time vs late correctly', () => {
  assert.equal(determineStatusByTime('06:45', '07:15'), 'hadir');
  assert.equal(determineStatusByTime('07:14', '07:15'), 'hadir');
  assert.equal(determineStatusByTime('07:15', '07:15'), 'hadir');
  assert.equal(determineStatusByTime('07:16', '07:15'), 'terlambat');
  assert.equal(determineStatusByTime('07:30', '07:15'), 'terlambat');
  assert.equal(determineStatusByTime('08:00', '07:15'), 'terlambat');
});

test('parseBarcodePayload identifies students by exact NISN, prefix, or ID', () => {
  // Direct NISN
  const res1 = parseBarcodePayload('0012345678', mockStudents);
  assert.equal(res1.found, true);
  assert.equal(res1.student?.name, 'Ahmad Fauzi');

  // With prefix "NISN:0012345679"
  const res2 = parseBarcodePayload('NISN:0012345679', mockStudents);
  assert.equal(res2.found, true);
  assert.equal(res2.student?.name, 'Siti Aisyah');

  // NIS match
  const res3 = parseBarcodePayload('4011', mockStudents);
  assert.equal(res3.found, true);
  assert.equal(res3.student?.name, 'Ahmad Fauzi');

  // Not found
  const res4 = parseBarcodePayload('9999999999', mockStudents);
  assert.equal(res4.found, false);
  assert.equal(res4.student, undefined);
});

test('calculateStudentMonthlySummary computes statistics correctly', () => {
  const records: AttendanceRecord[] = [
    {
      id: 'r1',
      studentId: 's1',
      date: '2026-11-02',
      checkInTime: '06:50',
      status: 'hadir',
    },
    {
      id: 'r2',
      studentId: 's1',
      date: '2026-11-03',
      checkInTime: '07:20',
      status: 'terlambat',
    },
    {
      id: 'r3',
      studentId: 's1',
      date: '2026-11-04',
      checkInTime: '',
      status: 'sakit',
    },
    {
      id: 'r4',
      studentId: 's1',
      date: '2026-11-05',
      checkInTime: '',
      status: 'izin',
    },
    {
      id: 'r5',
      studentId: 's1',
      date: '2026-11-06',
      checkInTime: '',
      status: 'alpa',
    },
  ];

  const summary = calculateStudentMonthlySummary(mockStudents[0], records, 2026, 11);

  assert.equal(summary.hadir, 1);
  assert.equal(summary.terlambat, 1);
  assert.equal(summary.sakit, 1);
  assert.equal(summary.izin, 1);
  assert.equal(summary.alpa, 1);
  assert.equal(summary.dailyStatus[2], 'hadir');
  assert.equal(summary.dailyStatus[3], 'terlambat');
  assert.equal(summary.dailyStatus[4], 'sakit');
  assert.equal(summary.dailyStatus[5], 'izin');
  assert.equal(summary.dailyStatus[6], 'alpa');
  // Attended: 1 hadir + 1 terlambat = 2 out of 5 recorded days = 40%
  assert.equal(summary.attendancePercentage, 40);
});

test('calculateClassOverallStats computes day aggregate stats', () => {
  const records: AttendanceRecord[] = [
    { id: 'r1', studentId: 's1', date: '2026-11-09', checkInTime: '06:55', status: 'hadir' },
    { id: 'r2', studentId: 's2', date: '2026-11-09', checkInTime: '07:25', status: 'terlambat' },
  ];

  const stats = calculateClassOverallStats(mockStudents, records, '2026-11-09');
  assert.equal(stats.totalStudents, 2);
  assert.equal(stats.hadir, 1);
  assert.equal(stats.terlambat, 1);
  assert.equal(stats.belumHadir, 0);
  assert.equal(stats.attendancePercentage, 100);
});

test('formatIndonesianDate formats correctly', () => {
  const formatted = formatIndonesianDate('2026-11-09');
  assert.match(formatted, /November 2026/);
});

test('formatWhatsAppMessage contains student and parent details', () => {
  const record: AttendanceRecord = {
    id: 'r1',
    studentId: 's1',
    date: '2026-11-09',
    checkInTime: '06:55',
    status: 'hadir',
  };
  const message = formatWhatsAppMessage(mockStudents[0], record, 'SDN Merdeka 01');
  assert.match(message, /Ahmad Fauzi/);
  assert.equal(message.includes('HADIR'), true);
  assert.equal(message.includes('06:55 WIB'), true);
  assert.equal(message.includes('SDN Merdeka 01'), true);
});
