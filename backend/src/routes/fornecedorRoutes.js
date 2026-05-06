const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/fornecedorController');

router.get('/', FornecedorController.listarTodos);
router.get('/:id', FornecedorController.buscarPorId);
router.post('/', FornecedorController.criar);
router.put('/:id', FornecedorController.atualizar);
router.delete('/:id', FornecedorController.deletar);

module.exports = router;