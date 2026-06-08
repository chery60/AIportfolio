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

const strongTextShadow = { textShadow: '0 2px 18px rgba(0,0,0,0.82)' };
const softTextShadow = { textShadow: '0 1px 12px rgba(0,0,0,0.72)' };

export default function MobileHomeTab() {
  const { trigger } = useWebHaptics({ debug: true });
  return (
    <div className="h-full overflow-y-scroll overflow-x-hidden bg-transparent min-h-0 scroll-smooth mobile-no-scrollbar mobile-smooth-scroll">
      <div className="px-5 flex flex-col gap-5" style={{ paddingBottom: 'calc(13rem + env(safe-area-inset-bottom, 0px))' }}>

        <div className="flex-shrink-0" style={{ minHeight: 'clamp(48px, 8vh, 76px)' }} aria-hidden="true" />

        {/* Available for Work badge */}
        <ScrollReveal delay={0} yOffset={16} blur="6px">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d7dcff] bg-[#11143a]/90 px-3 py-1.5 rounded-full border border-[#aeb7ff]/30 shadow-[0_10px_30px_rgba(0,0,0,0.36)] backdrop-blur-xl">
              Available for Work
            </span>
          </div>
        </ScrollReveal>

        {/* Stack */}
        <ScrollReveal delay={0.05} yOffset={20} blur="8px">
          <div style={{ height: 'clamp(146px, 38vw, 172px)' }}>
            <div style={{ width: 'clamp(146px, 38vw, 172px)', height: 'clamp(146px, 38vw, 172px)' }}>
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
        <ScrollReveal delay={0.08} yOffset={24} blur="8px">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold text-[#ffffff] leading-tight tracking-normal" style={strongTextShadow}>
              Sai Charan
            </h1>
            <p className="text-[1.55rem] leading-[1.12] text-[#c6ceff] font-semibold min-h-[3.4rem]" style={strongTextShadow}>
              <RotatingText
                words={ROLES}
                interval={2800}
                className="text-[#c6ceff] font-semibold"
              />
            </p>
            <div className="flex w-full max-w-full items-start gap-2 bg-[#05070b]/92 border border-white/[0.18] rounded-xl px-3.5 py-3 backdrop-blur-xl shadow-[0_16px_44px_rgba(0,0,0,0.46)]">
              <span className="text-[#aeb7ff] font-mono text-xs leading-5 flex-shrink-0">{'>'}</span>
              <code className="min-w-0 flex-1 whitespace-normal break-words text-[#dbe3ed] font-mono text-[11px] leading-5">
                <span className="text-[#bec7ff]">const</span>{' '}
                <span className="text-[#ffffff]">passion</span>{' '}
                <span className="text-[#a8b2c1]">=</span>{' '}
                <span className="text-[#dbe3ed]">
                  &quot;Designing for humans, powered by craft&quot;
                </span>
              </code>
              <span className="w-2 h-4 bg-[#aeb7ff] animate-pulse rounded-sm flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <ScrollReveal delay={0.06} yOffset={20} blur="6px">
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 bg-[#05070b]/90 border border-white/[0.16] rounded-xl py-3 backdrop-blur-xl shadow-[0_14px_34px_rgba(0,0,0,0.44)]"
              >
                <span className="text-xl font-semibold text-[#ffffff]">{s.value}</span>
                <span className="text-[10px] text-[#c6ceda] font-semibold text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Bio — LinkedIn-inspired, craft-focused */}
        <ScrollReveal delay={0.1} yOffset={24} blur="8px">
          <div className="bg-[#05070b]/93 border border-white/[0.18] rounded-2xl p-4 backdrop-blur-xl shadow-[0_20px_52px_rgba(0,0,0,0.5)]">
            <p className="text-sm text-[#d8dee8] font-medium leading-relaxed">
              Specialist in enterprise and SaaS products. Adaptive designer with a strong passion for{' '}
              <Highlighter color="rgba(174,183,255,0.24)">
                <span className="text-white">UX Design</span>
              </Highlighter>
              . I help companies design efficient experiences based on{' '}
              <Highlighter action="underline" color="rgba(174,183,255,0.78)">
                <span className="text-white">user-centric strategy</span>
              </Highlighter>
              , with the aim of user and customer satisfaction. On a path to become{' '}
              <Highlighter action="highlight" color="rgba(130,143,255,0.26)">
                <span className="text-white">irreplaceable by AI</span>
              </Highlighter>
              — a lifelong learner who values craft above all.
            </p>
          </div>
        </ScrollReveal>

        {/* Experience timeline */}
        <ScrollReveal delay={0.12} yOffset={24} blur="8px">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-widest uppercase text-[#c8d0dc]" style={softTextShadow}>Experience</p>
            <div className="flex flex-col gap-3">
              {EXPERIENCE.map((exp) => (
                <div key={exp.company} className="flex items-center gap-3 bg-[#05070b]/90 border border-white/[0.16] rounded-xl px-4 py-3 backdrop-blur-xl shadow-[0_14px_36px_rgba(0,0,0,0.38)]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: exp.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-[510] text-[#f7f8f8] truncate">{exp.company}</span>
                      <span className="text-[10px] text-[#bac4d2] flex-shrink-0">{exp.period}</span>
                    </div>
                    <p className="text-xs text-[#d0d7e2]">{exp.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Skills */}
        <ScrollReveal delay={0.14} yOffset={24} blur="8px">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-widest uppercase text-[#c8d0dc]" style={softTextShadow}>Skills</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium text-[#dbe3ed] bg-[#05070b]/88 border border-white/[0.16] rounded-full px-3 py-1.5 backdrop-blur-xl shadow-[0_8px_22px_rgba(0,0,0,0.3)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA buttons */}
        <ScrollReveal delay={0.16} yOffset={24} blur="8px">
          <div className="flex gap-3">
            <motion.a
              onPointerDown={() => trigger('light')}
              href={`${import.meta.env.BASE_URL}sai%20charan%20kalla_Latest%20Resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.96 }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5e6ad2] text-white text-sm font-semibold rounded-xl py-3.5 shadow-[0_14px_36px_rgba(94,106,210,0.32)]"
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
              className="flex items-center justify-center gap-2 bg-[#05070b]/90 border border-white/[0.18] text-[#f7f8f8] text-sm font-semibold rounded-xl py-3.5 px-4 backdrop-blur-xl shadow-[0_14px_36px_rgba(0,0,0,0.38)]"
            >
              <ExternalLink className="w-4 h-4" />
              LinkedIn
            </motion.a>
          </div>
        </ScrollReveal>

        {/* Subtle hint */}
        <ScrollReveal delay={0.18} yOffset={16} blur="6px">
          <div className="flex items-center justify-center gap-2 py-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c6ceff]" />
            <p className="text-xs font-medium text-[#c8d0dc] text-center" style={softTextShadow}>Tap Projects to explore case studies · Chat to ask me anything</p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
