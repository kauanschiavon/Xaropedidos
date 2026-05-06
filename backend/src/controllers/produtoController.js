const ProdutoModel = require('../models/produtoModel');

const ProdutoController = {

    listarTodos: async (req, res) => {
        try {
            const produtos = await ProdutoModel.listarTodos();
            res.json(produtos);
        } catch (error) {
            console.error('Erro ao listar produtos:', error.message);
            res.status(500).json({ erro: 'Erro ao listar produtos' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const produto = await ProdutoModel.buscarPorId(req.params.id);
            if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
            res.json(produto);
        } catch (error) {
            console.error('Erro ao buscar produto:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar produto' });
        }
    },

    criar: async (req, res) => {
        try {
            const id = await ProdutoModel.criar(req.body);
            res.status(201).json({ mensagem: 'Produto criado com sucesso', id });
        } catch (error) {
            console.error('Erro ao criar produto:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await ProdutoModel.atualizar(req.params.id, req.body);
            res.json({ mensagem: 'Produto atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error.message);
            res.status(500).json({ erro: 'Erro ao atualizar produto' });
        }
    },

    deletar: async (req, res) => {
        try {
            await ProdutoModel.deletar(req.params.id);
            res.json({ mensagem: 'Produto removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover produto:', error.message);
            res.status(500).json({ erro: 'Erro ao remover produto' });
        }
    }
};

module.exports = ProdutoController;