const express = require('express')
const router = express.Router()
const db = require('../config/db')

router.get('/contagem-insumos', async (req, res) => {
    try {
        const insumosVisiveis = ['Hamburguer', 'Bacon', 'Calabresa', 'Ovo', 'Frango', 'Bacon (metade)', 'Calabresa (metade)', 'Salsicha']
        const adicionaisVisiveis = ['Bacon (adicional)', 'Calabresa (adicional)', 'Frango (adicional)', 'Ovo', 'Salsicha']

        const [porReceita] = await db.query(`
            SELECT 
                i.id,
                i.nome as nome_insumo,
                SUM(r.quantidade * ip.quantidade) as total_necessario
            FROM pedido p
            JOIN item_do_pedido ip ON ip.id_pedido = p.id
            JOIN receita r ON r.id_produto = ip.id_produto
            JOIN insumo i ON r.id_insumo = i.id
            WHERE p.status IN ('em_preparo', 'pronto')
            AND i.nome IN (?)
            GROUP BY i.id, i.nome
        `, [insumosVisiveis])

        const [porAdicionais] = await db.query(`
            SELECT 
                a.nome as nome_insumo,
                SUM(ia.quantidade * ip.quantidade) as total_necessario
            FROM pedido p
            JOIN item_do_pedido ip ON ip.id_pedido = p.id
            JOIN item_adicional ia ON ia.id_item_pedido = ip.id
            JOIN adicional a ON ia.id_adicional = a.id
            WHERE p.status IN ('em_preparo', 'pronto')
            AND a.nome IN (?)
            GROUP BY a.id, a.nome
        `, [adicionaisVisiveis])

        const mapa = {}

        // função para normalizar o nome — junta adicional e metade
        const normalizarNome = (nome) => {
            if (nome === 'Bacon (adicional)') return 'Bacon (metade)'
            if (nome === 'Calabresa (adicional)') return 'Calabresa (metade)'
            if (nome === 'Frango (adicional)') return 'Frango (metade)'
            return nome
        }

        porReceita.forEach(item => {
            const nome = normalizarNome(item.nome_insumo)
            mapa[nome] = (mapa[nome] || 0) + Number(item.total_necessario)
        })
        porAdicionais.forEach(item => {
            const nome = normalizarNome(item.nome_insumo)
            mapa[nome] = (mapa[nome] || 0) + Number(item.total_necessario)
        })

        const resultado = Object.entries(mapa)
            .map(([nome_insumo, total_necessario]) => ({ nome_insumo, total_necessario }))
            .sort((a, b) => b.total_necessario - a.total_necessario)

        res.json(resultado)
    } catch (error) {
        console.error('Erro ao contar insumos:', error.message)
        res.status(500).json({ erro: error.message })
    }
})
router.get('/vendas', async (req, res) => {
    try {
        const { dataInicial, dataFinal } = req.query

        if (!dataInicial || !dataFinal) {
            return res.status(400).json({ erro: 'Informe o período' })
        }

        const [pedidos] = await db.query(`
            SELECT * FROM pedido
            WHERE status = 'finalizado'
            AND DATE(horario) BETWEEN ? AND ?
            ORDER BY horario DESC
        `, [dataInicial, dataFinal])

        // busca itens e pagamentos para cada pedido
        for (const pedido of pedidos) {
            const [itens] = await db.query(`
                SELECT 
                    ip.quantidade, ip.valor_unitario, ip.observacao,
                    pr.nome as nome_produto,
                    GROUP_CONCAT(a.nome ORDER BY a.nome SEPARATOR ', ') as adicionais,
                    COALESCE(SUM(ia.preco_unitario * ia.quantidade), 0) as total_adicionais
                FROM item_do_pedido ip
                JOIN produto pr ON ip.id_produto = pr.id
                LEFT JOIN item_adicional ia ON ia.id_item_pedido = ip.id
                LEFT JOIN adicional a ON ia.id_adicional = a.id
                WHERE ip.id_pedido = ?
                GROUP BY ip.id, ip.quantidade, ip.valor_unitario, ip.observacao, pr.nome
            `, [pedido.id])

            const [pagamentos] = await db.query(`
                SELECT forma, valor_total, horario
                FROM pagamento
                WHERE id_pedido = ?
            `, [pedido.id])

            pedido.itens = itens
            pedido.pagamentos = pagamentos
        }

        const [resumo] = await db.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                COALESCE(SUM(valor_total), 0) as faturamento_total,
                COALESCE(AVG(valor_total), 0) as ticket_medio
            FROM pedido
            WHERE status = 'finalizado'
            AND DATE(horario) BETWEEN ? AND ?
        `, [dataInicial, dataFinal])

        const [porForma] = await db.query(`
            SELECT p.forma, SUM(p.valor_total) as total, COUNT(*) as quantidade
            FROM pagamento p
            JOIN pedido pe ON p.id_pedido = pe.id
            WHERE pe.status = 'finalizado'
            AND DATE(pe.horario) BETWEEN ? AND ?
            GROUP BY p.forma
        `, [dataInicial, dataFinal])

        res.json({
            total_pedidos: resumo[0].total_pedidos,
            faturamento_total: resumo[0].faturamento_total,
            ticket_medio: resumo[0].ticket_medio,
            por_forma: porForma,
            pedidos
        })

    } catch (error) {
        console.error('Erro ao gerar relatório:', error.message)
        res.status(500).json({ erro: 'Erro ao gerar relatório' })
    }
})
router.get('/estimativa-tempo', async (req, res) => {
    try {
        const [lanches] = await db.query(`
            SELECT COALESCE(SUM(ip.quantidade), 0) as total
            FROM pedido p
            JOIN item_do_pedido ip ON ip.id_pedido = p.id
            JOIN produto pr ON ip.id_produto = pr.id
            WHERE p.status = 'em_preparo'
            AND pr.categoria = 'Lanches'
        `)

        const [porcoes] = await db.query(`
            SELECT COALESCE(SUM(ip.quantidade), 0) as total
            FROM pedido p
            JOIN item_do_pedido ip ON ip.id_pedido = p.id
            JOIN produto pr ON ip.id_produto = pr.id
            WHERE p.status = 'em_preparo'
            AND pr.categoria = 'Porção'
        `)

        const totalLanches = Number(lanches[0].total)
        const totalPorcoes = Number(porcoes[0].total)
        const totalItens = totalLanches + totalPorcoes

        const tempoPorcoes = totalPorcoes * 5
        const tempoLanches = totalLanches <= 2 && totalPorcoes === 0 ? 15 : totalLanches * 3
        const estimativa = totalItens === 0 ? 0 : Math.max(tempoLanches + tempoPorcoes, totalLanches <= 2 && totalPorcoes === 0 ? 15 : 0)

        res.json({
            total_lanches: totalLanches,
            total_porcoes: totalPorcoes,
            estimativa_minutos: estimativa
        })
    } catch (error) {
        console.error('Erro ao calcular estimativa:', error.message)
        res.status(500).json({ erro: error.message })
    }
})

module.exports = router