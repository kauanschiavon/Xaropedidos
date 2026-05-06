const db = require('../config/db');

const ProdutoModel = {

listarTodos: async () => {
    const [rows] = await db.query(`
        SELECT * FROM produto
        ORDER BY 
            CASE categoria
                WHEN 'Lanches' THEN 1
                WHEN 'Porção' THEN 2
                WHEN 'Água'  THEN 3
                WHEN 'Refri' THEN 4
                WHEN 'Sucos' THEN 5
                WHEN 'Cerveja' THEN 6
                WHEN 'Energético' THEN 7
                ELSE 8
            END,
            nome ASC
    `);
    return rows;
},
buscarPorId: async (id) => {
    const [rows] = await db.query('SELECT * FROM produto WHERE id = ?', [id]);
    return rows[0];
},

    criar: async (produto) => {
        const { nome, valor_unitario, categoria, disponivel } = produto;
        const [result] = await db.query(
            'INSERT INTO produto (nome, valor_unitario, categoria, disponivel) VALUES (?, ?, ?, ?)',
            [nome, valor_unitario, categoria, disponivel ?? true]
        );
        return result.insertId;
    },

    atualizar: async (id, produto) => {
        const { nome, valor_unitario, categoria, disponivel } = produto;
        await db.query(
            'UPDATE produto SET nome=?, valor_unitario=?, categoria=?, disponivel=? WHERE id=?',
            [nome, valor_unitario, categoria, disponivel, id]
        );
    },

    deletar: async (id) => {
        await db.query('DELETE FROM produto WHERE id = ?', [id]);
    }
};

module.exports = ProdutoModel;