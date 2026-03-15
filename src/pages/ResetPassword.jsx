import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/auth.service'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        setLoading(true)
        setError('')

        try {
            const result = await authService.resetPassword(token, password);

            if (result.success) {
                setSubmitted(true)
                // Auto redirect after 3 seconds
                setTimeout(() => {
                    navigate('/login')
                }, 3000)
            } else {
                setError(result.error || 'Failed to reset password. Link may be expired.')
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
                            <h1 className="text-2xl font-bold mb-2">Password Reset Successful</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                Your password has been updated. Redirecting you to login...
                            </p>
                            <Link to="/login" className="btn btn-primary w-full mt-6">
                                <ArrowLeft size={16} /> Login Now
                            </Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mt-4 mb-2">Reset Password</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                Enter your new password below.
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
                            <label>New Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Minimum 6 characters" required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon p-1">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Re-enter password" required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Processing...' : <><Lock size={16} /> Update Password</>}
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
