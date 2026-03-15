import { MessageSquare, Bell, CheckCheck, Briefcase, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'

export default function TopBar() {
    const { isAuthenticated, requireAuth, notifications, markAllRead } = useAuth()
    const [showNotifs, setShowNotifs] = useState(false)
    const [showMessages, setShowMessages] = useState(false)
    const notifRef = useRef(null)
    const msgRef = useRef(null)

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false)
            }
            if (msgRef.current && !msgRef.current.contains(event.target)) {
                setShowMessages(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getNotifIcon = (type) => {
        if (type === 'applied') return <Briefcase size={16} />
        if (type === 'alert') return <AlertCircle size={16} />
        return <Bell size={16} />
    }

    const timeAgo = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime()
        const mins = Math.floor(diff / 60000)
        const hrs = Math.floor(mins / 60)
        const days = Math.floor(hrs / 24)
        if (days > 0) return `${days}d ago`
        if (hrs > 0) return `${hrs}h ago`
        if (mins > 0) return `${mins}m ago`
        return 'Just now'
    }

    return (
        <header
            className="h-14 border-b flex items-center justify-between px-6 sticky top-0 z-40"
            style={{
                background: 'rgba(19, 17, 28, 0.85)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Left: Messages */}
            <div className="relative" ref={msgRef}>
                <button
                    className="btn-ghost btn-icon relative"
                    onClick={() => {
                        if (!isAuthenticated) { requireAuth(); return }
                        setShowMessages(!showMessages)
                    }}
                    title="Inbox"
                >
                    <MessageSquare size={20} />
                </button>

                {showMessages && isAuthenticated && (
                    <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-xl border z-50 overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
                        <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <h3 className="font-semibold text-sm">Messages</h3>
                        </div>
                        <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                            <p>Message a talent from the <Link to="/explore" className="text-primary hover:underline font-bold" onClick={() => setShowMessages(false)}>Explore</Link> page</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Notifications */}
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
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-danger"
                            style={{ background: 'var(--color-danger)', minWidth: '18px', height: '18px' }}>
                            {unreadCount}
                        </span>
                    )}
                </button>

                {showNotifs && isAuthenticated && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                        <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => { markAllRead(); setShowNotifs(false) }}>
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => {
                                const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {});
                                return (
                                <div key={n.id} className={`p-4 border-b transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                                    style={{ borderColor: 'var(--color-border)' }}>
                                    <div className="flex gap-3">
                                        <div className={`avatar avatar-sm shrink-0 ${n.type === 'applied' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                                            {getNotifIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold leading-tight flex items-center flex-wrap gap-1">
                                                {n.title}
                                                {meta.senderName && (
                                                    <span className="text-xs font-normal" style={{ color: 'var(--color-text-dim)' }}>
                                                        from <span className="underline decoration-primary underline-offset-2 font-medium" style={{ color: 'var(--color-text)' }}>{meta.senderName}</span>
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-dim)' }}>{n.message}</p>
                                            <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>{timeAgo(n.timestamp)}</p>
                                        </div>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                                    </div>
                                </div>
                            )}) : (
                                <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    <Bell size={28} className="mx-auto mb-2 opacity-20" />
                                    <p>No notifications yet</p>
                                    <p className="text-xs mt-1 opacity-60">Apply for jobs to see updates here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
