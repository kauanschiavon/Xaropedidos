import { useEffect, useState } from "react";
import api from "../services/api";

function Pagamento() {
  const [pedidos, setPedidos] = useState([]);
  const [caixa, setCaixa] = useState(null);

  // Estados para pedido pendente (em pagamento)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [forma, setForma] = useState("pix");
  const [valorPago, setValorPago] = useState("");
  const [totalPago, setTotalPago] = useState(0);

  // Estados para visualizar pedido pago
  const [pedidoVisualizando, setPedidoVisualizando] = useState(null);
  const [itensVisualizando, setItensVisualizando] = useState([]);

  const [mensagem, setMensagem] = useState(null);

  const carregarDados = async () => {
    try {
      const caixaRes = await api.get("/caixa/aberto");
      setCaixa(caixaRes.data);
      const pedidosRes = await api.get(`/pedidos/caixa/${caixaRes.data.id}`);
      setPedidos(pedidosRes.data);
    } catch {
      setCaixa(null);
      setPedidos([]);
    }
  };

  useEffect(() => {
    const init = async () => await carregarDados();
    init();
  }, []);

  const selecionarPedido = async (pedido) => {
    if (pedido.status === "finalizado") return;

    setPedidoSelecionado(pedido);
    setPedidoVisualizando(null); // Esconde o painel de visualização se houver
    setValorPago("");
    setForma("pix");

    try {
      const res = await api.get(`/pedidos/${pedido.id}`);
      setItensPedido(res.data);
      const pagRes = await api.get(`/pagamentos/pedido/${pedido.id}`);
      const pago = pagRes.data.reduce(
        (acc, p) => acc + Number(p.valor_total),
        0,
      );
      setTotalPago(pago);
    } catch {
      setItensPedido([]);
      setTotalPago(0);
    }
  };

  // Nova função adicionada: Selecionar e carregar itens de um pedido já pago
  const selecionarPedidoPago = async (pedido) => {
    setPedidoVisualizando(pedido);
    setPedidoSelecionado(null); // Esconde o painel de pagamento
    try {
      const res = await api.get(`/pedidos/${pedido.id}`);
      setItensVisualizando(res.data);
    } catch {
      setItensVisualizando([]);
    }
  };

const registrarPagamento = async () => {
    try {
        if (!valorPago || parseFloat(valorPago) <= 0) {
            setMensagem({ tipo: 'erro', texto: 'Informe um valor válido' });
            setTimeout(() => setMensagem(null), 3000); // Remove o erro após 3s
            return;
        }

        const valorPagoNum = parseFloat(valorPago);

        // calcula troco antes de enviar
        if (forma === 'dinheiro' && valorPagoNum > saldoRestante) {
            const troco = valorPagoNum - saldoRestante;
            setMensagem({ tipo: 'troco', texto: `Troco: R$ ${troco.toFixed(2)}` });
        }

        const res = await api.post('/pagamentos', {
            id_pedido: pedidoSelecionado.id,
            forma,
            valor_pago: valorPagoNum
        });

        // Só mostra sucesso e limpa a mensagem se NÃO tiver troco
        if (forma !== 'dinheiro' || valorPagoNum <= saldoRestante) {
            setMensagem({ tipo: 'sucesso', texto: res.data.mensagem });
            setTimeout(() => setMensagem(null), 3000);
        }

        await carregarDados();

        if (res.data.saldo_restante === 0) {
            setPedidoSelecionado(null);
            setItensPedido([]);
            setTotalPago(0);
        } else {
            setTotalPago(prev => prev + valorPagoNum);
            setValorPago('');
        }
    } catch (error) {
        setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao registrar pagamento' });
        setTimeout(() => setMensagem(null), 3000); // Remove o erro após 3s
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

  const saldoRestante = pedidoSelecionado
    ? Number(pedidoSelecionado.valor_total) - totalPago
    : 0;

  // FILTRO ATUALIZADO AQUI
  const pedidosPendentes = pedidos.filter(p => p.status === 'em_preparo' || p.status === 'pronto');
  const pedidosPagos = pedidos.filter((p) => p.status === "finalizado");

  return (
    <div>
      <h1 style={{ color: "#1a1a1a", marginBottom: "8px" }}>Pagamento</h1>
      <p style={{ color: "#888", marginBottom: "30px" }}>
        Selecione um pedido pendente para registrar o pagamento ou um pedido
        pago para visualizar.
      </p>

      {!caixa && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2b1c",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          Nenhum caixa aberto. Abra o caixa antes de registrar pagamentos.
        </div>
      )}

{mensagem && (
    <div style={{
        background: mensagem.tipo === 'sucesso' ? '#f0fdf4' : 
                    mensagem.tipo === 'troco' ? '#1a1a1a' : '#fee2e2',
        color: mensagem.tipo === 'sucesso' ? '#16a34a' : 
               mensagem.tipo === 'troco' ? 'white' : '#dc2b1c',
        padding: mensagem.tipo === 'troco' ? '20px 24px' : '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: mensagem.tipo === 'troco' ? '22px' : '14px',
        fontWeight: mensagem.tipo === 'troco' ? 'bold' : 'normal',
        textAlign: mensagem.tipo === 'troco' ? 'center' : 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <span>{mensagem.tipo === 'troco' ? `💵 ${mensagem.texto}` : mensagem.texto}</span>
        <button onClick={() => setMensagem(null)} style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px',
            opacity: 0.7
        }}>✕</button>
    </div>
)}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* COLUNA ESQUERDA: Lista de pedidos */}
        <div>
          {/* Pendentes */}
          <div style={estilo.card}>
            <h3 style={{ marginBottom: "16px", color: "#dc2b1c" }}>
              🔴 Pendentes ({pedidosPendentes.length})
            </h3>
            {pedidosPendentes.length === 0 ? (
              <p style={{ color: "#aaa" }}>Nenhum pedido pendente</p>
            ) : (
              pedidosPendentes.map((pedido) => (
                <div
                  key={pedido.id}
                  onClick={() => selecionarPedido(pedido)}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    border:
                      pedidoSelecionado?.id === pedido.id
                        ? "2px solid #dc2b1c"
                        : "2px solid #fee2e2",
                    background:
                      pedidoSelecionado?.id === pedido.id ? "#fff5f5" : "white",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Mesa {pedido.numero_mesa}</strong>
                    <strong style={{ color: "#dc2b1c" }}>
                      R$ {Number(pedido.valor_total).toFixed(2)}
                    </strong>
                  </div>
                  {pedido.nome_do_cliente && (
                    <p style={{ color: "#888", fontSize: "13px" }}>
                      {pedido.nome_do_cliente}
                    </p>
                  )}
                  
                  {/* TEXTO DE STATUS ATUALIZADO AQUI */}
                  <p style={{ 
                      color: pedido.status === 'pronto' ? '#16a34a' : '#e7901e',
                      fontSize: '12px', marginTop: '4px', fontWeight: 'bold'
                  }}>
                      {pedido.status === 'pronto' ? '✓ Pronto para pagar' : '⏳ Em preparo'}
                  </p>

                  <p
                    style={{
                      color: "#aaa",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(pedido.horario).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagos */}
          {pedidosPagos.length > 0 && (
            <h3 style={{ marginBottom: "16px", color: "#16a34a" }}>
              🟢 Pagos ({pedidosPagos.length})
            </h3>
          )}
          {pedidosPagos.map((pedido) => (
            <div
              key={pedido.id}
              onClick={() => selecionarPedidoPago(pedido)}
              style={{
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "10px",
                cursor: "pointer",
                border:
                  pedidoVisualizando?.id === pedido.id
                    ? "2px solid #16a34a"
                    : "2px solid #dcfce7",
                background:
                  pedidoVisualizando?.id === pedido.id ? "#e8fdf0" : "#f0fdf4",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Mesa {pedido.numero_mesa}</strong>
                <strong style={{ color: "#16a34a" }}>
                  R$ {Number(pedido.valor_total).toFixed(2)}
                </strong>
              </div>
              {pedido.nome_do_cliente && (
                <p style={{ color: "#888", fontSize: "13px" }}>
                  {pedido.nome_do_cliente}
                </p>
              )}
              <p style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>
                {new Date(pedido.horario).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>

        {/* COLUNA DIREITA: Painéis Dinâmicos */}
        <div>
          {/* Painel de Pagamento (Pedido Pendente) */}
          {pedidoSelecionado && (
            <div style={estilo.card}>
              <h3 style={{ marginBottom: "16px" }}>
                Mesa {pedidoSelecionado.numero_mesa}
                {pedidoSelecionado.nome_do_cliente && (
                  <span
                    style={{
                      color: "#888",
                      fontSize: "14px",
                      marginLeft: "8px",
                    }}
                  >
                    {pedidoSelecionado.nome_do_cliente}
                  </span>
                )}
              </h3>

              {/* Itens do pedido */}
              <div style={{ marginBottom: "16px" }}>
                {itensPedido.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        <strong>{item.nome_produto}</strong> x{item.quantidade}
                      </span>
                      <span>
                        R${" "}
                        {(
                          Number(item.valor_unitario) * item.quantidade
                        ).toFixed(2)}
                      </span>
                    </div>
                    {item.adicionais && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "4px",
                        }}
                      >
                        <span style={{ color: "#e7901e", fontSize: "12px" }}>
                          + {item.adicionais}
                        </span>
                        <span style={{ color: "#e7901e", fontSize: "12px" }}>
                          R$ {Number(item.total_adicionais).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {item.observacao && (
                      <p
                        style={{
                          color: "#dc2b1c",
                          fontSize: "12px",
                          marginTop: "2px",
                        }}
                      >
                        ⚠ {item.observacao}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ color: "#888" }}>Total</span>
                  <span>
                    R$ {Number(pedidoSelecionado.valor_total).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ color: "#888" }}>Já pago</span>
                  <span style={{ color: "#16a34a" }}>
                    R$ {totalPago.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                  }}
                >
                  <span>Saldo restante</span>
                  <span style={{ color: "#dc2b1c" }}>
                    R$ {saldoRestante.toFixed(2)}
                  </span>
                </div>
              </div>

              <label style={{ fontSize: "13px", color: "#555" }}>
                Forma de Pagamento
              </label>
              <select
                style={estilo.select}
                value={forma}
                onChange={(e) => setForma(e.target.value)}
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
              </select>

              <label style={{ fontSize: "13px", color: "#555" }}>
                Valor Recebido (R$)
              </label>
              <input
                style={estilo.input}
                type="number"
                step="0.01"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder={`Ex: ${saldoRestante.toFixed(2)}`}
              />

              <button
                style={{ ...estilo.botao, width: "100%" }}
                onClick={registrarPagamento}
              >
                ✓ Confirmar Pagamento
              </button>
            </div>
          )}

          {/* Painel de Visualização (Pedido Pago) */}
          {pedidoVisualizando && !pedidoSelecionado && (
            <div style={estilo.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3>
                  Mesa {pedidoVisualizando.numero_mesa}
                  {pedidoVisualizando.nome_do_cliente && (
                    <span
                      style={{
                        color: "#888",
                        fontSize: "14px",
                        marginLeft: "8px",
                      }}
                    >
                      {pedidoVisualizando.nome_do_cliente}
                    </span>
                  )}
                </h3>
                <span
                  style={{
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                  }}
                >
                  ✓ Pago
                </span>
              </div>

              {itensVisualizando.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      <strong>{item.nome_produto}</strong> x{item.quantidade}
                    </span>
                    <span>
                      R${" "}
                      {(Number(item.valor_unitario) * item.quantidade).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                  {item.adicionais && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "4px",
                      }}
                    >
                      <span style={{ color: "#e7901e", fontSize: "12px" }}>
                        + {item.adicionais}
                      </span>
                      <span style={{ color: "#e7901e", fontSize: "12px" }}>
                        R$ {Number(item.total_adicionais).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {item.observacao && (
                    <p
                      style={{
                        color: "#dc2b1c",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      ⚠ {item.observacao}
                    </p>
                  )}
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "2px solid #f0f0f0",
                }}
              >
                <span>Total</span>
                <span style={{ color: "#16a34a" }}>
                  R$ {Number(pedidoVisualizando.valor_total).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Placeholder se nada estiver selecionado */}
          {!pedidoSelecionado && !pedidoVisualizando && (
            <div style={{ ...estilo.card, textAlign: "center", color: "#aaa" }}>
              Selecione um pedido ao lado para iniciar o pagamento ou visualizar
              os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pagamento;