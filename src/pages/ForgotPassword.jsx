import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../services/auth.service'
import api from '../services/api'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await authService.forgotPassword(email);

            if (result.success) {
                setSubmitted(true)
            } else {
                setError(result.error || 'Failed to send reset link.')
            }
        } catch (err) {
            setError('Could not connect to the server. Please try again.')
        } finally {
            setLoading(false)
        }
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

                    {submitted ? (
                        <>
                            <div className="avatar avatar-lg mx-auto mt-6 mb-4" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                                <CheckCircle size={28} />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                            </p>
                            <Link to="/login" className="btn btn-primary w-full mt-6">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mt-4 mb-2">Forgot Password?</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </>
                    )}
                </div>

                {!submitted && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email" placeholder="your@email.com" required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Sending...' : <><Mail size={16} /> Send Reset Link</>}
                        </button>
                        <Link to="/login" className="btn btn-ghost w-full" style={{ color: 'var(--color-text-muted)' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </form>
                )}
            </motion.div>
        </div>
    )
}
