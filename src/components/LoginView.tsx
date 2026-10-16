import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  KeyRound,
  LogIn,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { dbService } from '../services/database';
import { User as UserType } from '../types';
import { LogoPemkotJogja } from './LogoPemkotJogja';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = dbService.login(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Login gagal.');
      }
    }, 200);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
    const res = dbService.login(u, p);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <LogoPemkotJogja className="w-20 h-26 drop-shadow-md transition-transform duration-300 hover:scale-105" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            SISTEM PENDATAAN TPK
          </h1>
          <p className="text-xs sm:text-sm text-teal-800 font-semibold">
            Pemerintah Kota Yogyakarta
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Tim Pendamping Keluarga · Intervensi Stunting CATIN, BUFAS, dan BUMIL
          </p>
        </div>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-xl rounded-2xl border border-slate-200 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
            </button>
          </form>

          {/* Quick Login / Demo Accounts */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider text-center">
              Pilih Akun Demo Cepat (1-Klik):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-teal-900">ADMIN</span>
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Semua data &amp; backup</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('petugas1', 'tpk123')}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-teal-900">PETUGAS TPK</span>
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Kelurahan Sukamaju</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Keamanan terenkripsi Bcrypt · Data Terstandar BKKBN</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
