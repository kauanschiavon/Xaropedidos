const express = require('express')
const router = express.Router()
const db = require('../config/db')

router.get('/', async (req, res) => {
    try {
        const [pendentes] = await db.query(`
            SELECT p.*, pe.nome_do_cliente, pe.valor_total, pe.horario as horario_pedido
            FROM pendente p
            JOIN pedido pe ON p.id_pedido = pe.id
            WHERE p.status = 'pendente'
            ORDER BY p.data_registro DESC
        `)

        // busca itens de cada pedido
        for (const pendente of pendentes) {
            const [itens] = await db.query(`
                SELECT 
                    ip.quantidade, ip.observacao,
                    pr.nome as nome_produto,
                    GROUP_CONCAT(a.nome ORDER BY a.nome SEPARATOR ', ') as adicionais
                FROM item_do_pedido ip
                JOIN produto pr ON ip.id_produto = pr.id
                LEFT JOIN item_adicional ia ON ia.id_item_pedido = ip.id
                LEFT JOIN adicional a ON ia.id_adicional = a.id
                WHERE ip.id_pedido = ?
                GROUP BY ip.id, ip.quantidade, ip.observacao, pr.nome
            `, [pendente.id_pedido])
            pendente.itens = itens
        }

        res.json(pendentes)
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})
router.put('/:id/resolver', async (req, res) => {
    try {
        await db.query('UPDATE pendente SET status = "resolvido" WHERE id = ?', [req.params.id])
        res.json({ mensagem: 'Pendente resolvido com sucesso' })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

module.exports = router