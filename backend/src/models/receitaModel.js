const db = require('../config/db');

const ReceitaModel = {

    listarPorProduto: async (idProduto) => {
        const [rows] = await db.query(`
            SELECT r.*, i.nome as nome_insumo, i.quantidade as estoque_atual
            FROM receita r
            JOIN insumo i ON r.id_insumo = i.id
            WHERE r.id_produto = ?
        `, [idProduto]);
        return rows;
    },

    criar: async (receita) => {
        const { id_produto, id_insumo, quantidade, unidade_de_medida } = receita;
        const [result] = await db.query(
            'INSERT INTO receita (id_produto, id_insumo, quantidade, unidade_de_medida) VALUES (?, ?, ?, ?)',
            [id_produto, id_insumo, quantidade, unidade_de_medida]
        );
        return result.insertId;
    },

    atualizar: async (id, receita) => {
        const { quantidade, unidade_de_medida } = receita;
        await db.query(
            'UPDATE receita SET quantidade=?, unidade_de_medida=? WHERE id=?',
            [quantidade, unidade_de_medida, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM receita WHERE id = ?', [id]);
    },

    verificarDisponibilidade: async (idProduto, quantidadePedida) => {
        const [rows] = await db.query(`
            SELECT r.id_insumo, r.quantidade * ? as quantidade_necessaria,
            i.quantidade as estoque_atual, i.nome as nome_insumo
            FROM receita r
            JOIN insumo i ON r.id_insumo = i.id
            WHERE r.id_produto = ?
            HAVING quantidade_necessaria > estoque_atual
        `, [quantidadePedida, idProduto]);
        return rows;
    }
};

module.exports = ReceitaModel;