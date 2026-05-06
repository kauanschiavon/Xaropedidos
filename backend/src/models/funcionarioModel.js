const db = require('../config/db');
const bcrypt = require('bcryptjs');
const FuncionarioModel = {

    listarTodos: async () => {
        const [rows] = await db.query('SELECT id, nome, cpf, telefone, cargo, email FROM funcionario');
        return rows;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query('SELECT id, nome, cpf, telefone, cargo, email FROM funcionario WHERE id = ?', [id]);
        return rows[0];
    },

    criar: async (funcionario) => {
        const { nome, cpf, telefone, cargo, email, senha } = funcionario;
        const [result] = await db.query(
            'INSERT INTO funcionario (nome, cpf, telefone, cargo, email, senha) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, cpf, telefone, cargo, email, senha]
        );
        return result.insertId;
    },

    atualizar: async (id, funcionario) => {
        const { nome, cpf, telefone, cargo, email } = funcionario;
        await db.query(
            'UPDATE funcionario SET nome=?, cpf=?, telefone=?, cargo=?, email=? WHERE id=?',
            [nome, cpf, telefone, cargo, email, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM funcionario WHERE id = ?', [id]);
    },

    buscarPorEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM funcionario WHERE email = ?', [email]);
        return rows[0];
    }
};

module.exports = FuncionarioModel;