import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, FileText, Briefcase, Upload, ArrowRight, TrendingUp, Users, Film } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const pathways = [
    { path: '/explore', label: 'Explore Talent', desc: 'Discover professionals by role, location & skills', icon: Compass, color: '#7c3aed' },
    { path: '/post-request', label: 'Post a Request', desc: 'Find the perfect crew for your next project', icon: FileText, color: '#06b6d4' },
    { path: '/find-work', label: 'Find Work', desc: 'Browse opportunities and apply to projects', icon: Briefcase, color: '#f59e0b' },
    { path: '/upload-work', label: 'Upload Your Work', desc: 'Showcase your films, reels & portfolio', icon: Upload, color: '#10b981' },
]

export default function Home() {
    const { user, isAuthenticated } = useAuth()

    return (
        <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">
                    {isAuthenticated ? `Welcome back, ${user?.firstName}` : 'Welcome to CastUp'} 👋
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    {isAuthenticated
                        ? 'Here\'s what you can do today'
                        : 'Explore the platform and discover cinema talent'
                    }
                </p>
            </motion.div>

            {/* Quick stats */}
            {isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { icon: Users, label: 'Connections', value: '12', color: 'var(--color-primary)' },
                        { icon: Film, label: 'Projects', value: '3', color: 'var(--color-secondary)' },
                        { icon: TrendingUp, label: 'Profile Views', value: '48', color: 'var(--color-success)' },
                    ].map((stat, i) => (
                        <div key={i} className="card p-4 flex items-center gap-4">
                            <div className="avatar avatar-sm" style={{ background: `${stat.color}22`, color: stat.color }}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Pathway cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="section-title">Get Started</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {pathways.map((item, i) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <Link to={item.path} className="block">
                                <div className="card card-interactive p-6 h-full flex items-start gap-4 group">
                                    <div className="avatar" style={{
                                        background: `${item.color}18`,
                                        color: item.color,
                                        flexShrink: 0,
                                    }}>
                                        <item.icon size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-base">{item.label}</h3>
                                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
                                        </div>
                                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
            >
                <h2 className="section-title">Recent on CastUp</h2>
                <div className="space-y-3">
                    {[
                        { text: 'New crew call posted: "Independent Feature Film - Drama"', time: '2 hours ago' },
                        { text: 'Priya Sharma updated their portfolio', time: '5 hours ago' },
                        { text: 'New talent joined from Chennai', time: '1 day ago' },
                    ].map((activity, i) => (
                        <div key={i} className="card p-4 flex items-center justify-between">
                            <span className="text-sm">{activity.text}</span>
                            <span className="text-xs whitespace-nowrap ml-4" style={{ color: 'var(--color-text-dim)' }}>{activity.time}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
