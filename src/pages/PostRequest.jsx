import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { FileText, Upload, Calendar, X, CheckCircle, Trash2, MapPin, Users, Eye } from 'lucide-react'
import api from '@/services/api'
import { castingService } from '@/services/casting.service'
import { useNavigate, useLocation } from 'react-router-dom'
import { Share2 } from 'lucide-react'

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
    const { isAuthenticated, requireAuth, addJob, updateJob, user, isProfileComplete, allJobs, deleteJob } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
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
    const [deleteId, setDeleteId] = useState(null)
    const [uploadingDocs, setUploadingDocs] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    
    // Get today's date in local YYYY-MM-DD format for date input mins
    const today = new Date().toLocaleDateString('sv-SE');

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleViewApplicants = async (job) => {
        setViewingJob(job)
        setLoadingApplicants(true)
        const res = await castingService.getJobApplicants(job.id)
        if (res.success) {
            setApplicants(res.data || [])
        } else {
            console.error(res.error)
        }
        setLoadingApplicants(false)
    }

    useEffect(() => {
        if (isAuthenticated) {
            if (!isProfileComplete) {
                alert('Kindly complete your basic profile (Name & Role/Department) before posting a request.')
                navigate('/profile?edit=true')
            }

            // Check if we're coming from Find Work with an editJob state
            if (location.state?.editJob) {
                handleEdit(location.state.editJob);
                // Clear state so it doesn't re-trigger on refresh
                window.history.replaceState({}, document.title);
            }
        } else {
            // Wait a brief moment to avoid flashing during auth check
            setTimeout(() => {
                requireAuth()
            }, 100)
        }
    }, [isAuthenticated, isProfileComplete, navigate, requireAuth, location.state])

    const uploadDocuments = async (files) => {
        if (!files || files.length === 0) return [];
        
        setUploadingDocs(true);
        const uploaded = [];
        
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', file.name);
                
                const res = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (res.data.success) {
                    uploaded.push({
                        name: res.data.file.name,
                        url: res.data.file.file_url,
                        type: file.type
                    });
                }
            }
            return uploaded;
        } catch (error) {
            console.error("Error uploading documents:", error);
            alert("Some documents failed to upload. Creating post without them.");
            return uploaded;
        } finally {
            setUploadingDocs(false);
        }
    };

    const handleEdit = (job) => {
        setIsEditing(true)
        setEditingId(job.id)
        
        // Populate form with existing data
        setForm({
            title: job.title || '',
            projectType: job.projectType || '',
            projectDetails: job.description || '',
            startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
            endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
            documents: [], // We don't repopulate files but keep existing ones in backend if not changed
            existingDocuments: job.documents || [],
            country: job.country || '',
            state: job.state || '',
            city: job.city || '',
            category: job.category || '',
            subCategory: job.subCategory || '',
            serviceStart: job.serviceDuration?.start ? new Date(job.serviceDuration.start).toISOString().split('T')[0] : '',
            serviceEnd: job.serviceDuration?.end ? new Date(job.serviceDuration.end).toISOString().split('T')[0] : '',
            lastDateToApply: job.lastDateToApply ? new Date(job.lastDateToApply).toISOString().split('T')[0] : '',
            payRate: job.payRate || '',
            requirements: job.requirements || ''
        })

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    };

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditingId(null)
        resetForm()
    }

    const handleShare = async (job) => {
        const shareUrl = `${window.location.origin}/find-work?jobId=${job.id}`;
        const shareData = {
            title: `CastUp: ${job.title}`,
            text: `Check out this ${job.projectType} opportunity for ${job.subCategory} on CastUp!`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Sharing failed', err);
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            } catch (clipErr) {
                alert('Sharing not supported on this browser.');
            }
        }
    };

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

        setIsSubmitting(true)
        
        let uploadedDocs = [];
        if (form.documents.length > 0) {
            uploadedDocs = await uploadDocuments(form.documents);
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
            documents: isEditing 
                ? [...(form.existingDocuments || []), ...uploadedDocs]
                : uploadedDocs
        }
        try {
            let result;
            if (isEditing) {
                result = await updateJob(editingId, jobData)
            } else {
                result = await addJob(jobData)
            }

            if (result.success) {
                if (isEditing) {
                    alert('Request updated successfully!')
                    setIsEditing(false)
                    setEditingId(null)
                    resetForm()
                } else {
                    setSubmitted(true)
                }
            } else {
                const errorMsg = result.details 
                    ? `${result.error}: ${result.details}`
                    : result.error || 'Failed to save request. Please try again.';
                alert(errorMsg)
            }
        } catch (err) {
            console.error("Job Save Error:", err)
            const msg = err.response?.data?.error || err.message || 'An unexpected error occurred';
            alert(`Error saving request: ${msg}`)
        } finally {
            setIsSubmitting(false)
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
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{isEditing ? 'Edit Request' : 'Post a Request'}</h1>
                        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                            {isEditing ? 'Update your project details and requirements' : 'Find the perfect crew for your next project'}
                        </p>
                    </div>
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
                                    const MAX_SIZE = 10 * 1024 * 1024;
                                    if (newFiles.some(f => f.size > MAX_SIZE)) {
                                        alert("One or more files exceed the 10MB limit for the free tier.");
                                        return;
                                    }
                                    update('documents', [...form.documents, ...newFiles]);
                                }} />

                            {form.existingDocuments && form.existingDocuments.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Existing Documents</p>
                                    {form.existingDocuments.map((doc, idx) => (
                                        <div key={`exist-${idx}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-sm font-bold opacity-70 truncate max-w-[200px]">{doc.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = form.existingDocuments.filter((_, i) => i !== idx);
                                                    update('existingDocuments', updated);
                                                }}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {form.documents && form.documents.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">New Documents</p>
                                    {form.documents.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-primary">
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
                    <button type="button" className="btn btn-secondary" onClick={isEditing ? handleCancelEdit : resetForm}>
                        <X size={16} /> {isEditing ? 'Cancel Edit' : 'Cancel'}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <FileText size={16} /> {isEditing ? 'Update Request' : 'Create'}
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
                        {(allJobs || []).filter(j => j.createdBy?.id === user?.id).length} Active
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
                                { (allJobs || []).filter(j => j.createdBy?.id === user?.id).length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <FileText size={48} className="mb-4" />
                                                <p className="text-sm font-bold">No requests posted yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    (allJobs || []).filter(j => j.createdBy?.id === user?.id).map((job) => (
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
                                                         onClick={() => handleShare(job)}
                                                         className="w-8 h-8 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                         title="Share Posting"
                                                     >
                                                         <Share2 size={14} />
                                                     </button>
                                                     <button 
                                                         onClick={() => navigate('/find-work', { state: { selectedJobId: job.id } })}
                                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        title="View Details"
                                                    >
                                                        <FileText size={14} className="opacity-60" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(job)}
                                                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        title="Edit Post"
                                                    >
                                                        <Upload size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteId(job.id)}
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
                                <div className="space-y-4">
                                    {applicants.map((app, idx) => {
                                        const safeSocialLinks = typeof app.socialLinks === 'string' ? JSON.parse(app.socialLinks || '{}') : (app.socialLinks || {});
                                        const safePortfolioFiles = typeof app.portfolioFiles === 'string' ? JSON.parse(app.portfolioFiles || '[]') : (app.portfolioFiles || []);
                                        
                                        return (
                                            <div key={idx} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] hover:border-primary/30">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            {app.appliedPhoto ? (
                                                                <img src={app.appliedPhoto} alt="" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl">
                                                                    {app.user?.name?.[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-lg group-hover:text-primary transition-colors">{app.user?.name} {app.user?.lastName}</div>
                                                            <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                                                {app.category} • {app.appliedRole || app.user?.role || 'Professional'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/explore`, { state: { viewProfileId: app.user?.id, fromJobs: true } })}
                                                        className="btn btn-secondary btn-xs px-3 py-1 flex items-center gap-2 h-auto"
                                                    >
                                                        <Eye size={12} /> Profile
                                                    </button>
                                                </div>
                                                
                                                <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-medium opacity-70">
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black">Age:</span>
                                                        <span>{app.appliedAge || app.user?.age || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black">Gender:</span>
                                                        <span>{app.appliedGender || app.user?.gender || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black">Phone:</span>
                                                        <span className="text-primary font-bold">{app.appliedPhone || app.user?.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black">Whatsapp:</span>
                                                        <span className="text-success font-bold">{app.appliedWhatsapp || app.user?.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black">Email:</span>
                                                        <span className="font-bold">{app.appliedEmail || app.user?.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="col-span-2 flex items-start gap-2">
                                                        <span className="opacity-40 uppercase tracking-wider text-[9px] w-12 font-black pt-0.5">Address:</span>
                                                        <span className="flex-1">{app.appliedAddress || app.user?.location || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {app.message && (
                                                    <div className="mt-4 p-4 rounded-xl bg-black/30 text-xs italic opacity-90 leading-relaxed border-l-2 border-primary">
                                                        <span className="block not-italic text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Message:</span>
                                                        "{app.message}"
                                                    </div>
                                                )}

                                                {safeSocialLinks && Object.values(safeSocialLinks).some(Boolean) && (
                                                    <div className="mt-4 space-y-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Links & Projects</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(safeSocialLinks).filter(([_, url]) => url).map(([platform, url], i) => (
                                                                <a key={i} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" 
                                                                   className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all capitalize">
                                                                    <Globe size={10} /> {platform}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {safePortfolioFiles && safePortfolioFiles.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Portfolio Files</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {safePortfolioFiles.map((pf, i) => (
                                                                <a key={i} href={pf.url || pf} target="_blank" rel="noreferrer" 
                                                                   className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                                                                    <FileText size={12} /> {pf.name || `File ${i+1}`}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="mt-6 pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-4 text-[10px] font-bold opacity-30">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={10} /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                        </span>
                                                        {app.user?.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={10} /> {app.user.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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

            {/* Deletion Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="card w-full max-w-sm p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-danger/20 text-danger flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Delete Posting?</h3>
                            <p className="text-sm opacity-60 mb-8">This action cannot be undone. All applications for this job will also be removed.</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 h-12 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                 <button 
                                     onClick={async () => {
                                         const id = deleteId;
                                         setDeleteId(null);
                                         const result = await deleteJob(id);
                                         if (!result.success) {
                                             alert(result.error || 'Failed to delete job posting.');
                                         } else {
                                             alert('Job posting deleted successfully.');
                                         }
                                     }}
                                     className="flex-1 h-12 rounded-xl bg-danger text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-danger/20"
                                 >
                                     Delete
                                 </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
