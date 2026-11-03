import { Chat } from '@/components/Chat';
import { getView } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function Ask({ searchParams }: { searchParams: { item?: string } }) {
  const item = searchParams.item ? getView(searchParams.item) : null;
  return (
    <>
      <h1 className="hero pt-12">Ask the radar</h1>
      <p className="mt-4 pb-6 text-sm text-muted">Answers come only from what the radar has read and decided.</p>
      <Chat item={item ? { id: item.id, title: item.title } : null} />
    </>
  );
}
