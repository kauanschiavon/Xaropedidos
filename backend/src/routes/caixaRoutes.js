const express = require('express');
const router = express.Router();
const CaixaController = require('../controllers/caixaController');

router.get('/aberto', CaixaController.buscarAberto);
router.get('/totais', CaixaController.calcularTotais);
router.post('/abrir', CaixaController.abrir);
router.put('/fechar', CaixaController.fechar);

module.exports = router;