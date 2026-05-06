const CaixaModel = require('../models/caixaModel');

const CaixaController = {

    buscarAberto: async (req, res) => {
        try {
            const caixa = await CaixaModel.buscarAberto();
            if (!caixa) return res.status(404).json({ erro: 'Nenhum caixa aberto' });
            res.json(caixa);
        } catch (error) {
            console.error('Erro ao buscar caixa:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar caixa' });
        }
    },

    abrir: async (req, res) => {
        try {
            const caixaAberto = await CaixaModel.buscarAberto();
            if (caixaAberto) return res.status(400).json({ erro: 'Já existe um caixa aberto' });
            const id = await CaixaModel.abrir(req.body);
            res.status(201).json({ mensagem: 'Caixa aberto com sucesso', id });
        } catch (error) {
            console.error('Erro ao abrir caixa:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    fechar: async (req, res) => {
        try {
            const caixa = await CaixaModel.buscarAberto();
            if (!caixa) return res.status(404).json({ erro: 'Nenhum caixa aberto para fechar' });
            const totais = await CaixaModel.calcularTotalPorForma(caixa.id);
            await CaixaModel.fechar(caixa.id);
            res.json({ mensagem: 'Caixa fechado com sucesso', totais });
        } catch (error) {
            console.error('Erro ao fechar caixa:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    calcularTotais: async (req, res) => {
        try {
            const caixa = await CaixaModel.buscarAberto();
            if (!caixa) return res.status(404).json({ erro: 'Nenhum caixa aberto' });
            const totais = await CaixaModel.calcularTotalPorForma(caixa.id);
            res.json(totais);
        } catch (error) {
            console.error('Erro ao calcular totais:', error.message);
            res.status(500).json({ erro: 'Erro ao calcular totais' });
        }
    }
};

module.exports = CaixaController;