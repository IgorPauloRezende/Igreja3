import { useMemo, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

export interface MonthlyStatPoint {
  month: string;
  participacoes: number;
  cadastros: number;
}

interface ClippedAreaChartProps {
  data?: MonthlyStatPoint[];
  title?: string;
  subtitle?: string;
  unitLabel?: string;
}

const chartConfig = {
  participacoes: {
    label: 'Interações',
    color: '#218838',
  },
} satisfies ChartConfig;

export function ClippedAreaChart({
  data = [],
  title = 'Engajamento Comunitário (Últimos 6 meses)',
  subtitle = 'Passe o cursor sobre o gráfico para inspecionar cada mês',
  unitLabel = 'registros',
}: ClippedAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);

  const chartData = useMemo<MonthlyStatPoint[]>(() => {
    if (data.length > 0) return data;
    return [
      { month: 'Jun', participacoes: 0, cadastros: 0 },
      { month: 'Jul', participacoes: 0, cadastros: 0 },
      { month: 'Ago', participacoes: 0, cadastros: 0 },
      { month: 'Set', participacoes: 0, cadastros: 0 },
      { month: 'Out', participacoes: 0, cadastros: 0 },
      { month: 'Nov', participacoes: 0, cadastros: 0 },
    ];
  }, [data]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalParticipacoes = useMemo(
    () => chartData.reduce((acc, item) => acc + item.participacoes, 0),
    [chartData]
  );

  const activePoint =
    hoveredIndex !== null && chartData[hoveredIndex]
      ? chartData[hoveredIndex]
      : chartData[chartData.length - 1];

  const activeValue = activePoint ? activePoint.participacoes : 0;
  const activeMonth = activePoint ? activePoint.month : '';

  const previousMonthValue =
    chartData.length >= 2 ? chartData[chartData.length - 2].participacoes : 0;
  const latestMonthValue =
    chartData.length >= 1 ? chartData[chartData.length - 1].participacoes : 0;

  const deltaLabel = useMemo(() => {
    if (totalParticipacoes === 0) return 'Sem registros ainda';
    if (previousMonthValue === 0 && latestMonthValue > 0) return `+${latestMonthValue} no mês`;
    if (previousMonthValue === 0) return '0% no período';
    const pct = Math.round(((latestMonthValue - previousMonthValue) / previousMonthValue) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}% vs. mês anterior`;
  }, [latestMonthValue, previousMonthValue, totalParticipacoes]);

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[32px] font-semibold tracking-tight text-[#1D1D1F] tabular-nums">
              {hoveredIndex !== null ? activeValue : totalParticipacoes}
            </span>
            <Badge
              variant="secondary"
              className="bg-[#218838]/10 text-[#218838] border-transparent font-medium tabular-nums"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {hoveredIndex !== null ? `${activeMonth}: ${activeValue} ${unitLabel}` : deltaLabel}
            </Badge>
          </div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mt-1">{title}</h3>
          <p className="text-[13px] text-[#6E6E73]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] bg-white border border-black/[0.08] px-3 py-1.5 rounded-full self-start tabular-nums">
          <span className="w-2 h-2 rounded-full bg-[#218838]" />
          <span>Membros, inscritos, RSVPs &amp; orações</span>
        </div>
      </div>

      <div
        ref={chartRef}
        className="w-full"
        onMouseLeave={() => {
          setHoveredIndex(null);
          setAxis(chartRef.current?.getBoundingClientRect().width || 0);
        }}
      >
        <ChartContainer config={chartConfig} className="h-[220px] sm:h-[250px] w-full aspect-auto">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 8, right: 8, top: 14, bottom: 4 }}
            onMouseMove={(state) => {
              const x = state?.activeCoordinate?.x;
              if (typeof x === 'number') {
                setAxis(x);
              }
              const idx =
                typeof state?.activeTooltipIndex === 'number'
                  ? state.activeTooltipIndex
                  : null;
              if (idx !== null) {
                setHoveredIndex(idx);
              }
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.08)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <defs>
              <linearGradient id="paroquiaClippedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#218838" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#218838" stopOpacity={0.02} />
              </linearGradient>
              <clipPath id="paroquia-clipped-area">
                <rect
                  x={0}
                  y={0}
                  width={axis > 0 && hoveredIndex !== null ? axis : '100%'}
                  height="100%"
                />
              </clipPath>
            </defs>

            {/* Ghost base area */}
            <Area
              dataKey="participacoes"
              type="monotone"
              fill="none"
              stroke="rgba(0, 113, 227, 0.22)"
              strokeWidth={2}
              isAnimationActive={false}
            />

            {/* Clipped active area */}
            <Area
              dataKey="participacoes"
              type="monotone"
              fill="url(#paroquiaClippedGradient)"
              fillOpacity={1}
              stroke="#218838"
              strokeWidth={2.25}
              clipPath="url(#paroquia-clipped-area)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
