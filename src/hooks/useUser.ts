// src/hooks/useUser.ts

import { create } from 'zustand'; // Correct named import

interface UserState {
  name: string;
  setName: (name: string) => void;
}

const useUser = create<UserState>((set) => ({
  name: '',
  setName: (name) => set({ name }),
}));

export default useUser;
