import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PROJECT_TOURS,
  CONTEXTUAL_TIPS,
  COMEBACK_MESSAGES,
  IDLE_MESSAGES,
  type TourStep,
  type Emote,
  type ArrivalAnimation,
} from '../data/tourScripts';

// ── Tour State Machine ──────────────────────────────────────────────────────
export type TourState =
  | 'idle'        // No tour active, avatar follows cursor
  | 'intro'       // Intro prompt is showing
  | 'walking'     // Avatar is walking to the next section
  | 'narrating'   // Avatar arrived and is displaying narration
  | 'waiting'     // Waiting for user to click "Next"
  | 'comeback'    // User wandered; avatar running to catch them
  | 'complete';   // Tour finished

export interface GuideState {
  tourState: TourState;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;
  guideTarget: { x: number; y: number } | null;
  narrationText: string | null;
  emote: Emote | null;
  arrivalAnimation: ArrivalAnimation | null;
  progressLabel: string | null;
  contextualTip: string | null;
  isGuiding: boolean;
  showIntro: boolean;
  voiceEnabled: boolean;
}

export interface GuideActions {
  startTour: () => void;
  startTourWithVoice: () => void;
  dismissTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
  onAvatarArrived: () => void;
  checkProximity: (cursorX: number, cursorY: number) => void;
  resetTour: () => void;
}

interface SectionPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseAvatarGuideOptions {
  projectId: string;
  sectionPositions: SectionPosition[];
  onPanToSection?: (x: number, y: number) => void;
}

// How far (in grid px) the cursor must stray before comeback fires
const COMEBACK_THRESHOLD = 500;
// Delay (ms) before comeback activates after cursor leaves
const COMEBACK_DELAY = 1800;

