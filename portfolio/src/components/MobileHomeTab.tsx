import { motion } from 'framer-motion';
import { ExternalLink, Download, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ui/scroll-reveal';
import { RotatingText } from './ui/rotating-text';
import { Highlighter } from './ui/highlighter';
import Stack from './Stack/Stack';
import { useWebHaptics } from 'web-haptics/react';

const ROLES = [
  'Enterprise & SaaS Specialist',
  'Information Architect L2',
  'UX Designer',
  'Interaction Designer',
  'Senior Product Designer',
];

const STATS = [
  { value: '6+', label: 'Years Exp.' },
  { value: '5', label: 'Companies' },
  { value: '10+', label: 'Products' },
];

const SKILLS = [
  'Product Design',
  'User Research',
  'Design Systems',
  'Information Architecture',
  'Enterprise SaaS',
  'Prototyping',
  'Storyboarding',
  'B2B UX',
];

const EXPERIENCE = [
  { company: 'Toddle', role: 'Senior Product Designer', period: '2024 – Present', color: '#5e6ad2' },
  { company: 'Recur Club', role: 'Product Designer', period: '2022 – 2024', color: '#10B981' },
  { company: 'Oracle', role: 'UX Designer', period: '2021 – 2022', color: '#F59E0B' },
  { company: 'Publicis Sapient', role: 'Information Architect L2', period: '2021', color: '#828fff' },
  { company: 'InnoMinds', role: 'Design Trainee', period: '2020 – 2021', color: '#3B82F6' },
];

export default function MobileHomeTab() {
  const { trigger } = useWebHaptics({ debug: true });
  return (
    <div className="h-full overflow-y-scroll overflow-x-hidden bg-[#08090a] min-h-0 scroll-smooth mobile-snap-y mobile-no-scrollbar mobile-smooth-scroll">
      <div className="px-5 flex flex-col gap-6" style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* 120px top spacer — prevents auto-scroll on load so badge has gap from top */}
        <div className="mobile-snap-item-y flex-shrink-0" style={{ minHeight: 120 }} aria-hidden="true" />

        {/* Available for Work badge */}
        <ScrollReveal delay={0} yOffset={16} blur="6px" className="mobile-snap-item-y">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#7170ff] bg-[#7170ff]/10 px-2.5 py-1 rounded-full border border-[#7170ff]/20">
              Available for Work
            </span>
          </div>
        </ScrollReveal>

        {/* Stack */}
        <ScrollReveal delay={0.05} yOffset={20} blur="8px" className="mobile-snap-item-y">
          <div style={{ height: '160px' }}>
            <div style={{ width: '160px', height: '160px' }}>
              <Stack
                randomRotation
                sensitivity={150}
                sendToBackOnClick
                autoplay
                autoplayDelay={3000}
                pauseOnHover
                mobileClickOnly
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Header with Rotating Roles */}
        <ScrollReveal delay={0.08} yOffset={24} blur="8px" className="mobile-snap-item-y">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold text-[#f7f8f8] leading-tight tracking-[-0.022em]">
              Sai Charan
            </h1>
            <p className="text-2xl text-[#8a8f98] font-[510] min-h-[1.75rem]">
              <RotatingText
                words={ROLES}
                interval={2800}
                className="text-[#7170ff] font-[510]"
              />
            </p>
            <div className="inline-flex items-center gap-2 bg-[#0f1011] border border-white/[0.08] rounded-lg px-4 py-2.5">
              <span className="text-[#7170ff] font-mono text-xs">{'>'}</span>
              <code className="text-[#8a8f98] font-mono text-xs">
                <span className="text-[#828fff]">const</span>{' '}
                <span className="text-[#d0d6e0]">passion</span>{' '}
                <span className="text-[#62666d]">=</span>{' '}
                <span className="text-[#8a8f98]">
                  &quot;Designing for humans, powered by craft&quot;
                </span>
              </code>
              <span className="w-2 h-4 bg-[#7170ff] animate-pulse rounded-sm" />
            </div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <ScrollReveal delay={0.06} yOffset={20} blur="6px" className="mobile-snap-item-y">
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-0.5 bg-[#0f1011] border border-white/[0.08] rounded-xl py-3"
              >
                <span className="text-xl font-semibold text-[#f7f8f8]">{s.value}</span>
                <span className="text-[10px] text-[#62666d] font-[510] text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Bio — LinkedIn-inspired, craft-focused */}
        <ScrollReveal delay={0.1} yOffset={24} blur="8px" className="mobile-snap-item-y">
          <div className="bg-[#0f1011] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-sm text-[#8a8f98] leading-relaxed">
              Specialist in enterprise and SaaS products. Adaptive designer with a strong passion for{' '}
              <Highlighter color="rgba(113,112,255,0.15)">
                <span className="text-white">UX Design</span>
              </Highlighter>
              . I help companies design efficient experiences based on{' '}
              <Highlighter action="underline" color="rgba(113,112,255,0.5)">
                <span className="text-white">user-centric strategy</span>
              </Highlighter>
              , with the aim of user and customer satisfaction. On a path to become{' '}
              <Highlighter action="highlight" color="rgba(130,143,255,0.15)">
                <span className="text-white">irreplaceable by AI</span>
              </Highlighter>
              — a lifelong learner who values craft above all.
            </p>
          </div>
        </ScrollReveal>

        {/* Experience timeline */}
        <ScrollReveal delay={0.12} yOffset={24} blur="8px" className="mobile-snap-item-y">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-[510] tracking-widest uppercase text-[#62666d]">Experience</p>
            <div className="flex flex-col gap-3">
              {EXPERIENCE.map((exp) => (
                <div key={exp.company} className="flex items-center gap-3 bg-[#0f1011] border border-white/[0.08] rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: exp.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-[510] text-[#f7f8f8] truncate">{exp.company}</span>
                      <span className="text-[10px] text-[#62666d] flex-shrink-0">{exp.period}</span>
                    </div>
                    <p className="text-xs text-[#8a8f98]">{exp.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Skills */}
        <ScrollReveal delay={0.14} yOffset={24} blur="8px" className="mobile-snap-item-y">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-[510] tracking-widest uppercase text-[#62666d]">Skills</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="text-xs text-[#8a8f98] bg-[#0f1011] border border-white/[0.08] rounded-full px-3 py-1.5"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA buttons */}
        <ScrollReveal delay={0.16} yOffset={24} blur="8px" className="mobile-snap-item-y">
          <div className="flex gap-3">
            <motion.a
              onPointerDown={() => trigger('light')}
              href={`${import.meta.env.BASE_URL}sai%20charan%20kalla_Latest%20Resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.96 }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5e6ad2] text-white text-sm font-[510] rounded-xl py-3.5"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </motion.a>
            <motion.a
              onPointerDown={() => trigger('light')}
              href="https://www.linkedin.com/in/sai-charan-92a8ab13b/"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2 bg-white/[0.02] border border-white/[0.08] text-[#d0d6e0] text-sm font-[510] rounded-xl py-3.5 px-4"
            >
              <ExternalLink className="w-4 h-4" />
              LinkedIn
            </motion.a>
          </div>
        </ScrollReveal>

        {/* Subtle hint */}
        <ScrollReveal delay={0.18} yOffset={16} blur="6px" className="mobile-snap-item-y">
          <div className="flex items-center justify-center gap-2 py-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7170ff]/40" />
            <p className="text-xs text-[#62666d]">Tap Projects to explore case studies · Chat to ask me anything</p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
