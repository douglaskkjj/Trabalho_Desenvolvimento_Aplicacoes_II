'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../../../src/api';
import { resources, unwrapList, formatValue } from '../../../src/resources';

export default function ResourcePage({ params }) {
  const { resource } = params;
  const config = resources[resource];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('gestao_usuario') || '{}');
      setIsAdmin(u.role === 'ADMIN');
    } catch {}
  }, []);

  const podeEditar = isAdmin || resource === 'reservas';

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(config.endpoint);
      setItems(unwrapList(data));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  if (!config) {
    return (
      <div className="empty-state">
        <h2>Cadastro não encontrado</h2>
        <p>Selecione uma opção no menu lateral.</p>
      </div>
    );
  }

  function startCreate() {
    setEditing(null);
    setDetail(null);
    setForm(
      Object.fromEntries(
        config.fields
          .filter((f) => (!f.createOnly || resource === 'usuarios') && !f.editOnly)
          .map((f) => [f.name, f.type === 'boolean' ? false : ''])
      )
    );
    setModal(true);
    setError('');
    setSuccess('');
  }

  function startEdit(item) {
    setEditing(item);
    setDetail(null);
    const next = {};
    config.fields.forEach((f) => {
      if (f.createOnly) return;
      let v = item[f.name] ?? '';
      if (f.type === 'datetime-local' && v) {
        v = new Date(v).toISOString().slice(0, 16);
      }
      next[f.name] = v;
    });
    setForm(next);
    setModal(true);
    setError('');
    setSuccess('');
  }

  function closeModal() {
    setModal(false);
    setEditing(null);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {};
      config.fields.forEach((f) => {
        if (f.createOnly && !form[f.name]) return;
        let value = form[f.name];
        if (f.type === 'number') value = value === '' ? undefined : Number(value);
        if (f.type === 'boolean') value = Boolean(value);
        if (f.type === 'select' && ['day_of_week'].includes(f.name)) value = Number(value);

        if (value !== undefined && value !== '') {
          payload[f.name] = value;
        } else if (f.type === 'boolean') {
          payload[f.name] = false;
        }
      });

      if (editing) {
        await api.put(`${config.endpoint}/${editing.id}`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }

      closeModal();
      setSuccess(`${config.singular} ${editing ? 'atualizado' : 'cadastrado'} com sucesso.`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Deseja realmente excluir ${config.singular.toLowerCase()} #${item.id}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`${config.endpoint}/${item.id}`);
      setSuccess('Registro excluído com sucesso.');
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }


    return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GERENCIAMENTO</p>
          <h1>{config.title}</h1>
          <p className="muted">{config.description}.</p>
        </div>
        {podeEditar && (
          <button className="primary" onClick={startCreate}>
            ＋ Novo {config.singular}
          </button>
        )}
      </div>

      {error && !modal && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Todos os registros</h2>
            <p>
              {filtered.length} {filtered.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </p>
          </div>
          <div className="search-box">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar registro…"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c}>{columnLabel(c)}</th>
                ))}
                <th className="actions-head">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="table-message">
                    Carregando registros…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="table-message">
                    {items.length ? 'Nenhum resultado para sua busca.' : 'Nenhum registro cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    {config.columns.map((c) => (
                     
<td key={c}>
  {c === 'status' ? (
    <span className={`pill ${String(item[c]).toLowerCase()}`}>
      {formatValue(item[c])}
    </span>
  ) : c === 'is_active' || c === 'is_external_allowed' ? (
    <span className={`pill ${item[c] ? 'active' : 'inactive'}`}>
      {formatValue(item[c])}
    </span>
  ) : c === 'role' ? (
    <span className="cell-value">
      {item[c] || '—'}
    </span>
  ) : (
    <span className="cell-value">
      {formatValue(item[c])}
    </span>
  )}
</td>

                    ))}
                    <td>
                      <div className="actions">
                        <button title="Ver detalhes" onClick={() => setDetail(item)}>
                          ◉
                        </button>
                        {podeEditar && (
                          <>
                            <button title="Editar" onClick={() => startEdit(item)}>
                              ✎
                            </button>
                            <button title="Excluir" className="danger-action" onClick={() => remove(item)}>
                              ⌫
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          Exibindo {filtered.length} de {items.length} registros
        </div>
      </section>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <section className="modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">{editing ? 'EDIÇÃO' : 'NOVO CADASTRO'}</p>
                <h2>{editing ? `Editar ${config.singular}` : `Cadastrar ${config.singular}`}</h2>
              </div>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={save}>
              <div className="form-grid">
                 {config.fields
                  .filter((f) => {
                    if (editing && f.createOnly) return false;
                    if (f.editOnly && (!editing || !isAdmin)) return false;
                    return true;
                  })
                  .map((f) => (
                    <label key={f.name} className={f.type === 'textarea' ? 'span-2' : ''}>
                      {f.label}
                      {f.type === 'boolean' ? (
                        <span className="toggle-line">
                          <input
                            type="checkbox"
                            checked={Boolean(form[f.name])}
                            onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                          />
                          <span>{form[f.name] ? 'Sim' : 'Não'}</span>
                        </span>
                      ) : f.type === 'select' ? (
                        <select
                          required={f.required}
                          value={form[f.name] ?? ''}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        >
                          <option value="">Selecione…</option>
                          {f.options.map((o) => (
                            <option value={o.value} key={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          required={f.required}
                          value={form[f.name] ?? ''}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          rows="3"
                        />
                      ) : (
                        <input
                          type={f.type || 'text'}
                          required={f.required}
                          min={f.min}
                          value={form[f.name] ?? ''}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          placeholder={
                            f.type === 'password'
                              ? 'Crie uma senha segura'
                              : `Informe ${f.label.toLowerCase()}`
                          }
                        />
                      )}
                    </label>
                  ))}
              </div>

              {error && <div className="alert error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="primary" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar cadastro'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {detail && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">CONSULTA</p>
                <h2>Detalhes do {config.singular.toLowerCase()}</h2>
              </div>
              <button className="close-button" onClick={() => setDetail(null)}>
                ×
              </button>
            </div>

            <div className="detail-grid">
              {Object.entries(detail)
                .filter(([k]) => k !== '__v' && k !== 'password_hash')
                .map(([k, v]) => (
                  <div className="detail-item" key={k}>
                    <small>{columnLabel(k)}</small>
                    <b>{formatValue(v)}</b>
                  </div>
                ))}
            </div>

            <div className="modal-actions">
              <button className="secondary" onClick={() => setDetail(null)}>
                Fechar
              </button>
              {podeEditar && (
                <button className="primary" onClick={() => startEdit(detail)}>
                  Editar registro
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function columnLabel(key) {
  const labels = {
    id: 'ID',
    corporate_name: 'Razão social',
    trade_name: 'Nome fantasia',
    cnpj: 'CNPJ',
    phone: 'Telefone',
    name: 'Nome',
    type: 'Tipo',
    capacity: 'Capacidade',
    description: 'Descrição',
    is_active: 'Ativo',
    space_id: 'ID do espaço',
    day_of_week: 'Dia da semana',
    start_time: 'Início',
    end_time: 'Término',
    is_external_allowed: 'Externo permitido',
    user_id: 'ID do usuário',
    start_datetime: 'Início',
    end_datetime: 'Término',
    status: 'Status',
    rejection_reason: 'Motivo',
    email: 'E-mail',
    role: 'Perfil',
    cpf_cnpj: 'CPF/CNPJ',
    company_id: 'ID da empresa',
    created_at: 'Criado em'
  };
  return labels[key] || key.replaceAll('_', ' ');
}
