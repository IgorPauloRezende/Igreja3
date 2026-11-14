import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Cross,
} from 'lucide-react';
import parishLogo from '../assets/images/logo_igreja.svg';
import igrejaImg from '../assets/images/igreja.jpg';
import fellowshipImg from '../assets/images/community_fellowship_1794536416038.jpg';
import worshipImg from '../assets/images/event_worship_night_1794536414880.jpg';

interface Spread {
  id: number;
  label: string;
  leftPage?: {
    verseRef?: string;
    chapter?: string;
    title: string;
    subtitle?: string;
    image?: string;
    imageCaption?: string;
    content: string[];
    sacredVerse?: string;
    pageNumber?: number;
  };
  rightPage?: {
    verseRef?: string;
    chapter?: string;
    title: string;
    subtitle?: string;
    image?: string;
    imageCaption?: string;
    content: string[];
    sacredVerse?: string;
    pageNumber?: number;
  };
}

const BIBLE_SPREADS: Spread[] = [
  // 0: Capa de Couro da Bíblia Sagrada
  {
    id: 0,
    label: 'Capa da Bíblia',
  },
  // 1: Prólogo & Santa Isabel
  {
    id: 1,
    label: 'Acolhida & Santa Isabel',
    leftPage: {
      chapter: 'LIVRO DO GÊNESIS PAROQUIAL',
      verseRef: 'Is 1, 1-4',
      title: 'A Casa do Senhor',
      subtitle: '“Quão amáveis são os teus tabernáculos, Senhor dos Exércitos!” (Sl 84)',
      content: [
        'Eis o memorial sagrado erguido sob o manto de Santa Isabel da Hungria. Em solo abençoado de Casa Verde, reuniu-se um povo eleito para erguer um altar vivo de louvor, oração e caridade contínua.',
        'Cada tijolo assentado é testemunho de gerações que aqui dobraram os joelhos, batizaram seus filhos, selaram matrimônios e encontraram no Pão da Vida o alento para suas jornadas terrenas.',
      ],
      sacredVerse:
        '“Vinde a mim todos vós que estais cansados e fatigados sob o peso dos vossos fardos, e eu vos darei descanso.” — Mateus 11, 28',
      pageNumber: 1,
    },
    rightPage: {
      chapter: 'CÂNTICO DA PADROEIRA',
      verseRef: 'Lc 1, 46-55',
      title: 'Santa Isabel da Hungria',
      subtitle: 'Rainha humilde, Serva dos pobres e Mãe dos aflitos',
      content: [
        'Princesa da Hungria e Duquesa da Turíngia, Santa Isabel despiu-se da glória terrena para servir a Cristo nos enfermos e necessitados. Fundou hospitais, distribuiu pães e cuidou dos leprosos com ternura de mãe.',
        'Ao ser interrogada com o regaço repleto de pães para os famintos, revelou diante de todos o milagre celeste: os pães haviam se transformado em frescas e perfumadas rosas de Deus.',
      ],
      sacredVerse:
        '“Tudo o que fizestes a um destes meus irmãos mais pequeninos, a mim o fizestes.” — Mateus 25, 40',
      pageNumber: 2,
    },
  },
  // 2: Matriz & Pastorais
  {
    id: 2,
    label: 'Igreja Matriz & Pastorais',
    leftPage: {
      chapter: 'TEMPLO & ALTAR',
      verseRef: '1Rs 8, 27-30',
      title: 'Igreja Matriz e Capela Maranata',
      subtitle: 'Lugar de Adoração Perpétua e Reconciliação',
      image: igrejaImg,
      imageCaption: 'A Matriz na Rua Elias Gannam — Casa Verde, SP',
      content: [
        'Na nave sagrada da Matriz, o Sacrário ilumina os passos de nossa comunidade. As portas abertas acolhem o romeiro, o paroquiano e todo aquele que busca a bênção de Deus nas missas dominicais e semanais.',
      ],
      sacredVerse:
        '“Este lugar não é outro senão a casa de Deus e a porta do céu!” — Gênesis 28, 17',
      pageNumber: 3,
    },
    rightPage: {
      chapter: 'ATOS DOS APÓSTOLOS',
      verseRef: 'At 2, 42-47',
      title: 'Comunhão & Pastorais',
      subtitle: 'Perseverantes na Doutrina e na Fração do Pão',
      image: fellowshipImg,
      imageCaption: 'O serviço alegre dos ministérios e pastorais paroquiais',
      content: [
        'Como nas primeiras comunidades cristãs, os paroquianos unem-se em ministérios de amor: Liturgia, Música, Acolhida, Catequese, Ação Social e Dízimo.',
        'A fé se traduz em gestos concretos de acolhimento às famílias e solidariedade aos irmãos em vulnerabilidade.',
      ],
      sacredVerse:
        '“Eram assíduos ao ensinamento dos apóstolos, à comunhão fraterna e às orações.” — Atos 2, 42',
      pageNumber: 4,
    },
  },
  // 3: Juventude & Oração
  {
    id: 3,
    label: 'Juventude & Bênção Final',
    leftPage: {
      chapter: 'NOVA EVANGELIZAÇÃO',
      verseRef: '1Tm 4, 12',
      title: 'Juventude Carlo Acutis',
      subtitle: 'Santos de Calça Jeans e Adoradores em Espírito',
      image: worshipImg,
      imageCaption: 'Vigílias, louvor e adoração da Juventude Paroquial',
      content: [
        'Guiados pelo exemplo do jovem Beato Carlo Acutis, nossa juventude proclama que a santidade é um chamado para o hoje.',
        'Com noites de vigília, louvor e serviço alegre, os jovens testemunham a luz do Evangelho no meio das famílias e da cidade.',
      ],
      sacredVerse:
        '“A Eucaristia é a minha autoestrada para o Céu. Todos nascem originais, mas muitos morrem como fotocópias.” — Beato Carlo Acutis',
      pageNumber: 5,
    },
    rightPage: {
      chapter: 'BÊNÇÃO SOLENE',
      verseRef: 'Nm 6, 24-26',
      title: 'Oração à Padroeira',
      subtitle: 'Prece por Todas as Famílias de Nossa Paróquia',
      content: [
        'Ó Santa Isabel, que soubestes unir a realeza ao serviço humilde, ensinai-nos a repartir o pão da esperança e da caridade cristã.',
        'Abençoai os lares, curai os enfermos, guardai as crianças e jovens de nossa paróquia, e fazei brotar em nossas vidas as rosas da paz e da santidade.',
      ],
      sacredVerse:
        '“O Senhor te abençoe e te guarde! O Senhor faça brilhar sobre ti a sua face e te conceda a paz!” — Números 6, 24-26',
      pageNumber: 6,
    },
  },
  // 4: Contracapa Traseira da Bíblia
  {
    id: 4,
    label: 'Contracapa',
  },
];

