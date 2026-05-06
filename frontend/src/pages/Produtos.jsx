import { useEffect, useState } from "react";
import api from "../services/api";

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [receita, setReceita] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [editando, setEditando] = useState(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    valor_unitario: "",
    categoria: "",
    disponivel: true,
  });
  const [novoIngrediente, setNovoIngrediente] = useState({
    id_insumo: "",
    quantidade: "",
    unidade_de_medida: "unidade",
  });

  const carregarProdutos = async () => {
    const res = await api.get("/produtos");
    setProdutos(res.data);
  };

  useEffect(() => {
    const init = async () => {
      await carregarProdutos();
      const res = await api.get("/insumos");
      setInsumos(res.data);
    };
    init();
  }, []);

  const criarProduto = async () => {
    try {
      if (!novoProduto.nome || !novoProduto.valor_unitario) {
        setMensagem({ tipo: "erro", texto: "Preencha nome e valor" });
        return;
      }
      
      if (editando) {
          await api.put(`/produtos/${editando}`, novoProduto);
          setMensagem({ tipo: 'sucesso', texto: 'Produto atualizado com sucesso!' });
          setEditando(null);
      } else {
          await api.post('/produtos', novoProduto);
          setMensagem({ tipo: 'sucesso', texto: 'Produto criado com sucesso!' });
      }
      
      setMostrarForm(false);
      setNovoProduto({
        nome: "",
        valor_unitario: "",
        categoria: "",
        disponivel: true,
      });
      carregarProdutos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao salvar produto",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const deletarProduto = async (id) => {
    if (!window.confirm('Deseja remover este produto?')) return;
    try {
        await api.delete(`/produtos/${id}`);
        setMensagem({ tipo: 'sucesso', texto: 'Produto removido com sucesso!' });
        if (produtoSelecionado?.id === id) setProdutoSelecionado(null);
        carregarProdutos();
    } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao remover produto' });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const abrirEdicao = (produto) => {
    setEditando(produto.id);
    setNovoProduto({
        nome: produto.nome,
        valor_unitario: produto.valor_unitario,
        categoria: produto.categoria || '',
        disponivel: produto.disponivel
    });
    setMostrarForm(true);
  };

  const selecionarProduto = async (produto) => {
    setProdutoSelecionado(produto);
    const res = await api.get(`/receitas/produto/${produto.id}`);
    setReceita(res.data);
  };

  const adicionarIngrediente = async () => {
    try {
      if (!novoIngrediente.id_insumo || !novoIngrediente.quantidade) {
        setMensagem({
          tipo: "erro",
          texto: "Preencha todos os campos do ingrediente",
        });
        return;
      }
      await api.post("/receitas", {
        id_produto: produtoSelecionado.id,
        id_insumo: novoIngrediente.id_insumo,
        quantidade: novoIngrediente.quantidade,
        unidade_de_medida: novoIngrediente.unidade_de_medida,
      });
      setMensagem({ tipo: "sucesso", texto: "Ingrediente adicionado!" });
      setNovoIngrediente({
        id_insumo: "",
        quantidade: "",
        unidade_de_medida: "unidade",
      });
      const res = await api.get(`/receitas/produto/${produtoSelecionado.id}`);
      setReceita(res.data);
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao adicionar ingrediente",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const removerIngrediente = async (id) => {
    try {
      await api.delete(`/receitas/${id}`);
      const res = await api.get(`/receitas/produto/${produtoSelecionado.id}`);
      setReceita(res.data);
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao remover ingrediente" });
    }
  };

  const toggleDisponivel = async (produto) => {
    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        disponivel: !produto.disponivel,
      });
      carregarProdutos();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao atualizar disponibilidade" });
    }
  };

  const estilo = {
    card: {
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      marginBottom: "20px",
    },
    botao: {
      background: "linear-gradient(135deg, #e7901e, #dc2b1c)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
    },
    botaoSecundario: {
      background: "#f0f0f0",
      color: "#555",
      border: "none",
      borderRadius: "8px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "13px",
    },
    botaoDanger: {
      background: "#fee2e2",
      color: "#dc2b1c",
      border: "none",
      borderRadius: "8px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "13px",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      fontSize: "14px",
      marginBottom: "12px",
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      fontSize: "14px",
      marginBottom: "12px",
      background: "white",
    },
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ color: "#1a1a1a" }}>Cardápio</h1>
          <p style={{ color: "#888" }}>Gerencie os produtos e suas receitas</p>
        </div>
        <button
          style={estilo.botao}
          onClick={() => {
            setMostrarForm(!mostrarForm);
            setEditando(null);
            setNovoProduto({ nome: '', valor_unitario: '', categoria: '', disponivel: true });
          }}
        >
          {mostrarForm ? "✕ Fechar" : "+ Novo Produto"}
        </button>
      </div>

      {mensagem && (
        <div
          style={{
            background: mensagem.tipo === "sucesso" ? "#f0fdf4" : "#fee2e2",
            color: mensagem.tipo === "sucesso" ? "#16a34a" : "#dc2b1c",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Formulário novo produto / editar produto */}
      {mostrarForm && (
        <div style={estilo.card}>
          <h3 style={{ marginBottom: "16px" }}>
            {editando ? "Editar Produto" : "Novo Produto"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>Nome</label>
              <input
                style={estilo.input}
                value={novoProduto.nome}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, nome: e.target.value })
                }
                placeholder="Ex: X-Burguer"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Valor (R$)
              </label>
              <input
                style={estilo.input}
                type="number"
                step="0.01"
                value={novoProduto.valor_unitario}
                onChange={(e) =>
                  setNovoProduto({
                    ...novoProduto,
                    valor_unitario: e.target.value,
                  })
                }
                placeholder="Ex: 25.00"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Categoria
              </label>
              <input
                style={estilo.input}
                value={novoProduto.categoria}
                onChange={(e) =>
                  setNovoProduto({ ...novoProduto, categoria: e.target.value })
                }
                placeholder="Ex: Lanches"
              />
            </div>
          </div>
          <button style={estilo.botao} onClick={criarProduto}>
            {editando ? "Salvar Alterações" : "Salvar Produto"}
          </button>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Lista de produtos */}
        <div style={estilo.card}>
          <h3 style={{ marginBottom: "16px" }}>Produtos</h3>
          {produtos.length === 0 ? (
            <p style={{ color: "#aaa" }}>Nenhum produto cadastrado</p>
          ) : (
            produtos.map((produto) => (
              <div
                key={produto.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border:
                    produtoSelecionado?.id === produto.id
                      ? "2px solid #e7901e"
                      : "2px solid #f0f0f0",
                  background:
                    produtoSelecionado?.id === produto.id ? "#fff8f0" : "white",
                  cursor: "pointer",
                }}
                onClick={() => selecionarProduto(produto)}
              >
                <div>
                  <strong>{produto.nome}</strong>
                  <p style={{ color: "#888", fontSize: "13px" }}>
                    {produto.categoria}
                  </p>
                </div>
                
                {/* Botões de Ação do Produto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>R$ {Number(produto.valor_unitario).toFixed(2)}</span>
                  <button
                      style={produto.disponivel ? {
                          background: '#f0fdf4', color: '#16a34a',
                          border: 'none', borderRadius: '20px',
                          padding: '4px 12px', cursor: 'pointer', fontSize: '12px'
                      } : {
                          background: '#fee2e2', color: '#dc2b1c',
                          border: 'none', borderRadius: '20px',
                          padding: '4px 12px', cursor: 'pointer', fontSize: '12px'
                      }}
                      onClick={e => { e.stopPropagation(); toggleDisponivel(produto) }}>
                      {produto.disponivel ? 'Disponível' : 'Indisponível'}
                  </button>
                  <button
                      style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
                      onClick={e => { e.stopPropagation(); abrirEdicao(produto) }}>
                      Editar
                  </button>
                  <button
                      style={{ background: '#fee2e2', color: '#dc2b1c', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
                      onClick={e => { e.stopPropagation(); deletarProduto(produto.id) }}>
                      Deletar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Receita do produto */}
        {produtoSelecionado ? (
          <div style={estilo.card}>
            <h3 style={{ marginBottom: "4px" }}>
              Receita — {produtoSelecionado.nome}
            </h3>
            <p
              style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}
            >
              Ingredientes usados na baixa automática de estoque
            </p>

            {receita.length === 0 ? (
              <p style={{ color: "#aaa", marginBottom: "16px" }}>
                Nenhum ingrediente cadastrado
              </p>
            ) : (
              receita.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span>
                    <strong>{item.nome_insumo}</strong> — {item.quantidade}{" "}
                    {item.unidade_de_medida}
                  </span>
                  <button
                    style={estilo.botaoDanger}
                    onClick={() => removerIngrediente(item.id)}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}

            <h4 style={{ marginBottom: "12px", color: "#555" }}>
              Adicionar Ingrediente
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr auto",
                gap: "10px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={{ fontSize: "13px", color: "#555" }}>
                  Insumo
                </label>
                <select
                  style={estilo.select}
                  value={novoIngrediente.id_insumo}
                  onChange={(e) =>
                    setNovoIngrediente({
                      ...novoIngrediente,
                      id_insumo: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione...</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#555" }}>
                  Quantidade
                </label>
                <input
                  style={estilo.input}
                  type="number"
                  step="0.01"
                  value={novoIngrediente.quantidade}
                  onChange={(e) =>
                    setNovoIngrediente({
                      ...novoIngrediente,
                      quantidade: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#555" }}>
                  Unidade
                </label>
                <input
                  style={estilo.input}
                  value={novoIngrediente.unidade_de_medida}
                  onChange={(e) =>
                    setNovoIngrediente({
                      ...novoIngrediente,
                      unidade_de_medida: e.target.value,
                    })
                  }
                  placeholder="unidade, g, ml..."
                />
              </div>
              <button
                style={{ ...estilo.botao, marginBottom: "12px" }}
                onClick={adicionarIngrediente}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div style={{ ...estilo.card, textAlign: "center", color: "#aaa" }}>
            Selecione um produto para ver e editar sua receita
          </div>
        )}
      </div>
    </div>
  );
}

export default Produtos;