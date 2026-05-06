const MovimentacaoEstoqueModel = require('../models/movimentacaoEstoqueModel');
const InsumoModel = require('../models/insumoModel');

const MovimentacaoEstoqueController = {

    listarTodos: async (req, res) => {
        try {
            const movimentacoes = await MovimentacaoEstoqueModel.listarTodos();
            res.json(movimentacoes);
        } catch (error) {
            console.error('Erro ao listar movimentações:', error.message);
            res.status(500).json({ erro: 'Erro ao listar movimentações' });
        }
    },

    lancar: async (req, res) => {
        try {
            const { id_fornecedor, numero_nf, itens } = req.body;

            for (const item of itens) {
                const { id_insumo, quantidade, valor_do_custo, lote, tipo_de_movimento, motivo } = item;

                // valida se insumo existe
                const insumo = await InsumoModel.buscarPorId(id_insumo);
                if (!insumo) return res.status(404).json({ erro: `Insumo ${id_insumo} não encontrado` });

                // registra a movimentação
                await MovimentacaoEstoqueModel.criar({
                    id_insumo,
                    id_fornecedor: id_fornecedor || null,
                    tipo_de_movimento,
                    motivo,
                    quantidade,
                    lote: lote || null,
                    valor_do_custo: valor_do_custo || null,
                    numero_nf: numero_nf || null
                });

                // atualiza quantidade do insumo
                const ajuste = tipo_de_movimento === 'entrada' ? quantidade : -quantidade;
                await InsumoModel.atualizarQuantidade(id_insumo, ajuste);
            }

            res.status(201).json({ mensagem: 'Movimentação registrada com sucesso' });

        } catch (error) {
            console.error('Erro ao lançar movimentação:', error.message);
            res.status(500).json({ erro: error.message });
        }
    }
};

module.exports = MovimentacaoEstoqueController;