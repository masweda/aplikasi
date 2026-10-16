import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Database,
  FileSpreadsheet,
  HelpCircle,
  LogOut,
  Menu,
  Plus,
  Shield,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { User } from '../types';
import { LogoPemkotJogja } from './LogoPemkotJogja';

interface NavbarProps {
  currentUser: User;
  currentTab: 'dashboard' | 'pendataan' | 'laporan' | 'rekapitulasi' | 'audit' | 'users';
  setCurrentTab: (tab: 'dashboard' | 'pendataan' | 'laporan' | 'rekapitulasi' | 'audit' | 'users') => void;
  onOpenCreateModal: () => void;
  onOpenLookerGuide: () => void;
  onOpenBackupModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
  onOpenLookerGuide,
  onOpenBackupModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'dashboard' | 'pendataan' | 'laporan' | 'rekapitulasi' | 'audit' | 'users') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg py-1 px-1.5"
              >
                <LogoPemkotJogja className="w-8 h-10 shrink-0 drop-shadow-xs" />
                <div>
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                    Sistem Pendataan TPK
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                    Tim Pendamping Keluarga · BKKBN
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links (Text with subtle active indicator) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === 'dashboard'
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('pendataan')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === 'pendataan'
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Data Sasaran
              </button>
              <button
                onClick={() => handleNavClick('laporan')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === 'laporan'
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Laporan
              </button>
              <button
                onClick={() => handleNavClick('rekapitulasi')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === 'rekapitulasi'
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Rekapitulasi
              </button>

              {currentUser.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => handleNavClick('audit')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentTab === 'audit'
                        ? 'text-teal-900 bg-teal-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Audit Log
                  </button>
                  <button
                    onClick={() => handleNavClick('users')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentTab === 'users'
                        ? 'text-teal-900 bg-teal-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Kelola Petugas
                  </button>
                </>
              )}
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ Pendataan</span>
              </button>

              <button
                onClick={onOpenLookerGuide}
                title="Panduan Google Looker Studio"
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Looker Studio</span>
              </button>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={onOpenBackupModal}
                  title="Database Backup & SQL"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>Backup DB</span>
                </button>
              )}

              {/* User indicator & Logout */}
              <div className="hidden sm:flex items-center pl-2 ml-1 border-l border-slate-200">
                <div className="text-right mr-2 leading-tight">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                    {currentUser.username}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.kelurahan_nama || 'Petugas'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
            <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">{currentUser.full_name}</p>
                <p className="text-[11px] text-slate-500">
                  {currentUser.role === 'ADMIN' ? 'Koordinator / Administrator' : `Petugas TPK · ${currentUser.kelurahan_nama || 'Kelurahan'}`}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-red-600 font-medium px-2 py-1 bg-red-50 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                currentTab === 'dashboard' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Dashboard Statistik
            </button>

            <button
              onClick={() => handleNavClick('pendataan')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                currentTab === 'pendataan' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Sasaran (CATIN / BUFAS / BUMIL)
            </button>

            <button
              onClick={() => handleNavClick('laporan')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                currentTab === 'laporan' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Dashboard Laporan (Harian/Mingguan/Bulanan)
            </button>

            <button
              onClick={() => handleNavClick('rekapitulasi')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                currentTab === 'rekapitulasi' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Rekapitulasi Wilayah
            </button>

            {currentUser.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => handleNavClick('audit')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                    currentTab === 'audit' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Audit Log Aktivitas
                </button>

                <button
                  onClick={() => handleNavClick('users')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                    currentTab === 'users' ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Manajemen Petugas & Akun
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBackupModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left text-slate-700 hover:bg-slate-50"
                >
                  <Database className="w-4 h-4" />
                  Backup & Database Dump (.sql/.json)
                </button>
              </>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookerGuide();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left text-blue-700 bg-blue-50/50"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Panduan Google Looker Studio
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Quick Navigation Bar (Field Friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentTab('pendataan')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors ${
            currentTab === 'pendataan' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Sasaran</span>
        </button>
        <button
          onClick={onOpenCreateModal}
          className="flex flex-col items-center gap-0.5 py-1 px-3 bg-teal-700 text-white rounded-full -mt-4 shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-bold">Input</span>
        </button>
        <button
          onClick={() => setCurrentTab('rekapitulasi')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors ${
            currentTab === 'rekapitulasi' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rekap</span>
        </button>
        {currentUser.role === 'ADMIN' ? (
          <button
            onClick={() => setCurrentTab('audit')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors ${
              currentTab === 'audit' ? 'text-teal-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Audit</span>
          </button>
        ) : (
          <button
            onClick={onOpenLookerGuide}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-medium text-slate-500"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Looker</span>
          </button>
        )}
      </div>
    </>
  );
};
