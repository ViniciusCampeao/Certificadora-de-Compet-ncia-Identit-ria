# ELLP+ctrl — protótipo funcional de andamento

Aplicação local para demonstrar a gestão de voluntários do Projeto ELLP. A interface usa React e Vite. A API usa Node.js nativo e persiste os dados fictícios em `backend/data/db.json`.

## Executar

Requer Node.js 20.19 ou superior, ou Node.js 22.12 ou superior.

```bash
npm install
npm run api
```

Em outro terminal:

```bash
npm run dev
```

Abra <http://localhost:5173>. A conta de demonstração é `admin` / `ellp-demo`.

## O que funciona nesta parcial

- Login de demonstração para entrada na interface.
- Painel com contagem de registros, oficinas, vínculos ativos e documentos pendentes.
- Busca por nome, matrícula ou curso e filtro por situação do vínculo.
- Cadastro de voluntário com matrícula única.
- Consulta de perfil e encerramento/reativação do vínculo.
- Cadastro de oficina e registro de participação.
- Atualização demonstrativa do status de documentação.
- Histórico simples de ações da API.
- Dados fictícios persistidos em arquivo JSON local.

## Limites para apresentar com transparência

Esta é uma demonstração acadêmica local. A autenticação é fixa e não oferece segurança de produção; não use dados pessoais reais. O banco MongoDB está previsto no planejamento, mas ainda não integra esta parcial. A persistência atual em JSON serve para mostrar o fluxo funcional enquanto a equipe fecha a integração com o banco. Upload e geração real de PDF, autenticação segura e autorização por perfil ainda não foram implementados.

O PDF da proposta, já versionado no repositório, permanece como fonte do escopo. A aplicação não implementa emissão de certificados nem avaliação de competências, recursos que não aparecem definidos na proposta.
