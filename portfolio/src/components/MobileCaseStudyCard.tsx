import type { CaseStudyCardElement } from '../types';

interface Props {
    element: CaseStudyCardElement;
}

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '124, 92, 252';
}

export default function MobileCaseStudyCard({ element }: Props) {
    const { data } = element;
    const rgb = hexToRgb(data.accentColor);

    return (
        <div
            className="w-full border-b border-[var(--exec-line)] py-4"
            style={{
                borderLeft: `2px solid rgba(${rgb}, 0.56)`,
                paddingLeft: '14px',
            }}
        >
            <div className="mb-4">
                <h2
                    className="mb-1.5 text-[23px] font-semibold leading-[1.12] tracking-normal"
                    style={{ color: 'var(--exec-ink)' }}
                >
                    {data.title}
                </h2>
                <p className="text-[12px] font-semibold leading-snug" style={{ color: data.accentColor }}>
                    {data.subtitle}
                </p>
            </div>

            <div className="mb-4 overflow-x-auto mobile-no-scrollbar mobile-smooth-scroll-x">
                <div className="flex w-max gap-2">
                    {data.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-[11px] font-medium"
                            style={{ color: data.accentColor }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <p className="text-[14px] font-medium leading-[1.75]" style={{ color: 'var(--exec-ink-soft)' }}>
                {data.description}
            </p>

            {data.metrics && data.metrics.length > 0 && (
                <dl className="mt-5 divide-y divide-[var(--exec-line)] border-y border-[var(--exec-line)]">
                    {data.metrics.map(m => (
                        <div key={m.label} className="flex items-baseline justify-between gap-4 py-2.5">
                            <dt
                                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                                style={{ color: 'var(--exec-muted)' }}
                            >
                                {m.label}
                            </dt>
                            <dd className="text-right text-[15px] font-semibold" style={{ color: data.accentColor }}>
                                {m.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}
