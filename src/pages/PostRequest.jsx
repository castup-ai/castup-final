import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { FileText, Upload, Calendar, X, CheckCircle, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const projectTypes = ['Feature Film', 'Short Film', 'Web Series', 'Documentary', 'Music Video', 'Commercial', 'Ad Film', 'Corporate Video', 'Other']

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

export default function PostRequest() {
    const { isAuthenticated, requireAuth, addJob, user } = useAuth()
    const navigate = useNavigate()
    const [submitted, setSubmitted] = useState(false)
    const initialForm = {
        title: '', projectType: '', projectDetails: '',
        startDate: '', endDate: '', documents: [],
        country: '', state: '', city: '',
        category: '', subCategory: '', serviceStart: '', serviceEnd: '',
        lastDateToApply: '', payRate: '', requirements: ''
    }
    const [form, setForm] = useState(initialForm)

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (isAuthenticated) {
            // Relaxed check: Name and either Role or Department
            const isProfileComplete = user && user.name && (user.role || user.department);
            if (!isProfileComplete) {
                alert('Kindly complete your basic profile (Name & Role/Department) before posting a request.')
                navigate('/profile?edit=true')
            }
        } else {
            // Wait a brief moment to avoid flashing during auth check
            setTimeout(() => {
                requireAuth()
            }, 100)
        }
    }, [isAuthenticated, user, navigate, requireAuth])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { requireAuth(); return }

        // Relaxed check: Name and either Role or Department
        const isProfileComplete = user && user.name && (user.role || user.department);
        if (!isProfileComplete) {
            alert('Kindly complete your basic profile before posting a request.')
            navigate('/profile?edit=true')
            return
        }

        // Date Validation: Last Date to Apply must be before Project/Service Start Date
        const applyDate = new Date(form.lastDateToApply)
        const projStart = new Date(form.startDate)
        const servStart = form.serviceStart ? new Date(form.serviceStart) : null

        if (applyDate >= projStart) {
            alert('Last Date to Apply must be before the Project Start Date.')
            return
        }
        if (servStart && applyDate >= servStart) {
            alert('Last Date to Apply must be before the Service Start Date.')
            return
        }

        const jobData = {
            title: form.title,
            description: form.projectDetails,
            projectType: form.projectType,
            category: form.category,
            subCategory: form.subCategory,
            experience: form.experience || 'Any',
            startDate: form.startDate,
            endDate: form.endDate,
            country: form.country,
            state: form.state,
            city: form.city,
            serviceDuration: { start: form.serviceStart, end: form.serviceEnd },
            lastDateToApply: form.lastDateToApply,
            payRate: form.payRate,
            requirements: form.requirements,
            documents: form.documents
        }

        try {
            const result = await addJob(jobData)
            if (result.success) {
                setSubmitted(true)
            } else {
                alert(result.error || 'Failed to create request. Please try again.')
            }
        } catch (err) {
            console.error("Job Creation Error:", err)
            alert('An unexpected error occurred while creating the request.')
        }
    }

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-16">
                <div className="avatar avatar-xl mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Request Posted!</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>Your crew call has been published and is now visible to all professionals.</p>
                <button className="btn btn-primary" onClick={() => {
                    resetForm()
                    setSubmitted(false)
                }}>Post Another</button>
            </motion.div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-1">Post a Request</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    Find the perfect crew for your next project
                </p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                {/* Project Information */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText size={18} style={{ color: 'var(--color-primary-light)' }} /> Project Information
                    </h2>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label>Project Title *</label>
                            <input placeholder="e.g. Independent Feature Film" required
                                value={form.title} onChange={e => update('title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Project Type *</label>
                            <select required value={form.projectType} onChange={e => update('projectType', e.target.value)}>
                                <option value="">Select type</option>
                                {projectTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Project Details *</label>
                            <textarea rows={4} placeholder="Describe your project..." required
                                value={form.projectDetails} onChange={e => update('projectDetails', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input type="date" required value={form.startDate}
                                    onChange={e => update('startDate', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>End Date *</label>
                                <input type="date" required value={form.endDate}
                                    min={form.startDate || undefined}
                                    disabled={!form.startDate}
                                    onChange={e => update('endDate', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Attach Documents (PDF)</label>
                            <div className="file-upload" onClick={() => document.getElementById('doc-upload')?.click()}>
                                <Upload size={20} className="mx-auto mb-2" />
                                <p className="text-sm">Click to upload PDFs</p>
                            </div>
                            <input type="file" id="doc-upload" multiple accept=".pdf" className="hidden" style={{ display: 'none' }}
                                onChange={e => {
                                    const newFiles = Array.from(e.target.files);
                                    update('documents', [...form.documents, ...newFiles]);
                                }} />

                            {form.documents && form.documents.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {form.documents.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-primary truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = form.documents.filter((_, i) => i !== idx);
                                                    update('documents', updated);
                                                }}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="form-group">
                                <label>Country *</label>
                                <input placeholder="Country" required value={form.country}
                                    onChange={e => update('country', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input placeholder="State" value={form.state}
                                    onChange={e => update('state', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input placeholder="City" value={form.city}
                                    onChange={e => update('city', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Job Requirements */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={18} style={{ color: 'white' }} /> Job Requirements
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Category *</label>
                                <select required value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}>
                                    <option value="">Choose a category</option>
                                    <option value="Artist">Artist</option>
                                    <option value="Crew">Crew</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sub Category *</label>
                                <select required value={form.subCategory} onChange={e => update('subCategory', e.target.value)}>
                                    <option value="">Select role</option>
                                    {(form.category === 'Crew' ? CREW_ROLES : ARTIST_ROLES).map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Service Start Date</label>
                                <input type="date" value={form.serviceStart}
                                    onChange={e => update('serviceStart', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Service End Date</label>
                                <input type="date" value={form.serviceEnd}
                                    min={form.serviceStart || undefined}
                                    onChange={e => update('serviceEnd', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Last Date to Apply *</label>
                                <input type="date" required value={form.lastDateToApply}
                                    max={(() => {
                                        const dates = [form.startDate, form.serviceStart].filter(Boolean)
                                        return dates.length > 0 ? dates.sort()[0] : undefined
                                    })()}
                                    onChange={e => update('lastDateToApply', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Pay Rate</label>
                                <input placeholder="e.g. ₹50,000 - ₹1,00,000" value={form.payRate}
                                    onChange={e => update('payRate', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Requirements *</label>
                            <textarea rows={4} placeholder="Describe required skills, experience, etc." required
                                value={form.requirements} onChange={e => update('requirements', e.target.value)} />
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <FileText size={16} /> Create
                    </button>
                </div>
            </form>
        </div>
    )
}
