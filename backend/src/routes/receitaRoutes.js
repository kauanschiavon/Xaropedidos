const express = require('express');
const router = express.Router();
const ReceitaController = require('../controllers/receitaController');

router.get('/produto/:idProduto', ReceitaController.listarPorProduto);
router.post('/', ReceitaController.criar);
router.put('/:id', ReceitaController.atualizar);
router.delete('/:id', ReceitaController.deletar);

module.exports = router;