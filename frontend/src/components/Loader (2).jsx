export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="radar-loader" role="status" aria-label={label}>
        <span />
      </div>
      <p className="text-sm text-slate-500 dark:text-[#9da7ba]">{label}</p>
    </div>
  );
}
