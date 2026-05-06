const db = require('../config/db');

const CategoriaInsumoModel = {

    listarTodos: async () => {
        const [rows] = await db.query('SELECT * FROM categoria_insumo');
        return rows;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query('SELECT * FROM categoria_insumo WHERE id = ?', [id]);
        return rows[0];
    },

    criar: async (categoria) => {
        const { nome } = categoria;
        const [result] = await db.query(
            'INSERT INTO categoria_insumo (nome) VALUES (?)',
            [nome]
        );
        return result.insertId;
    },

    atualizar: async (id, categoria) => {
        const { nome } = categoria;
        await db.query(
            'UPDATE categoria_insumo SET nome=? WHERE id=?',
            [nome, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM categoria_insumo WHERE id = ?', [id]);
    }
};

module.exports = CategoriaInsumoModel;