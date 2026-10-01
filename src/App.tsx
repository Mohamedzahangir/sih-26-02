import { useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import KioskHome from './pages/KioskHome';
import Archive from './pages/Archive';
import Ask from './pages/Ask';
import DocumentViewer from './pages/DocumentViewer';
import Timeline from './pages/Timeline';
import Scan from './pages/Scan';
import Ocr from './pages/Ocr';
import Send from './pages/Send';
import MobileSend from './pages/MobileSend';
import NotFound from './pages/NotFound';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import { ArchiveProvider } from './context/ArchiveContext';
import { TransferProvider } from './context/TransferContext';
import { ToastProvider } from './context/ToastContext';

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Routes location={location}>{children}</Routes>
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Shell>
      <Route path="/" element={<Navigate to="/kiosk" replace />} />
      <Route path="/kiosk" element={<KioskHome />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/ask" element={<Ask />} />
      <Route path="/document/:id" element={<DocumentViewer />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/ocr" element={<Ocr />} />
      <Route path="/digitize" element={<Ocr />} />
      <Route path="/send" element={<Send />} />
      <Route path="/mobile-send" element={<MobileSend />} />
      <Route path="*" element={<NotFound />} />
    </Shell>
  );
}

function MotionGate({ children }: { children: ReactNode }) {
  const { reduceMotion } = usePreferences();
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>{children}</MotionConfig>
  );
}

const useHashRouter = window.location.protocol === 'file:' || window.location.hash.startsWith('#/mobile-send');
const Router = useHashRouter ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <PreferencesProvider>
      <MotionGate>
        <Router>
          <ArchiveProvider>
            <TransferProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </TransferProvider>
          </ArchiveProvider>
        </Router>
      </MotionGate>
    </PreferencesProvider>
  );
}
