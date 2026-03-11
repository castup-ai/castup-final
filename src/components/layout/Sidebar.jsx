import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'
import {
    Home, Compass, FileText, Briefcase, Upload,
    Bot, MapPin, Video, Phone, User, ChevronLeft, ChevronRight, Sparkles, LogOut
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/post-request', label: 'Post a Request', icon: FileText },
    { path: '/find-work', label: 'Find Work', icon: Briefcase },
    { path: '/upload-work', label: 'Upload Work', icon: Upload },
]

const aiItems = [
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { path: '/ai-location', label: 'AI Location Tracker', icon: MapPin },
    { path: '/ai-casting', label: 'AI Casting Director', icon: Video },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const { user, requireAuth, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

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

            {/* Nav items */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={(e) => handleNavClick(e, item.path, protectedPaths.includes(item.path))}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
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

                {/* AI Section */}
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
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'text-white' : 'hover:bg-[var(--color-surface-light)]'
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

                {/* Contact Us */}
                <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'text-white' : 'hover:bg-[var(--color-surface-light)]'
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
