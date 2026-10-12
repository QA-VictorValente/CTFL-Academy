import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ProfileSettings } from '@/components/student/profile-settings';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Perfil e Preferências
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados de conta, preferências de estudo e controles de privacidade.
        </p>
      </div>

      <ProfileSettings
        user={{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          preferredTheme: user.preferredTheme,
          dailyGoalMinutes: user.dailyGoalMinutes,
          nonNativeLanguageBonus: user.nonNativeLanguageBonus,
        }}
      />
    </div>
  );
}
