const express = require('express');
const router = express.Router();
const InsumoController = require('../controllers/insumoController');

router.get('/', InsumoController.listarTodos);
router.get('/criticos', InsumoController.buscarCriticos);
router.get('/:id', InsumoController.buscarPorId);
router.post('/', InsumoController.criar);
router.put('/:id', InsumoController.atualizar);
router.delete('/:id', InsumoController.deletar);

module.exports = router;