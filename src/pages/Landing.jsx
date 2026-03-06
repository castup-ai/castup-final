import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Users, ArrowRight, Film, Star, Clapperboard } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
            {/* Top nav */}
            <nav className="flex items-center justify-between px-8 py-4">
                <span className="text-2xl font-bold gradient-text">CastUp</span>
                <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--color-primary-light)' }}>
                    Log In
                </Link>
            </nav>

            {/* Hero */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 badge mb-6">
                            <Sparkles size={14} />
                            Cinema Networking Platform
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            Where <span className="gradient-text">Cinema</span>
                            <br />Talent Connects
                        </h1>
                        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                            Discover talented professionals, showcase your work, post crew calls, and collaborate on film projects — all in one platform.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                    >
                        <Link to="/register" className="btn btn-primary btn-lg text-base">
                            <Users size={20} />
                            Join for Free
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/explore" className="btn btn-secondary btn-lg text-base">
                            <Sparkles size={20} />
                            Explore Talent
                        </Link>
                    </motion.div>

                    {/* Feature cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
                    >
                        {[
                            { icon: Film, title: 'Showcase Work', desc: 'Upload your films, reels, and portfolio for the world to see' },
                            { icon: Users, title: 'Find Talent', desc: 'Discover skilled professionals filtered by role, location & availability' },
                            { icon: Clapperboard, title: 'Crew Calls', desc: 'Post project requirements and find the perfect crew for your next film' },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="card card-interactive text-left p-5"
                            >
                                <div className="avatar avatar-sm mb-3" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                                    <f.icon size={16} />
                                </div>
                                <h3 className="font-semibold mb-1">{f.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex justify-center gap-12 mt-16 mb-8"
                    >
                        {[
                            { num: '2,500+', label: 'Professionals' },
                            { num: '500+', label: 'Projects' },
                            { num: '50+', label: 'Cities' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl font-bold gradient-text">{s.num}</div>
                                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-6 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}>
                <p className="text-sm">© 2026 CastUp. All rights reserved.</p>
            </footer>
        </div>
    )
}
