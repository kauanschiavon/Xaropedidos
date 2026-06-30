# Xaropedidos

## Requisitos

- Node.js (LTS)
- MySQL
- Git

## Instalação

Clone o repositório:

```bash
git clone https://github.com/kauanschiavon/Xaropedidos.git
cd Xaropedidos
```

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` em `backend`:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
JWT_SECRET=
```

### Banco de dados

Crie um banco chamado:

```
XAROPEDIDOS_DATABASE
```

e importe o arquivo `.sql` do projeto.

### Frontend

```bash
cd ../frontend
npm install
```

Se necessário, ajuste a URL da API em:

```
src/services/api.js
```

```js
baseURL: "http://IP_DA_MAQUINA:3000"
```

## Executando

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

O frontend estará disponível em:

```
http://localhost:5173
```

Para acessar pelo celular, utilize:

```
http://IP_DA_MAQUINA:5173
```

(computador e celular devem estar na mesma rede).
