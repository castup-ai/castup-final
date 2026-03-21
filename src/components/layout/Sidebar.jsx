import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'
import {
    Home, Compass, FileText, Briefcase, Upload,
    Bot, MapPin, Video, Phone, User, ChevronLeft, ChevronRight, Sparkles, LogOut, Shield, MessageSquare, Film
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ADMIN_EMAILS = ['castup4862446@gmail.com', 'castupaiapp@gmail.com']

const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/post-request', label: 'Post a Request', icon: FileText },
    { path: '/find-work', label: 'Find Job', icon: Briefcase },
    { path: '/upload-work', label: 'Upload Work', icon: Upload },
]

const aiItems = [
    { path: '/ai-location', label: 'AI Location Tracker', icon: MapPin },
    { path: '/ai-casting', label: 'AI Casting Director', icon: Film },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const { user, requireAuth, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const isAdmin = user && ADMIN_EMAILS.includes(user.email)

    const handleNavClick = (e, path, requiresAuth) => {
        if (requiresAuth && !isAuthenticated) {
            e.preventDefault()
            requireAuth()
        }
    }

    const protectedPaths = ['/post-request', '/upload-work', '/ai-assistant', '/ai-location', '/ai-casting']

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-screen sticky top-0 flex flex-col border-r overflow-hidden"
            style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Logo */}
            <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: 'var(--color-border)' }}>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-bold gradient-text"
                    >
                        CastUp
                    </motion.span>
                )}
                {collapsed && (
                    <span className="text-xl font-bold gradient-text mx-auto">C</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="btn-ghost btn-icon"
                    style={{ marginLeft: collapsed ? 'auto' : 0 }}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Quick Actions (standalone icons for Inbox & Chat) */}
            <div className={`p-4 flex ${collapsed ? 'flex-col items-center' : 'items-center justify-start'} gap-2`}>
                <div className="flex items-center gap-1">
                    <NavLink
                        to="/inbox"
                        className={({ isActive }) =>
                            `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-[var(--color-text-dim)] hover:text-[var(--color-primary)]'}`
                        }
                        title="Inbox"
                    >
                        <MessageSquare size={20} />
                    </NavLink>

                    <NavLink
                        to="/ai-assistant"
                        className={({ isActive }) =>
                            `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-white/5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]'}`
                        }
                        title="AI Assistant"
                    >
                        <Sparkles size={20} />
                    </NavLink>
                </div>

                {!collapsed && (
                    <div className="flex flex-col ml-1">
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-30 px-1">Quick Access</span>
                        <div className="flex gap-2 text-xs font-bold px-1">
                            <NavLink to="/inbox" className="hover:text-primary transition-colors">Inbox</NavLink>
                            <span className="opacity-20">•</span>
                            <NavLink to="/ai-assistant" className="hover:text-accent transition-colors">AI Chat</NavLink>
                        </div>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {!isAdmin && navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={(e) => handleNavClick(e, item.path, protectedPaths.includes(item.path))}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \${isActive
                                ? 'text-white'
                                : 'hover:bg-[var(--color-surface-light)]'
                            }`
                        }
                        style={({ isActive }) => isActive ? {
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        } : { color: 'var(--color-text-muted)' }}
                    >
                        <item.icon size={20} />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}

                {/* AI Section (Only for non-admins) */}
                {!isAdmin && (
                    <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        {!collapsed && (
                            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                style={{ color: 'var(--color-text-dim)' }}>
                                <Sparkles size={12} />
                                AI Options
                            </div>
                        )}
                        {aiItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={(e) => handleNavClick(e, item.path, true)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \${isActive ? 'text-white' : 'hover:bg-[var(--color-surface-light)]'
                                    }`
                                }
                                style={({ isActive }) => isActive ? {
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                } : { color: 'var(--color-text-muted)' }}
                            >
                                <item.icon size={20} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Admin Dashboard */}
                {isAdmin && (
                    <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \${isActive ? 'text-white' : 'hover:bg-[var(--color-surface-light)]'
                                }`
                            }
                            style={({ isActive }) => isActive ? {
                                background: 'linear-gradient(135deg, var(--color-danger), var(--color-danger-dark))',
                            } : { color: 'var(--color-text-dim)' }}
                        >
                            <Shield size={20} className="text-danger" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden font-bold"
                                    >
                                        Admin Dashboard
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    </div>
                )}

                {/* Contact Us (Only for non-admins) */}
                {!isAdmin && (
                    <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \${isActive ? 'text-white' : 'hover:bg-[var(--color-surface-light)]'
                                }`
                            }
                            style={({ isActive }) => isActive ? {
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            } : { color: 'var(--color-text-muted)' }}
                        >
                            <Phone size={20} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        Contact Us
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* Profile at bottom */}
            <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (isAuthenticated) navigate('/profile')
                            else requireAuth()
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-[var(--color-surface-light)]"
                    >
                        <div className="avatar avatar-sm flex-shrink-0">
                            {user?.photo ? <img src={user.photo} alt="" /> : (user ? (user.name?.split(" ")[0])?.[0] || 'U' : <User size={14} />)}
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-left overflow-hidden"
                                >
                                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                        {user ? `${user.name}` : 'Profile'}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>
                                        {user ? user.role || 'Complete profile' : 'Sign in'}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                    {isAuthenticated && (
                        <button
                            onClick={() => { logout(); navigate('/') }}
                            className="btn-ghost btn-icon flex-shrink-0 rounded-lg hover:bg-[rgba(239,68,68,0.1)]"
                            title="Log Out"
                            style={{ color: 'var(--color-danger)' }}
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    )
}
