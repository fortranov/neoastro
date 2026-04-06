"use client";
import React, { useMemo } from "react";

interface PlanetData {
  sign: string;
  degree: number;
  longitude: number;
}

interface NatalChartWheelProps {
  ascendant: { sign: string; degree: number };
  planets: Record<string, PlanetData>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
}

const ZODIAC_SIGNS = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];
const ZODIAC_SYMBOLS: Record<string, string> = {
  "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋",
  "Лев": "♌", "Дева": "♍", "Весы": "♎", "Скорпион": "♏",
  "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓",
};
const SIGN_COLORS: Record<string, string> = {
  "Овен": "#f97316", "Лев": "#f97316", "Стрелец": "#f97316",
  "Телец": "#84cc16", "Дева": "#84cc16", "Козерог": "#84cc16",
  "Близнецы": "#facc15", "Весы": "#facc15", "Водолей": "#facc15",
  "Рак": "#60a5fa", "Скорпион": "#60a5fa", "Рыбы": "#60a5fa",
};
const PLANET_SYMBOLS: Record<string, string> = {
  "Солнце": "☉", "Луна": "☽", "Меркурий": "☿", "Венера": "♀",
  "Марс": "♂", "Юпитер": "♃", "Сатурн": "♄", "Уран": "⛢",
  "Нептун": "♆", "Плутон": "♇",
};
const PLANET_COLORS: Record<string, string> = {
  "Солнце": "#fbbf24", "Луна": "#cbd5e1", "Меркурий": "#67e8f9",
  "Венера": "#f9a8d4", "Марс": "#f87171", "Юпитер": "#fb923c",
  "Сатурн": "#a8a29e", "Уран": "#6ee7b7", "Нептун": "#818cf8", "Плутон": "#c084fc",
};
const ASPECT_COLORS: Record<string, string> = {
  "Соединение": "#fbbf24", "Трин": "#4ade80",
  "Секстиль": "#60a5fa", "Квадрат": "#f87171", "Оппозиция": "#fb923c",
};

const CX = 250, CY = 250;
const R_OUTER = 235;   // outer zodiac border
const R_ZODIAC = 198;  // inner zodiac / outer house ring
const R_HOUSE = 168;   // inner house ring
const R_PLANET = 147;  // planet base radius
const R_ASPECT = 112;  // aspect lines endpoint radius
const R_CENTER = 34;

// Ecliptic longitude → SVG angle.
// ASC maps to 180° (9-o'clock, left). Increasing longitude goes CCW (decreasing SVG angle).
function lonToAngle(lon: number, ascLon: number): number {
  const rel = ((lon - ascLon) % 360 + 360) % 360;
  return ((180 - rel) % 360 + 360) % 360;
}

function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

// Annular sector. Outer arc goes CCW (sweep=0) from a1 to a2 (span ≈ 30°).
function sectorPath(r1: number, r2: number, a1: number, a2: number): string {
  const span = ((a1 - a2) % 360 + 360) % 360;
  const la = span > 180 ? 1 : 0;
  const [ox1, oy1] = polar(r2, a1);
  const [ox2, oy2] = polar(r2, a2);
  const [ix1, iy1] = polar(r1, a2);
  const [ix2, iy2] = polar(r1, a1);
  return (
    `M${ox1} ${oy1}` +
    ` A${r2} ${r2} 0 ${la} 0 ${ox2} ${oy2}` +
    ` L${ix1} ${iy1}` +
    ` A${r1} ${r1} 0 ${la} 1 ${ix2} ${iy2}Z`
  );
}

