import React, { useState, useEffect } from 'react';
import { UserRole, SchoolProfile, TeacherProfile } from '../types';
import { School, UserCheck, Users, QrCode, Clock, Bell, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  school: SchoolProfile;
  teacher: TeacherProfile;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  school,
  teacher,
  onOpenScanner,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand & School Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 truncate">
                  SiHadir<span className="text-emerald-600">SD</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" /> Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate font-medium">
                {school.name} &bull; NPSN: {school.npsn}
              </p>
            </div>
          </div>

          {/* Time & Date Display (Hidden on very small screens) */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div className="leading-tight">
              <div className="font-semibold text-slate-800">{time}</div>
              <div className="text-[11px] text-slate-500">{date}</div>
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Scan Button (Always accessible) */}
            <button
              onClick={onOpenScanner}
              type="button"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              aria-label="Buka Pemindai Barcode Kamera"
            >
              <QrCode className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pindai Barcode / QR</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => onRoleChange('guru')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'guru'
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Peralihan ke Akun Guru"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Guru</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('orang_tua')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'orang_tua'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Peralihan ke Akun Wali Murid"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Wali Murid</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
