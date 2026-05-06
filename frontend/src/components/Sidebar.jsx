import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const menu = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Pedidos', path: '/pedidos', icon: '🧾' },
    { label: 'Caixa', path: '/caixa', icon: '💰' },
    { label: 'Pagamentos', path: '/pagamentos', icon: '💳' },
    { label: 'Cardápio', path: '/produtos', icon: '🍔' },
    { label: 'Estoque', path: '/estoque', icon: '📦' },
    { label: 'Fornecedores', path: '/fornecedores', icon: '🚚' },
    { label: 'Relatórios', path: '/relatorios', icon: '📈' },
]

function Sidebar() {
    const location = useLocation()
    const [aberto, setAberto] = useState(false)
    const isMobile = window.innerWidth <= 768

    return (
        <>
            {/* Mobile - topbar */}
            {isMobile ? (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '56px',
                        background: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        zIndex: 1000
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>🍔 XaroPedidos</span>
                        <button onClick={() => setAberto(!aberto)} style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}>
                            {aberto ? '✕' : '☰'}
                        </button>
                    </div>

                    {/* Menu dropdown mobile */}
                    {aberto && (
                        <div style={{
                            position: 'fixed',
                            top: '56px',
                            left: 0,
                            right: 0,
                            background: '#1a1a1a',
                            zIndex: 999,
                            paddingBottom: '12px'
                        }}>
                            {menu.map(item => {
                                const ativo = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setAberto(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '14px 20px',
                                            color: ativo ? '#e7901e' : '#aaa',
                                            textDecoration: 'none',
                                            background: ativo ? '#2a2a2a' : 'transparent',
                                            borderLeft: ativo ? '3px solid #e7901e' : '3px solid transparent',
                                            fontSize: '15px'
                                        }}>
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* Desktop - sidebar */
                <div style={{
                    width: '220px',
                    minHeight: '100vh',
                    background: '#1a1a1a',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: 0,
                    top: 0
                }}>
                    <div style={{
                        padding: '24px 20px',
                        borderBottom: '1px solid #333'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #e7901e, #dc2b1c)',
                            borderRadius: '8px',
                            padding: '10px',
                            textAlign: 'center'
                        }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                                🍔 XaroPedidos
                            </span>
                        </div>
                    </div>

                    <nav style={{ padding: '12px 0', flex: 1 }}>
                        {menu.map(item => {
                            const ativo = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        color: ativo ? '#e7901e' : '#aaa',
                                        textDecoration: 'none',
                                        background: ativo ? '#2a2a2a' : 'transparent',
                                        borderLeft: ativo ? '3px solid #e7901e' : '3px solid transparent',
                                        fontSize: '14px'
                                    }}>
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #333',
                        color: '#555',
                        fontSize: '12px'
                    }}>
                        Xaropinho Lanches © 2025
                    </div>
                </div>
            )}
        </>
    )
}

export default Sidebar