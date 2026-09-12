"use client";

export interface PieSlice {
  label: string;
  value: number;
  color: string;
  emoji?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const isFullCircle = endAngle - startAngle >= 359.999;
  if (isFullCircle) {
    // A full circle can't be drawn as a single arc path; split it in two.
    const mid = startAngle + 180;
    return [arcPath(cx, cy, r, startAngle, mid), arcPath(cx, cy, r, mid, endAngle)].join(" ");
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ data, size = 280 }: { data: PieSlice[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let cursor = 0;
  const slices = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const startAngle = cursor * 360;
    cursor += fraction;
    const endAngle = cursor * 360;
    return { ...d, startAngle, endAngle, fraction };
  });

  if (total === 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={1} />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Category breakdown">
      {slices.map((s, i) => (
        <path
          key={i}
          d={arcPath(cx, cy, r, s.startAngle, s.endAngle)}
          fill={s.color}
          // A thin stroke matching the card behind it reads as a soft gap
          // between slices instead of the old heavy black outline.
          stroke="rgb(var(--card))"
          strokeWidth={3}
        />
      ))}
    </svg>
  );
}
