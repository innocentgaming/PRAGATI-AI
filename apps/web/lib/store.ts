import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'MONITORING_OFFICER' | 'MINISTRY_USER' | 'ANALYST' | 'VIEWER';

interface UserState {
  currentUser: {
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
  };
  switchRole: (role: UserRole) => void;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

export const useStore = create<UserState>((set) => ({
  currentUser: {
    name: 'Ananya Sharma',
    email: 'officer@mospi.gov.in',
    role: 'MONITORING_OFFICER',
  },
  switchRole: (role) => {
    const rolesMeta: Record<UserRole, { name: string; email: string }> = {
      ADMIN: { name: 'Dr. Rajesh Verma (Joint Secretary)', email: 'admin@mospi.gov.in' },
      MONITORING_OFFICER: { name: 'Ananya Sharma (Director IPMD)', email: 'officer@mospi.gov.in' },
      MINISTRY_USER: { name: 'Suresh Kumar (Railway Board Advisor)', email: 'ministry@railways.gov.in' },
      ANALYST: { name: 'Pooja Nair (Senior Data Scientist)', email: 'analyst@mospi.gov.in' },
      VIEWER: { name: 'SIH Evaluation Judge', email: 'judge@sih.gov.in' }
    };
    set({
      currentUser: {
        name: rolesMeta[role].name,
        email: rolesMeta[role].email,
        role: role
      }
    });
  },
  isDemoMode: true,
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode }))
}));

