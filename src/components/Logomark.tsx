/** A peach reduced to a circle, a crease and a leaf. */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="15" cy="18" r="11" fill="currentColor" />
      <path d="M15 8c-3 3-3 17 0 21" stroke="#EEECE4" strokeWidth="1.6" />
      <path d="M15 8c1-5 6-6 11-5-1 5-6 7-11 5z" fill="currentColor" />
    </svg>
  );
}
