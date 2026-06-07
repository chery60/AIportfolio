import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import PresentationControls from '../components/Canvas3D/PresentationControls';
import CinematicControls from '../components/CinematicControls';

export type PresentationHudPayload = {
  currentIndex: number;
  totalSlides: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  sectionLabel?: string;
};

export type CinematicHudPayload = {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  speed: number;
  currentWaypointLabel?: string;
  totalWaypoints: number;
  currentWaypointIndex: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSetSpeed: (speed: number) => void;
};

type CanvasDomOverlayApi = {
  setPresentationHud: (payload: PresentationHudPayload | null) => void;
  setCinematicHud: (payload: CinematicHudPayload | null) => void;
};

const CanvasDomOverlayContext = createContext<CanvasDomOverlayApi | null>(null);

/**
 * Hosts DOM HUDs that must not sit inside the R3F Canvas tree.
 * react-dom createPortal as a child of R3F still passes through the R3F reconciler,
 * which then tries to treat span elements as THREE objects ("Span is not part of the THREE namespace").
 */
export function CanvasDomOverlayProvider({ children }: { children: ReactNode }) {
  const [presentation, setPresentation] = useState<PresentationHudPayload | null>(null);
  const [cinematic, setCinematic] = useState<CinematicHudPayload | null>(null);

  const setPresentationHud = useCallback((p: PresentationHudPayload | null) => {
    setPresentation(p);
  }, []);
  const setCinematicHud = useCallback((p: CinematicHudPayload | null) => {
    setCinematic(p);
  }, []);

  const value = useMemo(
    () => ({ setPresentationHud, setCinematicHud }),
    [setPresentationHud, setCinematicHud]
  );

  return (
    <CanvasDomOverlayContext.Provider value={value}>
      {children}
      {presentation ? <PresentationControls {...presentation} /> : null}
      {cinematic ? <CinematicControls {...cinematic} /> : null}
    </CanvasDomOverlayContext.Provider>
  );
}

/** Safe to call from inside R3F: no-ops when provider is absent. */
export function useCanvasDomOverlay(): CanvasDomOverlayApi {
  const ctx = useContext(CanvasDomOverlayContext);
  return (
    ctx ?? {
      setPresentationHud: () => {},
      setCinematicHud: () => {},
    }
  );
}
