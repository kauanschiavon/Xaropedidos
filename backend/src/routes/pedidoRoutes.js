const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedidoController');

router.get('/ativos-com-itens', PedidoController.listarAtivosComItens);
router.get('/', PedidoController.listarAtivos);
router.get('/:id', PedidoController.buscarPorId);
router.post('/', PedidoController.criar);
router.put('/:id/cancelar', PedidoController.cancelar);
router.post('/:id/itens', PedidoController.adicionarItem);
router.delete('/:id/itens/:idItem', PedidoController.removerItem);
router.get('/caixa/:idCaixa', PedidoController.listarTodosDoCaixa);
router.put('/:id/pronto', PedidoController.marcarPronto);
router.put('/:id/em-preparo', PedidoController.marcarEmPreparo);

module.exports = router;