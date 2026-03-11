import { useAuth } from '@/context/RealAuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, UserPlus } from 'lucide-react'

export default function AuthModal() {
    const { showAuthModal, setShowAuthModal } = useAuth()
    const navigate = useNavigate()

    if (!showAuthModal) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                onClick={() => setShowAuthModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="modal-content text-center"
                    onClick={e => e.stopPropagation()}
                    style={{ maxWidth: '420px' }}
                >
                    <button
                        onClick={() => setShowAuthModal(false)}
                        className="btn-ghost btn-icon absolute top-4 right-4"
                        style={{ position: 'absolute' }}
                    >
                        <X size={18} />
                    </button>

                    <div className="avatar avatar-lg mx-auto mb-4" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                        <LogIn size={28} />
                    </div>

                    <h2 className="text-xl font-bold mb-2">Log in / Sign up to do this</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                        You need an account to access this feature. Join CastUp to connect with cinema professionals.
                    </p>

                    <div className="flex gap-3">
                        <button
                            className="btn btn-primary flex-1"
                            onClick={() => { setShowAuthModal(false); navigate('/login') }}
                        >
                            <LogIn size={16} />
                            Log In
                        </button>
                        <button
                            className="btn btn-outline flex-1"
                            onClick={() => { setShowAuthModal(false); navigate('/register') }}
                        >
                            <UserPlus size={16} />
                            Sign Up
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
