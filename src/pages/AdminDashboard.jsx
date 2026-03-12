import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Navigate } from 'react-router-dom'
import {
    Shield, Users, Briefcase, Trash2, Search, BarChart2, Mail,
    CheckCircle, XCircle, Eye, RefreshCw
} from 'lucide-react'

const ADMIN_EMAIL = 'castup4862446@gmail.com'

export default function AdminDashboard() {
    const { user, allUsers, allJobs, deleteJob } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [search, setSearch] = useState('')
    const [deletedMsg, setDeletedMsg] = useState('')

    // Guard: only admin can access
    if (!user || user.email !== ADMIN_EMAIL) {
        return <Navigate to="/home" replace />
    }

    const filteredUsers = allUsers.filter(u =>
        !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredJobs = allJobs.filter(j =>
        !search || j.title?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDeleteJob = (jobId) => {
        if (window.confirm('Delete this job posting? This cannot be undone.')) {
            deleteJob(jobId)
            setDeletedMsg('Job deleted successfully.')
            setTimeout(() => setDeletedMsg(''), 3000)
        }
    }

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart2 },
        { key: 'users', label: `Users (${allUsers.length})`, icon: Users },
        { key: 'jobs', label: `Jobs (${allJobs.length})`, icon: Briefcase },
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)' }}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Logged in as {user.email}</p>
                    </div>
                </div>
            </motion.div>

            {deletedMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                    style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={16} /> {deletedMsg}
                </motion.div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Users', value: allUsers.length, color: 'var(--color-primary-light)', icon: Users },
                    { label: 'Active Jobs', value: allJobs.length, color: 'var(--color-secondary)', icon: Briefcase },
                    { label: 'Artists', value: allUsers.filter(u => u.category === 'Artist').length, color: 'var(--color-accent)', icon: Eye },
                    { label: 'Crew Members', value: allUsers.filter(u => u.category === 'Crew').length, color: 'var(--color-success)', icon: CheckCircle },
                ].map(stat => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="card p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
                            <stat.icon size={16} style={{ color: stat.color }} />
                        </div>
                        <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearch('') }}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent'}`}
                        style={{ color: activeTab === tab.key ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}
                    >
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            {activeTab !== 'overview' && (
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
                    <input className="pl-9" placeholder={activeTab === 'users' ? 'Search users by name or email...' : 'Search jobs by title...'}
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart2 size={16} style={{ color: 'var(--color-primary-light)' }} /> Platform Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Admin Email</span>
                                <span className="text-sm font-bold flex items-center gap-1"><Mail size={13} /> {ADMIN_EMAIL}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Registered Users</span>
                                <span className="text-sm font-bold text-primary">{allUsers.length}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Job Postings</span>
                                <span className="text-sm font-bold text-secondary">{allJobs.length}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Immediately Available</span>
                                <span className="text-sm font-bold text-success">{allUsers.filter(u => u.availability === 'Immediately').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={16} style={{ color: 'var(--color-secondary)' }} /> Recent Registrations</h3>
                        <div className="space-y-3">
                            {allUsers.slice(0, 5).map(u => (
                                <div key={u.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                                    <div className="avatar avatar-sm">{(u.name || 'U').substring(0, 2).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{u.name}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{u.email}</p>
                                    </div>
                                    <span className="badge text-xs">{u.role || 'Unset'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                        <div className="card p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>No users found</div>
                    ) : filteredUsers.map(u => (
                        <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="card p-4 flex items-center gap-4">
                            <div className="avatar avatar-md">
                                {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : (u.name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{u.name}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{u.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {u.role && <span className="badge text-xs">{u.role}</span>}
                                    {u.location && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.location}</span>}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className={`badge ${u.availability === 'Immediately' ? 'badge-success' : 'badge-warning'} text-xs`}>
                                    {u.availability || 'Not set'}
                                </span>
                                {u.email === ADMIN_EMAIL && (
                                    <div className="text-xs mt-1 font-bold" style={{ color: 'var(--color-danger)' }}>Admin</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
                <div className="space-y-3">
                    {filteredJobs.length === 0 ? (
                        <div className="card p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>No job postings found</div>
                    ) : filteredJobs.map(job => (
                        <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)' }}>
                                <Briefcase size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{job.title}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                                    Posted by: {job.createdBy?.name || 'Unknown'} • {job.location || 'Location N/A'}
                                </p>
                                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{job.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {job.projectType && <span className="badge text-xs">{job.projectType}</span>}
                                    {job.budget && <span className="badge badge-success text-xs">₹{job.budget}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="shrink-0 btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--color-danger)' }}
                                title="Delete Job"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
