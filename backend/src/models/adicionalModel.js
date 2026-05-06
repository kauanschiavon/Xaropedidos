const db = require('../config/db')

const AdicionalModel = {

    listarTodos: async () => {
        const [rows] = await db.query('SELECT * FROM adicional WHERE disponivel = TRUE')
        return rows
    },

    listarPorItem: async (idItemPedido) => {
        const [rows] = await db.query(`
            SELECT ia.*, a.nome
            FROM item_adicional ia
            JOIN adicional a ON ia.id_adicional = a.id
            WHERE ia.id_item_pedido = ?
        `, [idItemPedido])
        return rows
    },

    adicionar: async (itemAdicional) => {
        const { id_item_pedido, id_adicional, quantidade, preco_unitario } = itemAdicional
        const [result] = await db.query(
            'INSERT INTO item_adicional (id_item_pedido, id_adicional, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
            [id_item_pedido, id_adicional, quantidade, preco_unitario]
        )
        return result.insertId
    },

    deletar: async (id) => {
        await db.query('DELETE FROM item_adicional WHERE id = ?', [id])
    }
}

module.exports = AdicionalModel