import { useEffect, useState } from "react";
import api from "../services/api";

function Estoque() {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [aba, setAba] = useState("insumos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [novoInsumo, setNovoInsumo] = useState({
    nome: "",
    id_categoria: "",
    quantidade: "",
    custo_unitario: "",
    quantidade_critica: "",
    unidade: "unidade",
  });
  const [movimentacao, setMovimentacao] = useState({
    id_fornecedor: "",
    numero_nf: "",
    itens: [],
  });
  const [novoItemMov, setNovoItemMov] = useState({
    id_insumo: "",
    quantidade: "",
    valor_do_custo: "",
    lote: "",
    tipo_de_movimento: "entrada",
    motivo: "Compra",
  });

  const carregarInsumos = async () => {
    const res = await api.get("/insumos");
    setInsumos(res.data);
  };
  useEffect(() => {
    const init = async () => {
      await carregarInsumos();
      const [catRes, forRes] = await Promise.all([
        api.get("/categorias-insumo"),
        api.get("/fornecedores"),
      ]);
      setCategorias(catRes.data);
      setFornecedores(forRes.data);
    };
    init();
  }, []);

  const criarInsumo = async () => {
    try {
      await api.post("/insumos", novoInsumo);
      setMensagem({ tipo: "sucesso", texto: "Insumo criado com sucesso!" });
      setMostrarForm(false);
      setNovoInsumo({
        nome: "",
        id_categoria: "",
        quantidade: "",
        custo_unitario: "",
        quantidade_critica: "",
        unidade: "unidade",
      });
      carregarInsumos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao criar insumo",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const adicionarItemMovimentacao = () => {
    if (!novoItemMov.id_insumo || !novoItemMov.quantidade) return;
    const insumo = insumos.find(
      (i) => i.id === parseInt(novoItemMov.id_insumo),
    );
    setMovimentacao((prev) => ({
      ...prev,
      itens: [...prev.itens, { ...novoItemMov, nome_insumo: insumo.nome }],
    }));
    setNovoItemMov({
      id_insumo: "",
      quantidade: "",
      valor_do_custo: "",
      lote: "",
      tipo_de_movimento: "entrada",
      motivo: "Compra",
    });
  };

  const salvarMovimentacao = async () => {
    try {
      if (movimentacao.itens.length === 0) {
        setMensagem({ tipo: "erro", texto: "Adicione pelo menos um insumo" });
        return;
      }
      await api.post("/movimentacoes-estoque", movimentacao);
      setMensagem({
        tipo: "sucesso",
        texto: "Movimentação registrada com sucesso!",
      });
      setMovimentacao({ id_fornecedor: "", numero_nf: "", itens: [] });
      carregarInsumos();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao registrar movimentação",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };
  const deletarInsumo = async (id) => {
    if (
      !window.confirm(
        "Deseja deletar este insumo? Esta ação não será registrada no relatório.",
      )
    )
      return;
    try {
      await api.delete(`/insumos/${id}`);
      setMensagem({ tipo: "sucesso", texto: "Insumo deletado com sucesso!" });
      carregarInsumos();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao deletar insumo" });
    }
    setTimeout(() => setMensagem(null), 3000);
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
    aba: (ativo) => ({
      padding: "10px 20px",
      border: "none",
      borderBottom: ativo ? "2px solid #e7901e" : "2px solid transparent",
      background: "none",
      cursor: "pointer",
      color: ativo ? "#e7901e" : "#888",
      fontWeight: ativo ? "bold" : "normal",
      fontSize: "14px",
    }),
  };

  return (
    <div>
      <h1 style={{ color: "#1a1a1a", marginBottom: "8px" }}>Estoque</h1>
      <p style={{ color: "#888", marginBottom: "20px" }}>
        Gerencie insumos e movimentações
      </p>

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

      {/* Abas */}
      <div style={{ borderBottom: "1px solid #f0f0f0", marginBottom: "20px" }}>
        <button
          style={estilo.aba(aba === "insumos")}
          onClick={() => setAba("insumos")}
        >
          Insumos
        </button>
        <button
          style={estilo.aba(aba === "movimentacao")}
          onClick={() => setAba("movimentacao")}
        >
          Lançar Movimentação
        </button>
      </div>

      {/* Aba Insumos */}
      {aba === "insumos" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "16px",
            }}
          >
            <button
              style={estilo.botao}
              onClick={() => setMostrarForm(!mostrarForm)}
            >
              {mostrarForm ? "✕ Fechar" : "+ Novo Insumo"}
            </button>
          </div>

          {mostrarForm && (
            <div style={estilo.card}>
              <h3 style={{ marginBottom: "16px" }}>Novo Insumo</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Nome
                  </label>
                  <input
                    style={estilo.input}
                    value={novoInsumo.nome}
                    onChange={(e) =>
                      setNovoInsumo({ ...novoInsumo, nome: e.target.value })
                    }
                    placeholder="Ex: Pão de Hambúrguer"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Categoria
                  </label>
                  <select
                    style={estilo.select}
                    value={novoInsumo.id_categoria}
                    onChange={(e) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        id_categoria: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Quantidade inicial
                  </label>
                  <input
                    style={estilo.input}
                    type="number"
                    value={novoInsumo.quantidade}
                    onChange={(e) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        quantidade: e.target.value,
                      })
                    }
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Unidade de Medida
                  </label>
                  <select
                    style={estilo.select}
                    value={novoInsumo.unidade}
                    onChange={(e) =>
                      setNovoInsumo({ ...novoInsumo, unidade: e.target.value })
                    }
                  >
                    <option value="unidade">Unidade</option>
                    <option value="fatia">Fatia</option>
                    <option value="barra">Barra</option>
                    <option value="pacote">Pacote</option>
                    <option value="kg">Kg</option>
                    <option value="g">Gramas</option>
                    <option value="ml">ml</option>
                    <option value="l">Litro</option>
                    <option value="caixa">Caixa</option>
                    <option value="duzia">Dúzia</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Custo unitário (R$)
                  </label>
                  <input
                    style={estilo.input}
                    type="number"
                    step="0.01"
                    value={novoInsumo.custo_unitario}
                    onChange={(e) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        custo_unitario: e.target.value,
                      })
                    }
                    placeholder="Ex: 0.75"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#555" }}>
                    Quantidade crítica
                  </label>
                  <input
                    style={estilo.input}
                    type="number"
                    value={novoInsumo.quantidade_critica}
                    onChange={(e) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        quantidade_critica: e.target.value,
                      })
                    }
                    placeholder="Ex: 20"
                  />
                </div>
              </div>
              <button style={estilo.botao} onClick={criarInsumo}>
                Salvar Insumo
              </button>
            </div>
          )}

          <div style={estilo.card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Nome
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Categoria
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Quantidade
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Unidade
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Custo Unit.
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Crítico
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((insumo) => {
                  const critico =
                    insumo.quantidade_critica &&
                    insumo.quantidade <= insumo.quantidade_critica;
                  return (
                    <tr
                      key={insumo.id}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <td style={{ padding: "12px 10px" }}>
                        <strong>{insumo.nome}</strong>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#888" }}>
                        {insumo.nome_categoria}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        {insumo.quantidade}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          textAlign: "right",
                          color: "#888",
                        }}
                      >
                        {insumo.unidade}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        R$ {Number(insumo.custo_unitario).toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          textAlign: "right",
                          color: "#888",
                        }}
                      >
                        {insumo.quantidade_critica || "-"}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        {critico ? (
                          <span
                            style={{
                              background: "#fee2e2",
                              color: "#dc2b1c",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                            }}
                          >
                            ⚠ Crítico
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#f0fdf4",
                              color: "#16a34a",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                            }}
                          >
                            OK
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <button
                          style={{
                            background: "#fee2e2",
                            color: "#dc2b1c",
                            border: "none",
                            borderRadius: "8px",
                            padding: "4px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          onClick={() => deletarInsumo(insumo.id)}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Aba Movimentação */}
      {aba === "movimentacao" && (
        <div style={estilo.card}>
          <h3 style={{ marginBottom: "20px" }}>
            Lançar Movimentação de Estoque
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Fornecedor (opcional)
              </label>
              <select
                style={estilo.select}
                value={movimentacao.id_fornecedor}
                onChange={(e) =>
                  setMovimentacao({
                    ...movimentacao,
                    id_fornecedor: e.target.value,
                  })
                }
              >
                <option value="">Selecione...</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Número da NF (opcional)
              </label>
              <input
                style={estilo.input}
                value={movimentacao.numero_nf}
                onChange={(e) =>
                  setMovimentacao({
                    ...movimentacao,
                    numero_nf: e.target.value,
                  })
                }
                placeholder="Ex: NF-001"
              />
            </div>
          </div>

          <h4 style={{ marginBottom: "12px", color: "#555" }}>
            Adicionar Insumos
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>Insumo</label>
              <select
                style={estilo.select}
                value={novoItemMov.id_insumo}
                onChange={(e) =>
                  setNovoItemMov({ ...novoItemMov, id_insumo: e.target.value })
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
              <label style={{ fontSize: "13px", color: "#555" }}>Tipo</label>
              <select
                style={estilo.select}
                value={novoItemMov.tipo_de_movimento}
                onChange={(e) =>
                  setNovoItemMov({
                    ...novoItemMov,
                    tipo_de_movimento: e.target.value,
                  })
                }
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>Motivo</label>
              <input
                style={estilo.input}
                value={novoItemMov.motivo}
                onChange={(e) =>
                  setNovoItemMov({ ...novoItemMov, motivo: e.target.value })
                }
                placeholder="Ex: Compra"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Quantidade
              </label>
              <input
                style={estilo.input}
                type="number"
                value={novoItemMov.quantidade}
                onChange={(e) =>
                  setNovoItemMov({ ...novoItemMov, quantidade: e.target.value })
                }
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#555" }}>
                Custo Unit.
              </label>
              <input
                style={estilo.input}
                type="number"
                step="0.01"
                value={novoItemMov.valor_do_custo}
                onChange={(e) =>
                  setNovoItemMov({
                    ...novoItemMov,
                    valor_do_custo: e.target.value,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <button
              style={{ ...estilo.botao, marginBottom: "12px" }}
              onClick={adicionarItemMovimentacao}
            >
              +
            </button>
          </div>

          {movimentacao.itens.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              {movimentacao.itens.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    <strong>{item.nome_insumo}</strong> —{" "}
                    {item.tipo_de_movimento} — {item.motivo}
                  </span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
              <button style={estilo.botao} onClick={salvarMovimentacao}>
                ✓ Salvar Movimentação
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Estoque;
