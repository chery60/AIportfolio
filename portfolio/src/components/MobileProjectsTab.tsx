import { BlurFade } from './ui/blur-fade';
import MobileProjectDeck from './MobileProjectDeck';
import { PROJECTS } from '../data/projects';
import type { Project } from '../types';

interface Props {
  onSelectProject: (project: Project) => void;
}

export default function MobileProjectsTab({ onSelectProject }: Props) {
  return (
    <div className="h-full min-h-0 overflow-hidden bg-transparent">
      <div className="flex h-full min-h-0 flex-col px-5 pt-4 pb-4">
        <BlurFade delay={0}>
          <header className="shrink-0 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/58 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Portfolio
            </p>
            <h2 className="mt-1 text-[clamp(2rem,9vw,2.45rem)] font-black leading-none tracking-tight text-white drop-shadow-[0_3px_20px_rgba(0,0,0,0.7)]">
              Case Studies
            </h2>
            <p className="mt-2 text-sm font-semibold text-white/74 drop-shadow-[0_2px_14px_rgba(0,0,0,0.62)]">
              {PROJECTS.length} projects / swipe left or right
            </p>
          </header>
        </BlurFade>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-2">
          <BlurFade delay={0.08} className="flex min-h-0 w-full flex-1">
            <MobileProjectDeck
              projects={PROJECTS}
              onOpenProject={onSelectProject}
            />
          </BlurFade>

          <BlurFade delay={0.12}>
            <p className="mt-5 text-center text-[11px] font-medium tracking-wide text-white/46 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              ← browse &nbsp;·&nbsp; open →
            </p>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
