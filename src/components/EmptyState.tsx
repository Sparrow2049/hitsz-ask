export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-display text-lg text-text">{title}</p>
      <p className="mt-1.5 text-sm text-text-muted">{description}</p>
    </div>
  );
}
