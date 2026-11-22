# ELLP+ctrl

Aplicação web para centralizar o gerenciamento dos voluntários do **Projeto ELLP**
(extensão universitária — UTFPR Cornélio Procópio). Permite controlar dados
cadastrais, períodos de participação, oficinas, documentação (termos de
voluntariado) e o histórico de alterações, com acesso por perfil de
**Administrador** e **Voluntário**.

## Tecnologias

- **Frontend:** React + Vite, React Router.
- **Backend:** Node.js + Express.
- **Banco de dados:** MongoDB (Mongoose).
- **Autenticação:** senha com hash (bcrypt) e token de acesso (JWT).
- **Documentos:** geração de termos em PDF (PDFKit) e upload de arquivos (Multer).

## Pré-requisitos

- Node.js `20.19+` ou `22.12+`.
- MongoDB em execução. A forma mais simples é via Docker:

  ```bash
  docker compose up -d
  ```

  O arquivo `docker-compose.yml` sobe um MongoDB em `localhost:27017`.

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do modelo e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

   | Variável | Descrição |
   | --- | --- |
   | `API_PORT` | Porta da API (padrão `3001`). |
   | `MONGODB_URI` | String de conexão do MongoDB. |
   | `JWT_SECRET` | Chave de assinatura dos tokens — **troque em produção**. |
   | `JWT_EXPIRES` | Validade do token (ex.: `8h`). |
   | `ADMIN_USER` / `ADMIN_PASSWORD` | Credenciais do administrador criado na carga inicial. |
   | `VOLUNTARIO_SENHA_PADRAO` | Senha inicial dos voluntários da carga inicial. |
   | `CORS_ORIGIN` | Origem liberada para o frontend. |

3. Carregue os dados iniciais (administrador, voluntários e oficinas de exemplo):

   ```bash
   npm run seed
   ```

## Executar

Em um terminal, a API:

```bash
npm run api
```

Em outro, o frontend:

```bash
npm run dev
```

Acesse <http://localhost:5173>.

### Acesso

- **Administrador:** usuário e senha definidos no `.env` (padrão `admin` / `ellp-admin`).
- **Voluntário:** matrícula e senha inicial (padrão `ellp-2026`). No primeiro
  acesso o voluntário é direcionado para trocar a senha.

## Funcionalidades

**Administrador**

- Cadastrar, editar, pesquisar e filtrar voluntários.
- Encerrar e reativar o vínculo; excluir cadastros ainda sem histórico.
- Criar oficinas e registrar a participação de voluntários.
- Gerar termos de voluntariado em PDF e reemiti-los.
- Analisar os termos enviados, aprovar ou rejeitar (com justificativa).
- Consultar o histórico de alterações.

**Voluntário**

- Visualizar os próprios dados cadastrais (somente leitura).
- Baixar o termo de voluntariado, enviar o termo assinado e reenviar após rejeição.
- Acompanhar o status da documentação.
- Alterar a própria senha.

## Scripts

| Script | Ação |
| --- | --- |
| `npm run dev` | Inicia o frontend (Vite). |
| `npm run api` | Inicia a API. |
| `npm run seed` | Carrega os dados iniciais no banco. |
| `npm run build` | Gera o build de produção do frontend. |
| `npm test` | Executa os testes de integração da API. |
| `npm run lint` | Verifica o código com ESLint. |
| `npm run format` | Formata o código com Prettier. |

## Testes

Os testes de integração usam um banco separado. Defina `MONGODB_URI_TEST`
(ou deixe o padrão `mongodb://127.0.0.1:27017/ellp_ctrl_test`) e execute:

```bash
npm test
```

## Estrutura

```
backend/
  server.js            # inicialização (conexão + servidor)
  src/
    app.js             # aplicação Express
    config/            # ambiente, banco e uploads
    controllers/       # regras das rotas
    middleware/        # autenticação, autorização e erros
    models/            # modelos Mongoose (entidades)
    routes/            # definição das rotas da API
    pdf/               # geração dos termos em PDF
    utils/             # apoio (senha, token, validação, histórico)
    seed.js            # carga inicial
  tests/               # testes de integração
frontend/
  src/
    api/               # cliente HTTP
    auth/              # contexto de sessão
    components/        # componentes reutilizáveis
    pages/             # telas (admin e voluntário)
```
