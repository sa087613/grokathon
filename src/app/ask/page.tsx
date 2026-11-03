import { ensureDemoFresh } from '@/agent/demo';
import { Chat } from '@/components/Chat';
import { getView } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Ask({ searchParams }: { searchParams: { item?: string } }) {
  await ensureDemoFresh();
  const item = searchParams.item ? getView(searchParams.item) : null;
  return (
    <>
      <h1 className="font-serif text-3xl">Ask the radar</h1>
      <p className="mt-2 pb-6 text-sm text-muted">Answers come only from what the radar has read and decided.</p>
      <Chat item={item ? { id: item.id, title: item.title } : null} />
    </>
  );
}
