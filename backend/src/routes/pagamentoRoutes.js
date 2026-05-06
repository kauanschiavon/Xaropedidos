const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/pagamentoController');

router.post('/', PagamentoController.registrar);
router.get('/pedido/:idPedido', PagamentoController.listarPorPedido);

module.exports = router;