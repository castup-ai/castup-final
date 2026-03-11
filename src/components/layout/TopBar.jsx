import { MessageSquare, Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'

export default function TopBar() {
    const { isAuthenticated, requireAuth } = useAuth()
    const [msgCount] = useState(0)
    const [notifCount, setNotifCount] = useState(1)
    const [showNotifs, setShowNotifs] = useState(false)
    const notifRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef]);

    return (
        <header
            className="h-14 border-b flex items-center justify-between px-6 sticky top-0 z-40"
            style={{
                background: 'rgba(19, 17, 28, 0.85)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--color-border)',
            }}
        >
            <Link
                to="/contact"
                className="btn-ghost btn-icon relative"
                onClick={(e) => { 
                    if (!isAuthenticated) {
                        e.preventDefault();
                        requireAuth();
                    }
                }}
                title="Messages"
            >
                <MessageSquare size={20} />
                {msgCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-primary"
                        style={{ minWidth: '18px', height: '18px' }}>
                        {msgCount}
                    </span>
                )}
            </Link>

            <div className="relative" ref={notifRef}>
                <button
                    className="btn-ghost btn-icon relative"
                    onClick={() => {
                        if (!isAuthenticated) return requireAuth()
                        setShowNotifs(!showNotifs)
                    }}
                    title="Notifications"
                >
                    <Bell size={20} />
                    {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-danger"
                            style={{ background: 'var(--color-danger)', minWidth: '18px', height: '18px' }}>
                            {notifCount}
                        </span>
                    )}
                </button>

                {showNotifs && isAuthenticated && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl border z-50 overflow-hidden" 
                         style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                        <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {notifCount > 0 && (
                                <button className="text-xs text-primary hover:underline" onClick={() => setNotifCount(0)}>
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifCount > 0 ? (
                                <div className="p-4 border-b hover:bg-white/5 transition-colors cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
                                    <div className="flex gap-3">
                                        <div className="avatar avatar-sm bg-primary/20 text-primary shrink-0">
                                            <Bell size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Welcome to CastUp! 🎉</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>We're thrilled to have you. Complete your profile to get discovered.</p>
                                            <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>Just now</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    No new notifications
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
