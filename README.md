# 🚀 Xaropedidos - Guia de Configuração (Nova Máquina)

Este guia prático vai te ajudar a configurar e rodar o projeto do zero em um novo ambiente.

---

## 🛠️ Requisitos

Antes de começar, certifique-se de ter instalado:

* **Node.js** — [nodejs.org](https://nodejs.org/) (Baixe a versão **LTS**)
* **MySQL** — [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/)
* **Git** — [git-scm.com](https://git-scm.com/)

---

## 🏁 Passo a Passo

### 1. Clonar o Repositório

Abra o seu terminal e execute os comandos abaixo:

```bash
git clone [https://github.com/kauanschiavon/Xaropedidos.git](https://github.com/kauanschiavon/Xaropedidos.git)
cd Xaropedidos
2. Configurar o Backend
Navegue até a pasta do backend e instale as dependências:

Bash
cd backend
npm install
Agora, crie um arquivo chamado .env dentro da pasta backend e adicione as seguintes variáveis de ambiente:

Snippet de código
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=XAROPEDIDOS_DATABASE
PORT=3000
JWT_SECRET=xaropedidos_secret_key
⚠️ Nota: Lembre-se de substituir sua_senha_mysql pela senha real do seu banco de dados.

3. Importar o Banco de Dados
Abra o MySQL Workbench.

Crie um schema chamado XAROPEDIDOS_DATABASE.

No menu superior, vá em Server ➡️ Data Import.

Selecione o arquivo .sql exportado do banco original.

Clique em Start Import.

4. Configurar o Frontend
Abra um novo terminal (ou volte para a raiz do projeto) e acesse a pasta do frontend:

Bash
cd ../frontend
npm install
Abra o arquivo src/services/api.js e atualize a URL base com o IP da sua nova máquina:

JavaScript
const api = axios.create({
    baseURL: 'http://IP_DA_MAQUINA:3000'
});
🏃‍♂️ Como Rodar o Sistema
Você precisará de dois terminais abertos simultaneamente:

Terminal 1 — Backend

Bash
cd backend
npm run dev

Terminal 2 — Frontend

Bash
cd frontend
npm run dev

📱 Acesso pelo Celular
Para testar o sistema direto do seu dispositivo móvel:

Certifique-se de que o computador e o celular estão conectados na mesma rede Wi-Fi.

No navegador do celular, acesse:

http://IP_DA_MAQUINA:5173
