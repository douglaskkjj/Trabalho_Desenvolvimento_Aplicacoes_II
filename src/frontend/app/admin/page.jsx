'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../src/api';
import { resources, unwrapList } from '../../src/resources';
const icons = { empresas: '▤', espacos: '⌂', disponibilidades: '◷', reservas: '▣', usuarios: '♙' };

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let admin = false;
    try {
      const u = JSON.parse(localStorage.getItem('gestao_usuario') || '{}');
      setName(u.name || '');
      admin = u.role === 'ADMIN';
      setIsAdmin(admin);
    } catch {}

    const visiveis = Object.entries(resources).filter(([key]) => admin || !['empresas', 'usuarios'].includes(key));

    Promise.all(
      visiveis.map(async ([key, r]) => {
        try {
          const { data } = await api.get(r.endpoint);
          return [key, unwrapList(data)];
        } catch {
          return [key, []];
        }
      })
    ).then(results => {
      const next = {};
      results.forEach(([k, v]) => (next[k] = v));
      setCounts(next);
    });
  }, []);

  const visibleEntries = Object.entries(resources).filter(([key]) => isAdmin || !['empresas', 'usuarios'].includes(key));
  const total = Object.values(counts).reduce((n, v) => n + v.length, 0);

  return (
    <>
      <div className="welcome-row">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>Olá{name ? `, ${name.split(' ')}` : ''}! <span className="wave">✦</span></h1>
          <p className="muted">{isAdmin ? 'Aqui está o resumo da sua gestão de espaços.' : 'Consulte os espaços disponíveis e gerencie suas reservas.'}</p>
        </div>
        <div className="today-chip">◷ <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
      </div>
      <section className="stats-grid">
        <article className="stat-card total">
          <div className="stat-top"><span>Total de registros</span><i>▦</i></div>
          <strong>{total}</strong>
          <small>Em todas as categorias</small>
          <div className="stat-line" />
        </article>
        {visibleEntries.map(([key, r]) => (
          <article className="stat-card" key={key}>
            <div className="stat-top"><span>{r.title}</span><i>{icons[key]}</i></div>
            <strong>{counts[key]?.length ?? '—'}</strong>
            <small>Registros cadastrados</small>
          </article>
        ))}
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">ACESSO RÁPIDO</p>
          <h2>{isAdmin ? 'Gerencie seus cadastros' : 'O que você deseja fazer?'}</h2>
        </div>
      </div>
      <section className="module-grid">
        {visibleEntries.map(([key, r]) => (
          <Link href={`/admin/${key}`} className="module-card" key={key}>
            <div className="module-icon">{icons[key]}</div>
            <div>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
            <span className="module-arrow">↗</span>
          </Link>
        ))}
      </section>
    </>
  );
}
