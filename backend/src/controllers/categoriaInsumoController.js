const CategoriaInsumoModel = require('../models/categoriaInsumoModel');

const CategoriaInsumoController = {

    listarTodos: async (req, res) => {
        try {
            const categorias = await CategoriaInsumoModel.listarTodos();
            res.json(categorias);
        } catch (error) {
            console.error('Erro ao listar categorias:', error.message);
            res.status(500).json({ erro: 'Erro ao listar categorias' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const categoria = await CategoriaInsumoModel.buscarPorId(req.params.id);
            if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });
            res.json(categoria);
        } catch (error) {
            console.error('Erro ao buscar categoria:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar categoria' });
        }
    },

    criar: async (req, res) => {
        try {
            const id = await CategoriaInsumoModel.criar(req.body);
            res.status(201).json({ mensagem: 'Categoria criada com sucesso', id });
        } catch (error) {
            console.error('Erro ao criar categoria:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await CategoriaInsumoModel.atualizar(req.params.id, req.body);
            res.json({ mensagem: 'Categoria atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error.message);
            res.status(500).json({ erro: 'Erro ao atualizar categoria' });
        }
    },

    deletar: async (req, res) => {
        try {
            await CategoriaInsumoModel.deletar(req.params.id);
            res.json({ mensagem: 'Categoria removida com sucesso' });
        } catch (error) {
            console.error('Erro ao remover categoria:', error.message);
            res.status(500).json({ erro: 'Erro ao remover categoria' });
        }
    }
};

module.exports = CategoriaInsumoController;