import { useEffect, useState } from "react";
import api from "../services/api";

function Card({ titulo, valor, cor }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        flex: 1,
        borderTop: `4px solid ${cor}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ color: "#888", fontSize: "13px", marginBottom: "8px" }}>
        {titulo}
      </p>
      <h2 style={{ color: "#1a1a1a", fontSize: "28px" }}>{valor}</h2>
    </div>
  );
}

function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [insumosCriticos, setInsumosCriticos] = useState([]);
  const [contagemInsumos, setContagemInsumos] = useState([]);
  const [estimativa, setEstimativa] = useState(null)

const carregarDados = async () => {
    const [pedidosRes, criticosRes, contagemRes, estimativaRes] = await Promise.all([
        api.get('/pedidos/ativos-com-itens'),
        api.get('/insumos/criticos'),
        api.get('/relatorios/contagem-insumos'),
        api.get('/relatorios/estimativa-tempo')
    ])
    setPedidos(pedidosRes.data)
    setInsumosCriticos(criticosRes.data)
    setContagemInsumos(contagemRes.data)
    setEstimativa(estimativaRes.data)
};

  useEffect(() => {
    const init = async () => {
      await carregarDados();
    };
    init();

    // atualiza a cada 30 segundos automaticamente
const intervalo = setInterval(carregarDados, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const tempoDecorrido = (horario) => {
    const agora = new Date();
    const hora = new Date(horario);
    const diff = Math.floor((agora - hora) / 1000 / 60);
    if (diff < 1) return "agora";
    if (diff === 1) return "1 min";
    return `${diff} min`;
  };

  const marcarPronto = async (id) => {
    await api.put(`/pedidos/${id}/pronto`);
    await carregarDados();
  };

  const marcarEmPreparo = async (id) => {
    await api.put(`/pedidos/${id}/em-preparo`);
    await carregarDados();
  };

const corTempo = (horario) => {
    const agora = new Date()
    const hora = new Date(horario)
    const diff = Math.floor((agora - hora) / 1000 / 60)
    if (diff < 40) return '#16a34a'
    if (diff < 60) return '#e7901e'
    return '#dc2b1c'
};

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h1 style={{ color: "#1a1a1a" }}>Dashboard</h1>
        <button
          onClick={carregarDados}
          style={{
            background: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "6px 14px",
            cursor: "pointer",
            color: "#888",
            fontSize: "13px",
          }}
        >
          🔄 Atualizar
        </button>
      </div>
      <p style={{ color: "#888", marginBottom: "30px" }}>
        Visão geral da operação
      </p>
      {estimativa && (estimativa.total_lanches > 0 || estimativa.total_porcoes > 0) && (
    <div style={{
        background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(231, 144, 30, 0.3)'
    }}>
        <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '4px' }}>
                ⏱ Estimativa de tempo para finalizar todos os pedidos
            </p>
            <h2 style={{ color: 'white', fontSize: '32px', margin: 0 }}>
                {estimativa.estimativa_minutos} minutos
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>
                {estimativa.total_lanches > 0 && `${estimativa.total_lanches} ${estimativa.total_lanches === 1 ? 'lanche' : 'lanches'} × 3min`}
                {estimativa.total_lanches > 0 && estimativa.total_porcoes > 0 && ' + '}
                {estimativa.total_porcoes > 0 && `${estimativa.total_porcoes} ${estimativa.total_porcoes === 1 ? 'porção' : 'porções'} × 5min`}
                {estimativa.total_lanches <= 2 && estimativa.total_porcoes === 0 && ' — tempo mínimo fixo'}
            </p>
        </div>
        <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
        }}>
            🍔
        </div>
    </div>
)}

      {/* Cards de resumo */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <Card titulo="Pedidos Ativos" valor={pedidos.length} cor="#e7901e" />
        <Card
          titulo="Estoque Crítico"
          valor={insumosCriticos.length}
          cor="#dc2b1c"
        />
      </div>

      {contagemInsumos.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ marginBottom: "16px", color: "#1a1a1a" }}>
            🍳 Insumos necessários para os pedidos ativos
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {contagemInsumos.map((item) => (
              <div
                key={item.nome_insumo}
                style={{
                  background: "#fff8f0",
                  border: "2px solid #e7901e",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <h2 style={{ color: "#e7901e", margin: 0 }}>
                  {item.total_necessario}
                </h2>
                <p
                  style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}
                >
                  {item.nome_insumo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos com itens */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "16px", color: "#1a1a1a" }}>
          Fila de Pedidos — mais antigos no topo
        </h3>

{pedidos.length === 0 ? (
    <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#aaa',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
        Nenhum pedido ativo no momento
    </div>
) : (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
    }}>
        {pedidos.map((pedido, index) => (
            <div key={pedido.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${pedido.status === 'pronto' ? '#16a34a' : corTempo(pedido.horario)}`
            }}>
                {/* Cabeçalho do pedido */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            background: '#1a1a1a',
                            color: 'white',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            {index + 1}
                        </span>
                        <div>
                            <strong style={{ fontSize: '15px' }}>Mesa {pedido.numero_mesa}</strong>
                            {pedido.nome_do_cliente && (
                                <span style={{ color: '#888', fontSize: '12px', marginLeft: '6px' }}>
                                    {pedido.nome_do_cliente}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {pedido.status === 'pronto' ? (
                            <>
                                <span style={{
                                    background: '#f0fdf4', color: '#16a34a',
                                    padding: '4px 10px', borderRadius: '20px',
                                    fontSize: '11px', fontWeight: 'bold'
                                }}>
                                    ✓ Pronto
                                </span>
                                <button onClick={() => marcarEmPreparo(pedido.id)} style={{
                                    background: '#fff3e0', color: '#e7901e',
                                    border: 'none', borderRadius: '8px',
                                    padding: '4px 10px', cursor: 'pointer', fontSize: '11px'
                                }}>
                                    Voltar
                                </button>
                            </>
                        ) : (
                            <>
                                <span style={{
                                    color: corTempo(pedido.horario),
                                    fontSize: '12px', fontWeight: 'bold'
                                }}>
                                    ⏱ {tempoDecorrido(pedido.horario)}
                                </span>
                                <span style={{ color: '#888', fontSize: '11px' }}>
                                    {new Date(pedido.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button onClick={() => marcarPronto(pedido.id)} style={{
                                    background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '4px 10px', cursor: 'pointer',
                                    fontSize: '11px', fontWeight: 'bold'
                                }}>
                                    ✓ Pronto
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Itens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {pedido.itens.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 10px', background: '#f9f9f9', borderRadius: '8px'
                        }}>
                            <span style={{
                                background: '#e7901e', color: 'white',
                                borderRadius: '6px', padding: '2px 7px',
                                fontSize: '12px', fontWeight: 'bold',
                                minWidth: '26px', textAlign: 'center', flexShrink: 0
                            }}>
                                {item.quantidade}x
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                {item.nome_produto}
                            </span>
                            {item.adicionais && (
                                <span style={{ color: '#e7901e', fontSize: '11px', fontStyle: 'italic' }}>
                                    + {item.adicionais}
                                </span>
                            )}
                            {item.observacao && (
                                <span style={{ color: '#dc2b1c', fontSize: '11px', fontStyle: 'italic' }}>
                                    ⚠ {item.observacao}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
)}
      </div>

      {/* Estoque crítico */}
      {insumosCriticos.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ marginBottom: "16px", color: "#dc2b1c" }}>
            ⚠ Estoque Crítico
          </h3>
          {insumosCriticos.map((insumo) => (
            <div
              key={insumo.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <strong style={{ color: "#1a1a1a" }}>{insumo.nome}</strong>
              <p style={{ color: "#dc2b1c", fontSize: "13px" }}>
                {insumo.quantidade} restantes (mín: {insumo.quantidade_critica})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
