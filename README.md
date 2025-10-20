<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Pix Backend — API de Cobranças e Simulação de Pagamentos

Este projeto é um backend em NestJS que expõe endpoints para criar cobranças Pix, consultar cobranças por ID e simular pagamentos usando mensageria. Ele integra Postgres (persistência), Redis (cache), MongoDB (armazenamento adicional), RabbitMQ (fila para simulação) e Swagger (documentação interativa).

### Tecnologias

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **Banco relacional**: PostgreSQL via TypeORM
- **Cache**: Redis via `@nestjs/cache-manager`
- **Banco NoSQL**: MongoDB via Mongoose
- **Mensageria**: RabbitMQ (`amqplib`)
- **Documentação**: Swagger (`/api`)
- **Container/Orquestração**: Docker + Docker Compose
- **Qualidade**: ESLint, Prettier e Jest

---

## Como iniciar o projeto

Você pode rodar com Docker (recomendado) ou localmente.

### 1) Usando Docker Compose (recomendado)

1. Crie um arquivo `.env` na raiz do projeto com as variáveis mínimas:

```bash
PORT=3000

# Postgres
POSTGRES_HOST=database
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# MongoDB
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password
MONGODB_DATABASE=admin

# RabbitMQ (o docker-compose já define usuário/senha padrão)
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
```

2. Suba os serviços:

```bash
docker compose up -d --build
```

3. A API ficará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/api`.

4. Painéis/Portas úteis:

- **RabbitMQ Management**: `http://localhost:15672` (user: `guest`, pass: `guest`)
- **MongoDB**: porta `27017`
- **Redis**: porta `6379`
- **Postgres**: porta `5432`

### 2) Rodando localmente (sem Docker)

1. Garanta os serviços instalados e rodando localmente (Postgres, Redis, MongoDB, RabbitMQ) e configure um `.env` com seus hosts/ports locais.
2. Instale dependências:

```bash
npm install
```

3. Execute em modo desenvolvimento:

```bash
npm run start:dev
```

4. Acesse: `http://localhost:3000/api` para a documentação.

---

## Endpoints principais

- `POST /charges` — Cria uma cobrança Pix
- `GET /charges/:id` — Consulta uma cobrança por ID
- `POST /charges/simulate-payment` — Simula um pagamento (processado via RabbitMQ)

Exemplos rápidos (curl):

```bash
# Criar cobrança
curl -X POST http://localhost:3000/charges \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Assinatura Premium",
    "amount": 129.90
  }'

# Buscar por ID
curl http://localhost:3000/charges/<ID_DA_COBRANCA>

# Simular pagamento
curl -X POST http://localhost:3000/charges/simulate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "chargeId": "<ID_DA_COBRANCA>",
    "method": "PIX"
  }'
```

---

## Documentação (Swagger)

Acesse `http://localhost:3000/api` para explorar e testar os endpoints pelo Swagger UI.

[![swagger.png](https://i.postimg.cc/261qzHWw/swagger.png)](https://postimg.cc/TLX20JCL)

---

## Telas e evidências

### Criar pagamento

[![criar-pagamento.png](https://i.postimg.cc/VNsHvtDY/criar-pagamento.png)](https://postimg.cc/yD5TrkM5)

### Listar/consultar pagamento

[![listar-pagamento.png](https://i.postimg.cc/02BNcGKW/listar-pagamento.png)](https://postimg.cc/N5RY0H4m)

### Simular pagamento

[![simular-pagamento.png](https://i.postimg.cc/rszkrbjV/simular-pagamento.png)](https://postimg.cc/Fkt8tTw8)

### Dados no Redis

[![redis.png](https://i.postimg.cc/CLkFsyYk/redis.png)](https://postimg.cc/GH3wb54m)

### Dados no MongoDB

[![mongo.png](https://i.postimg.cc/c4XFjCsZ/mongo.png)](https://postimg.cc/GHTPTc8S)

### Painel do RabbitMQ

[![rabbitmq.png](https://i.postimg.cc/NMdyt3LM/rabbitmq.png)](https://postimg.cc/S2zQ7t6F)

---

## Scripts úteis

```bash
# desenvolvimento
npm run start

# watch mode (recomendado para dev)
npm run start:dev

# produção (após build)
npm run build && npm run start:prod

# testes
npm run test
npm run test:e2e
npm run test:cov

# lint/format
npm run lint
npm run format
```

---

## Observações

- O TypeORM está configurado com `synchronize: true` para facilitar o desenvolvimento. Em produção, ajuste conforme sua estratégia de migrações.
- As integrações (Redis/Mongo/RabbitMQ) são inicializadas via variáveis de ambiente. Verifique o `.env`.
- O Swagger é exposto em `/api` logo ao iniciar a aplicação.
