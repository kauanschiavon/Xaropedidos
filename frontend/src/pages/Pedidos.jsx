import { useEffect, useState } from "react";
import api from "../services/api";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [adicionais, setAdicionais] = useState([]);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState({});
  const [adicionaisEdicao, setAdicionaisEdicao] = useState([]);
  const [produtoRapido, setProdutoRapido] = useState(null);

  // Estados para Lanche Personalizado
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);
  const [ingredientesPersonalizado, setIngredientesPersonalizado] = useState(
    {},
  );
  const [nomePersonalizado, setNomePersonalizado] = useState("");
  const [precoPersonalizado, setPrecoPersonalizado] = useState("");
  const [insumos, setInsumos] = useState([]);

  // Estados para Novo Pedido
  const [novoPedido, setNovoPedido] = useState({
    nome_do_cliente: "",
    itens: [],
  });

  const [novoItem, setNovoItem] = useState({
    id_produto: "",
    quantidade: 1,
    observacao: "",
  });

  // --- NOVOS ESTADOS PARA EDIÇÃO ---
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [itensPedidoEditando, setItensPedidoEditando] = useState([]);
  const [novoItemEdicao, setNovoItemEdicao] = useState({
    id_produto: "",
    quantidade: 1,
    observacao: "",
    adicionais: [],
  });

  const carregarPedidos = () => {
    api.get("/pedidos/ativos-com-itens").then((res) => {
      const ordenados = res.data.sort((a, b) => {
        if (a.status === "pronto" && b.status !== "pronto") return 1;
        if (a.status !== "pronto" && b.status === "pronto") return -1;
        return new Date(b.horario) - new Date(a.horario);
      });
      setPedidos(ordenados);
    });
  };

  useEffect(() => {
    const init = async () => {
      await carregarPedidos();
      const [produtosRes, adicionaisRes, insumosRes] = await Promise.all([
        api.get("/produtos"),
        api.get("/adicionais"),
        api.get("/insumos"),
      ]);
      setProdutos(produtosRes.data);
      setAdicionais(adicionaisRes.data);
      setInsumos(insumosRes.data);
    };
    init();

    // atualiza a cada 15 segundos
    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 15000);

    return () => clearInterval(intervalo);
  }, []);

  // --- FUNÇÃO PARA VERIFICAR CAIXA ANTES DE ABRIR O FORMULÁRIO ---
  const abrirFormPedido = async () => {
    if (mostrarForm) {
      setMostrarForm(false);
      setProdutoRapido(null);
      setMostrarPersonalizado(false);
      setNovoPedido({ nome_do_cliente: "", itens: [] });
      return;
    }
    try {
      await api.get("/caixa/aberto");
      setMostrarForm(true);
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Nenhum caixa aberto. Abra o caixa antes de registrar pedidos.",
      });
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  // --- FUNÇÕES DE EDIÇÃO ---
  const abrirEdicao = async (pedido) => {
    setPedidoEditando(pedido);
    setAdicionaisEdicao([]);
    const [itensRes, adicionaisRes] = await Promise.all([
      api.get(`/pedidos/${pedido.id}`),
      api.get("/adicionais"),
    ]);
    setItensPedidoEditando(
      Array.isArray(itensRes.data) ? itensRes.data : itensRes.data.itens || [],
    );
    setAdicionaisEdicao(adicionaisRes.data);
  };

  const adicionarItemEdicao = async () => {
    try {
      if (!novoItemEdicao.id_produto || novoItemEdicao.quantidade < 1) return;

      const res = await api.post(`/pedidos/${pedidoEditando.id}/itens`, {
        id_produto: novoItemEdicao.id_produto,
        quantidade: novoItemEdicao.quantidade,
        observacao: novoItemEdicao.observacao,
      });

      const idItemCriado = res.data.id_item;

      if (novoItemEdicao.adicionais && novoItemEdicao.adicionais.length > 0) {
        for (const idAdicional of novoItemEdicao.adicionais) {
          await api.post(`/adicionais/item/${idItemCriado}`, {
            id_adicional: idAdicional,
            quantidade: 1,
          });
        }
      }

      setMensagem({ tipo: "sucesso", texto: "Item adicionado!" });
      const itensRes = await api.get(`/pedidos/${pedidoEditando.id}`);
      setItensPedidoEditando(itensRes.data);
      setNovoItemEdicao({
        id_produto: "",
        quantidade: 1,
        observacao: "",
        adicionais: [],
      });
      carregarPedidos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao adicionar item",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const removerItemEdicao = async (idItem) => {
    try {
      await api.delete(`/pedidos/${pedidoEditando.id}/itens/${idItem}`);
      setMensagem({ tipo: "sucesso", texto: "Item removido!" });
      const res = await api.get(`/pedidos/${pedidoEditando.id}`);
      setItensPedidoEditando(
        Array.isArray(res.data) ? res.data : res.data.itens || [],
      );
      carregarPedidos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao remover item",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const removerItem = (index) => {
    setNovoPedido((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
  };

  const registrarPedido = async () => {
    try {
      if (!novoPedido.nome_do_cliente || novoPedido.itens.length === 0) {
        setMensagem({
          tipo: "erro",
          texto: "Informe o nome do cliente e adicione pelo menos um item",
        });
        return;
      }

      const itensPadrao = novoPedido.itens.filter(
        (i) => i.id_produto !== "personalizado",
      );
      const itensPersonalizados = novoPedido.itens.filter(
        (i) => i.id_produto === "personalizado",
      );

      const res = await api.post("/pedidos", {
        nome_do_cliente: novoPedido.nome_do_cliente,
        itens: itensPadrao,
      });

      const idPedido = res.data.id;
      const pedidoRes = await api.get(`/pedidos/${idPedido}`);
      const itensCriados = Array.isArray(pedidoRes.data)
        ? pedidoRes.data
        : pedidoRes.data.itens || [];

      // adicionais dos itens padrão
      for (let i = 0; i < itensPadrao.length; i++) {
        const item = itensPadrao[i];
        if (item.adicionais && item.adicionais.length > 0) {
          const itemCriado = itensCriados[i];
          if (itemCriado) {
            for (const adicional of item.adicionais) {
              await api.post(`/adicionais/item/${itemCriado.item_id}`, {
                id_adicional: adicional.id,
                quantidade: adicional.quantidade || 1,
              });
            }
          }
        }
      }

      // itens personalizados
      for (const item of itensPersonalizados) {
        await api.post("/adicionais/lanche-personalizado", {
          id_pedido: idPedido,
          nome: item.nome_produto,
          preco: item.preco_personalizado,
          ingredientes: item.ingredientes_personalizado,
        });
      }

      setMensagem({ tipo: "sucesso", texto: "Pedido registrado com sucesso!" });
      setMostrarForm(false);
      setProdutoRapido(null);
      setMostrarPersonalizado(false);
      setNovoPedido({ nome_do_cliente: "", itens: [] });
      setAdicionaisSelecionados({});
      carregarPedidos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao registrar pedido",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const salvarLanchePersonalizado = async (idPedido) => {
    try {
      const ingredientesSelecionados = Object.entries(ingredientesPersonalizado)
        .filter(([, qtd]) => qtd > 0)
        .map(([id_insumo, quantidade]) => ({
          id_insumo: parseInt(id_insumo),
          quantidade,
        }));
      if (ingredientesSelecionados.length === 0) {
        setMensagem({
          tipo: "erro",
          texto: "Selecione pelo menos um ingrediente",
        });
        return;
      }

      await api.post("/adicionais/lanche-personalizado", {
        id_pedido: idPedido,
        nome: nomePersonalizado || "Lanche Personalizado",
        preco: parseFloat(precoPersonalizado) || 0,
        ingredientes: ingredientesSelecionados,
      });

      setMensagem({
        tipo: "sucesso",
        texto: "Lanche personalizado adicionado!",
      });
      setMostrarPersonalizado(false);
      setIngredientesPersonalizado({});
      setNomePersonalizado("");
      setPrecoPersonalizado("");
      carregarPedidos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto:
          error.response?.data?.erro || "Erro ao criar lanche personalizado",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const cancelarPedido = async (id) => {
    if (!window.confirm("Deseja cancelar este pedido?")) return;
    try {
      await api.put(`/pedidos/${id}/cancelar`);
      setMensagem({ tipo: "sucesso", texto: "Pedido cancelado com sucesso!" });
      carregarPedidos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao cancelar pedido",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const marcarPronto = async (id) => {
    await api.put(`/pedidos/${id}/pronto`);
    carregarPedidos();
  };

  const marcarEmPreparo = async (id) => {
    await api.put(`/pedidos/${id}/em-preparo`);
    carregarPedidos();
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
      background: "#f3f4f6",
      color: "#374151",
      border: "none",
      borderRadius: "8px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "13px",
    },
    botaoCancelar: {
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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tempoDecorrido = (horario) => {
    const agora = new Date();
    const hora = new Date(horario);
    const diff = Math.floor((agora - hora) / 1000 / 60);
    if (diff < 1) return "agora";
    if (diff === 1) return "1 min";
    return `${diff} min`;
  };

  const corTempo = (horario) => {
    const agora = new Date();
    const hora = new Date(horario);
    const diff = Math.floor((agora - hora) / 1000 / 60);
    if (diff < 10) return "#16a34a";
    if (diff < 20) return "#e7901e";
    return "#dc2b1c";
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
          <h1 style={{ color: "#1a1a1a" }}>Pedidos</h1>
          <p style={{ color: "#888" }}>Gerencie os pedidos ativos</p>
        </div>
        <button style={estilo.botao} onClick={abrirFormPedido}>
          {mostrarForm ? "✕ Fechar" : "+ Novo Pedido"}
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

      {/* Formulário Novo Pedido */}
      {mostrarForm && (
        <div style={estilo.card}>
          <h3 style={{ marginBottom: "20px" }}>Novo Pedido</h3>

          {/* Cliente obrigatório */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", color: "#555" }}>
              Nome do Cliente <span style={{ color: "#dc2b1c" }}>*</span>
            </label>
            <input
              style={estilo.input}
              type="text"
              value={novoPedido.nome_do_cliente}
              onChange={(e) =>
                setNovoPedido({
                  ...novoPedido,
                  nome_do_cliente: e.target.value,
                })
              }
              placeholder="Nome do cliente (obrigatório)"
            />
          </div>

          {/* Botão lanche personalizado */}
          <div style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => {
                setMostrarPersonalizado(!mostrarPersonalizado);
                setProdutoRapido(null); // Fecha a gaveta de produto rápido se estiver aberta
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                border: mostrarPersonalizado
                  ? "2px solid #e7901e"
                  : "2px dashed #e0e0e0",
                background: mostrarPersonalizado ? "#fff8f0" : "white",
                cursor: "pointer",
                textAlign: "left",
                color: "#e7901e",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              🍔 + Criar Lanche Personalizado
            </button>
          </div>

          {/* Catálogo de produtos por categoria */}
          <h4 style={{ marginBottom: "12px", color: "#555" }}>
            Escolha os itens
          </h4>
          {Object.entries(
            produtos.reduce((acc, p) => {
              if (!acc[p.categoria]) acc[p.categoria] = [];
              acc[p.categoria].push(p);
              return acc;
            }, {}),
          ).map(([categoria, itens]) => (
            <div key={categoria} style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {categoria}
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {itens.map((produto) => {
                  const itemNoCarrinho = novoPedido.itens.filter(
                    (i) => i.id_produto === String(produto.id),
                  );
                  const quantidadeTotal = itemNoCarrinho.reduce(
                    (acc, i) => acc + i.quantidade,
                    0,
                  );
                  return (
                    <button
                      key={produto.id}
                      type="button"
                      onClick={() => {
                        if (!produto.disponivel) {
                          setMensagem({
                            tipo: "erro",
                            texto: `"${produto.nome}" está indisponível no momento`,
                          });
                          setTimeout(() => setMensagem(null), 3000);
                          return;
                        }
                        setProdutoRapido(produto);
                        setMostrarPersonalizado(false); // Fecha a gaveta do lanche personalizado
                        setNovoItem({
                          id_produto: String(produto.id),
                          quantidade: 1,
                          observacao: "",
                        });
                        setAdicionaisSelecionados({ 0: {} });
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border:
                          produtoRapido?.id === produto.id
                            ? "2px solid #e7901e"
                            : "2px solid #f0f0f0",
                        background: !produto.disponivel
                          ? "#f9f9f9"
                          : produtoRapido?.id === produto.id
                            ? "#fff8f0"
                            : "white",
                        cursor: produto.disponivel ? "pointer" : "not-allowed",
                        textAlign: "left",
                        opacity: produto.disponivel ? 1 : 0.5,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>
                          {produto.nome}
                        </strong>
                        {!produto.disponivel && (
                          <p
                            style={{
                              color: "#dc2b1c",
                              fontSize: "11px",
                              margin: 0,
                            }}
                          >
                            Indisponível
                          </p>
                        )}
                        {produto.disponivel && (
                          <p
                            style={{
                              color: "#888",
                              fontSize: "12px",
                              margin: 0,
                            }}
                          >
                            R$ {Number(produto.valor_unitario).toFixed(2)}
                          </p>
                        )}
                      </div>
                      {quantidadeTotal > 0 && (
                        <span
                          style={{
                            background: "#e7901e",
                            color: "white",
                            borderRadius: "20px",
                            padding: "2px 10px",
                            fontSize: "13px",
                            fontWeight: "bold",
                          }}
                        >
                          {quantidadeTotal}x
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Carrinho Resumo */}
          {novoPedido.itens.length > 0 && (
            <div style={{ marginTop: "20px", paddingBottom: "80px" }}>
              <h4 style={{ marginBottom: "12px", color: "#555" }}>
                Itens adicionados ({novoPedido.itens.length})
              </h4>
              {novoPedido.itens.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <div>
                    <strong>{item.nome_produto}</strong> x{item.quantidade}
                    {item.adicionais?.length > 0 && (
                      <span
                        style={{
                          color: "#e7901e",
                          fontSize: "12px",
                          marginLeft: "6px",
                        }}
                      >
                        +{" "}
                        {item.adicionais
                          .map((a) => `${a.quantidade}x ${a.nome}`)
                          .join(", ")}
                      </span>
                    )}
                    {item.id_produto === "personalizado" &&
                      item.ingredientes_personalizado?.length > 0 && (
                        <span
                          style={{
                            color: "#e7901e",
                            fontSize: "12px",
                            marginLeft: "6px",
                          }}
                        >
                          +{" "}
                          {item.ingredientes_personalizado
                            .map((ingrediente) => {
                              const insumoInfo = insumos.find(
                                (i) => i.id === ingrediente.id_insumo,
                              );
                              return `${ingrediente.quantidade}x ${insumoInfo?.nome || ""}`;
                            })
                            .filter((texto) => texto)
                            .join(", ")}
                        </span>
                      )}
                    {item.observacao && (
                      <p
                        style={{
                          color: "#dc2b1c",
                          fontSize: "12px",
                          margin: 0,
                        }}
                      >
                        ⚠ {item.observacao}
                      </p>
                    )}
                  </div>
                  <button
                    style={estilo.botaoCancelar}
                    onClick={() => removerItem(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAINÉIS FLUTUANTES (GAVETAS NA BASE DA TELA)                   */}
      {/* ------------------------------------------------------------- */}

      {/* Painel do produto selecionado - FORA do card */}
      {produtoRapido && mostrarForm && (
        <div
          style={{
            position: "fixed",
            bottom: "0",
            left: "0",
            right: "0",
            background: "white",
            borderTop: "2px solid #f0f0f0",
            padding: "16px",
            zIndex: 998,
            maxHeight: "70vh",
            overflowY: "auto",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <p style={{ fontWeight: "bold", fontSize: "15px", margin: 0 }}>
              {produtoRapido.nome} — R${" "}
              {Number(produtoRapido.valor_unitario).toFixed(2)}
            </p>
            <button
              onClick={() => {
                setProdutoRapido(null);
                setNovoItem({ id_produto: "", quantidade: 1, observacao: "" });
                setAdicionaisSelecionados({});
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#888",
              }}
            >
              ✕
            </button>
          </div>

          {/* Quantidade */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => {
                if (novoItem.quantidade === 1) {
                  setProdutoRapido(null);
                  setNovoItem({
                    id_produto: "",
                    quantidade: 1,
                    observacao: "",
                  });
                  setAdicionaisSelecionados({});
                } else {
                  setNovoItem((prev) => ({
                    ...prev,
                    quantidade: prev.quantidade - 1,
                  }));
                }
              }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #e0e0e0",
                background: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              −
            </button>
            <strong
              style={{
                fontSize: "18px",
                minWidth: "24px",
                textAlign: "center",
              }}
            >
              {novoItem.quantidade}
            </strong>
            <button
              onClick={() =>
                setNovoItem((prev) => ({
                  ...prev,
                  quantidade: prev.quantidade + 1,
                }))
              }
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #e7901e",
                background: "#e7901e",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              +
            </button>
            {!["Refri", "Sucos", "Cerveja", "Água"].includes(
              produtoRapido?.categoria,
            ) && (
              <input
                style={{ ...estilo.input, margin: 0, flex: 1 }}
                placeholder="Observação (opcional)"
                value={novoItem.observacao}
                onChange={(e) =>
                  setNovoItem({ ...novoItem, observacao: e.target.value })
                }
              />
            )}
          </div>

          {/* Adicionais Lanches */}
          {produtoRapido.categoria === "Lanches" && adicionais.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginBottom: "8px",
                }}
              >
                Adicionais
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {adicionais.map((adicional) => {
                  const qtd =
                    (adicionaisSelecionados[0] || {})[adicional.id] || 0;
                  return (
                    <div
                      key={adicional.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border:
                          qtd > 0 ? "2px solid #e7901e" : "2px solid #f0f0f0",
                        background: qtd > 0 ? "#fff8f0" : "white",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: qtd > 0 ? "bold" : "normal",
                          color: qtd > 0 ? "#e7901e" : "#333",
                        }}
                      >
                        {adicional.nome}{" "}
                        <span style={{ color: "#aaa", fontWeight: "normal" }}>
                          +R${adicional.preco.toFixed(2)}
                        </span>
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {qtd > 0 && (
                          <>
                            <button
                              onClick={() => {
                                const atual = {
                                  ...(adicionaisSelecionados[0] || {}),
                                };
                                if (atual[adicional.id] <= 1)
                                  delete atual[adicional.id];
                                else atual[adicional.id]--;
                                setAdicionaisSelecionados({
                                  ...adicionaisSelecionados,
                                  0: atual,
                                });
                              }}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: "2px solid #e0e0e0",
                                background: "white",
                                fontSize: "16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              −
                            </button>
                            <strong
                              style={{
                                minWidth: "16px",
                                textAlign: "center",
                              }}
                            >
                              {qtd}
                            </strong>
                          </>
                        )}
                        <button
                          onClick={() => {
                            const atual = {
                              ...(adicionaisSelecionados[0] || {}),
                            };
                            atual[adicional.id] =
                              (atual[adicional.id] || 0) + 1;
                            setAdicionaisSelecionados({
                              ...adicionaisSelecionados,
                              0: atual,
                            });
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "2px solid #e7901e",
                            background: "#e7901e",
                            color: "white",
                            fontSize: "16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Adicionais Porção */}
          {produtoRapido.categoria === "Porção" && (
            <div style={{ marginBottom: "12px" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginBottom: "8px",
                }}
              >
                Adicionais
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {adicionais
                  .filter((a) => ["Catupiry", "Cheddar"].includes(a.nome))
                  .map((adicional) => {
                    const qtd =
                      (adicionaisSelecionados[0] || {})[adicional.id] || 0;
                    return (
                      <div
                        key={adicional.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border:
                            qtd > 0 ? "2px solid #e7901e" : "2px solid #f0f0f0",
                          background: qtd > 0 ? "#fff8f0" : "white",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: qtd > 0 ? "bold" : "normal",
                            color: qtd > 0 ? "#e7901e" : "#333",
                          }}
                        >
                          {adicional.nome}{" "}
                          <span style={{ color: "#aaa", fontWeight: "normal" }}>
                            +R${adicional.preco.toFixed(2)}
                          </span>
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {qtd > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  const atual = {
                                    ...(adicionaisSelecionados[0] || {}),
                                  };
                                  if (atual[adicional.id] <= 1)
                                    delete atual[adicional.id];
                                  else atual[adicional.id]--;
                                  setAdicionaisSelecionados({
                                    ...adicionaisSelecionados,
                                    0: atual,
                                  });
                                }}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  border: "2px solid #e0e0e0",
                                  background: "white",
                                  fontSize: "16px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                −
                              </button>
                              <strong
                                style={{
                                  minWidth: "16px",
                                  textAlign: "center",
                                }}
                              >
                                {qtd}
                              </strong>
                            </>
                          )}
                          <button
                            onClick={() => {
                              const atual = {
                                ...(adicionaisSelecionados[0] || {}),
                              };
                              atual[adicional.id] =
                                (atual[adicional.id] || 0) + 1;
                              setAdicionaisSelecionados({
                                ...adicionaisSelecionados,
                                0: atual,
                              });
                            }}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "2px solid #e7901e",
                              background: "#e7901e",
                              color: "white",
                              fontSize: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <button
            style={{ ...estilo.botao, width: "100%", padding: "14px" }}
            onClick={() => {
              const selecionados = adicionaisSelecionados[0] || {};
              const adicionaisDoProduto = adicionais
                .filter((a) => selecionados[a.id] > 0)
                .map((a) => ({ ...a, quantidade: selecionados[a.id] }));

              setNovoPedido((prev) => ({
                ...prev,
                itens: [
                  ...prev.itens,
                  {
                    id_produto: String(produtoRapido.id),
                    quantidade: novoItem.quantidade,
                    observacao: novoItem.observacao,
                    nome_produto: produtoRapido.nome,
                    adicionais: adicionaisDoProduto,
                  },
                ],
              }));
              setProdutoRapido(null);
              setNovoItem({ id_produto: "", quantidade: 1, observacao: "" });
              setAdicionaisSelecionados({});
            }}
          >
            + Adicionar ao Pedido
          </button>
        </div>
      )}

      {/* Modal Lanche Personalizado - FORA do card */}
      {mostrarPersonalizado && mostrarForm && (
        <div
          style={{
            position: "fixed",
            bottom: "0",
            left: "0",
            right: "0",
            background: "white",
            borderTop: "2px solid #f0f0f0",
            padding: "16px",
            zIndex: 998,
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0 }}>🍔 Lanche Personalizado</h3>
            <button
              onClick={() => setMostrarPersonalizado(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#888",
              }}
            >
              ✕
            </button>
          </div>

          {/* Nome e preço */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Nome (opcional)
              </label>
              <input
                style={estilo.input}
                value={nomePersonalizado}
                onChange={(e) => setNomePersonalizado(e.target.value)}
                placeholder="Ex: X-Especial"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Preço (R$)
              </label>
              <input
                style={estilo.input}
                type="number"
                step="0.01"
                value={precoPersonalizado}
                onChange={(e) => setPrecoPersonalizado(e.target.value)}
                placeholder="Ex: 25.00"
              />
            </div>
          </div>

          {/* Ingredientes */}
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
            Ingredientes
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {insumos
              .filter(
                (i) =>
                  ![
                    "Batata Palha",
                    "Presunto",
                    "Mussarela",
                    "Salada",
                    "Bacon (metade)",
                    "Calabresa (metade)",
                    "Frango (metade)",
                  ].includes(i.nome),
              )
              .map((insumo) => {
                const qtd = ingredientesPersonalizado[insumo.id] || 0;
                return (
                  <div
                    key={insumo.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border:
                        qtd > 0 ? "2px solid #e7901e" : "2px solid #f0f0f0",
                      background: qtd > 0 ? "#fff8f0" : "white",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: qtd > 0 ? "bold" : "normal",
                        color: qtd > 0 ? "#e7901e" : "#333",
                      }}
                    >
                      {insumo.nome}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {qtd > 0 && (
                        <>
                          <button
                            onClick={() => {
                              const novo = { ...ingredientesPersonalizado };
                              if (novo[insumo.id] <= 1) delete novo[insumo.id];
                              else novo[insumo.id]--;
                              setIngredientesPersonalizado(novo);
                            }}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "2px solid #e0e0e0",
                              background: "white",
                              fontSize: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            −
                          </button>
                          <strong
                            style={{ minWidth: "16px", textAlign: "center" }}
                          >
                            {qtd}
                          </strong>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIngredientesPersonalizado({
                            ...ingredientesPersonalizado,
                            [insumo.id]:
                              (ingredientesPersonalizado[insumo.id] || 0) + 1,
                          });
                        }}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "2px solid #e7901e",
                          background: "#e7901e",
                          color: "white",
                          fontSize: "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Para pedidos já criados — escolhe qual pedido */}
          {pedidos.length > 0 && (
            <>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Adicionar a pedido existente (Opcional)
              </label>
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
              >
                <select
                  style={{ ...estilo.select, margin: 0 }}
                  id="pedido-personalizado"
                >
                  {pedidos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome_do_cliente}
                    </option>
                  ))}
                </select>
                <button
                  style={estilo.botaoSecundario}
                  onClick={() => {
                    const idPedido = document.getElementById(
                      "pedido-personalizado",
                    ).value;
                    salvarLanchePersonalizado(idPedido);
                  }}
                >
                  Salvar Direto
                </button>
              </div>
            </>
          )}

          {/* Se estiver criando um novo pedido */}
          {novoPedido.nome_do_cliente && (
            <button
              style={{ ...estilo.botao, width: "100%", padding: "14px" }}
              onClick={() => {
                const ingredientesSelecionados = Object.entries(
                  ingredientesPersonalizado,
                )
                  .filter(([, qtd]) => qtd > 0)
                  .map(([id_insumo, quantidade]) => ({
                    id_insumo: parseInt(id_insumo),
                    quantidade,
                  }));

                if (ingredientesSelecionados.length === 0) {
                  setMensagem({
                    tipo: "erro",
                    texto: "Selecione pelo menos um ingrediente",
                  });
                  return;
                }

                setNovoPedido((prev) => ({
                  ...prev,
                  itens: [
                    ...prev.itens,
                    {
                      id_produto: "personalizado",
                      quantidade: 1,
                      observacao: "Lanche personalizado",
                      nome_produto: nomePersonalizado || "Lanche Personalizado",
                      preco_personalizado: parseFloat(precoPersonalizado) || 0,
                      ingredientes_personalizado: ingredientesSelecionados,
                      adicionais: [],
                    },
                  ],
                }));
                setMostrarPersonalizado(false);
                setIngredientesPersonalizado({});
                setNomePersonalizado("");
                setPrecoPersonalizado("");
              }}
            >
              + Adicionar ao Novo Pedido
            </button>
          )}
        </div>
      )}

      {/* Lista de Pedidos */}
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderLeft: `4px solid ${corTempo(pedido.horario)}`,
          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div>
                <strong style={{ fontSize: "16px", color: "#e7901e" }}>
                  {pedido.nome_do_cliente}
                </strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  color: corTempo(pedido.horario),
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                ⏱ {tempoDecorrido(pedido.horario)}
              </span>
              <span style={{ color: "#888", fontSize: "12px" }}>
                {new Date(pedido.horario).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                R$ {Number(pedido.valor_total).toFixed(2)}
              </span>

              {/* BLOCO DE STATUS E BOTÃO CORRIGIDO */}
              {pedido.status === "pronto" ? (
                <>
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓ Pronto
                  </span>
                  <button
                    onClick={() => marcarEmPreparo(pedido.id)}
                    style={{
                      background: "#fff3e0",
                      color: "#e7901e",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Voltar para preparo
                  </button>
                </>
              ) : (
                <button
                  style={{
                    background: "linear-gradient(135deg, #e7901e, #dc2b1c)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  onClick={() => marcarPronto(pedido.id)}
                >
                  ✓ Marcar Pronto
                </button>
              )}

              <button
                style={estilo.botaoSecundario}
                onClick={() => abrirEdicao(pedido)}
              >
                Editar
              </button>
              <button
                style={estilo.botaoCancelar}
                onClick={() => cancelarPedido(pedido.id)}
              >
                Cancelar
              </button>
            </div>
          </div>

          {/* Itens */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {pedido.itens &&
              pedido.itens.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{
                      background: "#e7901e",
                      color: "white",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      minWidth: "28px",
                      textAlign: "center",
                    }}
                  >
                    {item.quantidade}x
                  </span>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.nome_produto}
                  </span>
                  {item.adicionais && (
                    <span
                      style={{
                        color: "#e7901e",
                        fontSize: "12px",
                        fontStyle: "italic",
                      }}
                    >
                      + {item.adicionais}
                    </span>
                  )}
                  {item.observacao && (
                    <span
                      style={{
                        color: "#dc2b1c",
                        fontSize: "13px",
                        fontStyle: "italic",
                      }}
                    >
                      ⚠ {item.observacao}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* MODAL DE EDIÇÃO */}
      {pedidoEditando && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3>Editando — {pedidoEditando.nome_do_cliente}</h3>
              <button
                onClick={() => setPedidoEditando(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ color: "#555" }}>Itens Atuais</h4>
            {itensPedidoEditando.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <span>
                  <strong>{item.nome_produto}</strong> x{item.quantidade}{" "}
                  {item.observacao && `(${item.observacao})`}
                </span>
                <button
                  style={estilo.botaoCancelar}
                  onClick={() => removerItemEdicao(item.item_id)}
                >
                  Remover
                </button>
              </div>
            ))}

            <h4 style={{ marginTop: "20px" }}>Adicionar Item</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              <select
                style={estilo.select}
                value={novoItemEdicao.id_produto}
                onChange={(e) =>
                  setNovoItemEdicao({
                    ...novoItemEdicao,
                    id_produto: e.target.value,
                  })
                }
              >
                <option value="">Selecione...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <input
                style={estilo.input}
                type="number"
                min="1"
                value={novoItemEdicao.quantidade}
                onChange={(e) =>
                  setNovoItemEdicao({
                    ...novoItemEdicao,
                    quantidade: parseInt(e.target.value),
                  })
                }
              />
              <input
                style={estilo.input}
                type="text"
                value={novoItemEdicao.observacao}
                onChange={(e) =>
                  setNovoItemEdicao({
                    ...novoItemEdicao,
                    observacao: e.target.value,
                  })
                }
                placeholder="Obs"
              />
              <button
                style={{ ...estilo.botao, marginBottom: "12px" }}
                onClick={adicionarItemEdicao}
              >
                +
              </button>

              {novoItemEdicao.id_produto && adicionaisEdicao.length > 0 && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "#555",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Adicionais
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    {adicionaisEdicao.map((adicional) => {
                      const selecionado = (
                        novoItemEdicao.adicionais || []
                      ).includes(adicional.id);
                      return (
                        <button
                          key={adicional.id}
                          type="button"
                          onClick={() => {
                            const atual = novoItemEdicao.adicionais || [];
                            const jatem = atual.includes(adicional.id);
                            setNovoItemEdicao({
                              ...novoItemEdicao,
                              adicionais: jatem
                                ? atual.filter((a) => a !== adicional.id)
                                : [...atual, adicional.id],
                            });
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            border: selecionado
                              ? "2px solid #e7901e"
                              : "2px solid #e0e0e0",
                            background: selecionado ? "#fff8f0" : "white",
                            color: selecionado ? "#e7901e" : "#555",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: selecionado ? "bold" : "normal",
                          }}
                        >
                          {adicional.nome} +R${adicional.preco.toFixed(2)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante de Confirmar Pedido */}
      {novoPedido.itens.length > 0 &&
        !produtoRapido &&
        !mostrarPersonalizado && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 999,
              width: "90%",
              maxWidth: "400px",
            }}
          >
            <button
              style={{
                ...estilo.botao,
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                boxShadow: "0 4px 16px rgba(220, 43, 28, 0.4)",
                borderRadius: "12px",
              }}
              onClick={registrarPedido}
            >
              ✓ Confirmar Pedido ({novoPedido.itens.length}{" "}
              {novoPedido.itens.length === 1 ? "item" : "itens"})
            </button>
          </div>
        )}
    </div>
  );
}

export default Pedidos;
