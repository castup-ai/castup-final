import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Search, Filter, X, Mail, MessageSquare, Share2,
    MapPin, Calendar, Award, Briefcase, Globe, Star,
    ChevronDown, Languages, CheckCircle, Heart, MoreHorizontal,
    User, Camera, Instagram, Youtube, Linkedin, Twitter, ExternalLink,
    Play, Clock, Ruler, Droplets, Image as ImageIcon, Clapperboard, Eye
} from 'lucide-react'

const experienceLevels = ['All', 'Beginner', 'Intermediate', 'Expert']
const availabilityOptions = ['All', 'Immediately', 'Next Week', 'Next Month']

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

const sortOptions = ['Most Recent', 'Most Viewed', 'Top Rated']

export default function Explore() {
    const { user, allUsers, isAuthenticated, requireAuth } = useAuth()
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        experience: 'All', availability: 'All', category: 'All', role: 'All', location: '', sort: 'Most Recent'
    })
    const [modalTab, setModalTab] = useState('Info')
    const [portfolioTab, setPortfolioTab] = useState('Photos')
    const [isFavorite, setIsFavorite] = useState(false)
    const [showContactDropdown, setShowContactDropdown] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const handleCloseProfile = () => {
        if (location.state?.fromJobs) {
            navigate(-1)
        } else {
            setSelectedProfile(null)
        }
    }

    useEffect(() => {
        if (location.state?.viewProfileId && allUsers.length > 0) {
            const targetUser = allUsers.find(u => u.id === location.state.viewProfileId)
            if (targetUser) {
                setSelectedProfile(targetUser)
            }
        }
    }, [location.state, allUsers])

    const getAvailableRoles = () => {
        if (filters.category === 'Artist') return ['All', ...ARTIST_ROLES]
        if (filters.category === 'Crew') return ['All', ...CREW_ROLES]
        return ['All', ...ARTIST_ROLES, ...CREW_ROLES].sort()
    }

    const filtered = allUsers.filter(u => {
        if (user && (u.id === user.id || u.email === user.email)) return false
        if (search && !`${u.firstName} ${u.lastName} ${u.role} ${u.skills?.join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false
        if (filters.experience !== 'All' && u.experience !== filters.experience) return false
        if (filters.availability !== 'All' && u.availability !== filters.availability) return false

        // Category/Role Check
        if (filters.role !== 'All') {
            if (u.role !== filters.role) return false
        } else if (filters.category !== 'All') {
            const list = filters.category === 'Artist' ? ARTIST_ROLES : CREW_ROLES
            if (!list.includes(u.role)) return false
        }

        if (filters.location && !u.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
        return true
    })

    const resetFilters = () => {
        setFilters({ experience: 'All', availability: 'All', category: 'All', role: 'All', location: '', sort: 'Most Recent' })
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar - All Subcategories Listed */}
                <aside className="w-full md:w-60 flex-shrink-0">
                    <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold">Categories</h2>
                            <button className="text-[10px] font-bold px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setFilters({ ...filters, category: 'All', role: 'All' })}
                                style={{ color: 'var(--color-primary)' }}>
                                CLEAR
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Artist Section */}
                            <div>
                                <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 pb-1.5 border-b flex items-center justify-between cursor-pointer transition-colors ${filters.category === 'Artist' ? 'text-primary' : 'text-dim'}`}
                                    onClick={() => setFilters({ ...filters, category: filters.category === 'Artist' ? 'All' : 'Artist', role: 'All' })}
                                    style={{ borderColor: filters.category === 'Artist' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                                    Artist
                                    <span className="opacity-50">{ARTIST_ROLES.length}</span>
                                </h3>
                                <ul className="space-y-0.5">
                                    {ARTIST_ROLES.map(role => (
                                        <li key={role}>
                                            <button
                                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 hover:pl-3 group flex items-center justify-between ${filters.role === role ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary/10 text-muted hover:text-primary'}`}
                                                onClick={() => setFilters({ ...filters, category: 'Artist', role: filters.role === role ? 'All' : role })}
                                            >
                                                <span>{role}</span>
                                                {filters.role === role && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                {filters.role !== role && <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary/40 transition-all" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Crew Section */}
                            <div>
                                <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 pb-1.5 border-b flex items-center justify-between cursor-pointer transition-colors ${filters.category === 'Crew' ? 'text-primary' : 'text-dim'}`}
                                    onClick={() => setFilters({ ...filters, category: filters.category === 'Crew' ? 'All' : 'Crew', role: 'All' })}
                                    style={{ borderColor: filters.category === 'Crew' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                                    Crew
                                    <span className="opacity-50">{CREW_ROLES.length}</span>
                                </h3>
                                <ul className="space-y-0.5">
                                    {CREW_ROLES.map(role => (
                                        <li key={role}>
                                            <button
                                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 hover:pl-3 group flex items-center justify-between ${filters.role === role ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary/10 text-muted hover:text-primary'}`}
                                                onClick={() => setFilters({ ...filters, category: 'Crew', role: filters.role === role ? 'All' : role })}
                                            >
                                                <span>{role}</span>
                                                {filters.role === role && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                {filters.role !== role && <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary/40 transition-all" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                        <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">Explore Talent</h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Discover {allUsers.length}+ professionals ready to collaborate
                        </p>
                    </motion.div>

                    {/* Search bar + Global Filters Button */}
                    <div className="flex gap-2 mb-6 items-center">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-11 h-[44px] text-sm shadow-sm border border-border bg-bg-offset text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all rounded-xl w-full"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className={`h-[44px] px-6 rounded-xl flex items-center gap-2 font-bold transition-all border ${showFilters ? 'bg-primary border-primary text-white' : 'bg-bg-offset border-border text-text-dim hover:border-primary hover:text-primary'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mb-8"
                            >
                                <div className="bg-bg-offset rounded-3xl p-6 border border-border/50 shadow-2xl relative">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="form-group">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-text-dim mb-2 block">Sort By</label>
                                            <select className="h-11 rounded-xl text-xs font-bold" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                                                {sortOptions.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-text-dim mb-2 block">Experience</label>
                                            <div className="flex flex-wrap gap-2">
                                                {experienceLevels.map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        type="button"
                                                        onClick={() => setFilters({ ...filters, experience: lvl })}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filters.experience === lvl ? 'bg-primary border-primary text-white' : 'bg-bg border-border text-text-dim hover:text-primary hover:border-primary/50'}`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-text-dim mb-2 block">Availability</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availabilityOptions.map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setFilters({ ...filters, availability: opt })}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filters.availability === opt ? 'bg-primary border-primary text-white' : 'bg-bg border-border text-text-dim hover:text-primary hover:border-primary/50'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-text-dim mb-2 block">Location</label>
                                            <div className="relative">
                                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                                                <input placeholder="City or country..." className="pl-10 h-11 rounded-xl text-xs font-bold" value={filters.location}
                                                    onChange={e => setFilters({ ...filters, location: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-border/30">
                                        <button className="h-10 px-6 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-border/50 transition-all" onClick={resetFilters}>
                                            Cancel
                                        </button>
                                        <button className="h-10 px-8 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => setShowFilters(false)}>
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    <div className="flex flex-col gap-6">
                        {filtered.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card overflow-hidden border-0 shadow-2xl flex flex-col md:flex-row min-h-[220px] relative group cursor-pointer"
                                style={{ background: 'var(--color-card)' }}
                                onClick={() => setSelectedProfile(user)}
                            >
                                {/* Left Banner Section */}
                                <div className="md:w-64 bg-primary/10 relative overflow-hidden flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-primary/10">
                                    {/* Decorative Dots Pattern */}
                                    <div className="absolute top-3 left-3 grid grid-cols-3 gap-1 opacity-20">
                                        {[...Array(9)].map((_, i) => <div key={`dot-tl-${i}`} className="w-1 h-1 rounded-full bg-primary"></div>)}
                                    </div>
                                    <div className="absolute bottom-3 right-3 grid grid-cols-3 gap-1 opacity-20">
                                        {[...Array(9)].map((_, i) => <div key={`dot-br-${i}`} className="w-1 h-1 rounded-full bg-primary"></div>)}
                                    </div>

                                    <div className="relative z-10 w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500 overflow-hidden">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-primary">{user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}</span>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                            <Star size={14} className="text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className={`text-[10px] font-black uppercase tracking-widest block ${user.availability === 'Immediately' ? 'text-success' : 'text-warning'}`}>
                                            {user.availability === 'Immediately' ? 'Available Now' : user.availability}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Content Section */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-tighter rounded-full italic">
                                                {user.role || user.department || 'Professional'}
                                            </span>
                                            <div className="h-px bg-primary/10 flex-1"></div>
                                            <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                                                <MapPin size={12} /> {user.location}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                                            {user.firstName} {user.lastName}
                                        </h2>
                                        <p className="text-sm text-text-dim mb-6 line-clamp-2 leading-relaxed italic opacity-80">
                                            {user.bio || `Professional ${user.role || 'creator'} based in ${user.location}. Experienced in various projects and ready for new collaborations.`}
                                        </p>

                                        {/* Info Row - Refined Separated Specs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center">
                                                <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-1">Experience</span>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={12} className="text-primary" />
                                                    <span className="text-xs font-bold leading-none">{user.yearsOfExperience || '5+'} Years</span>
                                                </div>
                                            </div>
                                            <div className="bg-success/5 p-3 rounded-xl border border-success/10 flex flex-col items-center justify-center text-center">
                                                <span className="text-[9px] font-black text-success/60 uppercase tracking-widest mb-1">Projects</span>
                                                <div className="flex items-center gap-2">
                                                    <Clapperboard size={12} className="text-success" />
                                                    <span className="text-xs font-bold leading-none capitalize">{user.projectsCount || '10+'} Completed</span>
                                                </div>
                                            </div>
                                            <div className="bg-accent/5 p-3 rounded-xl border border-accent/10 flex flex-col items-center justify-center text-center">
                                                <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest mb-1">Languages</span>
                                                <div className="flex items-center gap-2">
                                                    <Languages size={12} className="text-accent" />
                                                    <span className="text-xs font-bold leading-none">{user.languages?.length ? user.languages.length : 2} Known</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Actions Row */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/10">
                                        <div className="flex flex-wrap gap-1.5 flex-1 w-full">
                                            {user.skills?.slice(0, 4).map(s => (
                                                <span key={s} className="px-2 py-1 bg-surface border border-border/50 text-[10px] font-bold text-text-muted rounded-md tracking-wider">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto shrink-0">
                                            <button
                                                className="h-12 px-6 rounded-xl border-2 border-primary/30 text-primary text-xs font-black uppercase tracking-widest transition-all hover:bg-primary/5 flex items-center justify-center gap-2 w-full sm:w-auto"
                                            >
                                                <Eye size={16} /> View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="card text-center py-20 bg-opacity-30">
                            <p className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>No professionals found</p>
                            <p style={{ color: 'var(--color-text-dim)' }}>We couldn't find any results matching your current filters. Try relaxing some criteria.</p>
                            <button className="btn btn-outline btn-sm mt-6" onClick={resetFilters}>Clear all filters</button>
                        </div>
                    )}
                </main>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setSelectedProfile(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="modal-content overflow-hidden p-0 bg-bg"
                            style={{ maxWidth: '750px', borderRadius: '24px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Detailed Profile Modal Transformation */}
                            <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                                {/* 1. Hero / Header Section */}
                                <div className="relative">
                                    {/* Cover Photo */}
                                    <div className="h-56 sm:h-64 w-full bg-bg-offset overflow-hidden relative">
                                        {selectedProfile.coverPhoto ? (
                                            <img src={selectedProfile.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-light/10 flex items-center justify-center">
                                                <Camera size={48} className="opacity-10" />
                                            </div>
                                        )}
                                        {/* Share Button Overlay */}
                                        <button className="absolute top-4 right-16 h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10 shadow-2xl">
                                            <Share2 size={18} />
                                        </button>
                                        {/* Close Button Overlay */}
                                        <button
                                            onClick={handleCloseProfile}
                                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10 shadow-2xl z-10"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Profile Identity Overlay */}
                                    <div className="px-6 pb-6 -mt-12 relative flex flex-col sm:flex-row items-end justify-between gap-6">
                                        <div className="flex flex-col sm:flex-row items-end gap-5">
                                            <div className="relative group">
                                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-bg p-1.5 shadow-2xl overflow-hidden border border-border/50">
                                                    {selectedProfile.photo ? (
                                                        <img src={selectedProfile.photo} className="w-full h-full object-cover rounded-2xl" alt="Profile" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-black">
                                                            {selectedProfile.firstName?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pb-2 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-3xl font-black tracking-tight">{selectedProfile.firstName || 'Unknown'} {selectedProfile.lastName || 'User'}</h2>
                                                    <CheckCircle size={22} className="text-primary" />
                                                    <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded">#{selectedProfile.role || 'Professional'}</div>
                                                    <div className="flex items-center gap-1 text-accent font-black text-sm">
                                                        <Star size={14} fill="currentColor" /> 5
                                                    </div>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation()
                                                            setIsFavorite(!isFavorite)
                                                        }}
                                                        className={`h-9 w-9 rounded-full bg-bg-offset border border-border flex items-center justify-center transition-all ${isFavorite ? 'text-danger bg-danger/5 border-danger/20 scale-110 shadow-lg' : 'text-text-dim hover:text-danger'}`}
                                                    >
                                                        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons in Header */}
                                        <div className="flex gap-3 pb-2">
                                            <button className="h-11 px-6 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                Add to Estimation List
                                            </button>
                                            <div className="relative group">
                                                <button
                                                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                                                    className="h-11 px-6 bg-accent text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-accent/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    Contact <ChevronDown size={14} className={`transition-transform duration-300 ${showContactDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {showContactDropdown && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute bottom-full mb-3 right-0 w-48 bg-bg-offset border border-border rounded-2xl shadow-2xl p-2 z-50"
                                                        >
                                                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-3 text-xs font-bold text-text-main">
                                                                <Mail size={14} className="text-primary" /> Email Professionally
                                                            </button>
                                                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-3 text-xs font-bold text-text-main border-t border-border/30">
                                                                <MessageSquare size={14} className="text-accent" /> Direct Message
                                                            </button>
                                                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/5 transition-colors flex items-center gap-3 text-xs font-bold text-danger border-t border-border/30">
                                                                <X size={14} /> Clear Cache
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Demographic & Experience Grid */}
                                <div className="px-8 py-8 border-t border-border/30">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-12">
                                        <GridStat label="Member Since" value="22/11/2025" />
                                        <GridStat label="My Response Time" value="48 hours" />
                                        <GridStat label="Location" value={selectedProfile.location || 'Kochi, Kerala, India'} />
                                        <GridStat label="Age & Gender" value={`${selectedProfile.age || '--'}, ${selectedProfile.gender || 'Male'}`} />
                                        <GridStat label="Languages Known" value={selectedProfile.languages?.join(', ') || 'English, Malayalam, Tamil, Hindi'} />
                                        <GridStat label="Height & Weight" value={`${selectedProfile.height || '--'} (h), ${selectedProfile.weight || '--'} (w)`} />
                                        <GridStat label="Skin Tone" value={selectedProfile.skinTone || 'Medium'} />
                                    </div>
                                </div>

                                {/* 3. Description Section */}
                                <div className="px-8 pb-10">
                                    <h3 className="text-lg font-black tracking-tight mb-4">Description</h3>
                                    <p className="text-sm leading-relaxed text-text-muted font-medium bg-bg-offset/30 p-6 rounded-3xl border border-border/50">
                                        {selectedProfile.bio || `I am ${selectedProfile.firstName || 'a creator'} — a professional driven by strong characters and rooted emotions. My journey in cinema has always been about exploring real people, their struggles, and their spirited dreams. I love challenging myself and bringing authenticity to every frame. Acting is not just my profession, it's my passion and my identity.`}
                                    </p>
                                </div>

                                {/* 4. Professional Stats Blocks */}
                                <div className="px-8 pb-12 space-y-10">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">Years of Experience</h4>
                                        <p className="text-sm font-black text-primary">{selectedProfile.yearsOfExperience || '10'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">My Next Available Date</h4>
                                        <p className="text-sm font-black text-accent">{selectedProfile.availabilityDate || '01/12/2025 to 31/12/2025'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">Projects Worked On: Brand Name / Project Title</h4>
                                        <p className="text-sm font-bold text-text-main leading-relaxed">
                                            Angamaly Diaries, Velipadinte Pusthakam, Pokkiri Simon, Paipin Chuvattile Pranayam, Chekka Chivantha Vaanam, Sandakozhi 2, Contessa, Sachin, Ikkayude Sakadam, Love FM, Malik, Auto Shankar
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">Projects Type</h4>
                                        <p className="text-sm font-bold text-text-main">Feature Film, Drama, Web Series</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">Additional Skills:</h4>
                                        <p className="text-sm font-bold text-text-main">Action Choreographer, Dancer</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim">Awards and Recognition:</h4>
                                        <p className="text-sm font-medium text-text-muted leading-relaxed">
                                            South Indian International Movie Awards: Best actor in a Negative role, Vanitha Film Awards: Best Newcomer Actor, Asianet Film Awards: Best New Face Male, Asiavision Awards: New Sensation in acting, Filmfare Awards South: Best Supporting Actor
                                        </p>
                                    </div>
                                </div>

                                {/* 5. Social & Media Hub */}
                                <div className="px-8 pb-12 space-y-10">
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim mb-4">Social Media Links</h4>
                                        <div className="flex gap-6">
                                            <a href="#" className="flex items-center gap-2 text-xs font-black group transition-all">
                                                <Instagram size={20} className="text-[#E4405F]" /> Instagram
                                            </a>
                                            <a href="#" className="flex items-center gap-2 text-xs font-black group transition-all">
                                                <Globe size={20} className="text-primary" /> Facebook
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-dim mb-4">Youtube Links</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="aspect-video bg-bg-offset rounded-2xl overflow-hidden group relative cursor-pointer border border-border/50">
                                                    <div className="w-full h-full flex items-center justify-center bg-black/20">
                                                        <div className="w-10 h-10 bg-danger text-white rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                                                            <Play size={16} fill="white" />
                                                        </div>
                                                    </div>
                                                    <div className="translate-y-full group-hover:translate-y-0 absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-transform">
                                                        <div className="text-[10px] font-black text-white px-2 py-0.5 bg-danger inline-block rounded-sm mb-1 uppercase">Official Trailer</div>
                                                        <div className="text-[9px] font-bold text-white/80 line-clamp-1 truncate">Project Title Representation</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Portfolio Navigation - Final Tabs */}
                                <div className="px-8 pb-16">
                                    <div className="flex gap-8 border-b border-border mb-8">
                                        {['Photos', 'Videos'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setPortfolioTab(tab)}
                                                className={`pb-4 text-sm font-black tracking-widest uppercase transition-all relative ${portfolioTab === tab ? 'text-primary' : 'text-text-dim hover:text-text-main'}`}
                                            >
                                                {tab} ({tab === 'Photos' ? '4' : '1'})
                                                {portfolioTab === tab && (
                                                    <motion.div layoutId="pTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="space-y-2">
                                                <h5 className="text-[10px] font-black uppercase text-text-muted">Untitled</h5>
                                                <div className="aspect-[3/4] bg-bg-offset rounded-2xl overflow-hidden border border-border/50 group relative">
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                                                        <Camera size={24} className="opacity-20" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink size={24} className="text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Identity Reference */}
                            <div className="p-4 border-t border-border flex justify-between items-center bg-bg-offset/30 px-8">
                                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Profile ID: {selectedProfile.id}</p>
                                <div className="flex gap-4">
                                    <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Report Profile</button>
                                    <button className="text-[9px] font-black text-text-dim uppercase tracking-widest hover:underline">Block User</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function GridStat({ label, value }) {
    return (
        <div className="space-y-1">
            <h5 className="text-[10px] font-black text-text-dim uppercase tracking-wider">{label}</h5>
            <p className="text-xs font-black text-text-main line-clamp-1">{value || '--'}</p>
        </div>
    )
}

function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-primary-light shadow-sm border border-border/50">
                <Icon size={14} />
            </div>
            <div>
                <div className="text-[9px] uppercase font-bold text-text-dim leading-none mb-1">{label}</div>
                <div className="text-[11px] font-bold text-text-main truncate max-w-[120px]">{value || '—'}</div>
            </div>
        </div>
    )
}

function SocialIcon({ icon: Icon, href, color }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-bg-offset border border-border flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1"
            style={{ color }}>
            <Icon size={18} />
        </a>
    )
}
