import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Navigate } from 'react-router-dom'
import {
    Shield, Users, Briefcase, Trash2, Search, BarChart2, Mail,
    CheckCircle, XCircle, Eye, RefreshCw, Video, Database, Sparkles,
    Filter, Download, Plus, ArrowRight, Check, X as CloseIcon, ChevronLeft, ChevronRight, FileVideo
} from 'lucide-react'

const ADMIN_EMAILS = ['castup4862446@gmail.com', 'castupaiapp@gmail.com']

export default function AdminDashboard() {
    const { 
        user, allUsers, allJobs, allWorks, 
        deleteJob, deleteUser, deleteWork, 
        refreshPlatformData 
    } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [deletedMsg, setDeletedMsg] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [preview, setPreview] = useState(null) // { url, type, name }
    const itemsPerPage = 10

    // Reset page on tab/search change
    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab, debouncedSearch])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Guard: only admin can access
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
        return <Navigate to="/home" replace />
    }

    const filteredUsers = useMemo(() => 
        allUsers.filter(u =>
            !debouncedSearch || 
            u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
            u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
        ), [allUsers, debouncedSearch]
    )

    const filteredJobs = useMemo(() => 
        allJobs.filter(j =>
            !debouncedSearch || j.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
        ), [allJobs, debouncedSearch]
    )

    const filteredWorks = useMemo(() => 
        allWorks.filter(w =>
            !debouncedSearch || 
            w.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
            w.ownerEmail?.toLowerCase().includes(debouncedSearch.toLowerCase())
        ), [allWorks, debouncedSearch]
    )

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Delete this job posting? This cannot be undone.')) {
            const result = await deleteJob(jobId)
            if (result.success) {
                setDeletedMsg('Job deleted successfully.')
                setTimeout(() => setDeletedMsg(''), 3000)
            } else {
                alert(result.error || 'Failed to delete job')
            }
        }
    }

    const handleDeleteUser = async (userId, userEmail) => {
        if (ADMIN_EMAILS.includes(userEmail)) {
            return alert('You cannot delete an admin account.')
        }
        if (window.confirm(`Delete user ${userEmail} and all their data? This action is permanent.`)) {
            const result = await deleteUser(userId)
            if (result.success) {
                setDeletedMsg('User deleted successfully.')
                setTimeout(() => setDeletedMsg(''), 3000)
            } else {
                alert(result.error || 'Failed to delete user')
            }
        }
    }

    const handleDeleteWork = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete the work "\${name}"?`)) return
        
        const workItem = allWorks.find(w => w.id === id);
        const { success, error } = await deleteWork(id, workItem?.user_id, workItem?.is_portfolio);
        
        if (success) {
            setDeletedMsg(`Work "\${name}" deleted successfully`)
            setTimeout(() => setDeletedMsg(''), 3000)
        } else {
            alert(`Error deleting work: \${error}`)
        }
    }

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart2 },
        { key: 'users', label: `Users (${allUsers.length})`, icon: Users },
        { key: 'jobs', label: `Jobs (${allJobs.length})`, icon: Briefcase },
        { key: 'works', label: `Works (${allWorks.length})`, icon: Video },
    ]

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', color: 'white' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">System Control</h1>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>Administrator: {user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => refreshPlatformData()}
                        className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all"
                    >
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                </div>
            </motion.div>

            {deletedMsg && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-xl"
                    style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={20} /> {deletedMsg}
                </motion.div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: allUsers.length, color: '#6366f1', icon: Users, bg: 'rgba(99,102,241,0.1)' },
                    { label: 'Active Jobs', value: allJobs.length, color: '#ec4899', icon: Briefcase, bg: 'rgba(236,72,153,0.1)' },
                    { label: 'Artists', value: allUsers.filter(u => u.category === 'Artist').length, color: '#8b5cf6', icon: Eye, bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Crew Members', value: allUsers.filter(u => u.category === 'Crew').length, color: '#10b981', icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="card p-6 border-0 shadow-lg group hover:translate-y-[-4px] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>Active Now</span>
                        </div>
                        <div className="text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                        <div className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearch('') }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab.key ? 'shadow-lg' : 'opacity-50 hover:opacity-100'}`}
                        style={{ 
                            background: activeTab === tab.key ? 'var(--color-bg-light)' : 'transparent',
                            color: activeTab === tab.key ? 'var(--color-primary-light)' : 'var(--color-text-muted)'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            {activeTab !== 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
                    <input className="pl-12 py-4 rounded-2xl border-0 shadow-inner" 
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                        placeholder={
                            activeTab === 'users' ? 'Search by name or email...' : 
                            activeTab === 'jobs' ? 'Search jobs by title...' : 
                            'Search works by name or owner...'
                        }
                        value={search} onChange={e => setSearch(e.target.value)} />
                </motion.div>
            )}

            {/* Content Area */}
            <motion.div layout>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card p-8 border-0 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart2 size={120} /></div>
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full" style={{ background: 'var(--color-primary)' }}></span>
                                Platform Vitality
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>Admin Integrity</span>
                                    <span className="text-sm font-black flex items-center gap-2 text-success"><Shield size={14} /> Verified Admin Pool</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>Database Node</span>
                                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white/5">AWS-AP-SOUTH-1</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>API Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                        <span className="text-xs font-bold text-success">Operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Users List */}
                        <div className="card p-8 border-0 shadow-xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full" style={{ background: '#ec4899' }}></span>
                                New Joiners
                            </h3>
                            <div className="space-y-4">
                                {allUsers.slice(0, 4).map(u => (
                                    <div key={u.id} className="flex items-center gap-4 group">
                                        <div className="avatar avatar-md shadow-lg group-hover:scale-105 transition-transform">
                                            {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : (u.name || 'U').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{u.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>{u.role || 'GUEST'}</p>
                                        </div>
                                        <span className="text-[10px] font-mono opacity-50">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Management */}
                {activeTab === 'users' && (
                    <div className="grid gap-4">
                        {filteredUsers.length === 0 ? (
                            <div className="card p-12 text-center font-bold opacity-50">Zero results match your lookup</div>
                        ) : filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(u => (
                            <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="card p-5 flex items-center gap-5 group hover:shadow-2xl transition-all border-0">
                                <div className="avatar avatar-lg shadow-xl shrink-0">
                                    {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : (u.name || 'U').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-lg font-black truncate">{u.name}</p>
                                        {ADMIN_EMAILS.includes(u.email) && <span className="badge badge-error text-[10px] font-black uppercase py-0.5">Admin</span>}
                                    </div>
                                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-dim)' }}>{u.email}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {u.category && <span className="badge text-[10px] font-black uppercase" style={{ background: 'rgba(255,255,255,0.05)' }}>{u.category}</span>}
                                        {u.role && <span className="badge text-[10px] font-black uppercase" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{u.role}</span>}
                                        {u.location && <span className="text-[10px] font-bold opacity-40 flex items-center gap-1 uppercase tracking-widest">{u.location}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${u.availability === 'Immediately' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                        {u.availability || 'Pending'}
                                    </span>
                                    {!ADMIN_EMAILS.includes(u.email) && (
                                        <button
                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                            title="Permanently Remove User"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Jobs Management */}
                {activeTab === 'jobs' && (
                    <div className="grid gap-4">
                        {filteredJobs.length === 0 ? (
                            <div className="card p-12 text-center font-bold opacity-50">No active job deployments recorded</div>
                        ) : filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(job => (
                            <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="card p-6 border-0 shadow-lg hover:shadow-2xl transition-all flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" 
                                    style={{ background: 'rgba(236,72,153,0.05)', color: '#ec4899' }}>
                                    <Briefcase size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-black truncate">{job.title}</h3>
                                        <button
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Terminate Job Posting"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-dim)' }}>
                                            Posted by: <span className="text-white">{job.createdBy?.name || 'Unknown'}</span>
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-dim)' }}>{job.location || 'Remote'}</span>
                                    </div>
                                    <p className="text-sm line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{job.description}</p>
                                    <div className="flex items-center gap-3">
                                        {job.projectType && <span className="badge badge-secondary text-[10px] font-black uppercase">{job.projectType}</span>}
                                        {job.budget && <span className="badge badge-success text-[10px] font-black uppercase">REWARD: ₹{job.budget}</span>}
                                        <span className="text-[10px] font-mono opacity-30 ml-auto">DEPLOYED: {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Works Management */}
                {activeTab === 'works' && (
                    <div className="grid gap-4">
                        {filteredWorks.length === 0 ? (
                            <div className="card p-12 text-center font-bold opacity-50">No portfolio works uploaded yet</div>
                        ) : filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(work => (
                            <motion.div key={work.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="card p-5 border-0 shadow-lg hover:shadow-2xl transition-all flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner bg-black/20 flex items-center justify-center shrink-0 relative">
                                    {work.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$|data:image/i) ? (
                                        <img src={work.file_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            {work.source_type === 'Video' || (work.file_type && work.file_type.includes('video')) ? <Video size={20} className="text-primary mb-1" /> : <Layers size={20} className="text-white/40 mb-1" />}
                                            <span className="text-[8px] font-black uppercase text-center">{work.source_type || 'File'}</span>
                                        </div>
                                    )}
                                    {work.is_portfolio && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <div className="bg-primary/80 backdrop-blur-md rounded-bl-lg px-1.5 py-0.5 pointer-events-none">
                                                <Sparkles size={10} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <h3 className="text-lg font-black truncate">{work.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setPreview({ url: work.file_url || work.source_url, type: work.file_type || (work.source_type === 'Video' ? 'video/mp4' : 'image/png'), name: work.name })}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                                                title="Preview Work"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWork(work.id, work.name)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                                title="Delete Work"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[10px] font-black uppercase text-white/40">Owner:</span>
                                        <span className="text-xs font-bold text-white/80">{work.ownerName || 'Unknown'}</span>
                                        <span className="text-xs font-medium text-white/40">({work.ownerEmail})</span>
                                        <div className="ml-auto text-[10px] font-mono opacity-30 uppercase">
                                            Uploaded: {new Date(work.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination UI */}
                {activeTab !== 'overview' && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-6 py-2 rounded-xl bg-white/5 font-bold disabled:opacity-20 hover:bg-white/10 transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-black opacity-40">
                            Page {currentPage} of {Math.ceil((activeTab === 'users' ? filteredUsers.length : activeTab === 'jobs' ? filteredJobs.length : filteredWorks.length) / itemsPerPage) || 1}
                        </span>
                        <button 
                            disabled={currentPage >= Math.ceil((activeTab === 'users' ? filteredUsers.length : activeTab === 'jobs' ? filteredJobs.length : filteredWorks.length) / itemsPerPage)}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-6 py-2 rounded-xl bg-white/5 font-bold disabled:opacity-20 hover:bg-white/10 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Preview Lightbox */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95"
                        onClick={() => setPreview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setPreview(null)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 font-bold px-4 py-2"
                            >
                                <CloseIcon size={18} /> Close
                            </button>

                            <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '80vh' }}>
                                {preview.url?.startsWith('data:video') || preview.type?.includes('video') ? (
                                    <video src={preview.url} controls autoPlay className="max-w-full max-h-[80vh] object-contain w-full" />
                                ) : (
                                    <img src={preview.url} alt={preview.name} className="max-w-full max-h-[80vh] object-contain" />
                                )}
                            </div>
                            
                            <div className="mt-6 text-center">
                                <h3 className="text-xl font-black">{preview.name}</h3>
                                <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">{preview.type}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
