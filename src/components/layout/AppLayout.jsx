import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
