'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAppMode } from './ModeContext';

export interface CompanyScope {
  id: string;
  name: string;
  code: string;
  taxId: string;
}

export interface DepartmentScope {
  id: string;
  companyId: string;
  name: string;
  code: string;
}

export type ScopeRoleTier = 'developer' | 'admin' | 'supervisor';

export const MASTER_COMPANIES: CompanyScope[] = [
  {
    id: 'comp-01',
    name: 'PT Nusantara Teknologi Cipta Tbk (HQ Jakarta)',
    code: 'NTC-HQ',
    taxId: '01.345.678.9-012.000',
  },
  {
    id: 'comp-02',
    name: 'PT Nusantara Logistik Semesta (Surabaya Branch)',
    code: 'NLS-SUB',
    taxId: '02.987.654.3-054.000',
  },
];

export const MASTER_DEPARTMENTS: DepartmentScope[] = [
  // Departments under PT Nusantara Teknologi Cipta Tbk
  { id: 'dept-01', companyId: 'comp-01', name: 'Finance, AP & Tax', code: 'FIN' },
  { id: 'dept-02', companyId: 'comp-01', name: 'Enterprise IT & Security', code: 'IT' },
  { id: 'dept-03', companyId: 'comp-01', name: 'Accounts Payable Operation', code: 'AP' },
  { id: 'dept-04', companyId: 'comp-01', name: 'Risk Management & Audit', code: 'AUD' },
  { id: 'dept-05', companyId: 'comp-01', name: 'Procurement & Vendor Management', code: 'PROC' },
  { id: 'dept-06', companyId: 'comp-01', name: 'Legal & Corporate Governance', code: 'LEG' },

  // Departments under PT Nusantara Logistik Semesta
  { id: 'dept-07', companyId: 'comp-02', name: 'Operations & Fleet Logistics', code: 'OPS' },
  { id: 'dept-08', companyId: 'comp-02', name: 'Warehouse & Inventory Control', code: 'WH' },
  { id: 'dept-09', companyId: 'comp-02', name: 'Finance & Invoicing', code: 'FIN-LOG' },
  { id: 'dept-10', companyId: 'comp-02', name: 'Vendor Dispatch Management', code: 'DISP' },
];

export interface ScopeContextValue {
  roleTier: ScopeRoleTier;
  canChangeCompany: boolean;
  canChangeDepartment: boolean;
  allowedCompanies: CompanyScope[];
  allowedDepartments: DepartmentScope[];
  activeCompanyId: string; // 'all' or company.id
  activeDepartmentId: string; // 'all' or department.id
  activeCompany: CompanyScope | null;
  activeDepartment: DepartmentScope | null;
  setActiveCompanyId: (id: string) => void;
  setActiveDepartmentId: (id: string) => void;
  resetScope: () => void;
}

const ScopeContext = createContext<ScopeContextValue | undefined>(undefined);

const STORAGE_KEY_COMPANY = 'dokumenai_scope_company';
const STORAGE_KEY_DEPARTMENT = 'dokumenai_scope_department';

