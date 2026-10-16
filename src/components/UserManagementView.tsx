import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit2,
  Filter,
  KeyRound,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { dbService } from '../services/database';
import { KEMANTREN_LIST } from '../services/kemantrenData';
import { Kelurahan, User as UserType, UserRole } from '../types';

interface UserManagementViewProps {
  users: UserType[];
  kelurahanList: Kelurahan[];
  currentUser: UserType;
  onRefresh: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  kelurahanList,
  currentUser,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // List filter state
  const [searchFilter, setSearchFilter] = useState('');
  const [kemantrenFilter, setKemantrenFilter] = useState('all');

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('PETUGAS_TPK');
  const [modalKemantren, setModalKemantren] = useState<string>(KEMANTREN_LIST[0]);
  const [kelurahanId, setKelurahanId] = useState<number | null>(kelurahanList[0]?.id || null);
  const [noHp, setNoHp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('PETUGAS_TPK');
    const firstKel = kelurahanList[0];
    setModalKemantren(firstKel?.kemantren || KEMANTREN_LIST[0]);
    setKelurahanId(firstKel?.id || null);
    setNoHp('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: UserType) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(''); // leave blank to keep old password
    setFullName(u.full_name);
    setRole(u.role);
    const assignedKel = kelurahanList.find(k => k.id === u.kelurahan_id);
    setModalKemantren(assignedKel?.kemantren || KEMANTREN_LIST[0]);
    setKelurahanId(u.kelurahan_id);
    setNoHp(u.no_hp);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingUser) {
      const res = dbService.updateUser(
        editingUser.id,
        {
          full_name: fullName,
          role,
          kelurahan_id: role === 'ADMIN' ? null : kelurahanId,
          no_hp: noHp,
          passwordPlain: password.trim() ? password.trim() : undefined,
        },
        currentUser
      );

      if (res.success) {
        setModalOpen(false);
        onRefresh();
      } else {
        setFormError(res.error || 'Gagal mengubah pengguna.');
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setFormError('Username dan kata sandi wajib diisi.');
        return;
      }

      const res = dbService.createUser(
        {
          username,
          passwordPlain: password,
          full_name: fullName,
          role,
          kelurahan_id: role === 'ADMIN' ? null : kelurahanId,
          no_hp: noHp,
        },
        currentUser
      );

      if (res.success) {
        setModalOpen(false);
        onRefresh();
      } else {
        setFormError(res.error || 'Gagal membuat pengguna.');
      }
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (window.confirm(`Hapus pengguna ${name}? Akses login pengguna ini akan dicabut.`)) {
      const res = dbService.deleteUser(id, currentUser);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.error || 'Gagal menghapus pengguna.');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = u.full_name.toLowerCase().includes(q);
        const matchesUser = u.username.toLowerCase().includes(q);
        const matchesKel = (u.kelurahan_nama || '').toLowerCase().includes(q);
        const matchesKem = (u.kemantren_nama || '').toLowerCase().includes(q);
        if (!matchesName && !matchesUser && !matchesKel && !matchesKem) return false;
      }
      if (kemantrenFilter !== 'all') {
        if (u.role === 'ADMIN') return false;
        if ((u.kemantren_nama || '').toLowerCase() !== kemantrenFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [users, searchFilter, kemantrenFilter]);

  const availableModalKelurahans = useMemo(() => {
    return kelurahanList.filter(k => k.kemantren.toLowerCase() === modalKemantren.toLowerCase());
  }, [kelurahanList, modalKemantren]);

  const handleModalKemantrenChange = (newKem: string) => {
    setModalKemantren(newKem);
    const inKem = kelurahanList.filter(k => k.kemantren.toLowerCase() === newKem.toLowerCase());
    if (inKem.length > 0) {
      setKelurahanId(inKem[0].id);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Akun &amp; Petugas TPK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola hak akses pengguna, penugasan 14 Kemantren &amp; 45 Kelurahan se-Kota Yogyakarta
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Akun Petugas</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama petugas, username, atau wilayah..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={kemantrenFilter}
            onChange={e => setKemantrenFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Wilayah Tugas (14 Kemantren)</option>
            {KEMANTREN_LIST.map(kem => (
              <option key={kem} value={kem}>
                Kemantren {kem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Lengkap &amp; Username</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Wilayah Tugas (Kemantren &amp; Kelurahan)</th>
                <th className="py-3 px-4">Nomor HP</th>
                <th className="py-3 px-4">Keamanan Sandi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'ADMINISTRATOR' : 'PETUGAS TPK'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {u.role === 'ADMIN' ? (
                      <span className="text-slate-400 italic">Semua Wilayah (Pusat Kota Yogyakarta)</span>
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-900">Kel. {u.kelurahan_nama || '-'}</div>
                        {u.kemantren_nama && (
                          <div className="text-[10px] text-teal-700 font-medium">
                            Kemantren {u.kemantren_nama}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                    {u.no_hp || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    <span className="text-emerald-700 font-semibold">Bcrypt Hashed</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        title="Edit Pengguna"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.full_name)}
                          title="Hapus Pengguna"
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? `Edit Pengguna @${editingUser.username}` : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati, A.Md.Keb"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  placeholder="Contoh: petugas_sukamaju"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Ganti Password (Kosongkan jika tidak diganti)' : 'Password *'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Password akan di-hash secara otomatis menggunakan Bcrypt salt tingkat tinggi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="PETUGAS_TPK">PETUGAS_TPK</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor HP (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={noHp}
                    onChange={e => setNoHp(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {role === 'PETUGAS_TPK' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Penugasan Wilayah Kerja
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        1. Kemantren (14 Wilayah) *
                      </label>
                      <select
                        value={modalKemantren}
                        onChange={e => handleModalKemantrenChange(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-teal-900 focus:ring-2 focus:ring-teal-600"
                      >
                        {KEMANTREN_LIST.map(kem => (
                          <option key={kem} value={kem}>
                            Kemantren {kem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        2. Kelurahan (45 Wilayah) *
                      </label>
                      <select
                        value={kelurahanId || ''}
                        onChange={e => setKelurahanId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                      >
                        {availableModalKelurahans.map(k => (
                          <option key={k.id} value={k.id}>
                            Kel. {k.nama}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-teal-700 mt-0.5">
                        {availableModalKelurahans.length} kelurahan di Kem. {modalKemantren}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
