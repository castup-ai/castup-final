import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/RealAuthContext'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff } from 'lucide-react'



export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        firstName: '', lastName: '', country: '', phone: '', email: '', password: '', confirmPassword: ''
    })
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            const result = await register({
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email,
                password: form.password,
                department: 'Acting', 
                country: form.country,
                phone: form.phone
            })
            if (result.success) navigate('/home')
            else setError(result.error || 'Registration failed. Try again.')
        } catch (err) {
            setError('Registration failed due to a network error.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--color-bg)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-bold gradient-text">CastUp</Link>
                    <h1 className="text-2xl font-bold mt-4 mb-2">Join for Free</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create your CastUp account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" placeholder="First name" required value={form.firstName}
                                onChange={e => update('firstName', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" placeholder="Last name" required value={form.lastName}
                                onChange={e => update('lastName', e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Country</label>
                        <input type="text" placeholder="Your country" required value={form.country}
                            onChange={e => update('country', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="+91 98765 43210" required value={form.phone}
                            onChange={e => update('phone', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="your@email.com" required value={form.email}
                            onChange={e => update('email', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" required
                                value={form.password} onChange={e => update('password', e.target.value)} />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon p-1">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" placeholder="Re-enter password" required
                            value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Creating account...' : <><UserPlus size={16} /> Join CastUp</>}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary-light)' }}>Log In</Link>
                </p>
            </motion.div>
        </div>
    )
}
