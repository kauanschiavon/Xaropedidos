const PagamentoModel = require('../models/pagamentoModel');
const PedidoModel = require('../models/pedidoModel');
const CaixaModel = require('../models/caixaModel');

const PagamentoController = {

    listarPorPedido: async (req, res) => {
        try {
            const pagamentos = await PagamentoModel.listarPorPedido(req.params.idPedido)
            res.json(pagamentos)
        } catch (error) {
            console.error('Erro ao listar pagamentos:', error.message)
            res.status(500).json({ erro: 'Erro ao listar pagamentos' })
        }
    },

    registrar: async (req, res) => {
        try {
            const { id_pedido, forma, valor_pago } = req.body;

            const rows = await PedidoModel.buscarPorId(id_pedido);
            if (!rows || rows.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado' });
            const pedido = rows[0];

            if (pedido.status === 'finalizado') return res.status(400).json({ erro: 'Pedido já finalizado' });
            if (pedido.status === 'cancelado') return res.status(400).json({ erro: 'Pedido cancelado' });

            const caixa = await CaixaModel.buscarAberto();
            if (!caixa) return res.status(400).json({ erro: 'Nenhum caixa aberto' });

            const totalPago = await PagamentoModel.somarPagosPorPedido(id_pedido);
            const saldoRestante = pedido.valor_total - totalPago;

            if (valor_pago <= 0) return res.status(400).json({ erro: 'Valor inválido' });
            if (totalPago >= pedido.valor_total) return res.status(400).json({ erro: 'Pedido já está quitado' });

            const valorRegistrado = Math.min(valor_pago, saldoRestante);
            await PagamentoModel.criar({
                id_pedido,
                id_caixa: caixa.id,
                valor_total: valorRegistrado,
                forma
            });

            await CaixaModel.adicionarSaldo(caixa.id, valorRegistrado);

            const novoTotalPago = totalPago + valorRegistrado;
            const novoSaldo = pedido.valor_total - novoTotalPago;

            if (novoSaldo <= 0) {
                await PedidoModel.atualizarStatus(id_pedido, 'finalizado');
                return res.json({
                    mensagem: 'Pagamento registrado e pedido finalizado',
                    saldo_restante: 0
                });
            }

            res.json({
                mensagem: 'Pagamento parcial registrado',
                saldo_restante: novoSaldo
            });

        } catch (error) {
            console.error('Erro ao registrar pagamento:', error.message);
            res.status(500).json({ erro: error.message });
        }
    }
};

module.exports = PagamentoController;