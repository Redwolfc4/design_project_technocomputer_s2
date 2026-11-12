import { RBACMember } from '@/types';
import { INITIAL_RBAC_USERS } from '@/lib/mocks/rbacUsers';
import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';
import { AuditService } from '../audit/audit.service';

export class MemberService {
  static getMembers(): RBACMember[] {
    if (!isClientEnvironment()) return INITIAL_RBAC_USERS;
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.MEMBERS, INITIAL_RBAC_USERS);
      return INITIAL_RBAC_USERS;
    }
    return safeLocalStorageGet<RBACMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_RBAC_USERS);
  }

  static getMemberById(id: string): RBACMember | undefined {
    return this.getMembers().find((m) => m.id === id);
  }

  static createMember(
    data: Omit<RBACMember, 'id' | 'createdAt'>,
    actorName = 'Admin Sistem'
  ): { success: boolean; member?: RBACMember; error?: string } {
    const members = this.getMembers();
    if (members.some((m) => m.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { success: false, error: 'Email sudah terdaftar dalam sistem.' };
    }

    const newMember: RBACMember = {
      ...data,
      id: `usr-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    members.unshift(newMember);
    safeLocalStorageSet(STORAGE_KEYS.MEMBERS, members);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'MEMBER_CREATED' as any,
      resourceType: 'system' as any,
      resourceId: newMember.id,
      resourceName: newMember.name,
      details: `Menambahkan anggota baru: ${newMember.name} (${newMember.roleTitle}) ke departemen ${newMember.department}`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, member: newMember };
  }

  static updateMember(
    id: string,
    updates: Partial<Omit<RBACMember, 'id' | 'createdAt'>>,
    actorName = 'Admin Sistem'
  ): { success: boolean; member?: RBACMember; error?: string } {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      return { success: false, error: 'Anggota tidak ditemukan.' };
    }

    const prev = members[index];
    const updated: RBACMember = { ...prev, ...updates };
    members[index] = updated;
    safeLocalStorageSet(STORAGE_KEYS.MEMBERS, members);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'MEMBER_UPDATED' as any,
      resourceType: 'system' as any,
      resourceId: updated.id,
      resourceName: updated.name,
      details: `Memperbarui data anggota: ${updated.name}`,
      previousValue: `Peran: ${prev.roleTitle}, Status: ${prev.status}`,
      newValue: `Peran: ${updated.roleTitle}, Status: ${updated.status}`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, member: updated };
  }

  static toggleStatus(id: string, actorName = 'Admin Sistem'): { success: boolean; member?: RBACMember; error?: string } {
    const member = this.getMemberById(id);
    if (!member) return { success: false, error: 'Anggota tidak ditemukan.' };
    const nextStatus = member.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    return this.updateMember(id, { status: nextStatus }, actorName);
  }

  static deleteMember(id: string, actorName = 'Admin Sistem'): { success: boolean; error?: string } {
    const members = this.getMembers();
    const target = members.find((m) => m.id === id);
    if (!target) return { success: false, error: 'Anggota tidak ditemukan.' };

    const filtered = members.filter((m) => m.id !== id);
    safeLocalStorageSet(STORAGE_KEYS.MEMBERS, filtered);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'MEMBER_DELETED' as any,
      resourceType: 'system' as any,
      resourceId: target.id,
      resourceName: target.name,
      details: `Menghapus akses anggota: ${target.name} (${target.email})`,
      status: 'warning',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true };
  }
}

