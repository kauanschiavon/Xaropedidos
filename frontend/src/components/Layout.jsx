import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'

function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                marginLeft: isMobile ? '0' : '220px',
                marginTop: isMobile ? '56px' : '0',
                flex: 1,
                minHeight: '100vh',
                background: '#f5f5f5',
                padding: isMobile ? '12px' : '30px',
                width: isMobile ? '100%' : 'calc(100% - 220px)',
                maxWidth: '100%',
                overflowX: 'hidden',
                boxSizing: 'border-box'
            }}>
                {children}
            </main>
        </div>
    )
}

export default Layout