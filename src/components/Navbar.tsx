import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import AccessibilityPanel from './AccessibilityPanel';
import { useT, type TranslationKey } from '../i18n';

const LINKS: { to: string; labelKey: TranslationKey }[] = [
  { to: '/kiosk', labelKey: 'nav.home' },
  { to: '/archive', labelKey: 'nav.archive' },
  { to: '/timeline', labelKey: 'nav.timeline' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const t = useT();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] transition-colors duration-200 ${
      isActive ? 'text-gold' : 'text-parchment/80 hover:text-parchment'
    }`;

  return (
    <header className="glass sticky top-0 z-50 hairline-b">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-6 px-5 sm:px-8">
        <Link
          to="/kiosk"
          className="group flex items-center gap-4"
          aria-label={t('nav.brand.aria')}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center border border-gold/60 font-display text-[1.35rem] leading-none text-gold transition-colors group-hover:bg-gold group-hover:text-ink"
            aria-hidden="true"
          >
            A
          </span>
          <span className="leading-none">
            <span className="block font-display text-[1.12rem] font-semibold tracking-[0.16em] text-parchment sm:text-[1.24rem]">
              AMBEDKAR
            </span>
            <span className="block font-display text-[1.12rem] font-semibold tracking-[0.16em] text-parchment sm:text-[1.24rem]">
              HERITAGE HUB
            </span>
            <span className="mt-1 hidden text-[0.54rem] font-semibold tracking-[0.36em] text-gold/80 uppercase sm:block">
              {t('nav.tagline')}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-9 md:flex" aria-label={t('nav.primary')}>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {({ isActive }) => (
                <>
                  {t(link.labelKey)}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <LanguageSelector />
          <div className="hidden sm:block">
            <AccessibilityPanel />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? t('nav.menu.close') : t('nav.menu.open')}
            aria-expanded={menuOpen}
            className="flex h-14 w-14 items-center justify-center border border-gold/35 text-parchment transition-colors hover:border-gold hover:text-gold md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-gold/20 md:hidden"
            aria-label={t('nav.mobile')}
          >
            <div className="flex flex-col px-5 py-3">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-gold/15 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.24em] ${
                      isActive ? 'text-gold' : 'text-parchment/85'
                    }`
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              ))}
              <div className="flex justify-end py-4 sm:hidden">
                <AccessibilityPanel />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {t('nav.current', { path: location.pathname })}
      </span>
    </header>
  );
}
