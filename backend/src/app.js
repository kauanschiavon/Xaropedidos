const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// rotas
const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionarios', funcionarioRoutes);

const categoriaInsumoRoutes = require('./routes/categoriaInsumoRoutes');
app.use('/categorias-insumo', categoriaInsumoRoutes);

const fornecedorRoutes = require('./routes/fornecedorRoutes');
app.use('/fornecedores', fornecedorRoutes);

const insumoRoutes = require('./routes/insumoRoutes');
app.use('/insumos', insumoRoutes);

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produtos', produtoRoutes);

const receitaRoutes = require('./routes/receitaRoutes');
app.use('/receitas', receitaRoutes);

const caixaRoutes = require('./routes/caixaRoutes');
app.use('/caixa', caixaRoutes);

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/pedidos', pedidoRoutes);

const pagamentoRoutes = require('./routes/pagamentoRoutes');
app.use('/pagamentos', pagamentoRoutes);

const movimentacaoEstoqueRoutes = require('./routes/movimentacaoEstoqueRoutes');
app.use('/movimentacoes-estoque', movimentacaoEstoqueRoutes);

const relatorioRoutes = require('./routes/relatorioRoutes')
app.use('/relatorios', relatorioRoutes)

const adicionalRoutes = require('./routes/adicionalRoutes')
app.use('/adicionais', adicionalRoutes)

// teste de conexão
app.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;