"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FinancialPoint, RevenueSegment, Competitor, Criterion } from "@/lib/types";
import { eur } from "@/lib/utils";

const AXIS = { fontSize: 11, fill: "#7c869a" };
const GRID = "rgba(255,255,255,0.05)";
const SEG_COLORS = ["#5b8cff", "#2fd180", "#e9c46a", "#a78bff", "#ff5d6c"];

function TT({ active, payload, label, unit = "€M" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-ink-800/95 px-3 py-2 text-xs shadow-elev backdrop-blur">
      {label && <p className="mb-1 font-medium text-white">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="num flex items-center gap-2 text-mist-200">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold text-white">{Math.round(p.value)}{unit}</span>
        </p>
      ))}
    </div>
  );
}

export function GrowthChart({ data }: { data: FinancialPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gEbit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2fd180" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#2fd180" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="year" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip content={<TT />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Area type="monotone" dataKey="revenue" name="Revenu" stroke="#5b8cff" strokeWidth={2.2} fill="url(#gRev)" />
        <Area type="monotone" dataKey="ebitda" name="EBITDA" stroke="#2fd180" strokeWidth={2.2} fill="url(#gEbit)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProfitabilityChart({ data }: { data: FinancialPoint[] }) {
  const enriched = data.map((d) => ({
    year: d.year,
    "Marge EBITDA": +((d.ebitda / d.revenue) * 100).toFixed(1),
    "Marge nette": +((d.netIncome / d.revenue) * 100).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={enriched} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="year" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<TT unit="%" />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Line type="monotone" dataKey="Marge EBITDA" stroke="#2fd180" strokeWidth={2.2} dot={{ r: 3, fill: "#2fd180" }} />
        <Line type="monotone" dataKey="Marge nette" stroke="#e9c46a" strokeWidth={2.2} dot={{ r: 3, fill: "#e9c46a" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ValuationChart({ data }: { data: FinancialPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#a78bff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="year" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => eur(v)} />
        <Tooltip content={<TT />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Area type="monotone" dataKey="valuation" name="Valorisation" stroke="#a78bff" strokeWidth={2.2} fill="url(#gVal)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueDonut({ data }: { data: RevenueSegment[] }) {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={SEG_COLORS[i % SEG_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<TT unit="%" />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-2.5">
        {data.map((s, i) => (
          <li key={s.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-mist-200">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
              {s.name}
            </span>
            <span className="num font-semibold text-white">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompetitorChart({ data }: { data: Competitor[] }) {
  const rows = data.map((c) => ({ ...c, name: c.isSelf ? `${c.name} ★` : c.name }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 52)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={14}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ ...AXIS, fontSize: 12, fill: "#aab2c2" }} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<TT />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="revenue" name="Revenu" radius={[0, 6, 6, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.isSelf ? "#5b8cff" : "#2e3442"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CriteriaRadar({ data }: { data: Criterion[] }) {
  const rows = data.map((c) => ({ label: c.label, score: c.score }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={rows} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "#aab2c2" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="score" stroke="#5b8cff" strokeWidth={2} fill="#5b8cff" fillOpacity={0.25} />
        <Tooltip content={<TT unit="" />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
