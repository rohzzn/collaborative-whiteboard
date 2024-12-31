
// src/hooks/useUser.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  setName: (name: string) => void;
}

const useUser = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      setName: (name) => set({ name }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUser;