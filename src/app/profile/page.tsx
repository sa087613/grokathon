import { ensureDemoFresh } from '@/agent/demo';
import { ProfileForm } from '@/components/ProfileForm';
import { getProfile } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  await ensureDemoFresh();
  return (
    <>
      <h1 className="font-serif text-3xl">Store profile</h1>
      <p className="mt-2 pb-6 text-sm text-muted">Every item is judged against this. It applies from the next run.</p>
      <ProfileForm initial={getProfile()!} />
    </>
  );
}