export function NatalChartWheel({ ascendant, planets, aspects }: NatalChartWheelProps) {
  const ascSignIdx = ZODIAC_SIGNS.indexOf(ascendant.sign);
  const ascLon = (ascSignIdx >= 0 ? ascSignIdx * 30 : 0) + (ascendant.degree || 0);

  // Compute planet positions with simple collision avoidance (alternate radius).
  const planetPositions = useMemo(() => {
    const entries = Object.entries(planets)
      .map(([name, data]) => ({ name, angle: lonToAngle(data.longitude, ascLon), r: R_PLANET }))
      .sort((a, b) => a.angle - b.angle);

    for (let i = 1; i < entries.length; i++) {
      let diff = Math.abs(entries[i].angle - entries[i - 1].angle);
      if (diff > 180) diff = 360 - diff;
      if (diff < 22) {
        entries[i].r = entries[i - 1].r === R_PLANET ? R_PLANET - 24 : R_PLANET;
      }
    }
    return Object.fromEntries(entries.map(p => [p.name, { angle: p.angle, r: p.r }]));
  }, [planets, ascLon]);

  // Degree marks every 10° on the zodiac outer ring.
  const degreeMarks = useMemo(() => {
    const marks = [];
    for (let d = 0; d < 360; d += 10) {
      const a = lonToAngle(d, ascLon);
      const isMajor = d % 30 === 0;
      const [x1, y1] = polar(R_OUTER - (isMajor ? 10 : 5), a);
      const [x2, y2] = polar(R_OUTER, a);
      marks.push({ x1, y1, x2, y2, isMajor });
    }
    return marks;
  }, [ascLon]);

  return (
    <svg viewBox="0 0 500 500" className="w-full max-w-[480px] mx-auto select-none">
      {/* Background */}
      <circle cx={CX} cy={CY} r={R_OUTER + 8} fill="#0d0820" />

      {/* Zodiac segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const a1 = lonToAngle(i * 30, ascLon);
        const a2 = lonToAngle((i + 1) * 30, ascLon);
        const aMid = lonToAngle(i * 30 + 15, ascLon);
        const color = SIGN_COLORS[sign];
        const [tx, ty] = polar((R_OUTER + R_ZODIAC) / 2, aMid);
        return (
          <g key={sign}>
            <path
              d={sectorPath(R_ZODIAC, R_OUTER, a1, a2)}
              fill={color} fillOpacity={0.13}
              stroke={color} strokeOpacity={0.4} strokeWidth={0.5}
            />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill={color} fillOpacity={0.95}>
              {ZODIAC_SYMBOLS[sign]}
            </text>
          </g>
        );
      })}

      {/* Degree marks */}
      {degreeMarks.map((m, i) => (
        <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke="#6d28d9" strokeWidth={m.isMajor ? 1 : 0.5} strokeOpacity={0.5} />
      ))}

      {/* Ring borders */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#4c1d95" strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={R_ZODIAC} fill="none" stroke="#4c1d95" strokeWidth={1} />

      {/* House ring background */}
      <circle cx={CX} cy={CY} r={R_ZODIAC} fill="#100824" />

      {/* House spokes from center to zodiac inner */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = lonToAngle(ascLon + i * 30, ascLon);
        const isAxis = i % 3 === 0;
        const [x1, y1] = polar(R_CENTER + 2, angle);
        const [x2, y2] = polar(R_ZODIAC, angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isAxis ? "#7c3aed" : "#4c1d95"}
            strokeWidth={isAxis ? 1.2 : 0.6}
            strokeOpacity={isAxis ? 0.9 : 0.5} />
        );
      })}

      {/* House numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = lonToAngle(ascLon + i * 30 + 15, ascLon);
        const [hx, hy] = polar((R_ZODIAC + R_HOUSE) / 2, angle);
        return (
          <text key={i} x={hx} y={hy} textAnchor="middle" dominantBaseline="central"
            fontSize={9} fill="#a78bfa" fillOpacity={0.85}>
            {i + 1}
          </text>
        );
      })}

      <circle cx={CX} cy={CY} r={R_HOUSE} fill="none" stroke="#4c1d95" strokeWidth={0.7} strokeOpacity={0.6} />

      {/* Inner work area */}
      <circle cx={CX} cy={CY} r={R_HOUSE} fill="#0d0820" />

      {/* Aspect lines */}
      {aspects.map((asp, idx) => {
        const pos1 = planetPositions[asp.planet1];
        const pos2 = planetPositions[asp.planet2];
        if (!pos1 || !pos2) return null;
        const [x1, y1] = polar(R_ASPECT, pos1.angle);
        const [x2, y2] = polar(R_ASPECT, pos2.angle);
        const color = ASPECT_COLORS[asp.aspect] || "#888";
        return (
          <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth={0.8} strokeOpacity={0.3} />
        );
      })}

      <circle cx={CX} cy={CY} r={R_ASPECT} fill="none" stroke="#4c1d95" strokeWidth={0.4} strokeOpacity={0.4} />

      {/* Planet tick lines */}
      {Object.entries(planetPositions).map(([name, { angle, r }]) => {
        const color = PLANET_COLORS[name] || "#fff";
        const [hx, hy] = polar(R_HOUSE - 4, angle);
        const [px, py] = polar(r + 14, angle);
        return (
          <line key={name + "_t"} x1={hx} y1={hy} x2={px} y2={py}
            stroke={color} strokeWidth={0.6} strokeOpacity={0.2} />
        );
      })}

      {/* Planet symbols */}
      {Object.entries(planetPositions).map(([name, { angle, r }]) => {
        const [px, py] = polar(r, angle);
        const color = PLANET_COLORS[name] || "#fff";
        return (
          <g key={name}>
            <circle cx={px} cy={py} r={13} fill="#1a0a38" stroke={color} strokeWidth={1.2} strokeOpacity={0.85} />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
              fontSize={12} fill={color}>
              {PLANET_SYMBOLS[name] || "✦"}
            </text>
          </g>
        );
      })}

      {/* ASC marker line */}
      <line
        x1={CX - R_OUTER + 2} y1={CY}
        x2={CX - R_ZODIAC - 1} y2={CY}
        stroke="#e879f9" strokeWidth={2} strokeOpacity={0.9}
      />
      <text x={CX - R_OUTER - 6} y={CY}
        textAnchor="end" dominantBaseline="central"
        fontSize={9} fill="#e879f9" fontWeight="bold">
        ASC
      </text>

      {/* Center circle */}
      <circle cx={CX} cy={CY} r={R_CENTER} fill="#0d0820" stroke="#4c1d95" strokeWidth={1} />
      <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
        fontSize={18} fill="#6d28d9" fillOpacity={0.7}>✦</text>

      {/* Aspect legend */}
      {Object.entries(ASPECT_COLORS).map(([asp, color], i) => {
        const x = 10 + i * 96;
        return (
          <g key={asp} transform={`translate(${x}, 492)`}>
            <line x1={0} y1={0} x2={16} y2={0} stroke={color} strokeWidth={1.5} strokeOpacity={0.8} />
            <text x={20} y={0} dominantBaseline="central" fontSize={7.5} fill={color} fillOpacity={0.9}>
              {asp}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
