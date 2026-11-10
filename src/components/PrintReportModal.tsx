import React from 'react';
import { SchoolProfile, TeacherProfile, MonthlyStudentSummary } from '../types';
import { Printer, Download, X, FileSpreadsheet } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  teacher: TeacherProfile;
  month: number;
  year: number;
  summaries: MonthlyStudentSummary[];
}

const MONTH_NAMES = [
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

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  school,
  teacher,
  month,
  year,
  summaries,
}) => {
  if (!isOpen) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = MONTH_NAMES[month - 1];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Build CSV Content
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'L/P',
      ...daysArray.map((d) => `Tgl ${d}`),
      'Hadir',
      'Terlambat',
      'Sakit',
      'Izin',
      'Alpa',
      'Persentase',
    ];

    const rows = summaries.map((s, idx) => {
      const dailyCols = daysArray.map((day) => {
        const st = s.dailyStatus[day];
        if (!st) return '-';
        if (st === 'hadir') return 'H';
        if (st === 'terlambat') return 'T';
        if (st === 'sakit') return 'S';
        if (st === 'izin') return 'I';
        if (st === 'alpa') return 'A';
        return '-';
      });

      return [
        idx + 1,
        `"${s.student.nisn}"`,
        `"${s.student.name}"`,
        s.student.gender,
        ...dailyCols,
        s.hadir,
        s.terlambat,
        s.sakit,
        s.izin,
        s.alpa,
        `${s.attendancePercentage}%`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kehadiran_${teacher.assignedClass}_${monthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-400" />
              Pratinjau Cetak Laporan Bulanan Resmi
            </h2>
            <p className="text-xs text-slate-300">
              Format baku laporan presensi sekolah dasar siap cetak A4 landscape atau ekspor
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Ekspor CSV / Excel
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs mx-auto max-w-5xl text-slate-900 border border-slate-200 printable-card">
            {/* Kop Surat Resmi */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
              <div className="flex items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center font-serif font-black text-xl text-slate-800">
                  SD
                </div>
                <div>
                  <h1 className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                    PEMERINTAH {school.province.toUpperCase()} &bull; DINAS PENDIDIKAN
                  </h1>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">
                    {school.name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {school.address}, Kec. {school.district}, {school.city} &bull; NPSN: {school.npsn}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Telp: {school.phone} &bull; Email: {school.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-5">
              <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900">
                LAPORAN REKAPITULASI KEHADIRAN SISWA BULANAN
              </h3>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Bulan: <span className="font-bold underline uppercase">{monthName} {year}</span> &bull; Kelas:{' '}
                <span className="font-bold">{teacher.assignedClass}</span> &bull; Tahun Ajaran:{' '}
                {school.academicYear} ({school.semester})
              </p>
            </div>

            {/* Attendance Matrix Table */}
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full border-collapse border border-slate-800 text-center">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <th rowSpan={2} className="border border-slate-800 px-1 py-1 w-7">
                      No
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1 text-left min-w-[140px]">
                      Nama Siswa
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-1 py-1 w-7">
                      L/P
                    </th>
                    <th colSpan={daysInMonth} className="border border-slate-800 py-1">
                      Tanggal ({monthName})
                    </th>
                    <th colSpan={5} className="border border-slate-800 py-1">
                      Rekap
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-1 py-1 w-10">
                      %
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-[10px]">
                    {daysArray.map((day) => (
                      <th key={day} className="border border-slate-800 px-0.5 py-0.5 w-5 font-mono">
                        {day}
                      </th>
                    ))}
                    <th className="border border-slate-800 px-1 py-0.5 bg-emerald-50 text-emerald-900 font-bold">H</th>
                    <th className="border border-slate-800 px-1 py-0.5 bg-amber-50 text-amber-900 font-bold">T</th>
                    <th className="border border-slate-800 px-1 py-0.5 bg-blue-50 text-blue-900 font-bold">S</th>
                    <th className="border border-slate-800 px-1 py-0.5 bg-purple-50 text-purple-900 font-bold">I</th>
                    <th className="border border-slate-800 px-1 py-0.5 bg-rose-50 text-rose-900 font-bold">A</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s, idx) => (
                    <tr key={s.student.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-800 py-1 font-mono">{idx + 1}</td>
                      <td className="border border-slate-800 px-2 py-1 text-left font-medium truncate max-w-[160px]">
                        {s.student.name}
                      </td>
                      <td className="border border-slate-800 py-1 font-mono">{s.student.gender}</td>
                      {daysArray.map((day) => {
                        const st = s.dailyStatus[day];
                        let char = '';
                        let colorClass = '';
                        if (st === 'hadir') {
                          char = '•';
                          colorClass = 'text-emerald-700 font-extrabold';
                        } else if (st === 'terlambat') {
                          char = 'T';
                          colorClass = 'text-amber-700 font-bold text-[9px]';
                        } else if (st === 'sakit') {
                          char = 'S';
                          colorClass = 'text-blue-700 font-bold text-[9px]';
                        } else if (st === 'izin') {
                          char = 'I';
                          colorClass = 'text-purple-700 font-bold text-[9px]';
                        } else if (st === 'alpa') {
                          char = 'A';
                          colorClass = 'text-rose-700 font-bold text-[9px]';
                        }
                        return (
                          <td key={day} className={`border border-slate-800 py-0.5 ${colorClass}`}>
                            {char}
                          </td>
                        );
                      })}
                      <td className="border border-slate-800 py-1 font-bold text-emerald-800 bg-emerald-50/30">
                        {s.hadir}
                      </td>
                      <td className="border border-slate-800 py-1 font-semibold text-amber-800 bg-amber-50/30">
                        {s.terlambat}
                      </td>
                      <td className="border border-slate-800 py-1 text-blue-800 bg-blue-50/30">
                        {s.sakit}
                      </td>
                      <td className="border border-slate-800 py-1 text-purple-800 bg-purple-50/30">
                        {s.izin}
                      </td>
                      <td className="border border-slate-800 py-1 text-rose-800 bg-rose-50/30">
                        {s.alpa}
                      </td>
                      <td className="border border-slate-800 py-1 font-bold font-mono">
                        {s.attendancePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200 pt-2">
              <div className="flex items-center gap-4">
                <span><strong>Keterangan:</strong></span>
                <span>• : Hadir Tepat Waktu</span>
                <span>T : Terlambat</span>
                <span>S : Sakit</span>
                <span>I : Izin</span>
                <span>A : Alpa (Tanpa Keterangan)</span>
              </div>
              <div>
                <span>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold text-slate-900 mt-0.5">Kepala Sekolah {school.name}</p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-950 uppercase">{school.principalName}</p>
                <p className="text-slate-600 font-mono">NIP. {school.principalNip}</p>
              </div>

              <div>
                <p>{school.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-semibold text-slate-900 mt-0.5">Guru Kelas / Wali Kelas</p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-950 uppercase">{teacher.name}</p>
                <p className="text-slate-600 font-mono">NIP. {teacher.nip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
