import { Search, X } from 'lucide-react';
import { useT } from '../i18n';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  autoFocus,
}: SearchBarProps) {
  const t = useT();
  const resolved = placeholder ?? t('archive.search');
  return (
    <div className="group relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-6 flex items-center text-gold">
        <Search size={22} strokeWidth={1.6} />
      </span>
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={resolved}
        aria-label={resolved}
        className="h-[70px] w-full rounded-none border border-gold/25 bg-ink-2/85 pr-16 pl-16 text-[1.05rem] text-parchment placeholder:text-muted focus:border-gold/70 focus:bg-ink-2 focus:outline-none transition-colors duration-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.clear')}
          className="absolute inset-y-0 right-4 my-auto flex h-12 w-12 items-center justify-center text-cool transition-colors hover:text-gold"
        >
          <X size={20} strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}
