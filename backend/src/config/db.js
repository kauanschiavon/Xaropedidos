const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const db = pool.promise();

// teste de conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar no banco:', err.message);
        return;
    }
    console.log('Banco de dados conectado com sucesso!');
    connection.release();
});

module.exports = db;