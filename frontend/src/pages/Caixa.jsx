import { useEffect, useState } from "react";
import api from "../services/api";

function Caixa() {
  const [caixa, setCaixa] = useState(null);
  const [valorAbertura, setValorAbertura] = useState("");
  const [totais, setTotais] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  const carregarCaixa = async () => {
    try {
      const res = await api.get("/caixa/aberto");
      setCaixa(res.data);
      const totaisRes = await api.get("/caixa/totais");
      setTotais(totaisRes.data);
    } catch {
      setCaixa(null);
    }
  };

 useEffect(() => {
    const init = async () => {
      await carregarCaixa();
    };
    init();
  }, []);
  const abrirCaixa = async () => {
    try {
      if (!valorAbertura) {
        setMensagem({ tipo: "erro", texto: "Informe o valor inicial" });
        return;
      }
      await api.post("/caixa/abrir", {
        valor: parseFloat(valorAbertura),
      });
      setMensagem({ tipo: "sucesso", texto: "Caixa aberto com sucesso!" });
      carregarCaixa();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao abrir caixa",
      });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const fecharCaixa = async () => {
    if (!window.confirm("Deseja fechar o caixa?")) return;
    try {
      const res = await api.put("/caixa/fechar");
      setMensagem({ tipo: "sucesso", texto: "Caixa fechado com sucesso!" });
      setCaixa(null);
      setTotais(res.data.totais);
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error.response?.data?.erro || "Erro ao fechar caixa",
      });
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
    botaoFechar: {
      background: "#fee2e2",
      color: "#dc2b1c",
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

  const formaLabel = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
  };

  return (
    <div>
      <h1 style={{ color: "#1a1a1a", marginBottom: "8px" }}>Caixa</h1>
      <p style={{ color: "#888", marginBottom: "30px" }}>
        Abertura e fechamento do caixa
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

      {/* Status do caixa */}
      <div style={estilo.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ marginBottom: "8px" }}>Status do Caixa</h3>
            {caixa ? (
              <>
                <span
                  style={{
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  ● Aberto
                </span>
                <p
                  style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}
                >
                  Aberto em:{" "}
                  {new Date(caixa.horario_abertura).toLocaleString("pt-BR")}
                </p>
                <p style={{ color: "#888", fontSize: "13px" }}>
                  Valor inicial: R$ {Number(caixa.valor).toFixed(2)}
                </p>
              </>
            ) : (
              <span
                style={{
                  background: "#fee2e2",
                  color: "#dc2b1c",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                }}
              >
                ● Fechado
              </span>
            )}
          </div>
          {caixa && (
            <button style={estilo.botaoFechar} onClick={fecharCaixa}>
              Fechar Caixa
            </button>
          )}
        </div>
      </div>

      {/* Total */}
      {totais.length > 0 && (
    <div style={estilo.card}>
        <h3 style={{ marginBottom: '16px' }}>Totais por Forma de Pagamento</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {totais.map(item => (
                <div key={item.forma} style={{
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    textAlign: 'center',
                    flex: 1,
                    borderTop: '3px solid #e7901e'
                }}>
                    <p style={{ color: '#888', fontSize: '13px' }}>{formaLabel[item.forma] || item.forma}</p>
                    <h3 style={{ color: '#1a1a1a' }}>R$ {Number(item.total).toFixed(2)}</h3>
                </div>
            ))}
        </div>

        {/* Total geral */}
        <div style={{
            marginTop: '16px',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                Total Geral
            </span>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '22px' }}>
                R$ {totais.reduce((acc, item) => acc + Number(item.total), 0).toFixed(2)}
            </span>
        </div>
    </div>
)}

      {/* Abrir caixa */}
      {!caixa && (
        <div style={estilo.card}>
          <h3 style={{ marginBottom: "20px" }}>Abrir Caixa</h3>
          {/* DEPOIS: Sem o grid e apenas o campo de valor */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", color: "#555" }}>
              Valor inicial em caixa (R$)
            </label>
            <input
              style={estilo.input}
              type="number"
              step="0.01"
              value={valorAbertura}
              onChange={(e) => setValorAbertura(e.target.value)}
              placeholder="Ex: 100.00"
            />
          </div>
          <button style={estilo.botao} onClick={abrirCaixa}>
            Abrir Caixa
          </button>
        </div>
      )}
    </div>
  );
}

export default Caixa;
