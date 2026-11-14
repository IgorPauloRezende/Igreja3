import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import type { PublicEvent } from './PublicSite';

interface SchedulePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  events: PublicEvent[];
  onViewAllMasses: () => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function SchedulePopover({
  isOpen,
  onClose,
  events,
  onViewAllMasses,
}: SchedulePopoverProps) {
  // Inicializa com a data atual
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Dias do mês
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      hasCelebration: boolean;
    }> = [];

    // Dias do mês anterior para completar a semana
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        hasCelebration: checkHasCelebration(d, events),
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        hasCelebration: checkHasCelebration(d, events),
      });
    }

    // Dias do próximo mês para completar a grade de 35 ou 42 dias
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        hasCelebration: checkHasCelebration(d, events),
      });
    }

    return days;
  }, [currentYear, currentMonth, events]);

  function handlePrevMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }

  function handleToday() {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  const selectedCelebrations = useMemo(() => {
    return getCelebrationsForDate(selectedDate, events);
  }, [selectedDate, events]);

  const isTodaySelected = isSameDay(selectedDate, new Date());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-label="Calendário de Horários e Missas"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="fixed inset-x-3 top-[74px] sm:inset-x-auto sm:top-full sm:right-0 sm:absolute sm:mt-3 sm:w-[350px] rounded-[24px] bg-white border border-black/[0.08] shadow-2xl p-4 sm:p-5 text-left z-50 origin-top-right overflow-hidden dark:bg-[#1C1C1E] dark:border-white/[0.12] dark:text-white"
        >
          {/* Header com Mês e Navegação */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#009E49]/10 text-[#009E49] flex items-center justify-center">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white capitalize">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToday}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium text-[#0066CC] hover:bg-[#0066CC]/10 transition-colors cursor-pointer"
                title="Ir para hoje"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar calendário"
                className="w-7 h-7 ml-1 rounded-full flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
            {WEEKDAY_NAMES.map((day, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-semibold ${
                  idx === 0
                    ? 'text-[#E02020]'
                    : idx === 3 || idx === 5
                    ? 'text-[#009E49]'
                    : 'text-[#86868B]'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {calendarDays.map((item, idx) => {
              const isSelected = isSameDay(item.date, selectedDate);
              const isToday = isSameDay(item.date, new Date());

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(item.date)}
                  className={`relative flex flex-col items-center justify-center h-8 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                      : item.isCurrentMonth
                      ? 'text-[#1D1D1F] dark:text-white/90 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                      : 'text-[#C7C7CC] dark:text-white/20 hover:bg-black/[0.02]'
                  } ${isToday && !isSelected ? 'ring-1 ring-[#0066CC] font-bold text-[#0066CC]' : ''}`}
                >
                  <span>{item.dayNumber}</span>
                  {item.hasCelebration && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        isSelected
                          ? 'bg-[#009E49]'
                          : item.date.getDay() === 0
                          ? 'bg-[#009E49]'
                          : 'bg-[#0066CC]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detalhes do dia selecionado */}
          <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#1D1D1F] dark:text-white">
                {formatDateLabel(selectedDate)}
              </span>
              {isTodaySelected && (
                <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#0066CC]/10 text-[#0066CC]">
                  Hoje
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {selectedCelebrations.length > 0 ? (
                selectedCelebrations.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.06] text-[12px]"
                  >
                    <div className="px-1.5 py-0.5 rounded-md bg-[#1D1D1F] text-white text-[11px] font-mono font-medium shrink-0 flex items-center gap-1 dark:bg-white dark:text-[#1D1D1F]">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{c.time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1D1D1F] dark:text-white leading-tight flex items-center gap-1">
                        {c.type === 'special' && (
                          <Sparkles className="w-3 h-3 text-[#E08A00] shrink-0" />
                        )}
                        <span className="truncate">{c.title}</span>
                      </p>
                      <p className="text-[11px] text-[#6E6E73] dark:text-white/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{c.place}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2.5 px-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04] text-center">
                  <p className="text-[12px] text-[#6E6E73] dark:text-white/60 leading-relaxed">
                    Sem celebrações comunitárias regulares neste dia. Igreja aberta para oração e
                    secretaria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé / Link para a seção completa */}
          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11.5px]">
            <span className="text-[#86868B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009E49]" />
              Missas regulares
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewAllMasses();
              }}
              className="font-semibold text-[#0066CC] hover:underline cursor-pointer"
            >
              Ver tabela completa &rarr;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helpers de datas e checagem de missas
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function checkHasCelebration(date: Date, events: PublicEvent[]): boolean {
  const day = date.getDay();
  // Domingo (0), Quarta (3)
  if (day === 0 || day === 3) return true;
  // 1ª sexta-feira do mês (dia 1 a 7 e day === 5)
  if (day === 5 && date.getDate() <= 7) return true;

  // Eventos especiais
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  return events.some((e) => e.date === dateStr);
}

function getCelebrationsForDate(date: Date, events: PublicEvent[]) {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const list: Array<{
    time: string;
    place: string;
    type: 'regular' | 'special';
    title: string;
  }> = [];

  // Domingo
  if (dayOfWeek === 0) {
    list.push({
      time: '08:00',
      place: 'Igreja Matriz',
      type: 'regular',
      title: 'Santa Missa Dominical',
    });
    list.push({
      time: '10:00',
      place: 'Igreja Matriz',
      type: 'regular',
      title: 'Santa Missa Dominical',
    });
    list.push({
      time: '11:30',
      place: 'Capela Maranata',
      type: 'regular',
      title: 'Santa Missa Dominical',
    });
    list.push({
      time: '18:00',
      place: 'Igreja Matriz',
      type: 'regular',
      title: 'Santa Missa Dominical',
    });
  }

  // Quarta-feira
  if (dayOfWeek === 3) {
    list.push({
      time: '19:30',
      place: 'Igreja Matriz',
      type: 'regular',
      title: 'Santa Missa e Novena',
    });
  }

  // Primeira sexta-feira do mês
  if (dayOfWeek === 5 && dayOfMonth <= 7) {
    list.push({
      time: '15:00',
      place: 'Igreja Matriz',
      type: 'regular',
      title: 'Missa do Sagrado Coração de Jesus',
    });
  }

  // Eventos na data
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const matching = events.filter((e) => e.date === dateStr);
  for (const evt of matching) {
    list.push({
      time: evt.time || '19:00',
      place: evt.location || 'Igreja Matriz',
      type: 'special',
      title: evt.title,
    });
  }

  return list;
}

function formatDateLabel(date: Date): string {
  const weekdayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  return `${weekdayNames[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}
