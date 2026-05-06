import { useEffect, useState } from 'react'
import api from '../services/api'

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [editando, setEditando] = useState(null)
    const [mensagem, setMensagem] = useState(null)
    const [form, setForm] = useState({
        nome: '', cpf: '', telefone: '', cargo: 'garcom', email: '', senha: ''
    })

    const carregarFuncionarios = async () => {
        const res = await api.get('/funcionarios')
        setFuncionarios(res.data)
    }

    useEffect(() => {
        const init = async () => {
            await carregarFuncionarios()
        }
        init()
    }, [])

    const salvar = async () => {
        try {
            if (!form.nome || !form.email) {
                setMensagem({ tipo: 'erro', texto: 'Nome e e-mail são obrigatórios' })
                return
            }
            if (editando) {
                await api.put(`/funcionarios/${editando}`, form)
                setMensagem({ tipo: 'sucesso', texto: 'Funcionário atualizado com sucesso!' })
            } else {
                if (!form.senha) {
                    setMensagem({ tipo: 'erro', texto: 'Senha é obrigatória' })
                    return
                }
                await api.post('/funcionarios', form)
                setMensagem({ tipo: 'sucesso', texto: 'Funcionário criado com sucesso!' })
            }
            setMostrarForm(false)
            setEditando(null)
            setForm({ nome: '', cpf: '', telefone: '', cargo: 'garcom', email: '', senha: '' })
            carregarFuncionarios()
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao salvar funcionário' })
        }
        setTimeout(() => setMensagem(null), 3000)
    }

    const editar = (funcionario) => {
        setEditando(funcionario.id)
        setForm({
            nome: funcionario.nome,
            cpf: funcionario.cpf,
            telefone: funcionario.telefone,
            cargo: funcionario.cargo,
            email: funcionario.email,
            senha: ''
        })
        setMostrarForm(true)
    }

    const deletar = async (id) => {
        if (!window.confirm('Deseja remover este funcionário?')) return
        try {
            await api.delete(`/funcionarios/${id}`)
            setMensagem({ tipo: 'sucesso', texto: 'Funcionário removido com sucesso!' })
            carregarFuncionarios()
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.response?.data?.erro || 'Erro ao remover funcionário' })
        }
        setTimeout(() => setMensagem(null), 3000)
    }

    const cargoLabel = {
        gerente: 'Gerente',
        atendente: 'Atendente',
        garcom: 'Garçom',
        chapeiro: 'Chapeiro'
    }

    const cargoCor = {
        gerente: { background: '#fff3e0', color: '#e7901e' },
        atendente: { background: '#e0f2fe', color: '#0284c7' },
        garcom: { background: '#f0fdf4', color: '#16a34a' },
        chapeiro: { background: '#fdf4ff', color: '#9333ea' }
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
        },
        select: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            marginBottom: '12px',
            background: 'white'
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: '#1a1a1a' }}>Funcionários</h1>
                    <p style={{ color: '#888' }}>Gerencie os funcionários da lanchonete</p>
                </div>
                <button style={estilo.botao} onClick={() => {
                    setMostrarForm(!mostrarForm)
                    setEditando(null)
                    setForm({ nome: '', cpf: '', telefone: '', cargo: 'garcom', email: '', senha: '' })
                }}>
                    {mostrarForm ? '✕ Fechar' : '+ Novo Funcionário'}
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
                    <h3 style={{ marginBottom: '16px' }}>{editando ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>Nome</label>
                            <input style={estilo.input} value={form.nome}
                                onChange={e => setForm({ ...form, nome: e.target.value })}
                                placeholder="Ex: João Silva" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>CPF</label>
                            <input style={estilo.input} value={form.cpf}
                                onChange={e => setForm({ ...form, cpf: e.target.value })}
                                placeholder="Ex: 123.456.789-00" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>Telefone</label>
                            <input style={estilo.input} value={form.telefone}
                                onChange={e => setForm({ ...form, telefone: e.target.value })}
                                placeholder="Ex: (44) 99999-9999" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>Cargo</label>
                            <select style={estilo.select} value={form.cargo}
                                onChange={e => setForm({ ...form, cargo: e.target.value })}>
                                <option value="gerente">Gerente</option>
                                <option value="atendente">Atendente</option>
                                <option value="garcom">Garçom</option>
                                <option value="chapeiro">Chapeiro</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>E-mail</label>
                            <input style={estilo.input} value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="Ex: joao@email.com" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#555' }}>
                                {editando ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                            </label>
                            <input style={estilo.input} type="password" value={form.senha}
                                onChange={e => setForm({ ...form, senha: e.target.value })}
                                placeholder="••••••••" />
                        </div>
                    </div>
                    <button style={estilo.botao} onClick={salvar}>
                        {editando ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
                    </button>
                </div>
            )}

            <div style={estilo.card}>
                {funcionarios.length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center' }}>Nenhum funcionário cadastrado</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Nome</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Cargo</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>E-mail</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#888', fontSize: '13px' }}>Telefone</th>
                                <th style={{ textAlign: 'right', padding: '10px', color: '#888', fontSize: '13px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcionarios.map(funcionario => (
                                <tr key={funcionario.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 10px' }}><strong>{funcionario.nome}</strong></td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <span style={{
                                            ...cargoCor[funcionario.cargo],
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px'
                                        }}>
                                            {cargoLabel[funcionario.cargo]}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 10px', color: '#888' }}>{funcionario.email}</td>
                                    <td style={{ padding: '12px 10px', color: '#888' }}>{funcionario.telefone}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button style={estilo.botaoSecundario} onClick={() => editar(funcionario)}>Editar</button>
                                            <button style={estilo.botaoDanger} onClick={() => deletar(funcionario.id)}>Remover</button>
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

export default Funcionarios