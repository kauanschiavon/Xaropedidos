const FuncionarioModel = require("../models/funcionarioModel");

const FuncionarioController = {
  listarTodos: async (req, res) => {
    try {
      const funcionarios = await FuncionarioModel.listarTodos();
      res.json(funcionarios);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao listar funcionários" });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const funcionario = await FuncionarioModel.buscarPorId(req.params.id);
      if (!funcionario)
        return res.status(404).json({ erro: "Funcionário não encontrado" });
      res.json(funcionario);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar funcionário" });
    }
  },

  criar: async (req, res) => {
    try {
      const id = await FuncionarioModel.criar(req.body);
      res.status(201).json({ mensagem: "Funcionário criado com sucesso", id });
    } catch (error) {
      console.error("Erro ao criar funcionário:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },

  atualizar: async (req, res) => {
    try {
      await FuncionarioModel.atualizar(req.params.id, req.body);
      res.json({ mensagem: "Funcionário atualizado com sucesso" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao atualizar funcionário" });
    }
  },

  deletar: async (req, res) => {
    try {
      await FuncionarioModel.deletar(req.params.id);
      res.json({ mensagem: "Funcionário removido com sucesso" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao remover funcionário" });
    }
  },
};

module.exports = FuncionarioController;
