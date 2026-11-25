export const resources = {
  empresas: {
    title: 'Empresas', singular: 'Empresa', endpoint: '/company', description: 'Empresas parceiras e solicitantes',
    fields: [
      { name: 'corporate_name', label: 'Razão social', required: true },
      { name: 'trade_name', label: 'Nome fantasia' },
      { name: 'cnpj', label: 'CNPJ' },
      { name: 'phone', label: 'Telefone' },
    ], columns: ['id', 'corporate_name', 'trade_name', 'cnpj', 'phone'],
  },
  espacos: {
    title: 'Espaços', singular: 'Espaço', endpoint: '/spaces', description: 'Salas e locais disponíveis para reserva',
    fields: [
      { name: 'name', label: 'Nome', required: true },
      { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'COWORKING', label: 'Coworking' }, { value: 'LAB', label: 'Laboratório' }, { value: 'MEETING_ROOM', label: 'Sala de reunião' }], required: true },
      { name: 'capacity', label: 'Capacidade', type: 'number', required: true, min: 0 },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean', required: true },
    ], columns: ['id', 'name', 'type', 'capacity', 'is_active'],
  },
  disponibilidades: {
    title: 'Disponibilidades', singular: 'Disponibilidade', endpoint: '/disponibilidades', description: 'Horários semanais de funcionamento dos espaços',
    fields: [
      { name: 'space_id', label: 'ID do espaço', type: 'number', required: true, min: 1 },
      { name: 'day_of_week', label: 'Dia da semana', type: 'select', options: [{value:'0',label:'Domingo'},{value:'1',label:'Segunda-feira'},{value:'2',label:'Terça-feira'},{value:'3',label:'Quarta-feira'},{value:'4',label:'Quinta-feira'},{value:'5',label:'Sexta-feira'},{value:'6',label:'Sábado'}], required: true },
      { name: 'start_time', label: 'Horário inicial', type: 'time', required: true },
      { name: 'end_time', label: 'Horário final', type: 'time', required: true },
      { name: 'is_external_allowed', label: 'Permite público externo', type: 'boolean', required: true },
    ], columns: ['id', 'space_id', 'day_of_week', 'start_time', 'end_time', 'is_external_allowed'],
  },
  reservas: {
    title: 'Reservas', singular: 'Reserva', endpoint: '/bookings', description: 'Solicitações e reservas dos espaços',
    fields: [
      { name: 'space_id', label: 'ID do espaço', type: 'number', required: true, min: 1 },
      { name: 'user_id', label: 'ID do usuário', type: 'number', required: true, min: 1 },
      { name: 'start_datetime', label: 'Data e hora de início', type: 'datetime-local', required: true },
      { name: 'end_datetime', label: 'Data e hora de término', type: 'datetime-local', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{value:'PENDING',label:'Pendente'},{value:'APPROVED',label:'Aprovada'},{value:'REJECTED',label:'Rejeitada'},{value:'CANCELLED',label:'Cancelada'}] },
      { name: 'rejection_reason', label: 'Motivo da rejeição', type: 'textarea' },
    ], columns: ['id', 'space_id', 'user_id', 'start_datetime', 'end_datetime', 'status'],
  },
  usuarios: {
    title: 'Usuários', singular: 'Usuário', endpoint: '/users', description: 'Usuários internos e clientes do sistema',
    fields: [
      { name: 'name', label: 'Nome', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'password', label: 'Senha', type: 'password', required: true, createOnly: true },
      { name: 'role', label: 'Perfil', type: 'select', options: [{value:'ADMIN',label:'Administrador'},{value:'CLIENT',label:'Cliente'}], required: true },
      { name: 'cpf_cnpj', label: 'CPF/CNPJ' },
      { name: 'company_id', label: 'ID da empresa', type: 'number', min: 1 },
    ], columns: ['id', 'name', 'email', 'role', 'cpf_cnpj', 'company_id'],
  },
};

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.dados)) return data.dados;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.usuarios)) return data.usuarios;
  if (Array.isArray(data?.empresas)) return data.empresas;
  if (Array.isArray(data?.reservas)) return data.reservas;
  if (Array.isArray(data?.disponibilidades)) return data.disponibilidades;
  if (Array.isArray(data?.spaces)) return data.spaces;
  return data && typeof data === 'object' ? [data] : [];
}
export function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleString('pt-BR');
  return String(value);
}
