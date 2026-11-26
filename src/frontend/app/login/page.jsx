'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getErrorMessage } from '../../src/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('gestao_token', data.token);
      localStorage.setItem('gestao_usuario', JSON.stringify(data.usuario));

  
        router.push('/admin');
      
      }catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-aside">
        <div className="brand-mark">GE<span>•</span></div>
        <div>
          <p className="eyebrow light">PLATAFORMA ADMINISTRATIVA</p>
          <h1>Gestão de<br />Espaços</h1>
          <p className="aside-copy">Organize ambientes, disponibilidades e reservas em um só lugar.</p>
        </div>
        <div className="aside-footer">UNESC · Ciência da Computação</div>
      </section>
      <section className="login-main">
        <form className="login-card" onSubmit={submit}>
          <div className="brand-mobile">GE<span>•</span></div>
          <p className="eyebrow">BEM-VINDO DE VOLTA</p>
          <h2>Acesse sua conta</h2>
          <p className="muted">Entre com suas credenciais para continuar.</p>
          {error && <div className="alert error">{error}</div>}
          <label>
            E-mail
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required />
          </label>
          <button className="primary full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar no sistema'} <span>→</span>
          </button>
          <p className="login-note">Acesso restrito a usuários cadastrados.</p>
        </form>
      </section>
    </main>
  );
}
