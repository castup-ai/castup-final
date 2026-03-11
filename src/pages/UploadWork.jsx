import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Upload, Film, CheckCircle, X, Trash2, FileText, Loader2 } from 'lucide-react'
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

export default function UploadWork() {
    const { isAuthenticated, requireAuth, user } = useAuth()
    const navigate = useNavigate()
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const initialForm = {
        title: '', type: '', description: '', castCrew: '', files: null
    }
    const [form, setForm] = useState(initialForm)

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (isAuthenticated) {
            const isProfileComplete = user && (user.name?.split(" ")[0]) && user.role
            if (!isProfileComplete) {
                alert('Kindly complete your profile before uploading work.')
                navigate('/profile')
            }
        } else {
            // Wait a brief moment to avoid flashing during auth check
            setTimeout(() => {
                requireAuth()
            }, 100)
        }
    }, [isAuthenticated, user, navigate, requireAuth])

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { requireAuth(); return }

        const isProfileComplete = user && (user.name?.split(" ")[0]) && user.role
        if (!isProfileComplete) {
            alert('Kindly complete your profile before uploading work.')
            navigate('/profile')
            return
        }

        const requiredFields = ['title', 'type', 'description', 'castCrew']
        const missing = requiredFields.filter(f => !form[f])

        if (missing.length > 0) {
            alert('Please complete all required project details before submitting.')
            return
        }

        setIsLoading(true)

        try {
            // Convert files to Base64 data strings so they can be securely saved in the database
            const filesMeta = form.files ? await Promise.all(Array.from(form.files).map(async f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                data: await fileToBase64(f)
            }))) : []

            await api.post('/portfolios/media', {
                title: form.title,
                type: form.type,
                description: form.description,
                castCrew: form.castCrew,
                files: filesMeta
            })
            setSubmitted(true)
        } catch (error) {
            console.error('Error uploading work:', error)
            alert('Encountered an error saving your project to your portfolio. Please try again.')
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
                <button className="btn btn-primary" onClick={() => {
                    resetForm()
                    setSubmitted(false)
                }}>Upload Another</button>
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


                {/* Project Details */}
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
                        <div className="form-group">
                            <label>Upload Files (Videos, Images)</label>
                            <div className="file-upload" onClick={() => document.getElementById('work-upload')?.click()}>
                                <Upload size={24} className="mx-auto mb-2" />
                                <p className="text-sm font-medium">Click to upload or drag files here</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>MP4, MOV, JPG, PNG supported</p>
                            </div>
                            <input type="file" id="work-upload" multiple accept="video/*,image/*" style={{ display: 'none' }}
                                onChange={e => {
                                    const newFiles = Array.from(e.target.files);
                                    setForm(prev => ({
                                        ...prev,
                                        files: prev.files ? [...Array.from(prev.files), ...newFiles] : newFiles
                                    }));
                                }} />

                            {form.files && form.files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {Array.from(form.files).map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-secondary/5 rounded-xl border border-secondary/10 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                                    <FileText size={14} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-xs font-bold text-secondary truncate max-w-[200px]">{file.name}</div>
                                                    <div className="text-[10px] text-text-dim">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const updated = Array.from(form.files).filter((_, i) => i !== idx);
                                                    update('files', updated.length > 0 ? updated : null);
                                                }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isLoading}>
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    )
}