export function ParishBook() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSpreads = BIBLE_SPREADS.length;
  const spread = BIBLE_SPREADS[currentSpread];

  function handleNext() {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentSpread > 0) {
      setCurrentSpread((prev) => prev - 1);
    }
  }

  const isCover = currentSpread === 0;
  const isBackCover = currentSpread === totalSpreads - 1;
  const isOpen = !isCover && !isBackCover;

  return (
    <section
      id="livro"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 bg-[#0E0E11] text-[#E8E6E3] relative overflow-hidden"
    >
      {/* Luz ambiente dourada de altar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1140px] mx-auto relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#EED8A1] text-[12px] font-serif tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Memorial Sagrado</span>
          </div>

          <h2 className="text-[30px] sm:text-[42px] font-serif font-bold text-[#F8F5EE] tracking-tight leading-tight">
            Livro Sagrado da Paróquia
          </h2>

          <p className="text-[14px] sm:text-[16px] text-[#A6A29A] leading-relaxed font-serif">
            Folheie a Bíblia Memorial de nossa história, vocações e testemunhos de fé.
          </p>
        </div>

        {/* CONTAINER DO LIVRO / BÍBLIA */}
        <div
          className={`relative mx-auto transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[100] bg-black/95 p-4 sm:p-10 flex flex-col items-center justify-center'
              : 'w-full max-w-[980px]'
          }`}
        >
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 z-[110] px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium backdrop-blur-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Sair da tela cheia</span>
            </button>
          )}

          {/* ESTRUTURA DO LIVRO 3D */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[620px] select-none">
            {/* Sombra realista na mesa */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[94%] h-10 bg-black/70 rounded-full blur-2xl pointer-events-none" />

            {/* Espessura dourada das folhas nas bordas (Laterais douradas da Bíblia) */}
            <div className="absolute -right-2 top-2 bottom-2 w-3 bg-gradient-to-r from-[#8B6B2B] via-[#EED8A1] to-[#8B6B2B] rounded-r-md shadow-md pointer-events-none opacity-85" />
            <div className="absolute -bottom-2 left-3 right-3 h-3 bg-gradient-to-b from-[#8B6B2B] via-[#EED8A1] to-[#684F1D] rounded-b-md shadow-md pointer-events-none opacity-85" />

            {/* Fita Marcador de Página Vermelha (Ribbon) descendo da bíblia */}
            <div className="absolute top-0 right-14 w-5 h-36 bg-gradient-to-b from-[#9E1B1B] via-[#BD2424] to-[#731212] rounded-b-sm shadow-xl z-30 pointer-events-none border-x border-[#BD2424]/40" />

            <AnimatePresence mode="wait">
              {/* ======================================================== */}
              {/* 1. CAPA DA BÍBLIA SAGRADA (COURO PRETO / DOURADO EM RELEVO) */}
              {/* ======================================================== */}
              {isCover && (
                <motion.div
                  key="bible-cover"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.92 }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                  onClick={handleNext}
                  className="w-full h-full rounded-[18px] sm:rounded-[24px] bg-[#141210] text-[#EED8A1] shadow-[inset_0_0_80px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-12 flex flex-col items-center justify-between text-center border-4 border-[#3D342A] relative overflow-hidden cursor-pointer group"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(45, 38, 30, 0.5) 0%, rgba(12, 11, 10, 0.95) 100%)`,
                  }}
                >
                  {/* Moldura clássica em baixo-relevo dourado da Bíblia */}
                  <div className="absolute inset-3 border-2 border-[#C5A059]/40 rounded-[16px] pointer-events-none shadow-[inset_0_0_15px_rgba(197,160,89,0.15)]" />
                  <div className="absolute inset-5 border border-[#C5A059]/20 rounded-[12px] pointer-events-none" />

                  {/* Cantoneiras douradas barrocas */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#C5A059] opacity-80" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#C5A059] opacity-80" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#C5A059] opacity-80" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#C5A059] opacity-80" />

                  {/* Lombada clássica (Vinco da costura do couro à esquerda) */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 via-[#262017]/40 to-transparent pointer-events-none border-r border-[#C5A059]/20" />

                  {/* Topo da capa */}
                  <div className="pt-4 space-y-1 relative z-10">
                    <p className="text-[11px] sm:text-[13px] uppercase tracking-[0.35em] text-[#C5A059] font-serif font-semibold">
                      Paróquia Rainha Santa Isabel
                    </p>
                    <p className="text-[10px] sm:text-[11px] tracking-widest text-[#A69986] uppercase font-serif">
                      Diocese de Santana · Casa Verde, São Paulo
                    </p>
                  </div>

                  {/* Cruz Dourada em Relevo e Título da Bíblia */}
                  <div className="relative my-auto flex flex-col items-center z-10">
                    {/* Cruz Latina Dourada ornamental */}
                    <div className="w-16 h-24 sm:w-20 sm:h-28 flex flex-col items-center justify-center relative mb-4 group-hover:scale-105 transition-transform duration-500">
                      <div className="w-3.5 sm:w-4 h-full bg-gradient-to-b from-[#FFF2B2] via-[#C5A059] to-[#846326] rounded-xs shadow-[0_0_20px_rgba(197,160,89,0.5)]" />
                      <div className="absolute top-5 sm:top-6 w-14 sm:w-18 h-3.5 sm:h-4 bg-gradient-to-r from-[#FFF2B2] via-[#C5A059] to-[#846326] rounded-xs shadow-[0_0_20px_rgba(197,160,89,0.5)]" />
                    </div>

                    <h3 className="text-[26px] sm:text-[40px] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D0] via-[#EED8A1] to-[#C5A059] tracking-[0.18em] filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      BÍBLIA MEMORIAL
                    </h3>

                    <p className="mt-2 text-[12px] sm:text-[14px] text-[#D8CEBA] font-serif italic max-w-md">
                      “Lâmpada para os meus passos é a tua palavra e luz no meu caminho.”
                      <span className="block not-italic text-[11px] text-[#C5A059] mt-0.5 tracking-wider font-semibold">
                        SALMO 119, 105
                      </span>
                    </p>
                  </div>

                  {/* Toque para abrir */}
                  <div className="pb-2 relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#EED8A1] text-[12px] sm:text-[13px] font-serif tracking-widest group-hover:bg-[#C5A059]/30 transition-colors shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>TOQUE PARA ABRIR A BÍBLIA</span>
                      <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* 2. PÁGINAS ABERTAS EM ESTILO BÍBLIA SAGRADA (COLUNAS & CAPÍTULOS) */}
              {/* ======================================================== */}
              {isOpen && (
                <motion.div
                  key={`spread-${currentSpread}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full h-full rounded-[16px] sm:rounded-[22px] bg-[#F7F3E9] text-[#24211D] border-4 border-[#2D261E] shadow-[inset_0_0_40px_rgba(0,0,0,0.1),0_25px_60px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row overflow-hidden relative font-serif"
                >
                  {/* Vinco central profundo da Bíblia (Encadernação costurada) */}
                  <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/40 to-black/15 pointer-events-none z-20" />
                  <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/45 z-20" />

                  {/* Bordas envelhecidas do papel bíblia */}
                  <div className="absolute inset-0 shadow-[inset_0_0_35px_rgba(150,130,90,0.25)] pointer-events-none z-10" />

                  {/* PÁGINA ESQUERDA DA BÍBLIA */}
                  <div
                    onClick={handlePrev}
                    title="Clique para voltar a página"
                    className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 sm:p-7 md:p-9 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#D9D0BE] relative cursor-pointer hover:bg-black/[0.015] transition-colors overflow-y-auto"
                  >
                    {spread.leftPage && (
                      <div className="space-y-3">
                        {/* Cabeçalho Litúrgico da Página */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#C8BEAA] text-[11px] text-[#6E6455] tracking-widest uppercase">
                          <span>{spread.leftPage.chapter}</span>
                          <span className="font-bold text-[#8C2323]">{spread.leftPage.verseRef}</span>
                        </div>

                        <div>
                          <h4 className="text-[19px] sm:text-[23px] font-bold text-[#1F1C18] leading-tight">
                            {spread.leftPage.title}
                          </h4>
                          {spread.leftPage.subtitle && (
                            <p className="text-[12px] sm:text-[13px] text-[#6E6455] italic mt-0.5">
                              {spread.leftPage.subtitle}
                            </p>
                          )}
                        </div>

                        {spread.leftPage.image && (
                          <div className="rounded-lg overflow-hidden border border-[#C8BEAA] shadow-sm max-h-32 sm:max-h-40">
                            <img
                              src={spread.leftPage.image}
                              alt={spread.leftPage.title}
                              className="w-full h-full object-cover sepia-[0.15]"
                            />
                            {spread.leftPage.imageCaption && (
                              <p className="p-1 text-[10.5px] text-center text-[#554E44] bg-[#EFE9DC] italic border-t border-[#D9D0BE]">
                                {spread.leftPage.imageCaption}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Texto com letra capitular estilizada */}
                        <div className="space-y-2 text-[12px] sm:text-[13px] text-[#332E27] leading-relaxed text-justify">
                          {spread.leftPage.content.map((p, idx) => (
                            <p key={idx}>
                              {idx === 0 ? (
                                <span className="float-left text-[38px] sm:text-[44px] font-bold text-[#8C2323] leading-none pr-2 pt-1 font-serif">
                                  {p.charAt(0)}
                                </span>
                              ) : null}
                              {idx === 0 ? p.slice(1) : p}
                            </p>
                          ))}
                        </div>

                        {/* Versículo de Destaque */}
                        {spread.leftPage.sacredVerse && (
                          <div className="p-3 rounded-lg bg-[#EFE9DC] border-l-3 border-[#8C2323] text-[11.5px] italic text-[#4A433A] shadow-xs">
                            {spread.leftPage.sacredVerse}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#7A7061] border-t border-[#D9D0BE]/70">
                      <span className="inline-flex items-center gap-1 hover:text-[#1F1C18]">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                      </span>
                      <span className="font-semibold">— {spread.leftPage?.pageNumber} —</span>
                    </div>
                  </div>

                  {/* PÁGINA DIREITA DA BÍBLIA */}
                  <div
                    onClick={handleNext}
                    title="Clique para avançar a página"
                    className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 sm:p-7 md:p-9 flex flex-col justify-between relative cursor-pointer hover:bg-black/[0.015] transition-colors overflow-y-auto"
                  >
                    {spread.rightPage && (
                      <div className="space-y-3">
                        {/* Cabeçalho Litúrgico da Página */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#C8BEAA] text-[11px] text-[#6E6455] tracking-widest uppercase">
                          <span className="font-bold text-[#8C2323]">{spread.rightPage.verseRef}</span>
                          <span>{spread.rightPage.chapter}</span>
                        </div>

                        <div>
                          <h4 className="text-[19px] sm:text-[23px] font-bold text-[#1F1C18] leading-tight">
                            {spread.rightPage.title}
                          </h4>
                          {spread.rightPage.subtitle && (
                            <p className="text-[12px] sm:text-[13px] text-[#6E6455] italic mt-0.5">
                              {spread.rightPage.subtitle}
                            </p>
                          )}
                        </div>

                        {spread.rightPage.image && (
                          <div className="rounded-lg overflow-hidden border border-[#C8BEAA] shadow-sm max-h-32 sm:max-h-40">
                            <img
                              src={spread.rightPage.image}
                              alt={spread.rightPage.title}
                              className="w-full h-full object-cover sepia-[0.15]"
                            />
                            {spread.rightPage.imageCaption && (
                              <p className="p-1 text-[10.5px] text-center text-[#554E44] bg-[#EFE9DC] italic border-t border-[#D9D0BE]">
                                {spread.rightPage.imageCaption}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Texto com letra capitular */}
                        <div className="space-y-2 text-[12px] sm:text-[13px] text-[#332E27] leading-relaxed text-justify">
                          {spread.rightPage.content.map((p, idx) => (
                            <p key={idx}>
                              {idx === 0 ? (
                                <span className="float-left text-[38px] sm:text-[44px] font-bold text-[#8C2323] leading-none pr-2 pt-1 font-serif">
                                  {p.charAt(0)}
                                </span>
                              ) : null}
                              {idx === 0 ? p.slice(1) : p}
                            </p>
                          ))}
                        </div>

                        {/* Versículo de Destaque */}
                        {spread.rightPage.sacredVerse && (
                          <div className="p-3 rounded-lg bg-[#EFE9DC] border-l-3 border-[#8C2323] text-[11.5px] italic text-[#4A433A] shadow-xs">
                            {spread.rightPage.sacredVerse}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#7A7061] border-t border-[#D9D0BE]/70">
                      <span className="font-semibold">— {spread.rightPage?.pageNumber} —</span>
                      <span className="inline-flex items-center gap-1 hover:text-[#1F1C18]">
                        <span>Avançar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* 3. CONTRACAPA TRASEIRA DA BÍBLIA (COURO ESCURO COM CRUZ) */}
              {/* ======================================================== */}
              {isBackCover && (
                <motion.div
                  key="bible-back-cover"
                  initial={{ opacity: 0, rotateY: 30, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 90, scale: 0.92 }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => setCurrentSpread(0)}
                  className="w-full h-full rounded-[18px] sm:rounded-[24px] bg-[#141210] text-[#EED8A1] shadow-[inset_0_0_80px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-12 flex flex-col items-center justify-between text-center border-4 border-[#3D342A] relative overflow-hidden cursor-pointer group font-serif"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(45, 38, 30, 0.5) 0%, rgba(12, 11, 10, 0.95) 100%)`,
                  }}
                >
                  <div className="absolute inset-3 border-2 border-[#C5A059]/40 rounded-[16px] pointer-events-none" />
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#C5A059] opacity-80" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#C5A059] opacity-80" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#C5A059] opacity-80" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#C5A059] opacity-80" />

                  <div className="pt-4">
                    <p className="text-[12px] uppercase tracking-[0.3em] text-[#C5A059]">
                      Amém · Louvado Seja Nosso Senhor Jesus Cristo
                    </p>
                  </div>

                  <div className="my-auto max-w-md space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center p-3 shadow-lg">
                      <img
                        src={parishLogo}
                        alt="Brasão"
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.4)]"
                      />
                    </div>

                    <p className="text-[15px] sm:text-[17px] italic text-[#F4E6C3] leading-relaxed">
                      “Para sempre seja louvado o nome de Jesus e de Sua Santa Mãe e Padroeira Rainha Santa Isabel.”
                    </p>

                    <p className="text-[11px] tracking-widest text-[#A69986] uppercase font-sans">
                      Rua Elias Gannam, 331 · Casa Verde, São Paulo — SP
                    </p>
                  </div>

                  <div className="pb-2">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#EED8A1] text-[12px] tracking-widest group-hover:bg-[#C5A059]/30 transition-colors">
                      <span>FECHAR E VOLTAR À CAPA</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BARRA DE CONTROLE DA BÍBLIA */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 px-2 font-serif">
            {/* Botão Anterior */}
            <button
              type="button"
              disabled={currentSpread === 0}
              onClick={handlePrev}
              aria-label="Página anterior"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A17] border border-[#C5A059]/30 text-[13px] text-[#EED8A1] hover:bg-[#2A2621] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md"
            >
              <ChevronLeft className="w-4 h-4 text-[#C5A059]" />
              <span>Página Anterior</span>
            </button>

            {/* Marcadores de Capítulos */}
            <div className="flex items-center gap-2">
              {BIBLE_SPREADS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSpread(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSpread === idx
                      ? 'w-8 bg-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.7)]'
                      : 'w-2.5 bg-[#4A4033] hover:bg-[#736450]'
                  }`}
                  title={s.label}
                />
              ))}
              <span className="ml-2 text-[12px] text-[#C5A059] tracking-wider uppercase font-sans font-semibold">
                {currentSpread === 0
                  ? 'Capa'
                  : currentSpread === totalSpreads - 1
                  ? 'Contracapa'
                  : `Págs. ${currentSpread * 2 - 1}–${currentSpread * 2}`}
              </span>
            </div>

            {/* Ações da direita: Próximo & Tela cheia */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                aria-label="Alternar tela cheia"
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1C1A17] border border-[#C5A059]/30 text-[#EED8A1] hover:bg-[#2A2621] transition-all cursor-pointer shadow-md"
                title="Modo de leitura imersiva"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={currentSpread === totalSpreads - 1}
                onClick={handleNext}
                aria-label="Próxima página"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C5A059] to-[#9E7B34] text-black font-semibold text-[13px] hover:brightness-110 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <span>Próxima Página</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
