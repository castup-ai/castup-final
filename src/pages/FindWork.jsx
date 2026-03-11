import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import {
    Briefcase, MapPin, Calendar, Clock, DollarSign, Share2, X,
    User, ChevronRight, CheckCircle, AlertCircle, Search, Sliders,
    Clapperboard, Heart, Eye, Filter, Trash2, Instagram, Linkedin, Youtube, Globe,
    Camera, Video, Link as LinkIcon, ArrowRight, FileText, ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

const PROJECT_TYPES = ['Feature Film', 'Short Film', 'Web Series', 'Documentary', 'Music Video', 'Commercial', 'Ad Film', 'Corporate Video', 'Other']

export default function FindWork() {
    const { allJobs, isAuthenticated, requireAuth, user, deleteJob } = useAuth()
    const navigate = useNavigate()
    const [selectedJob, setSelectedJob] = useState(null)
    const [showApply, setShowApply] = useState(false)
    const [applied, setApplied] = useState(false)
    const [applyForm, setApplyForm] = useState({
        category: 'Artist', role: '', age: '', gender: '', phone: '', whatsapp: '',
        gmail: '', address: '', additionalInfo: '', photo: null,
        portfolioFiles: null, socialLinks: { instagram: '', linkedin: '', youtube: '', other: '' }
    })

    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [statusFilter, setStatusFilter] = useState('All') // All, Open, Closed
    const [filters, setFilters] = useState({
        sortBy: 'newest',
        projectType: '',
        subCategory: '',
        experience: '',
        country: '',
        state: ''
    })

    const isProfileComplete = user && (user.name?.split(" ")[0]) && user.role

    // Derived lists for filters
    const uniqueCountries = useMemo(() => [...new Set(allJobs.map(j => j.country).filter(Boolean))].sort(), [allJobs])
    const uniqueStates = useMemo(() => {
        if (!filters.country) return [...new Set(allJobs.map(j => j.state).filter(Boolean))].sort()
        return [...new Set(allJobs.filter(j => j.country === filters.country).map(j => j.state).filter(Boolean))].sort()
    }, [allJobs, filters.country])

    // Filtering logic
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            const matchesSearch = !searchQuery ||
                (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.details?.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesProjectType = !filters.projectType || job.projectType === filters.projectType
            const matchesSubCategory = !filters.subCategory || job.subCategory === filters.subCategory
            const matchesCountry = !filters.country || job.country === filters.country
            const matchesState = !filters.state || job.state === filters.state

            // Experience and Availability logic (Simplified for placeholder use)
            const isClosed = job.lastDateToApply && new Date(job.lastDateToApply) < new Date()
            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Open' && !isClosed) ||
                (statusFilter === 'Closed' && isClosed)

            return matchesSearch && matchesProjectType && matchesSubCategory && matchesCountry && matchesState && matchesStatus
        }).sort((a, b) => {
            if (filters.sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            if (filters.sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            if (filters.sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '')
            if (filters.sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '')
            return 0
        })
    }, [allJobs, searchQuery, filters, statusFilter])

    const handleApply = (e) => {
        e.preventDefault()

        // Validation for mandatory fields
        const requiredFields = [
            { key: 'role', label: 'Role' },
            { key: 'age', label: 'Age' },
            { key: 'gender', label: 'Gender' },
            { key: 'phone', label: 'Phone' },
            { key: 'whatsapp', label: 'WhatsApp' },
            { key: 'gmail', label: 'Email' },
            { key: 'address', label: 'Address' }
        ];

        const missing = requiredFields.filter(f => {
            const val = applyForm[f.key] || (f.key === 'gmail' ? user?.email : '') || (f.key === 'phone' ? user?.phone : '');
            return !val;
        });

        const isAgeInvalid = applyForm.age && parseInt(applyForm.age) <= 0;

        // Add portfolio check
        const hasPortfolio = applyForm.portfolioFiles && applyForm.portfolioFiles.length > 0;

        if (missing.length > 0 || !hasPortfolio || isAgeInvalid) {
            if (isAgeInvalid) {
                alert("Age cannot be negative or zero.");
                return;
            }
            let message = "Kindly provide your ";
            if (missing.length > 0) {
                message += missing.map(f => f.label).join(', ');
            }
            if (!hasPortfolio) {
                message += (missing.length > 0 ? " and " : "") + "upload your Images and Videos";
            }
            message += " before applying.";
            alert(message);
            return;
        }

        setApplied(true)
        setShowApply(false)
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Find Work</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Showing {filteredJobs.length} opportunities for you
                        </p>
                    </div>
                </div>

                {/* Search and Tabs */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-dim)' }} />
                            <input
                                type="text"
                                placeholder="Search by project name, description or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[45px] pl-10 pr-4 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-primary/20"
                                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 h-[45px] rounded-xl border text-sm font-semibold transition-all ${showFilters ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-border hover:border-primary/50'}`}
                            style={!showFilters ? { background: 'var(--color-card)', borderColor: 'var(--color-border)' } : {}}
                        >
                            <Sliders size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2">
                        {['All', 'Open', 'Closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${statusFilter === status ? 'bg-primary text-white shadow-md' : 'bg-card border border-border hover:border-primary/50'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Expanded Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="card p-6 shadow-sm border-0" style={{ background: 'var(--color-bg-offset)' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="newest">Most Recent</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="title-asc">Title (A-Z)</option>
                                        <option value="title-desc">Title (Z-A)</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">Project Type</label>
                                    <select
                                        value={filters.projectType}
                                        onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="">All Project Types</option>
                                        {PROJECT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">Subcategory</label>
                                    <select
                                        value={filters.subCategory}
                                        onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="">All Subcategories</option>
                                        {[...ARTIST_ROLES, ...CREW_ROLES].sort().map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">Experience</label>
                                    <select
                                        value={filters.experience}
                                        onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="">Any Experience</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">Country</label>
                                    <select
                                        value={filters.country}
                                        onChange={(e) => setFilters({ ...filters, country: e.target.value, state: '' })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="">All Countries</option>
                                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block opacity-60">State</label>
                                    <select
                                        value={filters.state}
                                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                                        className="h-[40px] text-xs bg-card border-border rounded-lg"
                                    >
                                        <option value="">All States</option>
                                        {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setStatusFilter('All')
                                        setFilters({ sortBy: 'newest', projectType: '', subCategory: '', experience: '', country: '', state: '' })
                                    }}
                                    className="text-xs font-bold text-primary hover:opacity-80 transition-all flex items-center gap-1"
                                >
                                    <X size={14} /> Clear All Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Job listings */}
            {/* Job listings - HORIZONTAL BANNER STYLE */}
            <div className="flex flex-col gap-8">
                {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card overflow-hidden border-0 shadow-2xl flex flex-col md:flex-row min-h-[220px] relative group"
                        style={{ background: 'var(--color-card)' }}
                    >
                        {/* Left Banner Section (Inspired by Join Us graphic) */}
                        <div className="md:w-64 bg-primary/10 relative overflow-hidden flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-primary/10">
                            {/* Decorative Dots Pattern */}
                            <div className="absolute top-3 left-3 grid grid-cols-3 gap-1 opacity-20">
                                {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-primary"></div>)}
                            </div>
                            <div className="absolute bottom-3 right-3 grid grid-cols-3 gap-1 opacity-20">
                                {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-primary"></div>)}
                            </div>

                            {/* Stylized Icon Box */}
                            <div className="relative z-10 w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Clapperboard size={45} className="text-primary" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                    <Heart size={14} className="text-white fill-current" />
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 block">Est. 2026</span>
                            </div>

                            {/* Delete Button (Only for Creator) */}
                            {user && job.createdBy?.id === user.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this job post?')) {
                                            deleteJob(job.id);
                                        }
                                    }}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-danger hover:text-white z-10 shadow-lg"
                                    title="Delete Post"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        {/* Main Content Section */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-tighter rounded-full italic">
                                        We Are Hiring
                                    </span>
                                    <div className="h-px bg-primary/10 flex-1"></div>
                                    <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} /> {job.endDate || job.lastDateToApply}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedJob(job)}>
                                    {job.title}
                                </h2>
                                <p className="text-sm text-text-dim mb-6 line-clamp-2 leading-relaxed italic opacity-80">
                                    Looking for professional {job.subCategory} for our upcoming {job.projectType}. Join a team of passionate creators and bring visions to life.
                                </p>

                                {/* Info Row - Refined Separated Specs */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-1">Project Type</span>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={12} className="text-primary" />
                                            <span className="text-xs font-bold leading-none">{job.projectType}</span>
                                        </div>
                                    </div>
                                    <div className="bg-success/5 p-3 rounded-xl border border-success/10 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-black text-success/60 uppercase tracking-widest mb-1">Vacancy</span>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={12} className="text-success" />
                                            <span className="text-xs font-bold leading-none capitalize">{job.subCategory}</span>
                                        </div>
                                    </div>
                                    <div className="bg-accent/5 p-3 rounded-xl border border-accent/10 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest mb-1">End Date</span>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-accent" />
                                            <span className="text-xs font-bold leading-none">{job.endDate || job.lastDateToApply}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions Row */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black border border-primary/20">
                                        {(job.createdBy?.name?.split(' ')[0])?.[0]}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Posted By</span>
                                        <span
                                            className="text-sm font-bold cursor-pointer hover:underline hover:text-primary transition-all underline-offset-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (job.createdBy?.id) {
                                                    navigate('/explore', { state: { viewProfileId: job.createdBy.id, fromJobs: true } });
                                                }
                                            }}
                                        >
                                            {(job.createdBy?.name?.split(' ')[0])} {job.createdBy?.lastName}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setSelectedJob(job)}
                                        className="h-12 px-6 rounded-xl border-2 border-primary/30 text-primary text-xs font-black uppercase tracking-widest transition-all hover:bg-primary/5 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                                    >
                                        <Eye size={16} /> Details
                                    </button>
                                    {(!user || !job.createdBy || user.id !== job.createdBy.id) && (
                                        <button
                                            onClick={() => {
                                                if (!isAuthenticated) { requireAuth(); return }
                                                if (!isProfileComplete) { alert('Kindly complete your profile before applying.'); navigate('/profile'); return }
                                                setSelectedJob(job);
                                                setShowApply(true);
                                            }}
                                            className="h-12 px-8 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                                        >
                                            <ArrowRight size={16} /> Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 card border-dashed border-2">
                            <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold mb-2">No projects matching your search</h3>
                            <p className="text-sm opacity-60 max-w-xs mx-auto mb-8">Try adjusting your filters or status tabs to find more opportunities.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setStatusFilter('All')
                                    setFilters({ sortBy: 'newest', projectType: '', subCategory: '', experience: '', country: '', state: '' })
                                }}
                                className="btn btn-primary btn-sm rounded-full px-8"
                            >
                                Reset All Filters
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Job Detail Modal */}
            <AnimatePresence>
                {selectedJob && !showApply && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setSelectedJob(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content relative" style={{ maxWidth: '600px' }}
                            onClick={e => e.stopPropagation()}>

                            {/* Top Right Actions */}
                            <div className="absolute top-6 right-6 flex gap-2 z-10">
                                <button className="btn-ghost btn-icon bg-bg-offset shadow-sm" title="Share"><Share2 size={16} /></button>
                                <button className="btn-ghost btn-icon bg-bg-offset shadow-sm" onClick={() => setSelectedJob(null)}><X size={16} /></button>
                            </div>

                            <div className="space-y-5">
                                {/* Poster Info */}
                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center gap-1.5 text-sm font-bold">
                                        <span className="opacity-60">Posted by :</span>
                                        <span className="text-primary hover:underline cursor-pointer flex items-center gap-1"
                                            onClick={() => {
                                                if (selectedJob.createdBy?.id) {
                                                    navigate('/explore', { state: { viewProfileId: selectedJob.createdBy.id, fromJobs: true } });
                                                }
                                            }}>
                                            {(selectedJob.createdBy?.name?.split(' ')[0])} {selectedJob.createdBy?.lastName}
                                            <ExternalLink size={12} />
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-text-dim flex items-center gap-1.5">
                                        <span>Posted on :</span>
                                        <span>{(() => {
                                            const d = new Date(selectedJob.createdAt);
                                            return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                                        })()}</span>
                                    </div>
                                </div>

                                {/* Project Info */}
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Project Title</label>
                                        <h2 className="text-2xl font-black tracking-tight leading-none">{selectedJob.title}</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Project Type</label>
                                            <div className="text-sm font-bold flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {selectedJob.projectType}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</label>
                                            <div className="text-sm font-bold flex items-center gap-2">
                                                <MapPin size={12} className="text-primary" />
                                                {selectedJob.city}, {selectedJob.state}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Details</label>
                                        <p className="text-sm leading-relaxed text-text-muted font-medium bg-bg-offset/50 p-4 rounded-2xl border border-border/50">
                                            {selectedJob.details}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="py-2">
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                                </div>

                                {/* Job Requirements */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black tracking-tight">Job Requirement</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                        <div className="space-y-1 text-sm">
                                            <span className="font-bold opacity-40 block text-[10px] uppercase tracking-wider">Subcategory</span>
                                            <span className="font-black text-primary">{selectedJob.subCategory}</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <span className="font-bold opacity-40 block text-[10px] uppercase tracking-wider">Duration</span>
                                            <span className="font-bold">{selectedJob.serviceDuration?.start || 'TBD'} — {selectedJob.serviceDuration?.end || 'TBD'}</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <span className="font-bold opacity-40 block text-[10px] uppercase tracking-wider">Last date to apply</span>
                                            <span className="font-black text-accent">{selectedJob.lastDateToApply}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="font-bold opacity-40 block text-[10px] uppercase tracking-wider">Requirements</span>
                                        <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                                            ( {selectedJob.requirements || 'No specific requirements provided.'} )
                                        </p>
                                    </div>

                                    {selectedJob.documents && selectedJob.documents.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <span className="font-bold opacity-40 block text-[10px] uppercase tracking-wider">Attached Documents</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.documents.map((doc, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs font-bold text-primary">
                                                        <FileText size={14} />
                                                        <span className="truncate max-w-[150px]">{doc.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    className="h-12 px-8 rounded-xl bg-bg-offset border border-border text-xs font-black uppercase tracking-widest flex-1 transition-all hover:bg-border/50"
                                    onClick={() => setSelectedJob(null)}
                                >
                                    Cancel
                                </button>
                                {(!user || !selectedJob.createdBy || user.id !== selectedJob.createdBy.id) && (
                                    <button
                                        className="h-12 px-10 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest flex-[1.5] transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                                        onClick={() => {
                                            if (!isAuthenticated) { requireAuth(); return }
                                            if (!isProfileComplete) { alert('Kindly complete your profile before applying.'); navigate('/profile'); return }
                                            setShowApply(true)
                                        }}
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Apply Now Modal */}
            <AnimatePresence>
                {showApply && selectedJob && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setShowApply(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content" style={{ maxWidth: '600px' }}
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Job Application</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Applying for: {selectedJob.title}</p>
                                </div>
                                <button className="btn-ghost btn-icon" onClick={() => setShowApply(false)}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleApply} className="space-y-4">
                                {/* Card 1: Success Banner Style Header */}
                                <div className="bg-primary/5 py-2 px-3 text-center border-b border-primary/10 rounded-t-xl -mx-6 -mt-6 mb-4">
                                    <h4 className="text-[11px] font-bold text-primary italic">
                                        Your Professional Summary
                                    </h4>
                                </div>

                                {/* Profile Summary Card */}
                                <div className="card p-4 border-border/50 bg-card/30 space-y-4">
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="relative group/photo">
                                            <div className="w-20 h-20 rounded-2xl bg-bg-offset border-2 border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden transition-all group-hover/photo:border-primary/50">
                                                {applyForm.photo ? (
                                                    <img src={applyForm.photo} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <>
                                                        <Camera size={20} className="text-primary/40" />
                                                        <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-40 text-center px-2">Headshot Required</span>
                                                    </>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('apply-photo')?.click()}
                                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transform group-hover/photo:scale-110 transition-all"
                                            >
                                                <Camera size={12} />
                                            </button>
                                            {applyForm.photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => setApplyForm({ ...applyForm, photo: null })}
                                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shadow-md hover:scale-110 transition-all opacity-0 group-hover/photo:opacity-100"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div className="form-group mb-0">
                                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block opacity-60">First Name</label>
                                                <input value={(user?.name?.split(" ")[0]) || ''} readOnly className="bg-bg-offset border-border/50 cursor-not-allowed h-10 text-sm" />
                                            </div>
                                            <div className="form-group mb-0">
                                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block opacity-60">Last Name</label>
                                                <input value={user?.lastName || ''} readOnly className="bg-bg-offset border-border/50 cursor-not-allowed h-10 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" id="apply-photo" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setApplyForm({ ...applyForm, photo: reader.result });
                                                reader.readAsDataURL(file);
                                            }
                                        }} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Category</label>
                                            <select value={applyForm.category} onChange={e => setApplyForm({ ...applyForm, category: e.target.value, role: '' })} className="border-border rounded-lg h-11 text-sm bg-card">
                                                <option value="Artist">Artist</option>
                                                <option value="Crew">Crew</option>
                                            </select>
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Role / Subcategory</label>
                                            <select value={applyForm.role} onChange={e => setApplyForm({ ...applyForm, role: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card text-primary font-bold">
                                                <option value="">Select role</option>
                                                {(applyForm.category === 'Crew' ? CREW_ROLES : ARTIST_ROLES).map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Age</label>
                                            <input type="number" min="1" value={applyForm.age} onChange={e => setApplyForm({ ...applyForm, age: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card" />
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Gender</label>
                                            <select value={applyForm.gender} onChange={e => setApplyForm({ ...applyForm, gender: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card">
                                                <option value="">Select</option>
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Phone Number</label>
                                            <input type="tel" value={applyForm.phone || user?.phone || ''} onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Address Card */}
                                <div className="card p-4 border-border/50 bg-card/30 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-[11px] font-bold text-primary italic">Contact & Location</h4>
                                        <div className="h-px bg-primary/10 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">WhatsApp Number</label>
                                            <input type="tel" value={applyForm.whatsapp} onChange={e => setApplyForm({ ...applyForm, whatsapp: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card font-bold text-success" />
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Email Address</label>
                                            <input type="email" value={applyForm.gmail || user?.email || ''} onChange={e => setApplyForm({ ...applyForm, gmail: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card" />
                                        </div>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Full Address</label>
                                        <input value={applyForm.address} onChange={e => setApplyForm({ ...applyForm, address: e.target.value })} className="border-border rounded-lg h-11 text-sm bg-card" placeholder="Street, City, State, ZIP" />
                                    </div>
                                </div>

                                {/* Media & Links Card */}
                                <div className="card p-4 border-border/50 bg-card/30 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-[11px] font-bold text-primary italic">Portfolio & Links</h4>
                                        <div className="h-px bg-primary/10 flex-1"></div>
                                    </div>

                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Portfolio (Images & Videos)</label>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => document.getElementById('apply-files')?.click()}
                                                className="flex-1 h-24 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-all text-primary/60 group">
                                                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    <Camera size={20} className="text-primary" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase">Click to Upload Work</span>
                                            </button>
                                            <input type="file" id="apply-files" multiple accept="image/*,video/*" style={{ display: 'none' }}
                                                onChange={e => {
                                                    const files = Array.from(e.target.files || []);
                                                    setApplyForm(prev => ({
                                                        ...prev,
                                                        portfolioFiles: prev.portfolioFiles ? [...prev.portfolioFiles, ...files] : files
                                                    }));
                                                }} />
                                            {applyForm.portfolioFiles && applyForm.portfolioFiles.length > 0 && (
                                                <div className="space-y-2 mt-3">
                                                    {Array.from(applyForm.portfolioFiles).map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-success/5 rounded-xl border border-success/10 group">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                                                                    <FileText size={14} />
                                                                </div>
                                                                <span className="text-[11px] font-bold text-success truncate max-w-[150px]">{file.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const updated = Array.from(applyForm.portfolioFiles).filter((_, i) => i !== idx);
                                                                    setApplyForm({ ...applyForm, portfolioFiles: updated });
                                                                }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-60">Social & Project Links</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-primary/5 flex items-center justify-center">
                                                    <Instagram size={14} className="text-primary opacity-60" />
                                                </div>
                                                <input placeholder="Instagram" className="pl-11 h-10 text-xs bg-card border-border rounded-lg" value={applyForm.socialLinks.instagram} onChange={e => setApplyForm({ ...applyForm, socialLinks: { ...applyForm.socialLinks, instagram: e.target.value } })} />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-primary/5 flex items-center justify-center">
                                                    <Linkedin size={14} className="text-primary opacity-60" />
                                                </div>
                                                <input placeholder="LinkedIn" className="pl-11 h-10 text-xs bg-card border-border rounded-lg" value={applyForm.socialLinks.linkedin} onChange={e => setApplyForm({ ...applyForm, socialLinks: { ...applyForm.socialLinks, linkedin: e.target.value } })} />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-primary/5 flex items-center justify-center">
                                                    <Youtube size={14} className="text-primary opacity-60" />
                                                </div>
                                                <input placeholder="Youtube" className="pl-11 h-10 text-xs bg-card border-border rounded-lg" value={applyForm.socialLinks.youtube} onChange={e => setApplyForm({ ...applyForm, socialLinks: { ...applyForm.socialLinks, youtube: e.target.value } })} />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-primary/5 flex items-center justify-center">
                                                    <Globe size={14} className="text-primary opacity-60" />
                                                </div>
                                                <input placeholder="Previous Works" className="pl-11 h-10 text-xs bg-card border-border rounded-lg" value={applyForm.socialLinks.other} onChange={e => setApplyForm({ ...applyForm, socialLinks: { ...applyForm.socialLinks, other: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-1.5 rounded-md shadow-sm">
                                                <LinkIcon size={14} className="text-primary" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block">CastUp Profile Linked</span>
                                                <span className="text-[10px] font-bold text-primary">/profile/{user?.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-0 mt-6 pt-2 border-t border-border/10">
                                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block opacity-60">Additional Info</label>
                                    <textarea rows={3} placeholder="Tell us why you're a good fit..."
                                        value={applyForm.additionalInfo}
                                        onChange={e => setApplyForm({ ...applyForm, additionalInfo: e.target.value })}
                                        className="bg-card border-border rounded-xl text-sm py-3" />
                                </div>

                                <div className="flex gap-4 pt-4 -mx-2">
                                    <button type="button" className="btn btn-secondary h-12 flex-1 rounded-xl text-sm font-bold border-border/50" onClick={() => setShowApply(false)}>Cancel Application</button>
                                    <button type="submit" className="btn btn-primary h-12 flex-1 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Submit Application</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Applied Success */}
            < AnimatePresence >
                {applied && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => { setApplied(false); setSelectedJob(null) }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="modal-content text-center p-10" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Application Success!</h2>
                            <p className="text-sm opacity-60 mb-8 leading-relaxed">
                                Your profile and application details have been sent to the producer. They will contact you if your profile matches their requirements.
                            </p>
                            <button className="btn btn-primary w-full h-12 rounded-xl font-bold" onClick={() => { setApplied(false); setSelectedJob(null) }}>
                                Return to Opportunities
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    )
}

function CreditCard({ size, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}

