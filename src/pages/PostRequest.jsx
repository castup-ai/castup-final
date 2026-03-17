import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { FileText, Upload, Calendar, X, CheckCircle, Trash2, MapPin, Users, Eye } from 'lucide-react'
import api from '@/services/api'
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
    const { isAuthenticated, requireAuth, addJob, user, isProfileComplete, allJobs, deleteJob } = useAuth()
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
    const [viewingJob, setViewingJob] = useState(null)
    const [applicants, setApplicants] = useState([])
    const [loadingApplicants, setLoadingApplicants] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Get today's date in YYYY-MM-DD format for date input mins
    const today = new Date().toISOString().split('T')[0];

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (isAuthenticated) {
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
    }, [isAuthenticated, isProfileComplete, navigate, requireAuth])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!isAuthenticated) { requireAuth(); return }

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
            // Map File objects to serializable metadata since we're sending JSON
            documents: form.documents.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size,
                lastModified: f.lastModified
            }))
        }

        setIsSubmitting(true)
        try {
            const result = await addJob(jobData)
            if (result.success) {
                setSubmitted(true)
            } else {
                const errorMsg = result.details 
                    ? `${result.error}: ${result.details}`
                    : result.error || 'Failed to create request. Please try again.';
                alert(errorMsg)
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

    const handleViewApplicants = async (job) => {
        setViewingJob(job)
        setLoadingApplicants(true)
        try {
            const res = await api.get(`/casting/${job.id}/applicants`)
            if (res.data.success) {
                setApplicants(res.data.applicants)
            }
        } catch (e) {
            console.error("Error fetching applicants:", e)
        } finally {
            setLoadingApplicants(false)
        }
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
                                    min={today}
                                    onChange={e => update('startDate', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>End Date *</label>
                                <input type="date" required value={form.endDate}
                                    min={form.startDate || today}
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
                                    min={today}
                                    onChange={e => update('serviceStart', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Service End Date</label>
                                <input type="date" value={form.serviceEnd}
                                    min={form.serviceStart || today}
                                    onChange={e => update('serviceEnd', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Last Date to Apply *</label>
                                <input type="date" required value={form.lastDateToApply}
                                    min={today}
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
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FileText size={16} /> Create
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* My Posted Requests History Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 mb-20">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">My Posted Requests</h2>
                        <p className="text-sm font-medium opacity-50">Manage your active and previous crew calls</p>
                    </div>
                    <div className="badge badge-primary font-bold px-4 py-2">
                        {allJobs.filter(j => j.createdBy?.id === user?.id).length} Active
                    </div>
                </div>

                <div className="card overflow-hidden border-0 shadow-2xl" style={{ background: 'var(--color-card)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Job Info</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Location</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Deadline</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Status</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {allJobs.filter(j => j.createdBy?.id === user?.id).length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <FileText size={48} className="mb-4" />
                                                <p className="text-sm font-bold">No requests posted yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    allJobs.filter(j => j.createdBy?.id === user?.id).map((job) => (
                                        <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shadow-inner">
                                                        {job.title[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm leading-tight mb-0.5">{job.title}</div>
                                                        <div className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter italic">
                                                            {job.projectType} • {job.subCategory}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold opacity-70">
                                                    <MapPin size={12} className="text-primary" />
                                                    {job.city || job.location || 'Remote'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold opacity-70">
                                                    <Calendar size={12} className="text-accent" />
                                                    {job.lastDateToApply ? new Date(job.lastDateToApply).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${job.status === 'open' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                                    {job.status || 'open'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => navigate('/find-work', { state: { selectedJobId: job.id } })}
                                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        title="View Details"
                                                    >
                                                        <FileText size={14} className="opacity-60" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this job posting?')) {
                                                                deleteJob(job.id);
                                                            }
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleViewApplicants(job)}
                                                        className="px-3 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-tighter"
                                                        title="View Applicants"
                                                    >
                                                        <Users size={14} />
                                                        Applicants
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2 opacity-30">
                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Monitoring Active</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-30">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Cloud Encrypted</span>
                    </div>
                </div>
            </motion.div>

            {/* Applicants Modal */}
            {viewingJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-white/10"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-black">Applicants for {viewingJob.title}</h3>
                                <p className="text-xs font-medium opacity-50 uppercase tracking-widest mt-1">
                                    {applicants.length} Total Applications
                                </p>
                            </div>
                            <button 
                                onClick={() => { setViewingJob(null); setApplicants([]); }}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {loadingApplicants ? (
                                <div className="py-12 flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold opacity-50">Fetching applicants...</p>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="py-12 flex flex-col items-center opacity-30 text-center">
                                    <Users size={48} className="mb-4" />
                                    <p className="text-sm font-bold">No applications yet.</p>
                                    <p className="text-xs max-w-xs mt-1">Once professionals apply to your request, they will appear here.</p>
                                </div>
                            ) : (
                                applicants.map((app, idx) => (
                                    <div key={idx} className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] hover:border-primary/30">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {app.user?.photo ? (
                                                        <img src={app.user.photo} alt="" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg">
                                                            {app.user?.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-[#13111c]"></div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base group-hover:text-primary transition-colors">{app.user?.name}</div>
                                                    <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                                        {app.user?.role || app.user?.department || 'Professional'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => navigate(`/profile/${app.user?.id}`)}
                                                    className="btn btn-secondary btn-sm px-4 flex items-center gap-2"
                                                >
                                                    <Eye size={14} /> Profile
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {app.message && (
                                            <div className="mt-4 p-3 rounded-xl bg-black/20 text-xs italic opacity-80 leading-relaxed border-l-2 border-primary/30">
                                                "{app.message}"
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold opacity-40">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} /> Applied {new Date(app.timestamp || viewingJob.created_at).toLocaleDateString()}
                                            </span>
                                            {app.user?.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={10} /> {app.user.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                            <button 
                                onClick={() => { setViewingJob(null); setApplicants([]); }}
                                className="btn btn-secondary btn-sm px-6"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
