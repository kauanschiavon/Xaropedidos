const db = require('../config/db');

const PagamentoModel = {

    listarPorPedido: async (idPedido) => {
        const [rows] = await db.query(
            'SELECT * FROM pagamento WHERE id_pedido = ?',
            [idPedido]
        );
        return rows;
    },

    criar: async (pagamento) => {
        const { id_pedido, id_caixa, valor_total, forma } = pagamento;
        const [result] = await db.query(
            'INSERT INTO pagamento (id_pedido, id_caixa, valor_total, horario, forma) VALUES (?, ?, ?, NOW(), ?)',
            [id_pedido, id_caixa, valor_total, forma]
        );
        return result.insertId;
    },

    somarPagosPorPedido: async (idPedido) => {
        const [rows] = await db.query(
            'SELECT COALESCE(SUM(valor_total), 0) as total_pago FROM pagamento WHERE id_pedido = ?',
            [idPedido]
        );
        return rows[0].total_pago;
    }
};

module.exports = PagamentoModel;