/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuditLogView } from './components/AuditLogView';
import { DashboardView } from './components/DashboardView';
import { DatabaseBackupModal } from './components/DatabaseBackupModal';
import { DetailModal } from './components/DetailModal';
import { LoginView } from './components/LoginView';
import { LookerStudioModal } from './components/LookerStudioModal';
import { Navbar } from './components/Navbar';
import { PendataanFormModal } from './components/PendataanFormModal';
import { PendataanListView } from './components/PendataanListView';
import { RekapitulasiView } from './components/RekapitulasiView';
import { LaporanView } from './components/LaporanView';
import { UserManagementView } from './components/UserManagementView';
import { dbService } from './services/database';
import {
  AuditLog,
  Kelurahan,
  Pendampingan,
  RekapitulasiRow,
  UnifiedPendampingan,
  User,
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => dbService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pendataan' | 'laporan' | 'rekapitulasi' | 'audit' | 'users'>('dashboard');

  // Database States
  const [data, setData] = useState<UnifiedPendampingan[]>([]);
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [rekapitulasi, setRekapitulasi] = useState<RekapitulasiRow[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UnifiedPendampingan | null>(null);
  const [viewingRecord, setViewingRecord] = useState<UnifiedPendampingan | null>(null);
  const [lookerModalOpen, setLookerModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [initialSasaranFilter, setInitialSasaranFilter] = useState<string>('all');
  const [initialKelurahanFilter, setInitialKelurahanFilter] = useState<string>('all');
  const [initialKemantrenFilter, setInitialKemantrenFilter] = useState<string>('all');

  // Load and refresh state
  const refreshData = React.useCallback(() => {
    setData(dbService.getUnifiedPendampinganList(currentUser));
    setKelurahanList(dbService.getKelurahanList());
    setRekapitulasi(dbService.getRekapitulasi());
    setUsersList(dbService.getUsers());
    setAuditLogs(dbService.getAuditLogs());
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
    const handleDbChanged = () => {
      if (currentUser) {
        refreshData();
      }
    };
    window.addEventListener('db-changed', handleDbChanged);
    return () => {
      window.removeEventListener('db-changed', handleDbChanged);
    };
  }, [currentUser, refreshData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
  };

  const handleNavigateToPendataan = (
    filterSasaran?: string,
    filterKelurahan?: string,
    filterKemantren?: string
  ) => {
    setInitialSasaranFilter(filterSasaran || 'all');
    setInitialKelurahanFilter(filterKelurahan || 'all');
    setInitialKemantrenFilter(filterKemantren || 'all');
    setCurrentTab('pendataan');
  };

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (rec: UnifiedPendampingan) => {
    setEditingRecord(rec);
    setCreateModalOpen(true);
  };

  const handleSavePendampingan = async (
    pendampinganData: Omit<Pendampingan, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
    targetData: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Sesi kedaluwarsa.' };

    let res;
    if (editingRecord) {
      res = dbService.updatePendampingan(editingRecord.id, pendampinganData, targetData, currentUser);
    } else {
      res = dbService.createPendampingan(pendampinganData, targetData, currentUser);
    }

    if (res.success) {
      refreshData();
    }
    return res;
  };

  const handleDeleteRecord = async (id: number) => {
    if (!currentUser) return;
    const res = dbService.deletePendampingan(id, currentUser);
    if (res.success) {
      refreshData();
    } else {
      alert(res.error || 'Gagal menghapus data.');
    }
  };

  // If not logged in, render dedicated Login View
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenLookerGuide={() => setLookerModalOpen(true)}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            data={data}
            kelurahanList={kelurahanList}
            currentUser={currentUser}
            onNavigateToPendataan={handleNavigateToPendataan}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenDetailModal={rec => setViewingRecord(rec)}
          />
        )}

        {currentTab === 'pendataan' && (
          <PendataanListView
            data={data}
            kelurahanList={kelurahanList}
            rekapitulasi={rekapitulasi}
            currentUser={currentUser}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenDetailModal={rec => setViewingRecord(rec)}
            onOpenEditModal={handleOpenEditModal}
            onDeleteRecord={handleDeleteRecord}
            initialSasaranFilter={initialSasaranFilter}
            initialKelurahanFilter={initialKelurahanFilter}
            initialKemantrenFilter={initialKemantrenFilter}
          />
        )}

        {currentTab === 'laporan' && (
          <LaporanView
            data={data}
            kelurahanList={kelurahanList}
            rekapitulasi={rekapitulasi}
            currentUser={currentUser}
            onOpenDetailModal={rec => setViewingRecord(rec)}
          />
        )}

        {currentTab === 'rekapitulasi' && (
          <RekapitulasiView
            rekapitulasi={rekapitulasi}
            data={data}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'audit' && currentUser.role === 'ADMIN' && (
          <AuditLogView logs={auditLogs} currentUser={currentUser} />
        )}

        {currentTab === 'users' && currentUser.role === 'ADMIN' && (
          <UserManagementView
            users={usersList}
            kelurahanList={kelurahanList}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Input / Edit Modal */}
      <PendataanFormModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingRecord(null);
        }}
        kelurahanList={kelurahanList}
        currentUser={currentUser}
        editingRecord={editingRecord}
        onSave={handleSavePendampingan}
      />

      {/* Detail Dossier Modal */}
      <DetailModal
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
        currentUser={currentUser}
        onRecordUpdated={rec => {
          setViewingRecord(rec);
          refreshData();
        }}
        onEdit={rec => {
          setViewingRecord(null);
          handleOpenEditModal(rec);
        }}
      />

      {/* Looker Studio Modal */}
      <LookerStudioModal
        isOpen={lookerModalOpen}
        onClose={() => setLookerModalOpen(false)}
        data={data}
        currentUser={currentUser}
      />

      {/* Database Backup & Django ORM Modal (Admin Only) */}
      {currentUser.role === 'ADMIN' && (
        <DatabaseBackupModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
          currentUser={currentUser}
          onDataRestored={refreshData}
        />
      )}
    </div>
  );
}
