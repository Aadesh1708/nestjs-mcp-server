# nest-mcp-agent-starter

> Signature: **Aadesh Jain**

A practical monorepo showing how to:

- expose tools from a NestJS MCP server (`mcp-server`)
- consume those tools from another NestJS service (`mcp-backend`)
- run an LLM agent with LangChain + LangGraph that can call MCP tools over SSE

This project is a good starter template for building "LLM + tools" applications with clear server/client separation.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Run the Apps](#run-the-apps)
- [How to Use](#how-to-use)
- [MCP Tools Exposed by `mcp-server`](#mcp-tools-exposed-by-mcp-server)
- [Connect to Multiple MCP Servers](#connect-to-multiple-mcp-servers)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Architecture

`mcp-server` (default port `3000`)
- exposes MCP tools over SSE at `/sse`
- includes tools like `time`, `get-todos`, `create-todo`, `update-todo`, `delete-todo`

`mcp-backend` (default port `3001`)
- receives user prompts via HTTP (`POST /`)
- creates a LangChain React-style agent
- fetches tools from `mcp-server` through `@langchain/mcp-adapters`
- lets the LLM decide when to call MCP tools

Flow:
1. Client sends a message to `mcp-backend`.
2. `mcp-backend` invokes the agent with available MCP tools.
3. Agent may call `mcp-server` tools over SSE.
4. Final text response is returned to the client.

## Tech Stack

- [NestJS](https://nestjs.com/)
- [LangChain.js](https://js.langchain.com/)
- [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- [`@langchain/mcp-adapters`](https://www.npmjs.com/package/@langchain/mcp-adapters)
- [`@rekog/mcp-nest`](https://www.npmjs.com/package/@rekog/mcp-nest)

## Prerequisites

- Node.js 20+
- npm 10+

## Environment Variables

Create a `.env` file at the repository root:

```env
# mcp-backend
GROQ_API_KEY=your_groq_api_key
GROQ_API_URL=https://api.groq.com/openai/v1
PORT=3001
```

Notes:
- `GROQ_API_KEY` is required by `mcp-backend`.
- `GROQ_API_URL` defaults to `https://api.groq.com/openai/v1` if omitted.
- `PORT` in this file is used by `mcp-backend`.
- `mcp-server` runs on `MCP_SERVER_PORT` with fallback `3000` (from code default). If you want to override it via environment, add:

```env
MCP_SERVER_PORT=3000
```

## Installation

```bash
npm install
```

## Run the Apps

Start **both** applications in separate terminals.

### 1) Start MCP Server

```bash
npm run start:dev mcp-server
```

Server URL (default): `http://localhost:3000`  
SSE endpoint consumed by backend: `http://localhost:3000/sse`

### 2) Start MCP Backend

```bash
npm run start:dev mcp-backend
```

Backend URL (default): `http://localhost:3001`

## How to Use

Send a prompt to the backend:

```bash
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"What time is it in India?\"}"
```

Example response:

```json
{
  "message": "It is currently ... in India."
}
```

Health check:

```bash
curl http://localhost:3001
```

## MCP Tools Exposed by `mcp-server`

- `hello(name)`
- `time()`
- `get-todos()`
- `create-todo(title, content)`
- `update-todo(id, title, content, isDone)`
- `delete-todo(id)`

These tools are registered in `apps/mcp-server/src/app.tool.ts`.

## Connect to Multiple MCP Servers

Edit `McpClientModule.register(...)` in `apps/mcp-backend/src/mcp-backend.module.ts`:

```ts
McpClientModule.register({
  throwOnLoadError: true,
  prefixToolNameWithServerName: false,
  additionalToolNamePrefix: '',
  mcpServers: {
    myServer: {
      transport: 'sse',
      url: 'http://localhost:3000/sse',
      useNodeEventSource: true,
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        delayMs: 2000,
      },
    },
  },
});
```

Tips:
- set `prefixToolNameWithServerName: true` if tool names can collide
- keep each server key unique (`myServer`, `financeServer`, etc.)
- verify every configured endpoint is reachable before booting `mcp-backend`

## Project Structure

```text
.
├── apps
│   ├── mcp-server
│   │   └── src
│   │       ├── app.module.ts
│   │       ├── app.service.ts
│   │       └── app.tool.ts
│   └── mcp-backend
│       └── src
│           ├── ai
│           ├── dto
│           ├── mcp-client
│           ├── mcp-backend.controller.ts
│           ├── mcp-backend.module.ts
│           └── mcp-backend.service.ts
├── package.json
└── README.md
```

## Scripts

- `npm run build` - build all apps
- `npm run start` - start default Nest app
- `npm run start:dev` - start in watch mode
- `npm run lint` - run ESLint with auto-fix
- `npm run test` - run unit tests

## Troubleshooting

- **429 / quota errors from backend**  
  Your AI provider quota/rate limit is reached. Wait and retry.

- **401/403 from backend**  
  Check `GROQ_API_KEY` and `GROQ_API_URL`.

- **Backend cannot use MCP tools**  
  Ensure `mcp-server` is running and `http://localhost:3000/sse` is accessible.

- **Port conflicts**  
  Change `PORT` (backend) and/or `MCP_SERVER_PORT` (server).

## License

This project is currently `UNLICENSED` (see `package.json`).

---

Built and maintained by **Aadesh Jain**.
