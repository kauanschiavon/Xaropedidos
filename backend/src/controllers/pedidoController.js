const PedidoModel = require("../models/pedidoModel");
const ItemPedidoModel = require("../models/itemPedidoModel");
const ReceitaModel = require("../models/receitaModel");
const InsumoModel = require("../models/insumoModel");
const CaixaModel = require("../models/caixaModel");
const ProdutoModel = require("../models/produtoModel");
const db = require("../config/db");

const PedidoController = {
  listarAtivos: async (req, res) => {
    try {
      const pedidos = await PedidoModel.listarAtivos();
      res.json(pedidos);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error.message);
      res.status(500).json({ erro: "Erro ao listar pedidos" });
    }
  },

listarAtivosComItens: async (req, res) => {
    try {
      const [rows] = await db.query(`
            SELECT 
                p.id, p.numero_mesa, p.horario, p.status, p.valor_total, p.nome_do_cliente,
                ip.id as item_id, ip.quantidade, ip.observacao,
                pr.nome as nome_produto,
                GROUP_CONCAT(
                    a.nome ORDER BY a.nome SEPARATOR ', '
                ) as adicionais
            FROM pedido p
            LEFT JOIN item_do_pedido ip ON ip.id_pedido = p.id
            LEFT JOIN produto pr ON ip.id_produto = pr.id
            LEFT JOIN item_adicional ia ON ia.id_item_pedido = ip.id
            LEFT JOIN adicional a ON ia.id_adicional = a.id
            WHERE p.status IN ('em_preparo', 'pronto')            
            GROUP BY p.id, p.numero_mesa, p.horario, p.status, p.valor_total, 
                     p.nome_do_cliente, ip.id, ip.quantidade, ip.observacao, pr.nome
        `);

      const pedidosMap = {};
      rows.forEach((row) => {
        if (!pedidosMap[row.id]) {
          pedidosMap[row.id] = {
            id: row.id,
            numero_mesa: row.numero_mesa,
            horario: row.horario,
            status: row.status,
            valor_total: row.valor_total,
            nome_do_cliente: row.nome_do_cliente,
            itens: [],
          };
        }
        if (row.item_id) {
          pedidosMap[row.id].itens.push({
            id: row.item_id,
            quantidade: row.quantidade,
            observacao: row.observacao,
            nome_produto: row.nome_produto,
            adicionais: row.adicionais || null,
          });
        }
      });

      // Aqui aplicamos a ordenação via JavaScript
const pedidosOrdenados = Object.values(pedidosMap).sort((a, b) => {
    if (a.status === 'pronto' && b.status !== 'pronto') return 1;
    if (a.status !== 'pronto' && b.status === 'pronto') return -1;
    return new Date(b.horario) - new Date(a.horario);
});

      res.json(pedidosOrdenados);
    } catch (error) {
      console.error("Erro ao listar pedidos com itens:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const pedido = await PedidoModel.buscarPorId(req.params.id);
      if (!pedido)
        return res.status(404).json({ erro: "Pedido não encontrado" });
      res.json(pedido);
    } catch (error) {
      console.error("Erro ao buscar pedido:", error.message);
      res.status(500).json({ erro: "Erro ao buscar pedido" });
    }
  },
  listarTodosDoCaixa: async (req, res) => {
    try {
      const pedidos = await PedidoModel.listarTodosDoCaixa(req.params.idCaixa);
      res.json(pedidos);
    } catch (error) {
      console.error("Erro ao listar pedidos do caixa:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },

criar: async (req, res) => {
    try {
        const caixa = await CaixaModel.buscarAberto();
        if (!caixa) return res.status(400).json({ erro: 'Nenhum caixa aberto' });

        const { nome_do_cliente, itens } = req.body;

        if (!nome_do_cliente || nome_do_cliente.trim() === '') {
            return res.status(400).json({ erro: 'Nome do cliente é obrigatório' })
        }

        for (const item of itens) {
            const insuficientes = await ReceitaModel.verificarDisponibilidade(item.id_produto, item.quantidade);
            if (insuficientes.length > 0) {
                return res.status(400).json({
                    erro: 'Estoque insuficiente',
                    insumos: insuficientes
                });
            }
        }

        const idPedido = await PedidoModel.criar({
            id_caixa: caixa.id,
            nome_do_cliente
        });

        for (const item of itens) {
            const produto = await ProdutoModel.buscarPorId(item.id_produto);

                if (!produto) {
        return res.status(400).json({ erro: 'Produto não encontrado' })
    }
    if (!produto.disponivel) {
        return res.status(400).json({ erro: `O produto "${produto.nome}" está indisponível no momento` })
    }

    const insuficientes = await ReceitaModel.verificarDisponibilidade(item.id_produto, item.quantidade);
    if (insuficientes.length > 0) {
        return res.status(400).json({
            erro: 'Estoque insuficiente',
            insumos: insuficientes
        });
    }

            await ItemPedidoModel.criar({
                id_pedido: idPedido,
                id_produto: item.id_produto,
                quantidade: item.quantidade,
                valor_unitario: produto.valor_unitario,
                observacao: item.observacao || null
            });

            await PedidoModel.atualizarValorTotal(idPedido, produto.valor_unitario * item.quantidade);

            const receita = await ReceitaModel.listarPorProduto(item.id_produto);
            for (const ingrediente of receita) {
                await InsumoModel.atualizarQuantidade(
                    ingrediente.id_insumo,
                    -(ingrediente.quantidade * item.quantidade)
                );
            }
        }

        res.status(201).json({ mensagem: 'Pedido registrado com sucesso', id: idPedido });

    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        res.status(500).json({ erro: error.message });
    }
},

adicionarItem: async (req, res) => {
    try {
        const { id } = req.params
        const { id_produto, quantidade, observacao } = req.body

        const rows = await PedidoModel.buscarPorId(id)
        if (!rows || rows.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado' })
        if (rows[0].status === 'cancelado') return res.status(400).json({ erro: 'Pedido não pode ser editado' })

        const insuficientes = await ReceitaModel.verificarDisponibilidade(id_produto, quantidade)
        if (insuficientes.length > 0) {
            return res.status(400).json({ erro: 'Estoque insuficiente', insumos: insuficientes })
        }

       const produto = await ProdutoModel.buscarPorId(id_produto)

if (!produto) {
    return res.status(400).json({ erro: 'Produto não encontrado' })
}
if (!produto.disponivel) {
    return res.status(400).json({ erro: `O produto "${produto.nome}" está indisponível no momento` })
}

        const idItemCriado = await ItemPedidoModel.criar({
            id_pedido: id,
            id_produto,
            quantidade,
            valor_unitario: produto.valor_unitario,
            observacao: observacao || null
        })

        await PedidoModel.atualizarValorTotal(id, produto.valor_unitario * quantidade)

        const receita = await ReceitaModel.listarPorProduto(id_produto)
        for (const ingrediente of receita) {
            await InsumoModel.atualizarQuantidade(
                ingrediente.id_insumo,
                -(ingrediente.quantidade * quantidade)
            )
        }

        res.json({ mensagem: 'Item adicionado com sucesso', id_item: idItemCriado })
    } catch (error) {
        console.error('Erro ao adicionar item:', error.message)
        res.status(500).json({ erro: error.message })
    }
},

  removerItem: async (req, res) => {
    try {
      const { id, idItem } = req.params;

      const rows = await PedidoModel.buscarPorId(id);
      if (!rows || rows.length === 0)
        return res.status(404).json({ erro: "Pedido não encontrado" });
      if (rows[0].status !== "em_preparo")
        return res.status(400).json({ erro: "Pedido não pode ser editado" });

      const itens = await ItemPedidoModel.listarPorPedido(id);
      const item = itens.find((i) => i.id === parseInt(idItem));
      if (!item) return res.status(404).json({ erro: "Item não encontrado" });

      // estorna insumos
      const receita = await ReceitaModel.listarPorProduto(item.id_produto);
      for (const ingrediente of receita) {
        await InsumoModel.atualizarQuantidade(
          ingrediente.id_insumo,
          ingrediente.quantidade * item.quantidade,
        );
      }

      // subtrai do valor total
      await PedidoModel.atualizarValorTotal(
        id,
        -(item.valor_unitario * item.quantidade),
      );

      await ItemPedidoModel.deletar(idItem);

      res.json({ mensagem: "Item removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover item:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },

  cancelar: async (req, res) => {
    try {
      const pedido = await PedidoModel.buscarPorId(req.params.id);
      if (!pedido || pedido.length === 0)
        return res.status(404).json({ erro: "Pedido não encontrado" });
      if (pedido[0].status === "finalizado")
        return res
          .status(400)
          .json({ erro: "Não é possível cancelar um pedido finalizado" });
      if (pedido[0].status === "cancelado")
        return res.status(400).json({ erro: "Pedido já cancelado" });

      // estorna os insumos
      const itens = await ItemPedidoModel.listarPorPedido(req.params.id);
      for (const item of itens) {
        const receita = await ReceitaModel.listarPorProduto(item.id_produto);
        for (const ingrediente of receita) {
          await InsumoModel.atualizarQuantidade(
            ingrediente.id_insumo,
            ingrediente.quantidade * item.quantidade,
          );
        }
      }

      await PedidoModel.atualizarStatus(req.params.id, "cancelado");
      res.json({ mensagem: "Pedido cancelado com sucesso" });
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },
  marcarPronto: async (req, res) => {
    try {
      const rows = await PedidoModel.buscarPorId(req.params.id);
      if (!rows || rows.length === 0)
        return res.status(404).json({ erro: "Pedido não encontrado" });
      if (rows[0].status === "finalizado")
        return res.status(400).json({ erro: "Pedido já finalizado" });
      if (rows[0].status === "cancelado")
        return res.status(400).json({ erro: "Pedido cancelado" });
      await PedidoModel.atualizarStatus(req.params.id, "pronto");
      res.json({ mensagem: "Pedido marcado como pronto" });
    } catch (error) {
      console.error("Erro ao marcar pedido como pronto:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },

  marcarEmPreparo: async (req, res) => {
    try {
      await PedidoModel.atualizarStatus(req.params.id, "em_preparo");
      res.json({ mensagem: "Pedido voltou para em preparo" });
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error.message);
      res.status(500).json({ erro: error.message });
    }
  },
};

module.exports = PedidoController;
