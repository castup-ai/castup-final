import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Upload, Film, CheckCircle, X, Loader2, Link, Youtube, Instagram, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

const projectTypes = ['Feature Film', 'Short Film', 'Web Series', 'Documentary', 'Music Video', 'Commercial', 'Ad Film', 'Other']

const ARTIST_ROLES = [
    'Actor', 'Actress', 'Child Artist', 'Female Model', 'Female Singer',
    'Influencers', 'Male Model', 'Male Singer'
]

const CREW_ROLES = [
    'Action Choreographer', 'Ad Film Maker', 'Ariel Cinematographer', 'Anchor',
    'Art Director', 'Artist Management', 'Assistant Director', 'Associate Director',
    'Associate Producer', 'Boom Operator', 'Camera Assistant', 'Camera Associate',
    'Casting Director', 'Colourist', 'Content Writer', 'Co Producer',
    'Costume Director', 'Creative Producer', 'Dance Choreographer', 'Dancer',
    'Digital Marketing', 'Director', 'Director Of Photography', 'Editor',
    'Executive Producer', 'Film Critic', 'Film Distributor', 'Film Unit',
    'Financial Or Investor', 'Focus Puller', 'Foley', 'Gaffer', 'Light Man',
    'Live Producer', 'Location Manager', 'Makeup', 'Movie Promoter',
    'Music Director', 'Music Programmer', 'Photographer', 'Poster Design',
    'Producer', 'Production Controller', 'Prosthetic', 'Script Writer',
    'Sound Design', 'Sound Mixing Engineer', 'Spot Editor', 'Still Photographer',
    'Story Board', 'Stunt Man', 'Sync Sound', 'VFX', 'Voice Over'
]

const detectSourceType = (url) => {
    if (!url) return 'link'
    if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('instagram')) return 'instagram'
    return 'link'
}

const getSourceIcon = (url) => {
    const type = detectSourceType(url)
    if (type === 'youtube') return <Youtube size={16} className="text-red-400" />
    if (type === 'instagram') return <Instagram size={16} className="text-pink-400" />
    return <Globe size={16} className="text-blue-400" />
}

export default function UploadWork() {
    const { isAuthenticated, requireAuth, user, isProfileComplete } = useAuth()
    const navigate = useNavigate()
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const initialForm = {
        title: '', type: '', description: '', castCrew: '', sourceUrl: '',
        document: null
    }
    const [form, setForm] = useState(initialForm)

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (isAuthenticated) {
            if (!isProfileComplete) {
                alert('Kindly complete your basic profile (Name & Role/Department) before uploading work.');
                navigate('/profile?edit=true');
            }
        } else {
            setTimeout(() => { requireAuth() }, 100)
        }
    }, [isAuthenticated, isProfileComplete, navigate, requireAuth])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { requireAuth(); return }

        if (!isProfileComplete) {
            alert('Kindly complete your basic profile before uploading work.');
            navigate('/profile?edit=true');
            return;
        }

        const requiredFields = ['title', 'type', 'description', 'castCrew']
        const missing = requiredFields.filter(f => !form[f])
        if (missing.length > 0) {
            alert('Please complete all required project details before submitting.')
            return
        }

        if (!form.document && !form.sourceUrl) {
            alert('You must provide either a link (YouTube/Instagram) or upload a file/document to showcase your work.')
            return
        }

        setIsLoading(true)
        try {
            let documentUrl = null;
            if (form.document) {
                // Actually upload the document to Cloudinary
                const uploadData = new FormData();
                uploadData.append('files', form.document);
                
                try {
                    const uploadRes = await api.post('/upload', uploadData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    if (uploadRes.data.success && uploadRes.data.urls.length > 0) {
                        documentUrl = uploadRes.data.urls[0].url;
                    }
                } catch (uploadErr) {
                    console.error('File upload failed:', uploadErr);
                    alert('Failed to upload the document. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }

            const payloadData = {
                title: form.title,
                type: form.type,
                description: form.description,
                castCrew: form.castCrew,
                sourceUrl: form.sourceUrl || null,
                sourceType: detectSourceType(form.sourceUrl),
                documentUrl: documentUrl
            };

            await api.post('/portfolios/media', payloadData)
            setSubmitted(true)
        } catch (error) {
            console.error('Error uploading work:', error)
            alert('Encountered an error saving your project. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-16">
                <div className="avatar avatar-xl mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Work Uploaded!</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>Your project has been published to your portfolio.</p>
                <button className="btn btn-primary" onClick={() => { resetForm(); setSubmitted(false) }}>Upload Another</button>
            </motion.div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-1">Upload Your Work</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    Showcase your films, reels, and creative projects
                </p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Film size={18} style={{ color: 'var(--color-secondary)' }} /> Project Details
                    </h2>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label>Title *</label>
                            <input placeholder="Project title" required value={form.title}
                                onChange={e => update('title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Type *</label>
                            <select required value={form.type} onChange={e => update('type', e.target.value)}>
                                <option value="">Select project type</option>
                                {projectTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description *</label>
                            <textarea rows={4} placeholder="Describe your project, story, and creative vision..."
                                required value={form.description}
                                onChange={e => update('description', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Cast & Crew Details *</label>
                            <textarea required rows={3} placeholder="List the cast and crew members involved..."
                                value={form.castCrew}
                                onChange={e => update('castCrew', e.target.value)} />
                        </div>

                        {/* URL Input */}
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <Link size={14} /> Video / Portfolio Link
                                <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    placeholder="YouTube, Instagram, Vimeo, or Google Drive link..."
                                    value={form.sourceUrl}
                                    onChange={e => update('sourceUrl', e.target.value)}
                                    className="pr-10"
                                />
                                {form.sourceUrl && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {getSourceIcon(form.sourceUrl)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Document Upload - NEW */}
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <Upload size={14} /> Attach Script/Document
                                <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional, PDF only)</span>
                            </label>
                            <div 
                                className="file-upload p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-primary/5 transition-colors"
                                onClick={() => document.getElementById('work-doc-upload')?.click()}
                            >
                                {form.document ? (
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-success" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">{form.document.name}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="text-danger hover:text-danger/80"
                                            onClick={(e) => { e.stopPropagation(); update('document', null); }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={20} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Click to upload PDF document</p>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" id="work-doc-upload" accept=".pdf" className="hidden" 
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file && file.size > 10 * 1024 * 1024) {
                                        alert("File too large. Maximum size for the free tier is 10MB.");
                                        return;
                                    }
                                    update('document', file);
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="flex gap-3 justify-end">
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isLoading}>
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isLoading ? 'Saving...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    )
}
