import { ButtonLink } from '../components/Button';
import Footer from '../components/Footer';
import { useT } from '../i18n';

export default function NotFound() {
  const t = useT();

  return (
    <div className="vignette flex min-h-screen flex-col">
      <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="kicker">{t('notfound.kicker')}</p>
        <h1 className="mt-6 font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight text-parchment">
          {t('notfound.title')}
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-cool">{t('notfound.desc')}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/kiosk" variant="primary">
            {t('notfound.cta.home')}
          </ButtonLink>
          <ButtonLink to="/archive" variant="outline">
            {t('notfound.cta.archive')}
          </ButtonLink>
        </div>
      </div>
      <Footer />
    </div>
  );
}
