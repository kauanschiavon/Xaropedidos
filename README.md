Requisitos na nova máquina

Node.js — nodejs.org (baixe a versão LTS)
MySQL — dev.mysql.com/downloads/installer
Git — git-scm.com


Passo a passo
1. Clone o repositório:
bashgit clone https://github.com/kauanschiavon/Xaropedidos.git
cd Xaropedidos
2. Configure o backend:
bashcd backend
npm install
Crie o arquivo .env dentro da pasta backend:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=XAROPEDIDOS_DATABASE
PORT=3000
JWT_SECRET=xaropedidos_secret_key
3. Importe o banco de dados:

Abra o MySQL Workbench
Crie um schema chamado XAROPEDIDOS_DATABASE
Vá em Server → Data Import
Selecione o arquivo .sql exportado do banco original
Clique em Start Import

4. Configure o frontend:
bashcd ../frontend
npm install
Atualize o src/services/api.js com o IP da nova máquina:
javascriptconst api = axios.create({
    baseURL: 'http://IP_DA_MAQUINA:3000'
})
5. Rode o sistema:
Terminal 1 — backend:
bashcd backend
npm run dev
Terminal 2 — frontend:
bashcd frontend
npm run dev

Para acessar pelo celular
Conecte no mesmo Wi-Fi e acesse:
http://IP_DA_MAQUINA:5173
