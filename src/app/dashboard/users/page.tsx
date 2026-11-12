'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppScope } from '@/context/ScopeContext';
import { useToast } from '@/context/ToastContext';
import { RBACMember } from '@/types';
import { ALL_AVAILABLE_PERMISSIONS } from '@/lib/mocks/rbacUsers';
import { MemberService } from '@/lib/modules/members/member.service';
import { RBACActionMenu } from '@/components/shared/RBACActionMenu';
import {
  DataTableRow,
  useDataTableInteractions,
  DataTableToolbar,
  DataTablePagination,
  DataTableEmptyState,
  DataTableExport,
  FilterConfig,
} from '@/components/shared/data-table';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/Select';
import {
  SearchIcon,
  XIcon,
  PlusIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
} from '@/components/ui/icons';

export default function UsersManagementPage() {
  const {
    activeCompanyId,
    setActiveCompanyId,
    allowedCompanies,
    canChangeCompany,
    setActiveDepartmentId,
    allowedDepartments,
    canChangeDepartment,
    activeDepartment,
  } = useAppScope();
  const toast = useToast();
  // Master data state
  const [users, setUsers] = useState<RBACMember[]>(() => MemberService.getMembers());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('Semua');
  const [selectedRole, setSelectedRole] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Modal Permission Search & Category Filter state
  const [modalPermSearch, setModalPermSearch] = useState('');
  const [modalPermCategory, setModalPermCategory] = useState('Semua');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<'name' | 'department' | 'roleTitle' | 'status' | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [viewUser, setViewUser] = useState<RBACMember | null>(null);
  const [editUser, setEditUser] = useState<RBACMember | null>(null);
  const [deleteUser, setDeleteUser] = useState<RBACMember | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Active Action Menu interactions (3-dot dropdown hover/click & right-click context menu)
  const {
    activeMenu,
    closeMenu,
    openDropdownMenu,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    cancelScheduledClose,
    scheduleCloseMenu,
    openContextMenu,
  } = useDataTableInteractions<RBACMember>();

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    roleTitle: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    permissions: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Tooltip active ID for permission overflow
  const [hoveredPermId, setHoveredPermId] = useState<string | null>(null);

  // Escape key handler for viewUser modal
  useEffect(() => {
    if (!viewUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewUser(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewUser]);

  // Derived options for filter dropdowns
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => depts.add(u.department));
    return Array.from(depts);
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    users.forEach((u) => roles.add(u.roleTitle));
    return Array.from(roles);
  }, [users]);

  const permMap = useMemo(() => {
    const map = new Map<string, string>();
    ALL_AVAILABLE_PERMISSIONS.forEach((p) => map.set(p.key, p.label));
    return map;
  }, []);

  const permissionCategories = useMemo(() => {
    const cats = new Set<string>();
    ALL_AVAILABLE_PERMISSIONS.forEach((p) => cats.add(p.category));
    return ['Semua', ...Array.from(cats)];
  }, []);

  const filteredModalPermissions = useMemo(() => {
    const q = modalPermSearch.trim().toLowerCase();
    return ALL_AVAILABLE_PERMISSIONS.filter((p) => {
      if (modalPermCategory !== 'Semua' && p.category !== modalPermCategory) return false;
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [modalPermSearch, modalPermCategory]);

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 0. Scope Isolation: Company & Department
      if (activeCompanyId !== 'all') {
        const userComp = user.companyId || 'comp-01';
        if (userComp !== activeCompanyId) return false;
      }
      if (activeDepartment && activeDepartment.id !== 'all') {
        if (user.department.toLowerCase() !== activeDepartment.name.toLowerCase()) {
          return false;
        }
      }

      // 1. Text Search across name, email, department, roleTitle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesDept = user.department.toLowerCase().includes(q);
        const matchesRole = user.roleTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesRole) {
          return false;
        }
      }

      // 2. Department filter
      if (selectedDept !== 'Semua' && user.department !== selectedDept) {
        return false;
      }

      // 3. Role filter
      if (selectedRole !== 'Semua' && user.roleTitle !== selectedRole) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'Semua' && user.status !== selectedStatus) {
        return false;
      }

      // 5. Multi-select Hak Akses (user must have at least one of the selected, or all)
      if (selectedPermissions.length > 0) {
        const hasPermissions = selectedPermissions.every((permKey) => user.permissions.includes(permKey));
        if (!hasPermissions) return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedDept, selectedRole, selectedStatus, selectedPermissions, activeCompanyId, activeDepartment]);

  // Sorting Logic
  const sortedUsers = useMemo(() => {
    if (!sortColumn) return filteredUsers;
    const sorted = [...filteredUsers].sort((a, b) => {
      const valA = (a[sortColumn] || '').toString().toLowerCase();
      const valB = (b[sortColumn] || '').toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortColumn, sortDirection]);

  // Pagination Logic
  const totalItems = sortedUsers.length;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Reset page when filter/search/sort/scope changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedRole, selectedStatus, selectedPermissions, activeCompanyId, activeDepartment, pageSize]);

  // Sort handler
  const handleSort = (column: 'name' | 'department' | 'roleTitle' | 'status') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('Semua');
    setSelectedRole('Semua');
    setSelectedStatus('Semua');
    setSelectedPermissions([]);
    setCurrentPage(1);
    toast.info('Filter berhasil direset ke pengaturan awal.', { title: 'Filter Direset' });
  };

  const isFilterActive =
    Boolean(searchQuery.trim()) ||
    selectedDept !== 'Semua' ||
    selectedRole !== 'Semua' ||
    selectedStatus !== 'Semua' ||
    selectedPermissions.length > 0;

  // Form Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid (contoh: nama@perusahaan.co.id)';
    }
    if (!formData.department.trim()) errors.department = 'Departemen wajib dipilih / diisi';
    if (!formData.roleTitle.trim()) errors.roleTitle = 'Peran sistem wajib diisi';
    if (formData.permissions.length === 0) errors.permissions = 'Pilih minimal 1 hak akses';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      department: uniqueDepartments[0] || 'Enterprise IT & Security',
      roleTitle: uniqueRoles[0] || '',
      status: 'Aktif',
      permissions: ['view_dashboard'],
    });
    setFormErrors({});
    setModalPermSearch('');
    setModalPermCategory('Semua');
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: RBACMember) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      roleTitle: user.roleTitle,
      status: user.status,
      permissions: [...user.permissions],
    });
    setFormErrors({});
    setModalPermSearch('');
    setModalPermCategory('Semua');
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Harap lengkapi seluruh kolom wajib dengan format yang benar.', {
        title: 'Validasi Anggota Gagal',
      });
      return;
    }

    const res = MemberService.createMember({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
      role: 'custom_member',
      roleTitle: formData.roleTitle.trim(),
      status: formData.status,
      permissions: formData.permissions,
    });

    if (!res.success) {
      toast.error(res.error || 'Gagal menambahkan anggota.', { title: 'Gagal Menambahkan Anggota' });
      return;
    }

    setUsers(MemberService.getMembers());
    setIsAddOpen(false);
    toast.success(`Anggota "${formData.name.trim()}" berhasil ditambahkan ke tim RBAC!`, {
      title: 'Anggota Ditambahkan',
    });
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (!validateForm()) {
      toast.error('Harap periksa kembali kolom wajib yang belum valid.', {
        title: 'Validasi Perubahan Gagal',
      });
      return;
    }

    const res = MemberService.updateMember(editUser.id, {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
      roleTitle: formData.roleTitle.trim(),
      status: formData.status,
      permissions: formData.permissions,
    });

    if (!res.success) {
      toast.error(res.error || 'Gagal memperbarui data.', { title: 'Pembaruan Gagal' });
      return;
    }

    setUsers(MemberService.getMembers());
    setEditUser(null);
    toast.success(`Data anggota "${formData.name.trim()}" berhasil diperbarui!`, {
      title: 'Perubahan Disimpan',
    });
  };

  // Delete User
  const handleDeleteConfirm = () => {
    if (!deleteUser) return;
    const res = MemberService.deleteMember(deleteUser.id);
    if (!res.success) {
      toast.error(res.error || 'Gagal menghapus anggota.', { title: 'Penghapusan Gagal' });
      return;
    }
    setUsers(MemberService.getMembers());
    toast.success(`Anggota "${deleteUser.name}" berhasil dihapus dari sistem!`, {
      title: 'Anggota Dihapus',
    });
    setDeleteUser(null);
  };

  // Toggle User Status (Aktif <-> Nonaktif)
  const handleToggleStatus = (targetUser: RBACMember) => {
    const res = MemberService.toggleStatus(targetUser.id);
    if (!res.success) {
      toast.error(res.error || 'Gagal mengubah status.', { title: 'Perubahan Status Gagal' });
      return;
    }
    setUsers(MemberService.getMembers());
    const nextStatus = targetUser.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    toast.success(`Status "${targetUser.name}" berhasil diubah menjadi ${nextStatus}!`, {
      title: 'Status Diperbarui',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport = sortedUsers;
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data anggota untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }
    const headers = ['ID', 'Nama Lengkap', 'Email', 'Departemen', 'Peran Sistem', 'Status', 'Hak Akses', 'Tanggal Dibuat'];
    const rows = dataToExport.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.roleTitle.replace(/"/g, '""')}"`,
      `"${u.status}"`,
      `"${u.permissions.join(', ')}"`,
      `"${u.createdAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_rbac_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${dataToExport.length} data anggota ke berkas CSV!`, {
      title: 'Ekspor CSV Selesai',
    });
  };

  // Export Excel (.xls HTML table readable natively by Excel)
  const handleExportExcel = () => {
    const dataToExport = sortedUsers;
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data anggota untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #4F46E5; color: #FFFFFF; font-weight: bold;">
              <th>ID</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Departemen</th>
              <th>Peran Sistem</th>
              <th>Status</th>
              <th>Hak Akses</th>
              <th>Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            ${dataToExport
        .map(
          (u) => `
              <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.department}</td>
                <td>${u.roleTitle}</td>
                <td>${u.status}</td>
                <td>${u.permissions.join(', ')}</td>
                <td>${u.createdAt}</td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_rbac_users_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${dataToExport.length} data anggota ke berkas Excel (.xls)!`, {
      title: 'Ekspor Excel Selesai',
    });
  };

  // Filter configurations for DataTableToolbar
  const filterConfigs: FilterConfig[] = [
    ...(canChangeCompany
      ? [
          {
            id: 'companyScope',
            label: 'Perusahaan (Scope)',
            type: 'select' as const,
            placeholder: 'Semua Perusahaan',
            options: [
              { label: 'Semua Perusahaan', value: 'all' },
              ...allowedCompanies.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.id })),
            ],
            selectedValue: activeCompanyId,
            onChange: (val: string | string[]) => setActiveCompanyId(val as string),
            searchable: true,
          },
        ]
      : []),
    {
      id: 'department',
      label: 'Departemen',
      type: 'select' as const,
      placeholder: 'Semua Departemen',
      options: [
        { label: 'Semua Departemen', value: 'Semua' },
        ...(canChangeDepartment
          ? allowedDepartments.map((d) => ({ label: d.name, value: d.name }))
          : uniqueDepartments.map((d) => ({ label: d, value: d }))),
      ],
      selectedValue: selectedDept,
      onChange: (val: string | string[]) => setSelectedDept(val as string),
      searchable: true,
    },
    {
      id: 'role',
      label: 'Role Sistem',
      type: 'select',
      placeholder: 'Semua',
      options: [
        { label: 'Semua Role', value: 'Semua' },
        ...uniqueRoles.map((r) => ({ label: r, value: r })),
      ],
      selectedValue: selectedRole,
      onChange: (val) => setSelectedRole(val),
      searchable: true,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Semua',
      options: [
        { label: 'Semua', value: 'Semua' },
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Nonaktif', value: 'Nonaktif' },
      ],
      selectedValue: selectedStatus,
      onChange: (val) => setSelectedStatus(val),
      searchable: true,
    },
    {
      id: 'permissions',
      label: 'Hak Akses',
      type: 'multi-select',
      placeholder: 'Semua Hak Akses',
      options: ALL_AVAILABLE_PERMISSIONS.map((p) => ({
        label: p.label,
        value: p.key,
        category: p.category,
      })),
      selectedValue: selectedPermissions,
      onChange: (vals) => setSelectedPermissions(vals),
      searchable: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Topbar
        title="Pengguna, Peran & Hak Akses Tim"
        subtitle="Kelola izin verifikasi dokumen, tingkat approval keuangan, dan akun auditor eksternal"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Pengguna, Peran & Hak Akses Tim"
          subtitle="Kelola izin verifikasi dokumen, tingkat approval keuangan, dan akun auditor eksternal."
          badge={{ label: `${users.length} Akun Terdaftar`, variant: 'indigo' }}
          actions={
            <div className="flex items-center gap-3">
              <DataTableExport
                options={{
                  onExportCSV: handleExportCSV,
                  onExportExcel: handleExportExcel,
                  disabled: sortedUsers.length === 0,
                }}
              />
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Tambah Anggota Baru</span>
              </button>
            </div>
          }
        />

        {/* Global Reusable DataTableToolbar */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama, email, departemen, atau role..."
          filters={filterConfigs}
          totalFiltered={filteredUsers.length}
          totalUnfiltered={users.length}
          entityName="anggota"
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
        />

        {/* RBAC Table Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
                  {/* Column 1: Nama Anggota */}
                  <th
                    className="py-3 px-5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nama Anggota</span>
                      <ArrowUpDownIcon
                        className={`w-3.5 h-3.5 ${sortColumn === 'name' ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                      />
                    </div>
                  </th>

                  {/* Column 2: Departemen */}
                  <th
                    className="py-3 px-5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Departemen</span>
                      <ArrowUpDownIcon
                        className={`w-3.5 h-3.5 ${sortColumn === 'department' ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                      />
                    </div>
                  </th>

                  {/* Column 3: Peran Sistem */}
                  <th
                    className="py-3 px-5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    onClick={() => handleSort('roleTitle')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Peran Sistem</span>
                      <ArrowUpDownIcon
                        className={`w-3.5 h-3.5 ${sortColumn === 'roleTitle' ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                      />
                    </div>
                  </th>

                  {/* Column 4: Hak Akses Kunci */}
                  <th className="py-3 px-5">Hak Akses Kunci</th>

                  {/* Column 5: Status */}
                  <th
                    className="py-3 px-5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDownIcon
                        className={`w-3.5 h-3.5 ${sortColumn === 'status' ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                      />
                    </div>
                  </th>

                  {/* Column 6: Aksi */}
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <DataTableEmptyState
                        title="Tidak ada anggota yang cocok"
                        description="Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan kembali data anggota tim."
                        isFilterActive={isFilterActive}
                        onResetFilters={handleResetFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <DataTableRow
                      key={user.id}
                      row={user}
                      onRowDoubleClick={(u) => setViewUser(u)}
                      onRowContextMenu={(u, e) => openContextMenu(u, e, 'Aksi Anggota')}
                    >
                      {/* 1. Nama Anggota */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0F172A]">{user.name}</div>
                        <div className="text-[11px] text-[#64748B]">{user.email}</div>
                      </td>

                      {/* 2. Departemen */}
                      <td className="py-3.5 px-5 font-medium text-[#475569]">
                        {user.department}
                      </td>

                      {/* 3. Peran Sistem */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded text-[11px]">
                          {user.roleTitle}
                        </span>
                      </td>

                      {/* 4. Hak Akses Kunci with Tooltip */}
                      <td className="py-3.5 px-5 text-[11px] text-[#64748B] relative">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span>
                            {user.permissions
                              .slice(0, 3)
                              .map((p) => permMap.get(p) || p)
                              .join(', ')}
                          </span>
                          {user.permissions.length > 3 && (
                            <div className="relative inline-block">
                              <span
                                onMouseEnter={() => setHoveredPermId(user.id)}
                                onMouseLeave={() => setHoveredPermId(null)}
                                className="cursor-pointer text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded hover:bg-indigo-100"
                              >
                                +{user.permissions.length - 3} lainnya
                              </span>

                              {/* Tooltip Content */}
                              {hoveredPermId === user.id && (
                                <div className="absolute left-0 bottom-full mb-1 w-64 p-2.5 bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg shadow-xl text-[10px] z-30 pointer-events-none">
                                  <div className="font-bold text-[#475569] pb-1 border-b border-[#E2E8F0] mb-1.5">
                                    Seluruh Hak Akses:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {user.permissions.map((p) => (
                                      <span key={p} className="bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] font-medium px-1.5 py-0.5 rounded">
                                        {permMap.get(p) || p}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-5">
                        {user.status === 'Aktif' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>AKTIF</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>NONAKTIF</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Aksi Column with 3-Dot Ellipsis */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => openDropdownMenu(user, e, 'Aksi Anggota')}
                            onMouseEnter={(e) => handleButtonMouseEnter(user, e, 'Aksi Anggota')}
                            onMouseLeave={handleButtonMouseLeave}
                            title="Aksi Anggota"
                            className="p-1.5 rounded-lg border border-transparent hover:border-[#CBD5E1] text-slate-500 hover:text-[#4F46E5] hover:bg-[#EEF2FF] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-all"
                          >
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </DataTableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Reusable DataTablePagination Controls */}
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </main>

      {/* ======================================================== */}
      {/* 1. VIEW MODAL (Detail Anggota) */}
      {/* ======================================================== */}
      {viewUser && (
        <Modal
          isOpen={Boolean(viewUser)}
          onClose={() => setViewUser(null)}
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                {viewUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">{viewUser.name}</h3>
                <p className="text-xs text-[#64748B]">{viewUser.email}</p>
              </div>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Departemen</span>
                <p className="font-semibold text-[#0F172A]">{viewUser.department}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Peran Sistem</span>
                <p className="font-semibold text-[#4F46E5]">{viewUser.roleTitle}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Status Akun</span>
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${viewUser.status === 'Aktif'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-slate-600 bg-slate-100 border border-slate-300'
                      }`}
                  >
                    {viewUser.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Tanggal Terdaftar</span>
                <p className="font-semibold text-[#0F172A]">{viewUser.createdAt}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0F172A] block">
                Hak Akses yang Dimiliki ({viewUser.permissions.length}):
              </span>
              <div className="max-h-44 overflow-y-auto p-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50 flex flex-wrap gap-1.5">
                {viewUser.permissions.map((permKey) => {
                  const permDef = ALL_AVAILABLE_PERMISSIONS.find((p) => p.key === permKey);
                  return (
                    <div
                      key={permKey}
                      className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] text-[#334155] shadow-2xs"
                    >
                      <span className="font-semibold">{permDef ? permDef.label : permKey}</span>
                      <span className="text-[9px] text-[#64748B] ml-1">({permKey})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setViewUser(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 2. ADD & EDIT MODAL (Formulir CRUD) */}
      {/* ======================================================== */}
      {(isAddOpen || editUser) && (
        <Modal
          isOpen={Boolean(isAddOpen || editUser)}
          onClose={() => {
            setIsAddOpen(false);
            setEditUser(null);
          }}
          title={editUser ? `Edit Data Anggota: ${editUser.name}` : '+ Tambah Anggota Tim Baru'}
          subtitle="Konfigurasikan informasi akun, profil penugasan, dan hak akses operasional."
          maxWidth="xl"
        >
          <form onSubmit={editUser ? handleEditSubmit : handleAddSubmit} noValidate className="space-y-4">
              {/* Field 1: Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A] block">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Pratama, S.Kom."
                  className="w-full px-3 py-2 bg-[#FAFAFF] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                />
                {formErrors.name && <p className="text-[11px] text-rose-500">{formErrors.name}</p>}
              </div>

              {/* Field 2: Email Perusahaan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A] block">
                  Email Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@nusantara-tech.co.id"
                  className="w-full px-3 py-2 bg-[#FAFAFF] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                />
                {formErrors.email && <p className="text-[11px] text-rose-500">{formErrors.email}</p>}
              </div>

              {/* Field 3 & 4: Departemen & Peran Sistem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <SearchableSelect
                    label="Departemen"
                    required
                    size="sm"
                    allowCustom
                    customOptionPrefix="Gunakan departemen baru:"
                    value={formData.department}
                    onChange={(val) => setFormData({ ...formData, department: val })}
                    placeholder="Pilih atau ketik departemen..."
                    searchPlaceholder="Cari atau tambah departemen..."
                    error={formErrors.department}
                    options={Array.from(
                      new Set([
                        ...uniqueDepartments,
                        ...allowedDepartments.map((d) => d.name),
                        'Finance, AP & Tax',
                        'Enterprise IT & Security',
                        'Internal Audit & Compliance',
                      ])
                    ).map((dept) => ({ value: dept, label: dept }))}
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Peran Sistem"
                    required
                    size="sm"
                    allowCustom
                    customOptionPrefix="Gunakan peran baru:"
                    value={formData.roleTitle}
                    onChange={(val) => setFormData({ ...formData, roleTitle: val })}
                    placeholder="Pilih atau ketik peran..."
                    searchPlaceholder="Cari atau tambah peran..."
                    error={formErrors.roleTitle}
                    options={Array.from(
                      new Set([
                        ...uniqueRoles,
                        'Finance & Tax Supervisor',
                        'Document Specialist',
                        'Compliance Auditor',
                        'Super Admin / CISO',
                        'Senior AP Specialist',
                      ])
                    ).map((role) => ({ value: role, label: role }))}
                  />
                </div>
              </div>

              {/* Field 5: Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A] block">Status Keanggotaan</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      value="Aktif"
                      checked={formData.status === 'Aktif'}
                      onChange={() => setFormData({ ...formData, status: 'Aktif' })}
                      className="text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span className="font-semibold text-emerald-700">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      value="Nonaktif"
                      checked={formData.status === 'Nonaktif'}
                      onChange={() => setFormData({ ...formData, status: 'Nonaktif' })}
                      className="text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span className="font-semibold text-slate-600">Nonaktif</span>
                  </label>
                </div>
              </div>

              {/* Field 6: Hak Akses (Searchable + Category Filtered Multi-select) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F172A] block">
                    Hak Akses Kunci <span className="text-rose-500">*</span> ({formData.permissions.length} dipilih)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          permissions: ALL_AVAILABLE_PERMISSIONS.map((p) => p.key),
                        })
                      }
                      className="text-[10px] text-[#4F46E5] font-semibold hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="text-[10px] text-slate-500 font-semibold hover:underline cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Search + Category Pills for Permissions */}
                <div className="space-y-2">
                  <div className="relative">
                    <SearchIcon className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={modalPermSearch}
                      onChange={(e) => setModalPermSearch(e.target.value)}
                      placeholder="Cari nama, kunci, atau deskripsi hak akses..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                    {modalPermSearch && (
                      <button
                        type="button"
                        onClick={() => setModalPermSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Hapus pencarian hak akses"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {permissionCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setModalPermCategory(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                          modalPermCategory === cat
                            ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/40'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto p-3 rounded-xl border border-[#CBD5E1] bg-[#FAFAFF] grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredModalPermissions.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-xs text-slate-400">
                      Tidak ada hak akses yang cocok dengan pencarian Anda.
                    </div>
                  ) : (
                    filteredModalPermissions.map((perm) => {
                      const checked = formData.permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                            checked
                              ? 'bg-[#EEF2FF] border-indigo-200 text-[#0F172A]'
                              : 'bg-white border-[#E2E8F0] text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [...formData.permissions, perm.key],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: formData.permissions.filter((k) => k !== perm.key),
                                });
                              }
                            }}
                            className="mt-0.5 rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[11px] truncate">{perm.label}</span>
                            </div>
                            <span className="text-[10px] text-[#64748B] line-clamp-1">{perm.desc}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                {formErrors.permissions && <p className="text-[11px] text-rose-500">{formErrors.permissions}</p>}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditUser(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {editUser ? 'Simpan Perubahan' : 'Tambahkan Anggota'}
                </Button>
              </div>
            </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      <ConfirmDialog
        isOpen={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akses Anggota Tim?"
        description={
          deleteUser ? (
            <div className="space-y-3">
              <p>
                Anda akan menghapus akun <strong className="text-rose-600">{deleteUser.name}</strong> ({deleteUser.email}).
                Seluruh hak akses ke dashboard DokumenAI Enterprise akan segera dicabut.
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-0.5">
                <div><strong>Departemen:</strong> {deleteUser.department}</div>
                <div><strong>Peran:</strong> {deleteUser.roleTitle}</div>
              </div>
            </div>
          ) : null
        }
        confirmLabel="Ya, Hapus Anggota"
        cancelLabel="Batal"
        variant="danger"
      />

      {/* Shared Action Menu (Triggered by 3-dot button hover/click or right-click context menu) */}
      {activeMenu && (
        <RBACActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          user={activeMenu.row}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
          onView={(u) => setViewUser(u)}
          onEdit={(u) => openEditModal(u)}
          onToggleStatus={(u) => handleToggleStatus(u)}
          onDelete={(u) => setDeleteUser(u)}
        />
      )}
    </div>
  );
}
