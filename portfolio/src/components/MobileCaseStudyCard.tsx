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
            className="w-full rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(145deg, #161820, #111218)',
                border: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            {/* Accent top bar */}
            <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}60)` }}
            />

            <div className="p-5">
                {/* Header */}
                <div className="mb-4">
                    <h2
                        className="font-bold text-lg leading-tight mb-0.5"
                        style={{ color: '#F0F0FF' }}
                    >
                        {data.title}
                    </h2>
                    <p className="text-xs font-semibold" style={{ color: data.accentColor }}>
                        {data.subtitle}
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {data.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{
                                background: `rgba(${rgb}, 0.12)`,
                                color: data.accentColor,
                                border: `1px solid rgba(${rgb}, 0.22)`,
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,255,0.55)' }}>
                    {data.description}
                </p>

                {/* Metrics */}
                {data.metrics && data.metrics.length > 0 && (
                    <div
                        className="flex gap-0 mt-5 pt-4 rounded-xl overflow-hidden"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {data.metrics.map((m, i) => (
                            <div
                                key={m.label}
                                className="flex-1 flex flex-col items-center text-center px-2"
                                style={{
                                    borderRight: i < data.metrics!.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                }}
                            >
                                <span
                                    className="text-xl font-black leading-none mb-1"
                                    style={{ color: data.accentColor }}
                                >
                                    {m.value}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'rgba(240,240,255,0.35)' }}>
                                    {m.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
