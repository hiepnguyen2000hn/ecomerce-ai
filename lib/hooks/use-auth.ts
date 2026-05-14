'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { currentUserAtom } from '@/lib/store';
import { login as apiLogin, getMe, logout as apiLogout } from '@/lib/api/auth';
import { getToken } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const setCurrentUser = useSetAtom(currentUserAtom);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: async () => {
      const user = await getMe();
      setCurrentUser(user);
      showToast.success('Access Granted', `Welcome back, ${user.email}`);
      router.push('/inventory');
    },
    onError: (err: Error) => {
      showToast.error('Login Failed', err.message);
    },
  });
}

export function useLogout() {
  const setCurrentUser = useSetAtom(currentUserAtom);
  const queryClient    = useQueryClient();
  const router         = useRouter();

  return () => {
    apiLogout();
    setCurrentUser(null);
    queryClient.clear();
    showToast.success('Logged out', 'Secure connection terminated.');
    router.replace('/login');
  };
}

// Called once on app mount to restore session from existing localStorage token
export function useInitAuth() {
  const setCurrentUser = useSetAtom(currentUserAtom);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await getMe();
      setCurrentUser(user);
      return user;
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: Infinity,
  });
}
