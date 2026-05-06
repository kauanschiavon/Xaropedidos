import { useEffect, useState } from 'react'
import api from '../services/api'

function Fornecedores() {
    const [fornecedores, setFornecedores] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [editando, setEditando] = useState(null)
    const [mensagem, setMensagem] = useState(null)
    const [form, setForm] = useState({
        nome: '', cnpj: '', telefone: '', email: ''
    })
const carregarFornecedores = async () => {
        const res = await api.get('/fornecedores')
        setFornecedores(res.data)
    }

    useEffect(() => {
        const init = async () => {
            await carregarFornecedores()
        }
        init()
    }, [])
    const salvar = async () => {
        try {
            if (!form.nome) {
                setMensagem({ tipo: 'erro', texto: 'Nome é obrigatório' })
                return
            }
            if (editando) {
                await api.put(`/fornecedores/${editando}`, form)
                setMensagem({ tipo: 'sucesso', texto: 'Fornecedor atualizado com sucesso!' })
            } else {
                await api.post('/fornecedores', form)
                setMensagem({ tipo: 'sucesso', texto: 'Fornecedor criado com sucesso!' })
            }
            setMostrarForm(false)
            setEditando(null)
            setForm({ nome: '', cnpj: '', telefone: '', email: '' })
            carregarFornecedores()
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao salvar fornecedor' })
        }
        setTimeout(() => setMensagem(null), 3000)
    }

    const editar = (fornecedor) => {
        setEditando(fornecedor.id)
        setForm({
            nome: fornecedor.nome,
            cnpj: fornecedor.cnpj,
            telefone: fornecedor.telefone,
            email: fornecedor.email
        })
        setMostrarForm(true)
    }

    const deletar = async (id) => {
        if (!window.confirm('Deseja remover este fornecedor?')) return
        try {
            await api.delete(`/fornecedores/${id}`)
            setMensagem({ tipo: 'sucesso', texto: 'Fornecedor removido com sucesso!' })
            carregarFornecedores()
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao remover fornecedor' })
        }
        setTimeout(() => setMensagem(null), 3000)
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
        botaoSecundario: {
            background: '#f0f0f0',
            color: '#555',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px'
        },
        botaoDanger: {
            background: '#fee2e2',
            color: '#dc2b1c',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px'
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            marginBottom: '12px'
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: '#1a1a1a' }}>Fornecedores</h1>
                    <p style={{ color: '#888' }}>Gerencie os fornecedores da lanchonete</p>
                </div>
                <button style={estilo.botao} onClick={() => {
                    setMostrarForm(!mostrarForm)
                    setEditando(null)
                    setForm({ nome: '', cnpj: '', telefone: '', email: '' })
                }}>
                    {mostrarForm ? '✕ Fechar' : '+ Novo Fornecedor'}
                </button>
            </div>

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

            {mostrarForm && (
                <div style={estilo.card}>
                    <h3 style={{ marginBottom: '16px' }}>{editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>Nome</label>
                            <input style={estilo.input} value={form.nome}
                                onChange={e => setForm({ ...form, nome: e.target.value })}
                                placeholder="Ex: Distribuidora XYZ" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>CNPJ</label>
                            <input style={estilo.input} value={form.cnpj}
                                onChange={e => setForm({ ...form, cnpj: e.target.value })}
                                placeholder="Ex: 12.345.678/0001-99" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>Telefone</label>
                            <input style={estilo.input} value={form.telefone}
                                onChange={e => setForm({ ...form, telefone: e.target.value })}
                                placeholder="Ex: (44) 99999-9999" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>E-mail</label>
                            <input style={estilo.input} value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="Ex: contato@xyz.com" />
                        </div>
                    </div>
                    <button style={estilo.botao} onClick={salvar}>
                        {editando ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                    </button>
                </div>
            )}

            <div style={estilo.card}>
                {fornecedores.length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center' }}>Nenhum fornecedor cadastrado</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Nome</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>CNPJ</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Telefone</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>E-mail</th>
                                <th style={{ textAlign: 'right', padding: '10px', color: '#888', fontSize: '13px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fornecedores.map(fornecedor => (
                                <tr key={fornecedor.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 10px' }}><strong>{fornecedor.nome}</strong></td>
                                    <td style={{ padding: '12px 10px', color: '#888' }}>{fornecedor.cnpj}</td>
                                    <td style={{ padding: '12px 10px', color: '#888' }}>{fornecedor.telefone}</td>
                                    <td style={{ padding: '12px 10px', color: '#888' }}>{fornecedor.email}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button style={estilo.botaoSecundario} onClick={() => editar(fornecedor)}>Editar</button>
                                            <button style={estilo.botaoDanger} onClick={() => deletar(fornecedor.id)}>Remover</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Fornecedores