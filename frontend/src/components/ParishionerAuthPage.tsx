import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BellRing,
  Calendar,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { formatDatePt } from '../lib/format';
import type { MinistryName, SafeParishioner } from '../types/church';
import { ParishEmblem } from './ParishEmblem';

export type ParishionerAuthMode = 'register' | 'login';

interface ParishionerAuthPageProps {
  initialMode: ParishionerAuthMode;
  account: SafeParishioner | null;
  onAuthenticated: (account: SafeParishioner) => void;
  onLoggedOut: () => void;
  onBackToSite: (sectionHash?: string) => void;
}

const PASTORAL_OPTIONS: Array<{ value: MinistryName | 'Comunidade'; label: string }> = [
  { value: 'Comunidade', label: 'Comunidade paroquial' },
];

export function ParishionerAuthPage({
  initialMode,
  account,
  onAuthenticated,
  onLoggedOut,
  onBackToSite,
}: ParishionerAuthPageProps) {
  const [mode, setMode] = useState<ParishionerAuthMode>(initialMode);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pastoral, setPastoral] = useState<MinistryName | 'Comunidade'>('Comunidade');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Account edit fields (when logged in)
  const [editName, setEditName] = useState(account?.fullName || '');
  const [editPhone, setEditPhone] = useState(account?.phone || '');
  const [editPastoral, setEditPastoral] = useState<MinistryName | 'Comunidade'>(
    account?.pastoral || 'Comunidade',
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/parishioner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: regEmail,
          phone,
          pastoral,
          password: regPassword,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        account?: SafeParishioner;
      };
      if (!res.ok || !json.account) {
        throw new Error(json.error || 'Não foi possível concluir seu cadastro.');
      }

      setEditName(json.account.fullName);
      setEditPhone(json.account.phone);
      setEditPastoral(json.account.pastoral);
      onAuthenticated(json.account);
      setSuccessMsg('Conta criada com sucesso! Bem-vindo à Área do Paroquiano.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/parishioner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        account?: SafeParishioner;
      };
      if (!res.ok || !json.account) {
        throw new Error(json.error || 'E-mail ou senha incorretos.');
      }

      setEditName(json.account.fullName);
      setEditPhone(json.account.phone);
      setEditPastoral(json.account.pastoral);
      onAuthenticated(json.account);
      setSuccessMsg('Acesso realizado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/parishioner/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName,
          phone: editPhone,
          pastoral: editPastoral,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        account?: SafeParishioner;
      };
      if (!res.ok || !json.account) {
        throw new Error(json.error || 'Não foi possível salvar suas alterações.');
      }
      onAuthenticated(json.account);
      setSuccessMsg('Seus dados foram atualizados com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/parishioner/logout', { method: 'POST' });
    } finally {
      setLoading(false);
      setSuccessMsg('');
      setError('');
      onLoggedOut();
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onBackToSite()}
            className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
          >
            <div className="w-9 h-9 shrink-0">
              <ParishEmblem alt="Brasão Paróquia Rainha Santa Isabel" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight min-w-0">
              <span className="block text-[13.5px] font-semibold text-[#1D1D1F] truncate">
                Paróquia Rainha Santa Isabel
              </span>
              <span className="block text-[11px] text-[#6E6E73] truncate">
                Área do Paroquiano
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onBackToSite()}
            className="inline-flex items-center gap-1.5 px-4 min-h-[38px] rounded-full bg-black/[0.05] hover:bg-black/[0.09] text-[13px] font-medium text-[#1D1D1F] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao site</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        {account ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[640px] space-y-5"
          >
            <div className="rounded-[28px] bg-white border border-black/[0.07] shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-13 h-13 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-[18px] font-semibold shrink-0">
                    {account.fullName.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-[20px] font-semibold tracking-tight text-[#1D1D1F] truncate">
                        {account.fullName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#218838]/10 text-[#218838] text-[11px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Paroquiano conectado
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6E6E73] truncate mt-0.5">
                      {account.email} · Cadastrado em {formatDatePt(account.createdAt.slice(0, 10))}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[38px] rounded-full border border-black/[0.1] hover:bg-[#F5F5F7] text-[13px] font-medium text-[#1D1D1F] transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <span>Sair da conta</span>
                </button>
              </div>

              {successMsg && (
                <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 px-4 py-3 text-[13px] text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {error && (
                <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                <h2 className="text-[14px] font-semibold text-[#1D1D1F]">
                  Seus dados cadastrais
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#6E6E73] mb-1.5">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#6E6E73] mb-1.5">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6E6E73] mb-1.5">
                    Participação na comunidade
                  </label>
                  <select
                    value={editPastoral}
                    onChange={(e) => setEditPastoral(e.target.value as MinistryName | 'Comunidade')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                  >
                    {editPastoral !== 'Comunidade' &&
                      !PASTORAL_OPTIONS.some((opt) => opt.value === editPastoral) && (
                        <option value={editPastoral}>
                          Vínculo registrado: {editPastoral} (a confirmar)
                        </option>
                      )}
                    {PASTORAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[12px] text-[#6E6E73]">
                    Para informações sobre grupos pastorais em atividade, consulte a secretaria.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onBackToSite()}
                    className="px-5 min-h-[42px] rounded-full border border-black/[0.1] hover:bg-[#F5F5F7] text-[13px] font-medium text-[#1D1D1F] transition-colors cursor-pointer"
                  >
                    Voltar à página inicial
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 min-h-[42px] rounded-full bg-[#218838] hover:bg-[#196C2E] text-white text-[13px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onBackToSite('#missas')}
                className="rounded-2xl bg-white border border-black/[0.07] p-4 text-left hover:border-black/[0.16] transition-colors flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#1D1D1F]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">Horários das Missas</p>
                  <p className="text-[12px] text-[#6E6E73]">Conferir celebrações semanais</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onBackToSite('#notificar')}
                className="rounded-2xl bg-white border border-black/[0.07] p-4 text-left hover:border-black/[0.16] transition-colors flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4 text-[#218838]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">Alertas &amp; Pedidos de Oração</p>
                  <p className="text-[12px] text-[#6E6E73]">
                    Consultar avisos publicados ou registrar um pedido de oração
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[460px] rounded-[28px] bg-white border border-black/[0.07] shadow-sm p-6 sm:p-8"
          >
            {/* Segmented Mode Switch */}
            <div className="p-1 rounded-full bg-[#F5F5F7] grid grid-cols-2 gap-1 mb-6">
              {(
                [
                  { id: 'register', label: 'Criar Conta' },
                  { id: 'login', label: 'Entrar' },
                ] as const
              ).map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMode(tab.id);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`relative py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
                      active ? 'text-[#1D1D1F]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-mode-pill"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-white shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <div className="w-11 h-11 rounded-2xl bg-[#218838]/10 text-[#218838] flex items-center justify-center mb-3.5">
                {mode === 'register' ? (
                  <UserPlus className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">
                {mode === 'register'
                  ? 'Crie sua conta de paroquiano'
                  : 'Entrar na Área do Paroquiano'}
              </h1>
              <p className="mt-1.5 text-[13.5px] text-[#6E6E73] leading-relaxed">
                {mode === 'register'
                  ? 'Cadastre-se gratuitamente para acompanhar inscrições e registrar seu vínculo com a comunidade.'
                  : 'Acesse sua conta com o e-mail e a senha cadastrados.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="voce@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    WhatsApp / Telefone <span className="text-[#86868B]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    Participação na comunidade
                  </label>
                  <select
                    value={pastoral}
                    onChange={(e) => setPastoral(e.target.value as MinistryName | 'Comunidade')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                  >
                    {PASTORAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[12px] text-[#6E6E73]">
                    Para informações sobre grupos pastorais em atividade, consulte a secretaria.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#424245] mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mín. 6 caracteres"
                        className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#424245] mb-1">
                      Confirmar senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 min-h-[46px] rounded-full bg-[#218838] hover:bg-[#196C2E] text-white text-[14px] font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Criando conta...' : 'Criar conta de paroquiano'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="voce@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#424245] mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-black/[0.1] bg-[#F5F5F7]/70 focus:bg-white focus:border-[#218838] focus:outline-none text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 min-h-[46px] rounded-full bg-[#218838] hover:bg-[#196C2E] text-white text-[14px] font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Entrando...' : 'Entrar na Área do Paroquiano'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-black/[0.06] text-center text-[13px] text-[#6E6E73]">
              {mode === 'register' ? (
                <>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="font-semibold text-[#218838] hover:underline cursor-pointer"
                  >
                    Fazer login
                  </button>
                </>
              ) : (
                <>
                  Ainda não possui cadastro?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="font-semibold text-[#218838] hover:underline cursor-pointer"
                  >
                    Criar conta gratuitamente
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
