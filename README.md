# Paróquia Rainha Santa Isabel

Site institucional da Paróquia Rainha Santa Isabel, com frontend React/Vite e
backend Express.

## Estrutura

- `frontend/`: aplicação React, estilos, componentes, assets e configuração do Vite.
- `backend/`: servidor Express e persistência local em JSON.
- `shared/`: tipos usados pelo frontend e pelo backend.
- `package.json`: dependências e comandos do projeto.

## Desenvolvimento

Requisitos: Node.js e npm.

```bash
npm ci
```

Copie `.env.example` para `.env`, configure um valor único e forte para
`ADMIN_PASSWORD` e ajuste as demais configurações. O servidor não inicia se essa
senha não estiver definida. Depois, inicie frontend e backend juntos:

```bash
npm run dev
```

O servidor fica disponível em `http://localhost:3000` por padrão.

## Build e produção

```bash
npm run lint
npm run build
npm start
```

O build do frontend é gerado em `frontend/dist`. Em produção, o Express serve
essa pasta e disponibiliza as rotas da API no mesmo host. Os dados locais ficam
em `backend/data/church.json` por padrão; `DATA_FILE` pode apontar para um volume
persistente no provedor de hospedagem.

## GitHub Pages

O GitHub pode exibir os arquivos do projeto, mas o GitHub Pages hospeda somente
conteúdo estático e não executa o Express. Como as páginas de administração,
conta e formulários dependem da API, publicar apenas o frontend no Pages não
oferece o site completo. Para manter esses recursos, hospede o projeto em um
serviço que execute Node.js; alternativamente, o frontend pode ser publicado no
Pages se a API for hospedada separadamente e configurada para aceitar chamadas
do domínio do site.
