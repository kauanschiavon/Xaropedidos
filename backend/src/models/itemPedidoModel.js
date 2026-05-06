const db = require("../config/db");

const ItemPedidoModel = {
  listarPorPedido: async (idPedido) => {
    const [rows] = await db.query(
      `
        SELECT 
            ip.*,
            pr.nome as nome_produto,
            GROUP_CONCAT(
                CONCAT(a.nome, ' (R$ ', ia.preco_unitario, ')')
                ORDER BY a.nome SEPARATOR ', '
            ) as adicionais,
            COALESCE(SUM(ia.preco_unitario * ia.quantidade), 0) as total_adicionais
        FROM item_do_pedido ip
        JOIN produto pr ON ip.id_produto = pr.id
        LEFT JOIN item_adicional ia ON ia.id_item_pedido = ip.id
        LEFT JOIN adicional a ON ia.id_adicional = a.id
        WHERE ip.id_pedido = ?
        GROUP BY ip.id
    `,
      [idPedido],
    );
    return rows;
  },

  criar: async (item) => {
    const { id_pedido, id_produto, quantidade, valor_unitario, observacao } =
      item;
    const [result] = await db.query(
      "INSERT INTO item_do_pedido (id_pedido, id_produto, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)",
      [id_pedido, id_produto, quantidade, valor_unitario, observacao],
    );
    return result.insertId;
  },

deletar: async (id) => {
    await db.query('DELETE FROM item_adicional WHERE id_item_pedido = ?', [id])
    await db.query('DELETE FROM item_do_pedido WHERE id = ?', [id])
},
};

module.exports = ItemPedidoModel;