export function useAvatarGuide({
  projectId,
  sectionPositions,
  onPanToSection,
}: UseAvatarGuideOptions): [GuideState, GuideActions] {
  const [tourState, setTourState] = useState<TourState>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [narrationText, setNarrationText] = useState<string | null>(null);
  const [emote, setEmote] = useState<Emote | null>(null);
  const [arrivalAnimation, setArrivalAnimation] = useState<ArrivalAnimation | null>(null);
  const [guideTarget, setGuideTarget] = useState<{ x: number; y: number } | null>(null);
  const [contextualTip, setContextualTip] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const tour = PROJECT_TOURS[projectId];
  const tips = CONTEXTUAL_TIPS[projectId] || [];
  const comebackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTipRef = useRef<string | null>(null);
  const tipCooldownRef = useRef(false);
  const hasSeenIntroRef = useRef(false);

  // Comeback tracking
  const comebackShownRef = useRef(false);    // prevents spamming
  const cursorPosRef = useRef({ x: 0, y: 0 }); // last known cursor pos

  // Non-stale refs for use inside callbacks
  const tourStateRef = useRef(tourState);
  const currentStepIndexRef = useRef(currentStepIndex);
  useEffect(() => { tourStateRef.current = tourState; }, [tourState]);
  useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);

  const steps = tour?.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || null;

  // ── Voice via Web Speech API ────────────────────────────────────────────
  useEffect(() => {
    if (!voiceEnabled || !narrationText) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 0.85;
    window.speechSynthesis.speak(utterance);

    return () => { window.speechSynthesis.cancel(); };
  }, [narrationText, voiceEnabled]);

  // Reset all guide state when the project changes (runs before the intro effect below)
  useEffect(() => {
    if (comebackTimerRef.current) {
      clearTimeout(comebackTimerRef.current);
      comebackTimerRef.current = null;
    }
    window.speechSynthesis?.cancel();

    setShowIntro(false);
    setTourState('idle');
    setGuideTarget(null);
    setNarrationText(null);
    setEmote(null);
    setArrivalAnimation(null);
    setContextualTip(null);
    setCurrentStepIndex(0);
    setVoiceEnabled(false);

    hasSeenIntroRef.current = false;
    comebackShownRef.current = false;
  }, [projectId]);

  // Show intro prompt once per session per project
  useEffect(() => {
    if (!tour || hasSeenIntroRef.current) return;

    const sessionKey = `avatar-tour-seen-${projectId}`;
    const hasSeen = sessionStorage.getItem(sessionKey);

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowIntro(true);
        setTourState('intro');
      }, 2000);
      return () => clearTimeout(timer);
    }
    hasSeenIntroRef.current = true;
  }, [projectId, tour]);

  // Get the canvas position for a section by its ID
  const getSectionTarget = useCallback(
    (step: TourStep): { x: number; y: number } | null => {
      const section = sectionPositions.find((s) => s.id === step.sectionId);
      if (!section) return null;
      return {
        x: section.x + step.targetOffset.x,
        y: section.y + step.targetOffset.y,
      };
    },
    [sectionPositions]
  );

  // ── Pan helper ──────────────────────────────────────────────────────────
  const panToStep = useCallback((step: TourStep) => {
    if (!onPanToSection) return;
    const section = sectionPositions.find((s) => s.id === step.sectionId);
    if (section) onPanToSection(section.x, section.y);
  }, [onPanToSection, sectionPositions]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const startTourInternal = useCallback((withVoice: boolean) => {
    if (!tour || steps.length === 0) return;

    const sessionKey = `avatar-tour-seen-${projectId}`;
    sessionStorage.setItem(sessionKey, 'true');
    hasSeenIntroRef.current = true;

    setVoiceEnabled(withVoice);
    setShowIntro(false);
    setCurrentStepIndex(0);
    setTourState('walking');
    comebackShownRef.current = false;

    const target = getSectionTarget(steps[0]);
    if (target) {
      setGuideTarget(target);
      panToStep(steps[0]);
    }
  }, [tour, steps, projectId, getSectionTarget, panToStep]);

  const startTour = useCallback(() => startTourInternal(false), [startTourInternal]);
  const startTourWithVoice = useCallback(() => startTourInternal(true), [startTourInternal]);

  const dismissTour = useCallback(() => {
    const sessionKey = `avatar-tour-seen-${projectId}`;
    sessionStorage.setItem(sessionKey, 'true');
    hasSeenIntroRef.current = true;

    window.speechSynthesis?.cancel();
    setShowIntro(false);
    setTourState('idle');
    setGuideTarget(null);
    setNarrationText(null);
    setEmote(null);
    setArrivalAnimation(null);
    setVoiceEnabled(false);
  }, [projectId]);

  const clearComebackTimer = useCallback(() => {
    if (comebackTimerRef.current) {
      clearTimeout(comebackTimerRef.current);
      comebackTimerRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    clearComebackTimer();
    comebackShownRef.current = false;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= totalSteps) {
      // Tour complete
      setTourState('complete');
      setNarrationText("That's the full tour! Feel free to explore on your own now 🎉");
      setEmote('wave');
      setArrivalAnimation('confetti');

      setTimeout(() => {
        window.speechSynthesis?.cancel();
        setTourState('idle');
        setGuideTarget(null);
        setNarrationText(null);
        setEmote(null);
        setArrivalAnimation(null);
        setVoiceEnabled(false);
      }, 5000);
      return;
    }

    setCurrentStepIndex(nextIndex);
    setTourState('walking');
    setNarrationText(null);
    setArrivalAnimation(null);

    const nextStepData = steps[nextIndex];
    const target = getSectionTarget(nextStepData);
    if (target) {
      setGuideTarget(target);
      panToStep(nextStepData);
    }
  }, [currentStepIndex, totalSteps, steps, getSectionTarget, panToStep, clearComebackTimer]);

  const skipTour = useCallback(() => {
    clearComebackTimer();
    comebackShownRef.current = false;
    window.speechSynthesis?.cancel();
    setTourState('idle');
    setGuideTarget(null);
    setNarrationText(null);
    setEmote(null);
    setArrivalAnimation(null);
    setVoiceEnabled(false);
  }, [clearComebackTimer]);

  const onAvatarArrived = useCallback(() => {
    const state = tourStateRef.current;
    const stepIndex = currentStepIndexRef.current;

    // Comeback: avatar caught up with cursor — now walk back to the tour section
    if (state === 'comeback') {
      const step = steps[stepIndex];
      if (step) {
        const sectionTarget = getSectionTarget(step);
        if (sectionTarget) {
          setTourState('walking');
          setGuideTarget(sectionTarget);
          setNarrationText(null);
          setEmote(step.emote);
          panToStep(step);
          // Allow comeback to fire again after a cooldown
          setTimeout(() => { comebackShownRef.current = false; }, 8000);
        }
      }
      return;
    }

    if (state !== 'walking') return;

    const step = steps[stepIndex];
    if (!step) return;

    setTourState('narrating');
    setNarrationText(step.narration);
    setEmote(step.emote);
    setArrivalAnimation(step.animationOnArrival || 'none');

    setTimeout(() => {
      setArrivalAnimation(null);
      setTourState('waiting');
    }, 1500);
  }, [steps, getSectionTarget, panToStep]);

  // ── Free-roam contextual tips + comeback detection ──────────────────────
  const checkProximity = useCallback(
    (cursorX: number, cursorY: number) => {
      // Always update cursor position ref
      cursorPosRef.current = { x: cursorX, y: cursorY };

      const state = tourStateRef.current;
      const stepIndex = currentStepIndexRef.current;

      // ── Comeback detection during 'waiting' ──
      if (state === 'waiting' && !comebackShownRef.current) {
        const step = steps[stepIndex];
        if (step) {
          const sectionTarget = getSectionTarget(step);
          if (sectionTarget) {
            const dist = Math.sqrt(
              (cursorX - sectionTarget.x) ** 2 + (cursorY - sectionTarget.y) ** 2
            );

            if (dist > COMEBACK_THRESHOLD) {
              if (!comebackTimerRef.current) {
                comebackTimerRef.current = setTimeout(() => {
                  comebackTimerRef.current = null;
                  // Only fire if still in 'waiting' state
                  if (tourStateRef.current !== 'waiting') return;
                  comebackShownRef.current = true;
                  // Avatar runs to last known cursor position
                  setTourState('comeback');
                  setGuideTarget({ x: cursorPosRef.current.x, y: cursorPosRef.current.y });
                  const msg = COMEBACK_MESSAGES[Math.floor(Math.random() * COMEBACK_MESSAGES.length)];
                  setNarrationText(msg);
                  setEmote('wave');
                }, COMEBACK_DELAY);
              }
            } else if (comebackTimerRef.current) {
              // Cursor returned before timer fired — cancel
              clearTimeout(comebackTimerRef.current);
              comebackTimerRef.current = null;
            }
          }
        }
        return;
      }

      // ── Contextual tips in idle free-roam ──
      if (state !== 'idle' || tipCooldownRef.current) return;

      const PROXIMITY_THRESHOLD = 200;

      for (const tip of tips) {
        const section = sectionPositions.find((s) => s.id === tip.sectionId);
        if (!section) continue;

        const centerX = section.x + section.width / 2;
        const centerY = section.y + section.height / 2;
        const dist = Math.sqrt(
          (cursorX - centerX) ** 2 + (cursorY - centerY) ** 2
        );

        if (dist < PROXIMITY_THRESHOLD && lastTipRef.current !== tip.sectionId) {
          lastTipRef.current = tip.sectionId;
          setContextualTip(tip.tip);
          tipCooldownRef.current = true;

          setTimeout(() => {
            setContextualTip(null);
            tipCooldownRef.current = false;
          }, 4000);
          return;
        }
      }
    },
    [steps, getSectionTarget, tips, sectionPositions]
  );

  const resetTour = useCallback(() => {
    const sessionKey = `avatar-tour-seen-${projectId}`;
    sessionStorage.removeItem(sessionKey);
    hasSeenIntroRef.current = false;
    clearComebackTimer();
    comebackShownRef.current = false;
    window.speechSynthesis?.cancel();
    setTourState('idle');
    setCurrentStepIndex(0);
    setGuideTarget(null);
    setNarrationText(null);
    setEmote(null);
    setArrivalAnimation(null);
    setContextualTip(null);
    setVoiceEnabled(false);
  }, [projectId, clearComebackTimer]);

  // ── Idle detection (show idle messages) ────────────────────────────────
  useEffect(() => {
    if (tourState !== 'idle') return;

    idleTimerRef.current = setTimeout(() => {
      const msg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
      setContextualTip(msg);
      setTimeout(() => setContextualTip(null), 3000);
    }, 8000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [tourState]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (comebackTimerRef.current) clearTimeout(comebackTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const state: GuideState = {
    tourState,
    currentStepIndex,
    totalSteps,
    currentStep,
    guideTarget,
    narrationText,
    emote,
    arrivalAnimation,
    progressLabel: currentStep?.progressLabel || null,
    contextualTip,
    // 'comeback' and 'complete' are included so the bubble renders in guide style
    isGuiding:
      tourState === 'walking' ||
      tourState === 'narrating' ||
      tourState === 'waiting' ||
      tourState === 'comeback' ||
      tourState === 'complete',
    showIntro,
    voiceEnabled,
  };

  const actions: GuideActions = {
    startTour,
    startTourWithVoice,
    dismissTour,
    nextStep,
    skipTour,
    onAvatarArrived,
    checkProximity,
    resetTour,
  };

  return [state, actions];
}
