const InsumoModel = require('../models/insumoModel');

const InsumoController = {

    listarTodos: async (req, res) => {
        try {
            const insumos = await InsumoModel.listarTodos();
            res.json(insumos);
        } catch (error) {
            console.error('Erro ao listar insumos:', error.message);
            res.status(500).json({ erro: 'Erro ao listar insumos' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const insumo = await InsumoModel.buscarPorId(req.params.id);
            if (!insumo) return res.status(404).json({ erro: 'Insumo não encontrado' });
            res.json(insumo);
        } catch (error) {
            console.error('Erro ao buscar insumo:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar insumo' });
        }
    },

    criar: async (req, res) => {
        try {
            const id = await InsumoModel.criar(req.body);
            res.status(201).json({ mensagem: 'Insumo criado com sucesso', id });
        } catch (error) {
            console.error('Erro ao criar insumo:', error.message);
            res.status(500).json({ erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await InsumoModel.atualizar(req.params.id, req.body);
            res.json({ mensagem: 'Insumo atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar insumo:', error.message);
            res.status(500).json({ erro: 'Erro ao atualizar insumo' });
        }
    },

    deletar: async (req, res) => {
        try {
            await InsumoModel.deletar(req.params.id);
            res.json({ mensagem: 'Insumo removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover insumo:', error.message);
            res.status(500).json({ erro: 'Erro ao remover insumo' });
        }
    },

    buscarCriticos: async (req, res) => {
        try {
            const insumos = await InsumoModel.buscarCriticos();
            res.json(insumos);
        } catch (error) {
            console.error('Erro ao buscar insumos críticos:', error.message);
            res.status(500).json({ erro: 'Erro ao buscar insumos críticos' });
        }
    }
};

module.exports = InsumoController;