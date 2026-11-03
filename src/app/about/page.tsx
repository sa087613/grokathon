const STEPS = [
  ['Read the morning\'s paper trail', 'Food recalls, Atlanta City Council agendas, city vending and street notices, and Fulton and DeKalb County Board of Health changes.'],
  ['Weigh it against your business', 'Your permits, commissary, counties, suppliers and regular spot. A rule for a Cobb County pool never reaches a Fulton taco truck.'],
  ['Keep quiet about the rest', 'Only what you must do, check or keep gets through. Everything else is logged with a reason you can overturn.'],
];

const BUILT = [
  ['Triage', 'Anthropic or OpenAI behind one wrapper, with a zero-key fixture mode'],
  ['Data', 'SQLite with better-sqlite3 and cosine similarity in code'],
  ['Frontend', 'Next.js 14, Tailwind and shadcn/ui'],
  ['Sources', 'openFDA, FDA recall RSS, Atlanta City Council, city and county page watch'],
];

/** Our own mark: a radar sweep with one peach-shaped return among quiet dots. */
function RadarArt() {
  return (
    <svg viewBox="0 0 420 240" className="mx-auto h-auto w-full max-w-md" fill="none" stroke="#ECE8E1" strokeWidth="2" aria-hidden="true">
      {[210, 160, 110, 60].map((r) => <path key={r} d={`M${210 - r} 225a${r} ${r} 0 0 1 ${2 * r} 0`} />)}
      <path d="M0 225h420" strokeWidth="4" />
      <path d="M210 225 300 62" stroke="#E5645A" />
      {[[90, 170], [140, 120], [165, 190], [255, 180], [340, 195], [120, 205], [235, 100]].map(([x, y]) => <rect key={x} x={x} y={y} width="6" height="6" fill="#9B958A" stroke="none" />)}
      <circle cx="306" cy="98" r="20" fill="#FFB48A" stroke="#121110" />
      <path d="M306 78c-5 8-5 32 0 40M306 78c2-9 10-11 18-9-2 9-10 12-18 9z" fill="#E5645A" stroke="#121110" />
    </svg>
  );
}

export const dynamic = 'force-dynamic';

export default function About() {
  const video = process.env.GROKBOT_DEMO_VIDEO_URL;
  return (
    <>
      <section className="py-12 text-center sm:py-20">
        <h1 className="hero">Why it stays quiet</h1>
        <p className="mx-auto mt-5 max-w-xl text-ink/75">Peachtree reads the public record for one Atlanta restaurant or food truck and speaks up only when something touches it. Silence is the product.</p>
        <div className="mt-12"><RadarArt /></div>
      </section>
      <div className="mx-auto max-w-3xl space-y-12">
        <section>
          <h2 className="section-head">How it works</h2>
          <ol className="mt-4 space-y-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-panel font-mono text-xs">{i + 1}</span>
                <div><h3 className="font-semibold">{title}</h3><p className="text-ink/75">{body}</p></div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="section-head">Links</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-line-strong p-4">
              <h3 className="font-semibold">Source code</h3>
              <p className="mt-1 text-sm text-ink/75">Agent, fetchers and this interface. Repository link to come.</p>
            </div>
            <div className="border border-dashed border-line-strong p-4">
              <h3 className="font-semibold text-muted">Demo video</h3>
              <p className="mt-1 text-sm text-muted">A morning on the radar, start to finish.</p>
              {video ? <a href={video} className="text-link-plain mt-3 inline-block text-sm">Watch the video</a> : <p className="label mt-3 text-muted">Not yet</p>}
            </div>
          </div>
        </section>
        <section>
          <h2 className="section-head">Built with</h2>
          <dl>
            {BUILT.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[9rem_1fr]">
                <dt className="label pt-1 text-muted">{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="text-sm text-muted">Peachtree is a monitoring aid and can miss things. It is not legal advice and does not replace your own permit deadlines or your county inspector.</p>
      </div>
    </>
  );
}
