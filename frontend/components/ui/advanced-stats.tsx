import { useMemo, useRef } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ClippedAreaChart,
  type MonthlyStatPoint,
} from '@/components/ui/advanced-stats-utils/charts';
import { TimelineAnimation } from '@/components/ui/advanced-stats-utils/timeline-animation';
import type { ChurchDatabase } from '@/src/types/church';

interface AdvancedStatsProps {
  db: ChurchDatabase;
}

const MONTH_NAMES_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function getMonthKey(dateInput?: string): string | null {
  if (!dateInput) return null;
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

export default function AdvancedStats({ db }: AdvancedStatsProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  const analytics = useMemo(() => {
    const now = new Date();
    const buckets: Array<{ key: string; month: string; participacoes: number; cadastros: number }> = [];

    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({
        key,
        month: MONTH_NAMES_PT[d.getMonth()],
        participacoes: 0,
        cadastros: 0,
      });
    }

    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    db.members.forEach((m) => {
      const k = getMonthKey(m.joinedAt);
      const b = k ? bucketMap.get(k) : undefined;
      if (b) {
        b.cadastros += 1;
        b.participacoes += 1;
      }
    });

    db.subscribers.forEach((s) => {
      const k = getMonthKey(s.createdAt);
      const b = k ? bucketMap.get(k) : undefined;
      if (b) {
        b.cadastros += 1;
        b.participacoes += 1;
      }
    });

    db.events.forEach((evt) => {
      evt.rsvps.forEach((r) => {
        const k = getMonthKey(r.createdAt);
        const b = k ? bucketMap.get(k) : undefined;
        if (b) b.participacoes += r.guests;
      });
    });

    db.prayerRequests.forEach((req) => {
      const k = getMonthKey(req.createdAt);
      const b = k ? bucketMap.get(k) : undefined;
      if (b) b.participacoes += 1;
    });

    db.notifications.forEach((n) => {
      const k = getMonthKey(n.createdAt);
      const b = k ? bucketMap.get(k) : undefined;
      if (b) b.participacoes += 1;
    });

    const monthlySeries: MonthlyStatPoint[] = buckets.map(({ month, participacoes, cadastros }) => ({
      month,
      participacoes,
      cadastros,
    }));

    const totalMembers = db.members.length;
    const activeAndLeaders = db.members.filter(
      (m) => m.status === 'Ativo' || m.status === 'Coordenador'
    ).length;
    const activeRatio = totalMembers > 0 ? Math.round((activeAndLeaders / totalMembers) * 100) : 0;

    const totalRsvps = db.events.reduce(
      (acc, e) => acc + e.rsvps.reduce((sum, r) => sum + r.guests, 0),
      0
    );
    const totalCapacity = db.events.reduce((acc, e) => acc + (e.capacity || 0), 0);
    const occupancyPct =
      totalCapacity > 0 ? Math.min(100, Math.round((totalRsvps / totalCapacity) * 100)) : 0;

    const pushSubscribers = db.subscribers.filter((s) => s.pushEnabled).length;
    const pendingPrayers = db.prayerRequests.filter((p) => p.status === 'Pendente').length;
    const prayedCount = db.prayerRequests.filter((p) => p.status !== 'Pendente').length;

    const currentMonthCadastros = buckets[buckets.length - 1]?.cadastros ?? 0;
    const prevMonthCadastros = buckets[buckets.length - 2]?.cadastros ?? 0;
    const growthDelta =
      prevMonthCadastros > 0
        ? Math.round(((currentMonthCadastros - prevMonthCadastros) / prevMonthCadastros) * 100)
        : currentMonthCadastros > 0
          ? 100
          : 0;

    // Pastoral digital engagement goal combining registered members, active alerts & prayers
    const engagementPoints = activeAndLeaders + db.subscribers.length + totalRsvps;
    const targetGoal = 100;
    const goalProgress = Math.min(100, Math.round((engagementPoints / targetGoal) * 100));

    return {
      monthlySeries,
      totalMembers,
      activeAndLeaders,
      activeRatio,
      totalRsvps,
      occupancyPct,
      pushSubscribers,
      pendingPrayers,
      prayedCount,
      currentMonthCadastros,
      growthDelta,
      engagementPoints,
      goalProgress,
      targetGoal,
    };
  }, [db]);

  const kpis = [
    {
      label: 'Paroquianos Ativos',
      value: String(analytics.activeAndLeaders),
      change: analytics.totalMembers > 0 ? `${analytics.activeRatio}%` : '0%',
      status: 'up' as const,
    },
    {
      label: 'Inscritos Notificar',
      value: String(db.subscribers.length),
      change: `${analytics.pushSubscribers} push`,
      status: 'up' as const,
    },
    {
      label: 'Presenças (RSVPs)',
      value: String(analytics.totalRsvps),
      change: db.events.length > 0 ? `${analytics.occupancyPct}% vagas` : '0 eventos',
      status: analytics.totalRsvps > 0 ? ('up' as const) : ('down' as const),
    },
    {
      label: 'Pedidos Pendentes',
      value: String(analytics.pendingPrayers),
      change: `${analytics.prayedCount} atendidos`,
      status: analytics.pendingPrayers > 0 ? ('down' as const) : ('up' as const),
    },
  ];

  return (
    <section ref={timelineRef} className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">
          Estatísticas &amp; Alcance Paroquial
        </h1>
        <p className="text-[13px] text-[#6E6E73]">
          Acompanhamento em tempo real dos cadastros, notificações, presenças em eventos e
          atendimentos pastorais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <TimelineAnimation
          animationNum={1}
          timelineRef={timelineRef}
          className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08]"
        >
          <ClippedAreaChart data={analytics.monthlySeries} />
        </TimelineAnimation>

        {/* Breakdown Section */}
        <div className="flex flex-col gap-4">
          <TimelineAnimation
            animationNum={2}
            timelineRef={timelineRef}
            className="p-6 rounded-3xl flex-1 bg-[#1D1D1F] text-white flex flex-col justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                Meta Pastoral
              </p>
              <h4 className="text-xl font-semibold tracking-tight">
                Comunhão &amp; Alcance Digital
              </h4>
              <p className="text-[12px] text-white/65 mt-1 leading-relaxed">
                Soma de membros ativos, inscritos em avisos e presenças confirmadas.
              </p>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-semibold tracking-tighter tabular-nums">
                  {analytics.goalProgress}%
                </span>
                <span className="text-xs font-medium text-white/60 mb-1 tabular-nums">
                  Meta: {analytics.targetGoal} participações ({analytics.engagementPoints})
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${analytics.goalProgress}%` }}
                />
              </div>
            </div>
          </TimelineAnimation>

          <TimelineAnimation
            animationNum={3}
            timelineRef={timelineRef}
            className="p-6 rounded-3xl flex-1 bg-white border border-black/[0.08] flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="size-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center border border-black/[0.06]">
                <Users className="w-4 h-4 text-[#218838]" />
              </div>
              <h4 className="font-semibold text-[#1D1D1F]">Crescimento da Comunidade</h4>
            </div>
            <p className="text-sm text-[#6E6E73] leading-relaxed">
              Neste mês foram registrados{' '}
              <span className="text-[#1D1D1F] font-semibold tabular-nums">
                {analytics.currentMonthCadastros}
              </span>{' '}
              novos cadastros (membros e inscritos em avisos), variação de{' '}
              <span className="text-[#1D1D1F] font-semibold tabular-nums">
                {analytics.growthDelta >= 0 ? `+${analytics.growthDelta}%` : `${analytics.growthDelta}%`}
              </span>{' '}
              em relação ao mês anterior.
            </p>
          </TimelineAnimation>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <TimelineAnimation
            animationNum={4 + index}
            timelineRef={timelineRef}
            key={kpi.label}
            className={cn(
              'p-5 sm:p-6 rounded-2xl border bg-white border-black/[0.08] transition-colors',
              kpi.status === 'up'
                ? 'hover:border-emerald-400 hover:bg-emerald-50/40'
                : 'hover:border-rose-400 hover:bg-rose-50/40'
            )}
          >
            <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">
              {kpi.label}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl sm:text-[28px] font-semibold text-[#1D1D1F] tracking-tight tabular-nums">
                {kpi.value}
              </p>
              <span
                className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums',
                  kpi.status === 'up'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                )}
              >
                {kpi.change}
              </span>
            </div>
          </TimelineAnimation>
        ))}
      </div>
    </section>
  );
}
