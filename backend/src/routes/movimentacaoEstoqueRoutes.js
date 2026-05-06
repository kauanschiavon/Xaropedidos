const express = require('express');
const router = express.Router();
const MovimentacaoEstoqueController = require('../controllers/movimentacaoEstoqueController');

router.get('/', MovimentacaoEstoqueController.listarTodos);
router.post('/', MovimentacaoEstoqueController.lancar);

module.exports = router;