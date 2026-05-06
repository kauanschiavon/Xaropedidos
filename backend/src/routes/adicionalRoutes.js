const express = require('express')
const router = express.Router()
const db = require('../config/db')
const AdicionalModel = require('../models/adicionalModel')
const PedidoModel = require('../models/pedidoModel')
const ItemPedidoModel = require('../models/itemPedidoModel')

router.get('/', async (req, res) => {
    try {
        const adicionais = await AdicionalModel.listarTodos()
        res.json(adicionais)
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

router.post('/item/:idItemPedido', async (req, res) => {
    try {
        const { idItemPedido } = req.params
        const { id_adicional, quantidade } = req.body

        // busca o adicional
        const [rows] = await db.query('SELECT * FROM adicional WHERE id = ?', [id_adicional])
        if (!rows[0]) return res.status(404).json({ erro: 'Adicional não encontrado' })
        const adicional = rows[0]

        // adiciona o item_adicional
        await AdicionalModel.adicionar({
            id_item_pedido: idItemPedido,
            id_adicional,
            quantidade: quantidade || 1,
            preco_unitario: adicional.preco
        })

        // atualiza o valor total do pedido
        const [itemRows] = await db.query('SELECT * FROM item_do_pedido WHERE id = ?', [idItemPedido])
        const idPedido = itemRows[0].id_pedido
        await PedidoModel.atualizarValorTotal(idPedido, adicional.preco * (quantidade || 1))

        res.status(201).json({ mensagem: 'Adicional incluído com sucesso' })
    } catch (error) {
        console.error('Erro ao adicionar adicional:', error.message)
        res.status(500).json({ erro: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        // busca o adicional para estornar o valor
        const [rows] = await db.query(`
            SELECT ia.*, a.preco, ip.id_pedido
            FROM item_adicional ia
            JOIN adicional a ON ia.id_adicional = a.id
            JOIN item_do_pedido ip ON ia.id_item_pedido = ip.id
            WHERE ia.id = ?
        `, [req.params.id])

        if (!rows[0]) return res.status(404).json({ erro: 'Adicional não encontrado' })
        const item = rows[0]

        await PedidoModel.atualizarValorTotal(item.id_pedido, -(item.preco * item.quantidade))
        await AdicionalModel.deletar(req.params.id)

        res.json({ mensagem: 'Adicional removido com sucesso' })
    } catch (error) {
        console.error('Erro ao remover adicional:', error.message)
        res.status(500).json({ erro: error.message })
    }
})
router.post('/lanche-personalizado', async (req, res) => {
    try {
        const { id_pedido, nome, preco, ingredientes } = req.body

        const caixa = await require('../models/caixaModel').buscarAberto()
        if (!caixa) return res.status(400).json({ erro: 'Nenhum caixa aberto' })

        // cria o produto temporário
        const [result] = await db.query(
            'INSERT INTO produto (nome, valor_unitario, categoria, disponivel) VALUES (?, ?, ?, ?)',
            [nome || 'Lanche Personalizado', preco || 0, 'Lanches', false]
        )
        const idProduto = result.insertId

        // cria os itens do pedido
        const [itemResult] = await db.query(
            'INSERT INTO item_do_pedido (id_pedido, id_produto, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
            [id_pedido, idProduto, 1, preco || 0, 'Lanche personalizado']
        )
        const idItem = itemResult.insertId

        // atualiza valor total do pedido
        await db.query('UPDATE pedido SET valor_total = valor_total + ? WHERE id = ?', [preco || 0, id_pedido])

        // debita os insumos
        for (const ingrediente of ingredientes) {
            await db.query(
                'UPDATE insumo SET quantidade = quantidade - ? WHERE id = ?',
                [ingrediente.quantidade, ingrediente.id_insumo]
            )
        }

        res.status(201).json({ mensagem: 'Lanche personalizado adicionado!', id_item: idItem })
    } catch (error) {
        console.error('Erro ao criar lanche personalizado:', error.message)
        res.status(500).json({ erro: error.message })
    }
})

module.exports = router