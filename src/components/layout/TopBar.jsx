import { MessageSquare, Bell } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function TopBar() {
    const { isAuthenticated, requireAuth } = useAuth()
    const [msgCount] = useState(3)
    const [notifCount] = useState(5)

    return (
        <header
            className="h-14 border-b flex items-center justify-between px-6 sticky top-0 z-40"
            style={{
                background: 'rgba(19, 17, 28, 0.85)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--color-border)',
            }}
        >
            <button
                className="btn-ghost btn-icon relative"
                onClick={() => { if (!isAuthenticated) requireAuth() }}
                title="Messages"
            >
                <MessageSquare size={20} />
                {msgCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                        style={{ background: 'var(--color-primary)', minWidth: '18px', height: '18px' }}>
                        {msgCount}
                    </span>
                )}
            </button>

            <button
                className="btn-ghost btn-icon relative"
                onClick={() => { if (!isAuthenticated) requireAuth() }}
                title="Notifications"
            >
                <Bell size={20} />
                {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                        style={{ background: 'var(--color-danger)', minWidth: '18px', height: '18px' }}>
                        {notifCount}
                    </span>
                )}
            </button>
        </header>
    )
}
