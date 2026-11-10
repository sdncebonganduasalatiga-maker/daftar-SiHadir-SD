import React, { useState } from 'react';
import { Student, SchoolProfile } from '../types';
import { Printer, X, CreditCard, Sparkles, User } from 'lucide-react';

interface StudentCardsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: SchoolProfile;
}

// Generate simple SVG barcode bars for visual fidelity and printable crispness
const BarcodeSvg: React.FC<{ code: string }> = ({ code }) => {
  // Deterministic pattern from string digits
  const bars: { width: number; space: number }[] = [];
  for (let i = 0; i < code.length; i++) {
    const val = (code.charCodeAt(i) % 4) + 1;
    bars.push({ width: val, space: (code.charCodeAt(i) % 3) + 1 });
  }

  return (
    <div className="flex flex-col items-center">
      <svg className="w-36 h-10" viewBox="0 0 120 36">
        <rect x="0" y="0" width="120" height="36" fill="white" />
        {/* Guard bars */}
        <rect x="6" y="2" width="2" height="32" fill="black" />
        <rect x="10" y="2" width="2" height="32" fill="black" />
        {/* Data bars */}
        {bars.map((bar, idx) => {
          const x = 16 + idx * 8;
          return (
            <React.Fragment key={idx}>
              <rect x={x} y="2" width={bar.width} height="28" fill="black" />
            </React.Fragment>
          );
        })}
        {/* End guard */}
        <rect x="108" y="2" width="2" height="32" fill="black" />
        <rect x="112" y="2" width="2" height="32" fill="black" />
      </svg>
      <span className="font-mono text-[10px] tracking-widest text-slate-800 font-bold -mt-0.5">
        *{code}*
      </span>
    </div>
  );
};

export const StudentCardsPrintModal: React.FC<StudentCardsPrintModalProps> = ({
  isOpen,
  onClose,
  students,
  school,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');

  if (!isOpen) return null;

  const classes = Array.from(new Set(students.map((s) => s.className)));
  const filteredStudents =
    selectedClass === 'Semua'
      ? students
      : students.filter((s) => s.className === selectedClass);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Cetak Kartu Pelajar Barcode Siswa
            </h2>
            <p className="text-xs text-slate-300">
              Cetak kartu presensi barcode untuk dikalungkan / dibawa siswa saat masuk sekolah
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu ({filteredStudents.length})
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

        {/* Printable Cards Grid */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col printable-card relative"
                style={{ pageBreakInside: 'avoid' }}
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                      SD
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-tight leading-tight">
                        {school.name}
                      </h4>
                      <p className="text-[10px] text-emerald-100 font-mono">
                        NPSN: {school.npsn} &bull; T.A: {school.academicYear}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-900 uppercase">
                    KARTU PRESENSI
                  </span>
                </div>

                {/* Body Card */}
                <div className="p-4 flex gap-4 items-center flex-1">
                  {/* Photo */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                    {std.avatarUrl ? (
                      <img
                        src={std.avatarUrl}
                        alt={std.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1 text-xs">
                    <h5 className="font-extrabold text-slate-900 text-sm truncate">
                      {std.name}
                    </h5>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <span className="text-slate-500">NISN</span>
                      <span className="col-span-2 font-mono font-bold text-slate-800">
                        : {std.nisn}
                      </span>

                      <span className="text-slate-500">NIS</span>
                      <span className="col-span-2 font-mono text-slate-700">
                        : {std.nis}
                      </span>

                      <span className="text-slate-500">Kelas</span>
                      <span className="col-span-2 font-semibold text-slate-800">
                        : {std.className}
                      </span>

                      <span className="text-slate-500">Wali</span>
                      <span className="col-span-2 truncate text-slate-700">
                        : {std.parentName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barcode Footer */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-center">
                    <BarcodeSvg code={std.nisn} />
                  </div>
                  <div className="text-[9px] text-slate-400 text-right leading-tight max-w-[100px]">
                    Scan saat tiba & pulang di gerbang sekolah
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
