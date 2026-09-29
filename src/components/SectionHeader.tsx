interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
}: SectionHeaderProps) {
  const centered = align === 'center';
  return (
    <header className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && <p className="kicker mb-4">{eyebrow}</p>}
      <h2
        className={`font-display text-[clamp(2.1rem,4vw,3.4rem)] leading-[1.05] font-medium ${
          tone === 'dark' ? 'text-parchment' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      <div
        className={`mt-5 h-px w-28 bg-gold/60 ${centered ? 'mx-auto' : ''}`}
        aria-hidden="true"
      />
      {description && (
        <p
          className={`mt-5 text-[0.98rem] leading-relaxed ${
            tone === 'dark' ? 'text-cool' : 'text-ink/70'
          }`}
        >
          {description}
        </p>
      )}
    </header>
  );
}
