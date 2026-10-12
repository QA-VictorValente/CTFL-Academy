import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AppShell } from '@/components/layout/app-shell';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
      }}
    >
      {children}
    </AppShell>
  );
}
