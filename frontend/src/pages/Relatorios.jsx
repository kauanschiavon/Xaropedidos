import { useState } from 'react'
import api from '../services/api'

function Relatorios() {
    const [dataInicial, setDataInicial] = useState('')
    const [dataFinal, setDataFinal] = useState('')
    const [relatorio, setRelatorio] = useState(null)
    const [insumosCriticos, setInsumosCriticos] = useState([])
    const [movimentacoes, setMovimentacoes] = useState([])
    const [aba, setAba] = useState('vendas')
    const [mensagem, setMensagem] = useState(null)

    const gerarRelatorioVendas = async () => {
        try {
            if (!dataInicial || !dataFinal) {
                setMensagem({ tipo: 'erro', texto: 'Informe o período' })
                return
            }
            const res = await api.get(`/relatorios/vendas?dataInicial=${dataInicial}&dataFinal=${dataFinal}`)
            setRelatorio(res.data)
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao gerar relatório' })
        }
        setTimeout(() => setMensagem(null), 3000)
    }

    const carregarEstoque = async () => {
        try {
            const [criticosRes, movRes] = await Promise.all([
                api.get('/insumos/criticos'),
                api.get('/movimentacoes-estoque')
            ])
            setInsumosCriticos(criticosRes.data)
            setMovimentacoes(movRes.data)
        } catch {
            setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados de estoque' })
        }
    }

    const trocarAba = (novaAba) => {
        setAba(novaAba)
        if (novaAba === 'estoque') carregarEstoque()
    }

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
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            marginBottom: '12px'
        },
        aba: (ativo) => ({
            padding: '10px 20px',
            border: 'none',
            borderBottom: ativo ? '2px solid #e7901e' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            color: ativo ? '#e7901e' : '#888',
            fontWeight: ativo ? 'bold' : 'normal',
            fontSize: '14px'
        })
    }

    const formaLabel = {
        pix: 'PIX',
        dinheiro: 'Dinheiro',
        cartao_credito: 'Cartão de Crédito',
        cartao_debito: 'Cartão de Débito'
    }

    return (
        <div>
            <h1 style={{ color: '#1a1a1a', marginBottom: '8px' }}>Relatórios</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>Análise de vendas e estoque</p>

            {mensagem && (
                <div style={{
                    background: mensagem.tipo === 'sucesso' ? '#f0fdf4' : '#fee2e2',
                    color: mensagem.tipo === 'sucesso' ? '#16a34a' : '#dc2b1c',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {mensagem.texto}
                </div>
            )}

            {/* Abas */}
            <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: '20px' }}>
                <button style={estilo.aba(aba === 'vendas')} onClick={() => trocarAba('vendas')}>Vendas</button>
                <button style={estilo.aba(aba === 'estoque')} onClick={() => trocarAba('estoque')}>Estoque</button>
            </div>

            {/* Aba Vendas */}
            {aba === 'vendas' && (
                <>
                    <div style={estilo.card}>
                        <h3 style={{ marginBottom: '16px' }}>Relatório de Vendas por Período</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: '#555' }}>Data Inicial</label>
                                <input style={estilo.input} type="date"
                                    value={dataInicial}
                                    onChange={e => setDataInicial(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#555' }}>Data Final</label>
                                <input style={estilo.input} type="date"
                                    value={dataFinal}
                                    onChange={e => setDataFinal(e.target.value)} />
                            </div>
                            <button style={{ ...estilo.botao, marginBottom: '12px' }} onClick={gerarRelatorioVendas}>
                                Gerar Relatório
                            </button>
                        </div>
                    </div>

                    {relatorio && (
                        <>
                            {/* Cards de resumo */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{
                                    background: 'white', borderRadius: '12px', padding: '20px', flex: 1,
                                    borderTop: '4px solid #e7901e', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}>
                                    <p style={{ color: '#888', fontSize: '13px' }}>Total de Pedidos</p>
                                    <h2>{relatorio.total_pedidos}</h2>
                                </div>
                                <div style={{
                                    background: 'white', borderRadius: '12px', padding: '20px', flex: 1,
                                    borderTop: '4px solid #dc2b1c', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}>
                                    <p style={{ color: '#888', fontSize: '13px' }}>Faturamento Total</p>
                                    <h2>R$ {Number(relatorio.faturamento_total).toFixed(2)}</h2>
                                </div>
                                <div style={{
                                    background: 'white', borderRadius: '12px', padding: '20px', flex: 1,
                                    borderTop: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}>
                                    <p style={{ color: '#888', fontSize: '13px' }}>Ticket Médio</p>
                                    <h2>R$ {Number(relatorio.ticket_medio).toFixed(2)}</h2>
                                </div>
                            </div>

                            {/* Por forma de pagamento */}
                            {relatorio.por_forma && relatorio.por_forma.length > 0 && (
                                <div style={estilo.card}>
                                    <h3 style={{ marginBottom: '16px' }}>Por Forma de Pagamento</h3>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {relatorio.por_forma.map(item => (
                                            <div key={item.forma} style={{
                                                background: '#f9f9f9', borderRadius: '8px',
                                                padding: '16px 24px', flex: 1, textAlign: 'center'
                                            }}>
                                                <p style={{ color: '#888', fontSize: '13px' }}>{formaLabel[item.forma] || item.forma}</p>
                                                <h3>R$ {Number(item.total).toFixed(2)}</h3>
                                                <p style={{ color: '#aaa', fontSize: '12px' }}>{item.quantidade} pagamentos</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pedidos do período */}
                            {relatorio.pedidos && relatorio.pedidos.length > 0 && (
    <div style={estilo.card}>
        <h3 style={{ marginBottom: '16px' }}>Pedidos no Período</h3>
        {relatorio.pedidos.map(pedido => (
            <div key={pedido.id} style={{
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '16px',
                marginBottom: '16px'
            }}>
                {/* Cabeçalho do pedido */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                        <strong style={{ fontSize: '15px' }}>#{pedido.id} — Mesa {pedido.numero_mesa}</strong>
                        {pedido.nome_do_cliente && (
                            <span style={{ color: '#888', fontSize: '13px', marginLeft: '8px' }}>
                                {pedido.nome_do_cliente}
                            </span>
                        )}
                        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '2px' }}>
                            {new Date(pedido.horario).toLocaleString('pt-BR')}
                        </p>
                    </div>
                    <strong style={{ fontSize: '16px', color: '#1a1a1a' }}>
                        R$ {Number(pedido.valor_total).toFixed(2)}
                    </strong>
                </div>

                {/* Itens */}
                <div style={{ marginBottom: '10px' }}>
                    {pedido.itens && pedido.itens.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '6px 10px', background: '#f9f9f9',
                            borderRadius: '6px', marginBottom: '4px', fontSize: '13px'
                        }}>
                            <div>
                                <span><strong>{item.quantidade}x</strong> {item.nome_produto}</span>
                                {item.adicionais && (
                                    <span style={{ color: '#e7901e', marginLeft: '6px' }}>
                                        + {item.adicionais}
                                    </span>
                                )}
                                {item.observacao && (
                                    <span style={{ color: '#dc2b1c', marginLeft: '6px', fontStyle: 'italic' }}>
                                        ⚠ {item.observacao}
                                    </span>
                                )}
                            </div>
                            <span style={{ color: '#555' }}>
                                R$ {(Number(item.valor_unitario) * item.quantidade + Number(item.total_adicionais)).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pagamentos */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {pedido.pagamentos && pedido.pagamentos.map((pag, i) => (
                        <span key={i} style={{
                            background: '#f0fdf4', color: '#16a34a',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px'
                        }}>
                            ✓ {formaLabel[pag.forma] || pag.forma} — R$ {Number(pag.valor_total).toFixed(2)}
                        </span>
                    ))}
                </div>
            </div>
        ))}
    </div>
)}

                            {relatorio.pedidos && relatorio.pedidos.length === 0 && (
                                <div style={{ ...estilo.card, textAlign: 'center', color: '#aaa' }}>
                                    Nenhuma venda encontrada no período informado
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Aba Estoque */}
            {aba === 'estoque' && (
                <>
                    {insumosCriticos.length > 0 && (
                        <div style={estilo.card}>
                            <h3 style={{ marginBottom: '16px', color: '#dc2b1c' }}>⚠ Insumos em Estoque Crítico</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                        <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Insumo</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: '#888', fontSize: '13px' }}>Atual</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: '#888', fontSize: '13px' }}>Mínimo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insumosCriticos.map(insumo => (
                                        <tr key={insumo.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '10px' }}><strong>{insumo.nome}</strong></td>
                                            <td style={{ padding: '10px', textAlign: 'right', color: '#dc2b1c', fontWeight: 'bold' }}>
                                                {insumo.quantidade}
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>
                                                {insumo.quantidade_critica}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div style={estilo.card}>
                        <h3 style={{ marginBottom: '16px' }}>Histórico de Movimentações</h3>
                        {movimentacoes.length === 0 ? (
                            <p style={{ color: '#aaa' }}>Nenhuma movimentação registrada</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                        <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Data</th>
                                        <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Insumo</th>
                                        <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Tipo</th>
                                        <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Motivo</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: '#888', fontSize: '13px' }}>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimentacoes.map(mov => (
                                        <tr key={mov.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '10px', color: '#888' }}>
                                                {new Date(mov.data).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td style={{ padding: '10px' }}><strong>{mov.nome_insumo}</strong></td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    background: mov.tipo_de_movimento === 'entrada' ? '#f0fdf4' : '#fee2e2',
                                                    color: mov.tipo_de_movimento === 'entrada' ? '#16a34a' : '#dc2b1c',
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px'
                                                }}>
                                                    {mov.tipo_de_movimento === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', color: '#888' }}>{mov.motivo}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                                                {mov.quantidade}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Relatorios