import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import api from '@/services/api'
import {
    MapPin, Briefcase, Star, Clock, Languages, UserPlus, MessageSquare,
    Instagram, Youtube, Linkedin, Twitter, Globe, ExternalLink,
    ChevronLeft, Film, ImageIcon, FileVideo, Eye, Award, CheckCircle,
    Share2
} from 'lucide-react'

export default function PublicProfile() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated, requireAuth, sendTargetedNotification, isProfileComplete, connectedUserIds } = useAuth()
    const [profile, setProfile] = useState(null)
    const [portfolio, setPortfolio] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [connected, setConnected] = useState(false)
    const [localSent, setLocalSent] = useState(false)
    
    // Check local storage for sent request
    useEffect(() => {
        if (user?.id && userId) {
            const connectKey = `sent_connect_${user.id}_${userId}`
            setLocalSent(localStorage.getItem(connectKey) === 'true')
        }
    }, [user, userId])

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                // Fetch user profile
                const res = await api.get(`/users/${userId}/public`)
                if (res.data?.success) {
                    setProfile(res.data.user)
                    // Track view if viewer is not the profile owner
                    if (user?.id !== userId) {
                        api.post(`/users/${userId}/view`).catch(() => {})
                    }
                } else {
                    setNotFound(true)
                }
                // Fetch portfolio
                try {
                    const portRes = await api.get(`/portfolios/${userId}`)
                    if (portRes.data?.success) setPortfolio(portRes.data.portfolio)
                } catch (_) {}
            } catch (e) {
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchProfile()
    }, [userId])

    const handleConnect = async () => {
        if (!isAuthenticated) { 
            if (confirm('Please log in or register to connect with talents.')) {
                requireAuth(); 
            }
            return 
        }

        if (!isProfileComplete) {
            alert('Kindly complete your profile (Name & Role/Department) before sending connection requests.');
            navigate('/profile?edit=true');
            return;
        }

        if (connecting || connected || localSent || connectedUserIds.includes(userId)) return
        setConnecting(true)
        const { success } = await sendTargetedNotification(userId, {
            type: 'connect',
            title: 'Connection Request',
            message: `${user.name} wants to connect with you.`,
            metadata: { senderId: user.id, senderName: user.name }
        })
        setConnecting(false)
        if (success) {
            setConnected(true)
            setLocalSent(true)
            localStorage.setItem(`sent_connect_${user.id}_${userId}`, 'true')
        }
    }

    const handleMessage = () => {
        if (!isAuthenticated) { 
            if (confirm('Please log in or register to message talents.')) {
                requireAuth(); 
            }
            return 
        }
        
        // Navigate to explore page and open their profile
        navigate('/explore', { state: { viewProfileId: userId } })
    }

    const handleShareProfile = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: `CastUp: ${profile.name}`,
            text: `Check out ${profile.name}'s professional profile on CastUp!`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Profile link copied to clipboard!');
            }
        } catch (err) {
            console.error('Sharing failed', err);
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Profile link copied to clipboard!');
            } catch (clipErr) {
                alert('Sharing not supported on this browser.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading profile...</p>
                </div>
            </div>
        )
    }

    if (notFound || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'var(--color-bg)' }}>
                <div className="text-6xl mb-4">🎬</div>
                <h1 className="text-2xl font-bold">Profile not found</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>This profile may have been removed or the link is incorrect.</p>
                <Link to="/" className="btn btn-primary mt-2">Go to CastUp</Link>
            </div>
        )
    }

    const socialLinks = typeof profile.socialMedia === 'string'
        ? JSON.parse(profile.socialMedia || '{}')
        : (profile.socialMedia || {})

    const skills = Array.isArray(profile.skills)
        ? profile.skills
        : typeof profile.skills === 'string'
        ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

    const languages = Array.isArray(profile.languages) ? profile.languages : []
    const media = Array.isArray(portfolio?.media) ? portfolio.media : []

    const socialIcons = {
        instagram: <Instagram size={18} />,
        youtube: <Youtube size={18} />,
        linkedin: <Linkedin size={18} />,
        twitter: <Twitter size={18} />,
        website: <Globe size={18} />,
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            {/* Top Nav */}
            <header className="sticky top-0 z-40 border-b flex items-center justify-between px-6 h-14"
                style={{ background: 'rgba(19,17,28,0.90)', backdropFilter: 'blur(12px)', borderColor: 'var(--color-border)' }}>
                <Link to="/" className="flex items-center gap-2">
                    <span className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>CastUp</span>
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handleShareProfile}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                        title="Share Profile"
                    >
                        <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
                    </button>
                    {isAuthenticated ? (
                        <Link to="/home" className="btn btn-primary btn-sm">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
                        </>
                    )}
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Hero Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border overflow-hidden mb-6"
                    style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>

                    {/* Cover banner */}
                    <div className="h-28 w-full" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', opacity: 0.8 }} />

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="-mt-12 mb-4 relative w-fit">
                            {profile.photo ? (
                                <img src={profile.photo} alt={profile.name}
                                    className="w-24 h-24 rounded-2xl object-cover border-4"
                                    style={{ borderColor: 'var(--color-bg-offset)' }} />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black border-4"
                                    style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-bg-offset)' }}>
                                    {profile.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black">{profile.name}</h1>
                                <p className="font-semibold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                                    {profile.role || profile.department || 'Professional'}
                                </p>
                                {profile.location && (
                                    <p className="flex items-center gap-1 text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <MapPin size={13} /> {profile.location}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {profile.experience && (
                                        <span className="badge text-xs"><Briefcase size={11} /> {profile.experience}</span>
                                    )}
                                    {profile.availability && (
                                        <span className="badge badge-success text-xs"><CheckCircle size={11} /> {profile.availability}</span>
                                    )}
                                    {profile.category && (
                                        <span className="badge text-xs">{profile.category}</span>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            {(!user || user.id !== profile.id) && (
                                <div className="flex gap-2 shrink-0">
                                         {connectedUserIds.includes(userId) ? (
                                             <div className="btn btn-sm btn-success flex items-center gap-2 cursor-default">
                                                 <CheckCircle size={15} /> Connected
                                             </div>
                                         ) : (connected || localSent) ? (
                                             <div className="btn btn-sm btn-secondary flex items-center gap-2 cursor-default">
                                                 <UserPlus size={15} /> Request Sent
                                             </div>
                                         ) : (
                                             <button
                                                 onClick={handleConnect}
                                                 disabled={connecting}
                                                 className="btn btn-sm btn-primary flex items-center gap-2"
                                             >
                                                 <UserPlus size={15} />
                                                 {connecting ? 'Sending...' : 'Connect'}
                                             </button>
                                         )}
                                    <button onClick={handleMessage} className="btn btn-secondary btn-sm flex items-center gap-2">
                                        <MessageSquare size={15} /> Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Bio */}
                {profile.bio && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-2xl border p-6 mb-6"
                        style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>
                        <h2 className="font-bold mb-3 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>About</h2>
                        <p className="text-sm leading-relaxed">{profile.bio}</p>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Experience', value: profile.yearsOfExperience ? `${profile.yearsOfExperience} yrs` : '—', icon: <Star size={14} /> },
                        { label: 'Gender', value: profile.gender || '—', icon: null },
                        { label: 'Height', value: profile.height || '—', icon: null },
                        { label: 'Languages', value: languages.length ? languages.join(', ') : '—', icon: <Languages size={14} /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-xl border p-4"
                            style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>
                            <p className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                {icon} {label}
                            </p>
                            <p className="text-sm font-bold truncate">{value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Skills */}
                {skills.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="rounded-2xl border p-6 mb-6"
                        style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>
                        <h2 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                                    style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', borderColor: 'var(--color-primary)30' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Portfolio */}
                {media.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="rounded-2xl border p-6 mb-6"
                        style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>
                        <h2 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Portfolio</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {media.map((item, idx) => (
                                <a key={item.id || idx}
                                    href={item.sourceUrl || '#'}
                                    target={item.sourceUrl ? '_blank' : undefined}
                                    rel="noreferrer"
                                    className="aspect-square rounded-xl border overflow-hidden flex flex-col items-center justify-center text-center p-3 transition-all hover:border-primary group relative"
                                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                    <div style={{ color: 'var(--color-primary)', opacity: 0.4 }} className="group-hover:opacity-80 transition-opacity mb-2">
                                        {item.type?.toLowerCase().includes('video') ? <FileVideo size={28} /> : <Film size={28} />}
                                    </div>
                                    <span className="text-xs font-bold truncate w-full">{item.title}</span>
                                    <span className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{item.type}</span>
                                    {item.sourceUrl && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={12} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Social Links */}
                {Object.keys(socialLinks).some(k => socialLinks[k]) && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="rounded-2xl border p-6 mb-6"
                        style={{ background: 'var(--color-bg-offset)', borderColor: 'var(--color-border)' }}>
                        <h2 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Social & Links</h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(socialLinks).filter(([, v]) => v).map(([key, url]) => (
                                <a key={key} href={url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all hover:border-primary hover:text-primary"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                    {socialIcons[key] || <Globe size={18} />} {key.charAt(0).toUpperCase() + key.slice(1)}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA for non-logged-in users */}
                {!isAuthenticated && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="rounded-2xl p-6 text-center"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary)20, var(--color-accent)10)', border: '1px solid var(--color-primary)30' }}>
                        <h3 className="font-bold text-lg mb-1">Join CastUp to Connect</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Sign up free to connect with {profile.name?.split(' ')[0]} and thousands of film professionals.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link to="/register" className="btn btn-primary">Sign Up Free</Link>
                            <Link to="/login" className="btn btn-secondary">Log In</Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
