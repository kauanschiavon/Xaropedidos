const express = require('express');
const router = express.Router();
const CategoriaInsumoController = require('../controllers/categoriaInsumoController');

router.get('/', CategoriaInsumoController.listarTodos);
router.get('/:id', CategoriaInsumoController.buscarPorId);
router.post('/', CategoriaInsumoController.criar);
router.put('/:id', CategoriaInsumoController.atualizar);
router.delete('/:id', CategoriaInsumoController.deletar);

module.exports = router;