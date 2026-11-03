import { upcBits } from '@/lib/products';

export function Barcode({ upc }: { upc: string }) {
  const bits = upcBits(upc);
  return (
    <figure aria-label={`UPC ${upc}`} className="hidden w-44 shrink-0 border border-line-strong bg-paper p-2 text-ink sm:block">
      <svg viewBox="0 0 95 34" className="h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
        {[...bits].map((b, i) => (b === '1' ? <rect key={i} x={i} width="1" height="34" fill="currentColor" /> : null))}
      </svg>
      <figcaption className="mt-1 text-center font-mono text-[10px] tracking-[0.2em]">{upc}</figcaption>
    </figure>
  );
}
