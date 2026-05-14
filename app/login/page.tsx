'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/lib/store';
import { LoginView } from '@/components/views/login-view';

export default function LoginPage() {
  const currentUser = useAtomValue(currentUserAtom);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) router.replace('/inventory');
  }, [currentUser, router]);

  return <LoginView onLogin={() => {}} />;
}
