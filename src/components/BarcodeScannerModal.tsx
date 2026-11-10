import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Student, SchoolProfile } from '../types';
import { parseBarcodePayload, determineStatusByTime } from '../utils/attendance';
import { sound } from '../utils/sound';
import {
  X,
  Camera,
  CameraOff,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Keyboard,
  User,
  Clock,
  Send,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: SchoolProfile;
  onRecordAttendance: (student: Student, checkInTime: string, status: 'hadir' | 'terlambat') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  school,
  onRecordAttendance,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [lastScannedStudent, setLastScannedStudent] = useState<{
    student: Student;
    time: string;
    status: 'hadir' | 'terlambat';
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5-qr-reader-container';
  const lastScanTimestamp = useRef<number>(0);
  const lastScannedId = useRef<string | null>(null);

  // Initialize camera scanner when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLastScannedStudent(null);
      setFeedbackMessage(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        // Wait for DOM element
        await new Promise((r) => setTimeout(r, 200));

        const element = document.getElementById(readerElementId);
        if (!element || !isMounted) return;

        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
          verbose: false,
        });

        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCodeScanned(decodedText);
          },
          () => {
            // scan failure callback (silent, fires every frame no code is found)
          }
        );

        if (isMounted) {
          setCameraActive(true);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('Camera access note:', err);
          setCameraActive(false);
          const errorMsg =
            err instanceof Error
              ? err.message
              : 'Kamera tidak terdeteksi atau izin belum diberikan.';
          setCameraError(
            `${errorMsg}. Anda tetap dapat menggunakan mode input barcode/NISN manual di bawah ini.`
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
            setCameraActive(false);
          });
      } else {
        scannerRef.current.clear();
        scannerRef.current = null;
        setCameraActive(false);
      }
    }
  };

  const handleCodeScanned = (rawCode: string) => {
    const now = Date.now();
    // Cooldown check (prevent repeated triggers within 2.5 seconds for same student)
    if (now - lastScanTimestamp.current < 2500 && lastScannedId.current === rawCode) {
      return;
    }

    lastScanTimestamp.current = now;
    lastScannedId.current = rawCode;

    const result = parseBarcodePayload(rawCode, students);

    if (!result.found || !result.student) {
      sound.playWarning();
      setFeedbackMessage({
        type: 'error',
        text: `Barcode / QR [${rawCode}] tidak terdaftar dalam database siswa.`,
      });
      return;
    }

    processAttendanceRecord(result.student);
  };

  const processAttendanceRecord = (student: Student) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const status = determineStatusByTime(timeStr, school.lateCutoffTime);

    sound.playSuccess();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }

    onRecordAttendance(student, timeStr, status);

    setLastScannedStudent({
      student,
      time: timeStr,
      status,
    });

    setFeedbackMessage({
      type: 'success',
      text: `Presensi ${student.name} berhasil dicatat (${status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}).`,
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeScanned(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="scanner-dialog-title" className="text-base font-bold tracking-tight">
                Pemindai Barcode / QR Siswa
              </h2>
              <p className="text-xs text-emerald-100">
                Arahkan barcode kartu pelajar atau masukkan NISN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            aria-label="Tutup Pemindai"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 space-y-5">
          {/* Camera Viewport Container */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border-2 border-slate-200 shadow-inner">
            {/* HTML5 QR container */}
            <div
              id={readerElementId}
              className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            />

            {/* Target Reticle Overlay when active */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400 rounded-2xl relative shadow-lg shadow-emerald-500/20">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />

                  {/* Animated laser line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
            )}

            {/* Camera Inactive / Permission State */}
            {!cameraActive && (
              <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-6 text-center">
                <CameraOff className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-200">
                  {cameraError ? 'Kamera Belum Terhubung' : 'Menghubungkan Kamera...'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {cameraError || 'Pastikan izin akses kamera diizinkan oleh peramban.'}
                </p>
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4" /> Gunakan simulasi scan di bawah
                </div>
              </div>
            )}
          </div>

          {/* Scanned Student Result Flashcard */}
          {lastScannedStudent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-200 shrink-0 border-2 border-white shadow-xs">
                {lastScannedStudent.student.avatarUrl ? (
                  <img
                    src={lastScannedStudent.student.avatarUrl}
                    alt={lastScannedStudent.student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-3 text-emerald-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      lastScannedStudent.status === 'hadir'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {lastScannedStudent.status === 'hadir' ? 'Tepat Waktu' : 'Terlambat'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {lastScannedStudent.time} WIB
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base truncate mt-0.5">
                  {lastScannedStudent.student.name}
                </h3>
                <p className="text-xs text-slate-600">
                  NISN: <span className="font-mono">{lastScannedStudent.student.nisn}</span> &bull;{' '}
                  {lastScannedStudent.student.className}
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Feedback message (error/warning) */}
          {feedbackMessage && feedbackMessage.type !== 'success' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Manual Barcode / NISN Input Form (Acts like USB scanner or manual typing) */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label htmlFor="manual-barcode-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Input Barcode / NISN Manual (Atau Gunakan Barcode Scanner USB)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="manual-barcode-input"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Contoh: 0158492001 atau tempel barcode..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> Pindai
              </button>
            </div>
          </form>

          {/* Quick Simulation Bar for Easy Testing */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Klik Cepat Kartu Siswa (Uji Coba Presensi):
              </span>
              <span className="text-[11px] text-slate-400">Total: {students.length} Siswa</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {students.map((std) => (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => processAttendanceRecord(std)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  title={`NISN: ${std.nisn}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[120px]">{std.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Batas Masuk: <strong className="text-slate-800">{school.lateCutoffTime} WIB</strong>
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
