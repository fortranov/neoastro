"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { getPlanLabel, getPlanColor, formatDate, getErrorMessage } from "@/lib/utils";

interface AdminUser {
  id: number;
  email: string;
  username: string;
  plan_type: "trial" | "basic" | "pro";
  is_blocked: boolean;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId?: number; username?: string }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState<{ open: boolean; user?: AdminUser }>({ open: false });
  const [editForm, setEditForm] = useState({ plan_type: "trial", is_blocked: false, is_admin: false });
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, limit: 20, search: search || undefined });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openEdit = (user: AdminUser) => {
    setEditForm({
      plan_type: user.plan_type,
      is_blocked: user.is_blocked,
      is_admin: user.is_admin,
    });
    setEditModal({ open: true, user });
  };

  const handleEdit = async () => {
    if (!editModal.user) return;
    setEditLoading(true);
    try {
      await adminApi.updateUser(editModal.user.id, {
        plan_type: editForm.plan_type as "trial" | "basic" | "pro",
        is_blocked: editForm.is_blocked,
        is_admin: editForm.is_admin,
      });
      setEditModal({ open: false });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.userId) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteModal.userId);
      setDeleteModal({ open: false });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleBlock = async (user: AdminUser) => {
    try {
      await adminApi.updateUser(user.id, { is_blocked: !user.is_blocked });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Пользователи</h1>
        <p className="text-gray-400 mt-1">Управление аккаунтами пользователей</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-gray-400 mt-1">Всего</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-green-400">
            {users.filter((u) => !u.is_blocked).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Активных</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-red-400">
            {users.filter((u) => u.is_blocked).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Заблокированных</div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Поиск по email или username..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Найти</Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
          >
            Сбросить
          </Button>
        )}
      </form>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Тариф
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Загрузка...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.username}</span>
                          {user.is_admin && (
                            <span className="text-xs px-1.5 py-0.5 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-600/30">
                              Админ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{user.email}</span>
                        <span className="text-xs text-gray-500">
                          {user.email_verified ? "✓ Verified" : "✗ Not verified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPlanColor(user.plan_type)}`}>
                        {getPlanLabel(user.plan_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          user.is_blocked
                            ? "bg-red-900/30 text-red-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {user.is_blocked ? "Заблокирован" : "Активен"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(user)}
                        >
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_blocked ? "secondary" : "ghost"}
                          onClick={() => toggleBlock(user)}
                          className={user.is_blocked ? "text-green-400" : "text-orange-400 hover:text-orange-300"}
                        >
                          {user.is_blocked ? "Разблокировать" : "Блокировать"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setDeleteModal({ open: true, userId: user.id, username: user.username })
                          }
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Edit modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title={`Редактировать: ${editModal.user?.username}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal({ open: false })} disabled={editLoading}>
              Отмена
            </Button>
            <Button onClick={handleEdit} loading={editLoading}>
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Тарифный план</label>
            <select
              value={editForm.plan_type}
              onChange={(e) => setEditForm((p) => ({ ...p, plan_type: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-white text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="trial" className="bg-[#1a1035]">Пробный</option>
              <option value="basic" className="bg-[#1a1035]">Базовый</option>
              <option value="pro" className="bg-[#1a1035]">Про</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-gray-300">Заблокирован</span>
            <button
              onClick={() => setEditForm((p) => ({ ...p, is_blocked: !p.is_blocked }))}
              className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors ${
                editForm.is_blocked ? "bg-red-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  editForm.is_blocked ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-gray-300">Администратор</span>
            <button
              onClick={() => setEditForm((p) => ({ ...p, is_admin: !p.is_admin }))}
              className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors ${
                editForm.is_admin ? "bg-yellow-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  editForm.is_admin ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${deleteModal.username}"? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        loading={deleteLoading}
      />
    </div>
  );
}
