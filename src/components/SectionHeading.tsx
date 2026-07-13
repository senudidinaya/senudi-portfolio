export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="eyebrow whitespace-nowrap">{eyebrow}</span>
      <span className="h-px flex-1 translate-y-[-2px] bg-line" />
      <h2 className="font-serif text-2xl font-light tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
