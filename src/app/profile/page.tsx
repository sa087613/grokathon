import { ProfileEditor } from '@/components/ProfileEditor';
import { getProfile } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function Profile() {
  return (
    <>
      <section className="dotted py-12 text-center sm:py-20">
        <h1 className="hero mx-auto max-w-3xl">What the radar knows about you</h1>
        <p className="mx-auto mt-5 max-w-xl text-ink/75">Every call on every item starts here. Correct a line and the next morning&apos;s read changes with it.</p>
      </section>
      <div className="mx-auto max-w-3xl pt-8"><ProfileEditor initial={getProfile()!} /></div>
    </>
  );
}
