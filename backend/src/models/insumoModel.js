const db = require('../config/db');

const InsumoModel = {

    listarTodos: async () => {
        const [rows] = await db.query(`
            SELECT i.*, c.nome as nome_categoria 
            FROM insumo i
            JOIN categoria_insumo c ON i.id_categoria = c.id
        `);
        return rows;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query(`
            SELECT i.*, c.nome as nome_categoria 
            FROM insumo i
            JOIN categoria_insumo c ON i.id_categoria = c.id
            WHERE i.id = ?
        `, [id]);
        return rows[0];
    },

    criar: async (insumo) => {
        const { id_categoria, nome, quantidade, custo_unitario, quantidade_critica, unidade } = insumo;
        const [result] = await db.query(
            'INSERT INTO insumo (id_categoria, nome, quantidade, custo_unitario, quantidade_critica, unidade) VALUES (?, ?, ?, ?, ?, ?)',
            [id_categoria, nome, quantidade, custo_unitario, quantidade_critica, unidade || 'unidade']
        );
        return result.insertId;
    },

    atualizar: async (id, insumo) => {
        const { id_categoria, nome, quantidade, custo_unitario, quantidade_critica, unidade } = insumo;
        await db.query(
            'UPDATE insumo SET id_categoria=?, nome=?, quantidade=?, custo_unitario=?, quantidade_critica=?, unidade=? WHERE id=?',
            [id_categoria, nome, quantidade, custo_unitario, quantidade_critica, unidade, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM insumo WHERE id = ?', [id]);
    },

    atualizarQuantidade: async (id, quantidade) => {
        await db.query(
            'UPDATE insumo SET quantidade = quantidade + ? WHERE id = ?',
            [quantidade, id]
        );
    },

    buscarCriticos: async () => {
        const [rows] = await db.query(`
            SELECT * FROM insumo 
            WHERE quantidade_critica IS NOT NULL 
            AND quantidade <= quantidade_critica
        `);
        return rows;
    }
};

module.exports = InsumoModel;