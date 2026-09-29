import { ButtonLink } from '../components/Button';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="vignette flex min-h-screen flex-col">
      <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="kicker">404 · Not found</p>
        <h1 className="mt-6 font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight text-parchment">
          This gallery does not exist
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-cool">
          The page you requested is not part of the Ambedkar Heritage Hub kiosk. Return to
          the entrance or continue into the Digital Archive.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/kiosk" variant="primary">
            Kiosk home
          </ButtonLink>
          <ButtonLink to="/archive" variant="outline">
            Explore archive
          </ButtonLink>
        </div>
      </div>
      <Footer />
    </div>
  );
}
