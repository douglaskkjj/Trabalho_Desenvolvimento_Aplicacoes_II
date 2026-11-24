# Frontend — Gestão de Espaços

Frontend em Next.js/React integrado à API Express fornecida no projeto.

## Requisitos
- Node.js 18 ou superior
- API do projeto em execução na porta 3000

## Instalação e execução
1. Entre na pasta `frontend`.
2. Instale as dependências: `npm install`.
3. Copie `.env.local.example` para `.env.local` (ajuste `NEXT_PUBLIC_API_URL` se necessário).
4. Inicie o frontend: `npm run dev`.
5. Acesse http://localhost:3001 (ou a porta exibida pelo Next.js).

Para manter a API na porta 3000 e o Next na 3001, execute `npm run dev -- -p 3001`.

## Integração
- Login: `POST /auth/login`, armazena JWT e usuário no localStorage.
- Empresas: `/company`
- Espaços: `/spaces`
- Disponibilidades: `/disponibilidades`
- Reservas: `/bookings`
- Usuários: `/users`

Os cadastros usam GET, POST, PUT e DELETE com o ID retornado pela API. O frontend não cria IDs: a API é responsável pela geração dos identificadores.

## Observações
- O frontend mantém os nomes de campos do backend (`corporate_name`, `space_id`, `start_datetime`, etc.).
- O formulário de usuário envia `password` apenas na criação, conforme a rota de cadastro que faz o hash no servidor.
- A rota de login utiliza `email` e `password` e espera `token` e `usuario` na resposta.
- A proteção visual das páginas administrativas verifica a existência do token no navegador. As rotas do backend fornecido não foram modificadas.
