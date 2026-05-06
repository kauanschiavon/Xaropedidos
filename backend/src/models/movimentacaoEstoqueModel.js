const db = require('../config/db');

const MovimentacaoEstoqueModel = {

    listarTodos: async () => {
        const [rows] = await db.query(`
            SELECT m.*, i.nome as nome_insumo, f.nome as nome_fornecedor
            FROM movimentacao_estoque m
            JOIN insumo i ON m.id_insumo = i.id
            LEFT JOIN fornecedor f ON m.id_fornecedor = f.id
            ORDER BY m.data DESC
        `);
        return rows;
    },

    criar: async (movimentacao) => {
        const { id_insumo, id_fornecedor, tipo_de_movimento, motivo, quantidade, lote, valor_do_custo, numero_nf } = movimentacao;
        const [result] = await db.query(
            `INSERT INTO movimentacao_estoque 
            (id_insumo, id_fornecedor, data, tipo_de_movimento, motivo, quantidade, lote, valor_do_custo, numero_nf) 
            VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
            [id_insumo, id_fornecedor, tipo_de_movimento, motivo, quantidade, lote, valor_do_custo, numero_nf]
        );
        return result.insertId;
    }
};

module.exports = MovimentacaoEstoqueModel;