/** Compact display of a single review's 1-5 ratings (skips null dimensions). */
export function ReviewRatings({
  liked,
  useful,
  difficulty,
}: {
  liked: number | null;
  useful: number | null;
  difficulty: number | null;
}) {
  const items = [
    liked != null ? { label: "Liked", value: liked } : null,
    useful != null ? { label: "Useful", value: useful } : null,
    difficulty != null ? { label: "Difficulty", value: difficulty } : null,
  ].filter((x): x is { label: string; value: number } => x !== null);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {it.label}
          <span className="font-semibold text-western-600 dark:text-western-300">
            {it.value}/5
          </span>
        </span>
      ))}
    </div>
  );
}
