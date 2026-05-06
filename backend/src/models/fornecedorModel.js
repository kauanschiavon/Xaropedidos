const db = require('../config/db');

const FornecedorModel = {

    listarTodos: async () => {
        const [rows] = await db.query('SELECT * FROM fornecedor');
        return rows;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query('SELECT * FROM fornecedor WHERE id = ?', [id]);
        return rows[0];
    },

    criar: async (fornecedor) => {
        const { nome, cnpj, telefone, email } = fornecedor;
        const [result] = await db.query(
            'INSERT INTO fornecedor (nome, cnpj, telefone, email) VALUES (?, ?, ?, ?)',
            [nome, cnpj, telefone, email]
        );
        return result.insertId;
    },

    atualizar: async (id, fornecedor) => {
        const { nome, cnpj, telefone, email } = fornecedor;
        await db.query(
            'UPDATE fornecedor SET nome=?, cnpj=?, telefone=?, email=? WHERE id=?',
            [nome, cnpj, telefone, email, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM fornecedor WHERE id = ?', [id]);
    }
};

module.exports = FornecedorModel;