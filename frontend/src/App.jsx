import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pedidos from './pages/Pedidos'
import Caixa from './pages/Caixa'
import Pagamento from './pages/Pagamento'
import Estoque from './pages/Estoque'
import Produtos from './pages/Produtos'
import Fornecedores from './pages/Fornecedores'
import Funcionarios from './pages/Funcionarios'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/pagamentos" element={<Pagamento />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App