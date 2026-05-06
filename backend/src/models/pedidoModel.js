const db = require("../config/db");

const PedidoModel = {
  listarAtivos: async () => {
    const [rows] = await db.query(`
            SELECT * FROM pedido 
            WHERE status = 'em_preparo'
            ORDER BY horario ASC
        `);
    return rows;
  },

  buscarPorId: async (id) => {
    const [rows] = await db.query(
      `
        SELECT 
            p.*,
            ip.id as item_id, ip.quantidade, ip.valor_unitario, ip.observacao,
            pr.nome as nome_produto,
            GROUP_CONCAT(
                a.nome ORDER BY a.nome SEPARATOR ', '
            ) as adicionais,
            COALESCE(SUM(ia.preco_unitario * ia.quantidade), 0) as total_adicionais
        FROM pedido p
        LEFT JOIN item_do_pedido ip ON ip.id_pedido = p.id
        LEFT JOIN produto pr ON ip.id_produto = pr.id
        LEFT JOIN item_adicional ia ON ia.id_item_pedido = ip.id
        LEFT JOIN adicional a ON ia.id_adicional = a.id
        WHERE p.id = ?
        GROUP BY p.id, ip.id, ip.quantidade, ip.valor_unitario, ip.observacao, pr.nome
    `,
      [id],
    );
    return rows;
  },

buscarPorNome: async (nomeDoCliente) => {
    const [rows] = await db.query(`
        SELECT * FROM pedido 
        WHERE nome_do_cliente = ? AND status = 'em_preparo'
        LIMIT 1
    `, [nomeDoCliente]);
    return rows[0];
},

criar: async (pedido) => {
    const { id_caixa, nome_do_cliente } = pedido;
    const [result] = await db.query(
        `INSERT INTO pedido (id_caixa, horario, status, valor_total, nome_do_cliente) 
         VALUES (?, NOW(), 'em_preparo', 0, ?)`,
        [id_caixa, nome_do_cliente]
    );
    return result.insertId;
},
  atualizarValorTotal: async (id, valor) => {
    await db.query(
      "UPDATE pedido SET valor_total = valor_total + ? WHERE id = ?",
      [valor, id],
    );
  },

  atualizarStatus: async (id, status) => {
    await db.query("UPDATE pedido SET status = ? WHERE id = ?", [status, id]);
  },
  listarTodosDoCaixa: async (idCaixa) => {
    const [rows] = await db.query(
      `
        SELECT * FROM pedido 
        WHERE id_caixa = ?
        AND status != 'cancelado'
        ORDER BY horario ASC
    `,
      [idCaixa],
    );
    return rows;
  },
  listarProntos: async () => {
    const [rows] = await db.query(`
        SELECT * FROM pedido 
        WHERE status = 'pronto'
        ORDER BY horario ASC
    `);
    return rows;
},
};

module.exports = PedidoModel;
