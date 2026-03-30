import { useState, useCallback, useRef, useEffect } from 'react';
import {
  CONTEXTUAL_TIPS,
  IDLE_MESSAGES,
} from '../data/tourScripts';

interface SectionPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aiDescription?: string | null;
}

interface UseAvatarGuideOptions {
  projectId: string;
  sectionPositions: SectionPosition[];
}

export function useAvatarGuide({
  projectId,
  sectionPositions,
}: UseAvatarGuideOptions): {
  contextualTip: string | null;
  checkProximity: (cursorX: number, cursorY: number) => void;
} {
  const [contextualTip, setContextualTip] = useState<string | null>(null);
  const lastTipRef = useRef<string | null>(null);
  const tipCooldownRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tips = CONTEXTUAL_TIPS[projectId] || [];

  // Reset tip state when project changes
  useEffect(() => {
    setContextualTip(null);
    lastTipRef.current = null;
    tipCooldownRef.current = false;
  }, [projectId]);

  // Idle messages
  useEffect(() => {
    idleTimerRef.current = setTimeout(() => {
      const msg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
      setContextualTip(msg);
      setTimeout(() => setContextualTip(null), 3000);
    }, 10000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [projectId]);

  const checkProximity = useCallback(
    (cursorX: number, cursorY: number) => {
      if (tipCooldownRef.current) return;

      const PROXIMITY_THRESHOLD = 200;

      for (const section of sectionPositions) {
        const dynamicTip = section.aiDescription;
        const staticTip = tips.find(t => t.sectionId === section.id)?.tip;
        const tipText = dynamicTip || staticTip;

        if (!tipText) continue;

        const centerX = section.x + section.width / 2;
        const centerY = section.y + section.height / 2;
        const dist = Math.sqrt(
          (cursorX - centerX) ** 2 + (cursorY - centerY) ** 2
        );

        if (dist < PROXIMITY_THRESHOLD && lastTipRef.current !== section.id) {
          lastTipRef.current = section.id;
          setContextualTip(tipText);
          tipCooldownRef.current = true;

          setTimeout(() => {
            setContextualTip(null);
            tipCooldownRef.current = false;
          }, 4000);
          return;
        }
      }
    },
    [tips, sectionPositions]
  );

  return { contextualTip, checkProximity };
}
