const FornecedorModel = require('../models/fornecedorModel');

const FornecedorController = {

    listarTodos: async (req, res) => {
        try {
            const fornecedores = await FornecedorModel.listarTodos();
            res.json(fornecedores);
        } catch (error) {
            console.error('Erro ao listar fornecedores:', error.message);
            res.status(500).json({ erro: 'Erro ao listar fornecedores' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const fornecedor = await FornecedorModel.buscarPorId(req.params.id);
            if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
            res.json(fornecedor);
        } catch (error) {
            console.error('Erro ao buscar fornecedor:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar fornecedor' });
        }
    },

    criar: async (req, res) => {
        try {
            const id = await FornecedorModel.criar(req.body);
            res.status(201).json({ mensagem: 'Fornecedor criado com sucesso', id });
        } catch (error) {
            console.error('Erro ao criar fornecedor:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await FornecedorModel.atualizar(req.params.id, req.body);
            res.json({ mensagem: 'Fornecedor atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error.message);
            res.status(500).json({ erro: 'Erro ao atualizar fornecedor' });
        }
    },

    deletar: async (req, res) => {
        try {
            await FornecedorModel.deletar(req.params.id);
            res.json({ mensagem: 'Fornecedor removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover fornecedor:', error.message);
            res.status(500).json({ erro: 'Erro ao remover fornecedor' });
        }
    }
};

module.exports = FornecedorController;