export const ScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppMode();

  // Resolve Role Tier: Developer (global), Admin (company), Supervisor (department)
  const roleTier: ScopeRoleTier = useMemo(() => {
    if (!user) return 'admin';
    const r = user.role.toLowerCase();
    if (r === 'developer' || r === 'dev' || r.includes('developer')) return 'developer';
    if (r === 'super_admin' || r === 'admin' || r === 'enterprise_member' || r.includes('admin')) return 'admin';
    return 'supervisor'; // finance_supervisor, document_reviewer, auditor, etc.
  }, [user]);

  const canChangeCompany = roleTier === 'developer';
  const canChangeDepartment = roleTier === 'developer' || roleTier === 'admin';

  // Allowed Companies based on Tier
  const allowedCompanies = useMemo(() => {
    if (roleTier === 'developer') return MASTER_COMPANIES;
    // Default assigned company is Company 1 (HQ)
    return [MASTER_COMPANIES[0]];
  }, [roleTier]);

  // Active Company ID
  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY_COMPANY);
      if (saved && (saved === 'all' || MASTER_COMPANIES.some((c) => c.id === saved))) {
        return saved;
      }
    }
    return MASTER_COMPANIES[0].id;
  });

  // Allowed Departments based on active company
  const allowedDepartments = useMemo(() => {
    if (activeCompanyId === 'all') {
      return MASTER_DEPARTMENTS;
    }
    const deptsInCompany = MASTER_DEPARTMENTS.filter((d) => d.companyId === activeCompanyId);
    if (roleTier === 'supervisor' && user?.department) {
      // Supervisor locked to specific department matching user profile or first matching
      const userDept = deptsInCompany.find(
        (d) => d.name.toLowerCase() === user.department.toLowerCase()
      );
      return userDept ? [userDept] : [deptsInCompany[0]];
    }
    return deptsInCompany;
  }, [activeCompanyId, roleTier, user?.department]);

  // Active Department ID
  const [activeDepartmentId, setActiveDepartmentIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY_DEPARTMENT);
      if (saved) return saved;
    }
    return 'all';
  });

  // Cascade department when company changes
  const setActiveCompanyId = useCallback((newCompId: string) => {
    setActiveCompanyIdState(newCompId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_COMPANY, newCompId);
    }

    // Cascade validate department
    setActiveDepartmentIdState((prevDeptId) => {
      if (prevDeptId === 'all') return 'all';
      const isValidInNewCompany = MASTER_DEPARTMENTS.some(
        (d) => (newCompId === 'all' || d.companyId === newCompId) && d.id === prevDeptId
      );
      const nextDept = isValidInNewCompany ? prevDeptId : 'all';
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_DEPARTMENT, nextDept);
      }
      return nextDept;
    });
  }, []);

  const setActiveDepartmentId = useCallback((newDeptId: string) => {
    setActiveDepartmentIdState(newDeptId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_DEPARTMENT, newDeptId);
    }
  }, []);

  const resetScope = useCallback(() => {
    const defaultComp = allowedCompanies[0]?.id || MASTER_COMPANIES[0].id;
    setActiveCompanyId(roleTier === 'developer' ? 'all' : defaultComp);
    setActiveDepartmentId('all');
  }, [allowedCompanies, roleTier, setActiveCompanyId, setActiveDepartmentId]);

  // Enforce tier lock if user changes
  useEffect(() => {
    if (roleTier === 'supervisor') {
      const lockedComp = MASTER_COMPANIES[0].id;
      setActiveCompanyIdState(lockedComp);
      const matchedDept = MASTER_DEPARTMENTS.find(
        (d) => d.companyId === lockedComp && d.name.toLowerCase() === (user?.department || '').toLowerCase()
      ) || MASTER_DEPARTMENTS.find((d) => d.companyId === lockedComp);
      if (matchedDept) {
        setActiveDepartmentIdState(matchedDept.id);
      }
    } else if (roleTier === 'admin') {
      if (activeCompanyId === 'all') {
        setActiveCompanyIdState(MASTER_COMPANIES[0].id);
      }
    }
  }, [roleTier, user?.department]);

  const activeCompany = useMemo(() => {
    return MASTER_COMPANIES.find((c) => c.id === activeCompanyId) || null;
  }, [activeCompanyId]);

  const activeDepartment = useMemo(() => {
    return MASTER_DEPARTMENTS.find((d) => d.id === activeDepartmentId) || null;
  }, [activeDepartmentId]);

  return (
    <ScopeContext.Provider
      value={{
        roleTier,
        canChangeCompany,
        canChangeDepartment,
        allowedCompanies,
        allowedDepartments,
        activeCompanyId,
        activeDepartmentId,
        activeCompany,
        activeDepartment,
        setActiveCompanyId,
        setActiveDepartmentId,
        resetScope,
      }}
    >
      {children}
    </ScopeContext.Provider>
  );
};

export const useAppScope = (): ScopeContextValue => {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error('useAppScope must be used within a ScopeProvider');
  }
  return context;
};

