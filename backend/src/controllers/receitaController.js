const ReceitaModel = require('../models/receitaModel');

const ReceitaController = {

    listarPorProduto: async (req, res) => {
        try {
            const receita = await ReceitaModel.listarPorProduto(req.params.idProduto);
            res.json(receita);
        } catch (error) {
            console.error('Erro ao listar receita:', error.message);
            res.status(500).json({ erro: 'Erro ao listar receita' });
        }
    },

    criar: async (req, res) => {
        try {
            const id = await ReceitaModel.criar(req.body);
            res.status(201).json({ mensagem: 'Ingrediente adicionado à receita com sucesso', id });
        } catch (error) {
            console.error('Erro ao criar receita:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await ReceitaModel.atualizar(req.params.id, req.body);
            res.json({ mensagem: 'Receita atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar receita:', error.message);
            res.status(500).json({ erro: 'Erro ao atualizar receita' });
        }
    },

    deletar: async (req, res) => {
        try {
            await ReceitaModel.deletar(req.params.id);
            res.json({ mensagem: 'Ingrediente removido da receita com sucesso' });
        } catch (error) {
            console.error('Erro ao remover ingrediente:', error.message);
            res.status(500).json({ erro: 'Erro ao remover ingrediente' });
        }
    }
};

module.exports = ReceitaController;