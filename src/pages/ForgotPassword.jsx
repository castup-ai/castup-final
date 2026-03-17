import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, ArrowLeft, CheckCircle, MessageSquare, Lock } from 'lucide-react'
import { auth } from '../config/firebase.config'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1) // 1: Phone, 2: OTP
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)

    // Setup ReCAPTCHA
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    }, []);

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Format phone number if missing +
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(result);
            setStep(2);
        } catch (err) {
            console.error('SMS Error:', err);
            // Show more detailed error for debugging
            const errorMessage = err.code === 'auth/unauthorized-domain' 
                ? 'Domain not authorized in Firebase Console. Please add "castup-final.vercel.app" to Authorized Domains.'
                : (err.message || 'Failed to send SMS. Please check the number and try again.');
            
            setError(errorMessage);
            
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.render().then(widgetId => {
                    window.grecaptcha.reset(widgetId);
                });
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken();
            
            // Success! Store token and redirect to reset password page
            // We pass the token and phone to the reset page
            navigate('/reset-password', { 
                state: { 
                    idToken, 
                    phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
                } 
            });
        } catch (err) {
            console.error('OTP Error:', err);
            setError('Invalid OTP code. Please try again.');
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
                    <h1 className="text-2xl font-bold mt-4 mb-2">Forgot Password?</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {step === 1 
                            ? "Enter your registered phone number to receive an OTP."
                            : `Enter the 6-digit code sent to your phone.`}
                    </p>
                </div>

                <div id="recaptcha-container"></div>

                {error && (
                    <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="relative">
                                <input
                                    type="tel" placeholder="+91 9876543210" required
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="pl-4"
                                />
                            </div>
                            <p className="text-xs mt-1 text-muted">Include country code (e.g., +91)</p>
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading || !phoneNumber}>
                            {loading ? 'Sending OTP...' : <><MessageSquare size={16} /> Send OTP</>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="form-group">
                            <label>Enter 6-digit OTP</label>
                            <input
                                type="text" placeholder="123456" required
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.5em] font-bold"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading || otp.length < 6}>
                            {loading ? 'Verifying...' : <><Lock size={16} /> Verify & Continue</>}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="btn btn-ghost w-full text-xs"
                        >
                            Change Phone Number
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
