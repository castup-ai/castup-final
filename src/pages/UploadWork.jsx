import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Upload, Film, CheckCircle, X, Trash2, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
    const initialForm = {
        name: '', category: '', subcategory: '', age: '', gender: '', email: '',
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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!isAuthenticated) { requireAuth(); return }

        const isProfileComplete = user && (user.name?.split(" ")[0]) && user.role
        if (!isProfileComplete) {
            alert('Kindly complete your profile before uploading work.')
            navigate('/profile')
            return
        }

        const requiredFields = ['category', 'subcategory', 'age', 'gender', 'title', 'type', 'description', 'castCrew']
        const missing = requiredFields.filter(f => !form[f])

        if (missing.length > 0 || !form.files || form.files.length === 0) {
            alert('Please complete all fields and upload at least one file before submitting.')
            return
        }

        setSubmitted(true)
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
                {/* Personal Info */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Upload size={18} style={{ color: 'var(--color-primary-light)' }} /> Your Details
                    </h2>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label>Name</label>
                            <input value={user ? `${user.name}` : form.name}
                                readOnly={!!user} style={user ? { opacity: 0.7 } : {}}
                                placeholder="Your full name"
                                onChange={e => update('name', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label>Category</label>
                                <select required value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}>
                                    <option value="">Choose a category</option>
                                    <option value="Artist">Artist</option>
                                    <option value="Crew">Crew</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Subcategory / Role *</label>
                                <select required value={form.subcategory} onChange={e => update('subcategory', e.target.value)}>
                                    <option value="">Select role</option>
                                    {(form.category === 'Crew' ? CREW_ROLES : ARTIST_ROLES).map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label>Age *</label>
                                <input required type="number" placeholder="Age" min="0" value={form.age}
                                    onChange={e => update('age', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Gender *</label>
                                <select required value={form.gender} onChange={e => update('gender', e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={user?.email || form.email}
                                    readOnly={!!user} style={user ? { opacity: 0.7 } : {}}
                                    placeholder="your@email.com"
                                    onChange={e => update('email', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </motion.div>

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
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Upload size={16} /> Upload
                    </button>
                </div>
            </form>
        </div>
    )
}
