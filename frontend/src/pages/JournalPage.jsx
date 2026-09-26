const entries = [
  {
    title: 'The rise of slow craftsmanship',
    tag: 'Culture',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'How handmade brands build trust online',
    tag: 'Strategy',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Material stories: clay, linen, and wood',
    tag: 'Materials',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function JournalPage() {
  return (
    <div className="section-shell py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Journal</p>
        <h1 className="mt-3 font-display text-5xl text-forest">Stories from the studio</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.title} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft">
            <img src={entry.image} alt={entry.title} className="h-64 w-full object-cover" />
            <div className="p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{entry.tag}</div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-800">{entry.title}</h2>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
