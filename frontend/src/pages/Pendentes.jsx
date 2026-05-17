import { useEffect, useState } from 'react'
import api from '../services/api'

function Pendentes() {
    const [pendentes, setPendentes] = useState([])
    const [pendenteSelecionado, setPendenteSelecionado] = useState(null)
    const [forma, setForma] = useState('pix')
    const [valorPago, setValorPago] = useState('')
    const [totalPago, setTotalPago] = useState(0)
    const [mensagem, setMensagem] = useState(null)

    const carregarPendentes = async () => {
        const res = await api.get('/pendentes')
        setPendentes(res.data)
    }

    useEffect(() => {
        const init = async () => await carregarPendentes()
        init()
    }, [])

    const selecionarPendente = async (pendente) => {
        setPendenteSelecionado(pendente)
        setValorPago('')
        setForma('pix')
        try {
            const res = await api.get(`/pagamentos/pedido/${pendente.id_pedido}`)
            const pago = res.data.reduce((acc, p) => acc + Number(p.valor_total), 0)
            setTotalPago(pago)
        } catch {
            setTotalPago(0)
        }
    }

    const registrarPagamento = async () => {
        try {
            if (!valorPago || parseFloat(valorPago) <= 0) {
                setMensagem({ tipo: 'erro', texto: 'Informe um valor válido' })
                return
            }

            const valorPagoNum = parseFloat(valorPago)
            const saldoRestante = Number(pendenteSelecionado.valor_total) - totalPago

            // troco
            if (forma === 'dinheiro' && valorPagoNum > saldoRestante) {
                const troco = valorPagoNum - saldoRestante
                setMensagem({ tipo: 'troco', texto: `Troco: R$ ${troco.toFixed(2)}` })
            }

            const res = await api.post('/pagamentos', {
                id_pedido: pendenteSelecionado.id_pedido,
                forma,
                valor_pago: valorPagoNum
            })

            if (forma !== 'dinheiro' || valorPagoNum <= saldoRestante) {
                setMensagem({ tipo: 'sucesso', texto: res.data.mensagem })
                setTimeout(() => setMensagem(null), 3000)
            }

            if (res.data.saldo_restante === 0) {
                // marca pendente como resolvido
                await api.put(`/pendentes/${pendenteSelecionado.id}/resolver`)
                setPendenteSelecionado(null)
                setTotalPago(0)
                carregarPendentes()
            } else {
                setTotalPago(prev => prev + valorPagoNum)
                setValorPago('')
            }

        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao registrar pagamento' })
            setTimeout(() => setMensagem(null), 3000)
        }
    }

    const totalPendente = pendentes.reduce((acc, p) => acc + Number(p.valor_total), 0)

    const saldoRestante = pendenteSelecionado
        ? Number(pendenteSelecionado.valor_total) - totalPago
        : 0

    const estilo = {
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '20px'
        },
        botao: {
            background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
            color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 20px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px'
        },
        input: {
            width: '100%', padding: '10px',
            borderRadius: '8px', border: '1px solid #e0e0e0',
            fontSize: '14px', marginBottom: '12px'
        },
        select: {
            width: '100%', padding: '10px',
            borderRadius: '8px', border: '1px solid #e0e0e0',
            fontSize: '14px', marginBottom: '12px', background: 'white'
        }
    }

    return (
        <div>
            <h1 style={{ color: '#1a1a1a', marginBottom: '8px' }}>Pendentes</h1>
            <p style={{ color: '#888', marginBottom: '24px' }}>
                Pedidos que não foram acertados no dia
            </p>

            {mensagem && (
                <div style={{
                    background: mensagem.tipo === 'sucesso' ? '#f0fdf4' :
                                mensagem.tipo === 'troco' ? '#1a1a1a' : '#fee2e2',
                    color: mensagem.tipo === 'sucesso' ? '#16a34a' :
                           mensagem.tipo === 'troco' ? 'white' : '#dc2b1c',
                    padding: mensagem.tipo === 'troco' ? '20px 24px' : '12px 20px',
                    borderRadius: '8px', marginBottom: '20px',
                    fontSize: mensagem.tipo === 'troco' ? '22px' : '14px',
                    fontWeight: mensagem.tipo === 'troco' ? 'bold' : 'normal',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span>{mensagem.tipo === 'troco' ? `💵 ${mensagem.texto}` : mensagem.texto}</span>
                    {mensagem.tipo === 'troco' && (
                        <button onClick={() => setMensagem(null)} style={{
                            background: 'none', border: 'none',
                            color: 'white', cursor: 'pointer', fontSize: '18px'
                        }}>✕</button>
                    )}
                </div>
            )}

            {/* Total pendente */}
            {pendentes.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
                    borderRadius: '12px', padding: '20px 24px',
                    marginBottom: '24px', color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <p style={{ opacity: 0.8, fontSize: '13px', margin: 0 }}>Total em aberto</p>
                        <h2 style={{ margin: 0 }}>R$ {totalPendente.toFixed(2)}</h2>
                    </div>
                    <span style={{ fontSize: '24px' }}>⚠</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Lista de pendentes */}
                <div style={estilo.card}>
                    <h3 style={{ marginBottom: '16px', color: '#dc2b1c' }}>
                        ⚠ Em aberto ({pendentes.length})
                    </h3>
                    {pendentes.length === 0 ? (
                        <p style={{ color: '#aaa' }}>Nenhum pendente em aberto</p>
                    ) : (
                        pendentes.map(p => (
                            <div key={p.id}
                                onClick={() => selecionarPendente(p)}
                                style={{
                                    padding: '14px',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    border: pendenteSelecionado?.id === p.id
                                        ? '2px solid #dc2b1c'
                                        : '2px solid #fee2e2',
                                    background: pendenteSelecionado?.id === p.id
                                        ? '#fff5f5' : 'white'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ color: '#000000' }}>{p.nome_do_cliente}</strong>
                                    <strong style={{ color: '#dc2b1c' }}>
                                        R$ {Number(p.valor_total).toFixed(2)}
                                    </strong>
                                </div>
                                <p style={{ color: '#aaa', fontSize: '12px', margin: '4px 0 0' }}>
                                    {new Date(p.data_registro).toLocaleString('pt-BR')}
                                </p>
                                {p.itens && p.itens.length > 0 && (
    <div style={{ marginTop: '8px' }}>
        {p.itens.map((item, i) => (
            <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 0', fontSize: '13px'
            }}>
                <span style={{
                    background: '#e7901e', color: 'white',
                    borderRadius: '6px', padding: '1px 6px',
                    fontSize: '12px', fontWeight: 'bold'
                }}>
                    {item.quantidade}x
                </span>
                <span>{item.nome_produto}</span>
                {item.adicionais && (
                    <span style={{ color: '#e7901e', fontSize: '11px' }}>
                        + {item.adicionais}
                    </span>
                )}
                {item.observacao && (
                    <span style={{ color: '#dc2b1c', fontSize: '11px', fontWeight: 'bold' }}>
                        ⚠ {item.observacao}
                    </span>
                )}
            </div>
        ))}
    </div>
)}
                            </div>
                        ))
                    )}
                </div>

                {/* Painel de pagamento */}
                {pendenteSelecionado ? (
                    <div style={estilo.card}>
                        <h3 style={{ marginBottom: '16px' }}>
                            {pendenteSelecionado.nome_do_cliente}
                        </h3>

                        {/* Totais */}
                        <div style={{
                            background: '#f9f9f9', borderRadius: '8px',
                            padding: '12px', marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#888' }}>Total</span>
                                <span>R$ {Number(pendenteSelecionado.valor_total).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#888' }}>Já pago</span>
                                <span style={{ color: '#16a34a' }}>R$ {totalPago.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Saldo restante</span>
                                <span style={{ color: '#dc2b1c' }}>R$ {saldoRestante.toFixed(2)}</span>
                            </div>
                        </div>

                        <label style={{ fontSize: '13px', color: '#555' }}>Forma de Pagamento</label>
                        <select style={estilo.select} value={forma} onChange={e => setForma(e.target.value)}>
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao">Cartão</option>
                        </select>

                        <label style={{ fontSize: '13px', color: '#555' }}>Valor Recebido (R$)</label>
                        <input style={estilo.input} type="number" step="0.01"
                            value={valorPago}
                            onChange={e => setValorPago(e.target.value)}
                            placeholder={`Ex: ${saldoRestante.toFixed(2)}`} />

                        <button style={{ ...estilo.botao, width: '100%' }} onClick={registrarPagamento}>
                            ✓ Confirmar Pagamento
                        </button>
                    </div>
                ) : (
                    <div style={{ ...estilo.card, textAlign: 'center', color: '#aaa' }}>
                        Selecione um pendente para registrar o pagamento
                    </div>
                )}
            </div>
        </div>
    )
}

export default Pendentes