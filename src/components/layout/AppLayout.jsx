import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ErrorBoundary from '../ErrorBoundary'

export default function AppLayout() {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    )
}
