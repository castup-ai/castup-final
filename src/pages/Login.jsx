import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const result = await login(form.email, form.password)
        if (result.success) navigate('/home')
        else setError(result.error || 'Invalid email or password')
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-bold gradient-text">CastUp</Link>
                    <h1 className="text-2xl font-bold mt-4 mb-2">Welcome Back</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Log in to continue</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email" placeholder="your@email.com" required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Enter password" required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon p-1">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: 'var(--color-primary-light)' }}>
                            Forgot Password?
                        </Link>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Logging in...' : <><LogIn size={16} /> Log In</>}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary-light)' }}>Sign Up</Link>
                </p>
            </motion.div>
        </div>
    )
}
