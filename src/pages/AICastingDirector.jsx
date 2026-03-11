import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { Video, Search, Sparkles, Filter, MapPin, Star, Mail, MessageSquare, ChevronRight } from 'lucide-react'

const ageRanges = ['Any', '18-25', '26-35', '36-45', '46+']
const genders = ['Any', 'Male', 'Female', 'Other']

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

export default function AICastingDirector() {
    const { allUsers } = useAuth()
    const [criteria, setCriteria] = useState({
        category: 'All', role: 'All', experience: '', ageRange: 'Any', gender: 'Any', skills: '', location: ''
    })
    const [results, setResults] = useState(null)
    const [searching, setSearching] = useState(false)

    const handleSearch = () => {
        setSearching(true)
        setTimeout(() => {
            let matches = [...allUsers]
            if (criteria.role !== 'All') {
                matches = matches.filter(u => u.role === criteria.role)
            } else if (criteria.category !== 'All') {
                const list = criteria.category === 'Artist' ? ARTIST_ROLES : CREW_ROLES
                matches = matches.filter(u => list.includes(u.role))
            }
            if (criteria.experience) matches = matches.filter(u => u.experience === criteria.experience)
            if (criteria.gender !== 'Any') matches = matches.filter(u => u.gender === criteria.gender)
            if (criteria.location) matches = matches.filter(u => u.location?.toLowerCase().includes(criteria.location.toLowerCase()))
            if (criteria.skills) {
                const skillList = criteria.skills.split(',').map(s => s.trim().toLowerCase())
                matches = matches.filter(u => u.skills?.some(s => skillList.some(sk => s.toLowerCase().includes(sk))))
            }
            if (criteria.ageRange !== 'Any') {
                const [min, max] = criteria.ageRange.includes('+') ? [parseInt(criteria.ageRange), 100] : criteria.ageRange.split('-').map(Number)
                matches = matches.filter(u => u.age >= min && u.age <= max)
            }
            // Sort by match quality (experience points)
            matches.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0))
            setResults(matches)
            setSearching(false)
        }, 1500)
    }

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Video size={22} style={{ color: 'var(--color-accent)' }} /> AI Casting Director
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Describe your ideal cast member and let AI find the best matches
                </p>
            </motion.div>

            {/* Criteria */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Filter size={18} style={{ color: 'var(--color-primary-light)' }} /> Casting Requirements
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="form-group">
                        <label>Category</label>
                        <select value={criteria.category} onChange={e => setCriteria({ ...criteria, category: e.target.value, role: 'All' })}>
                            <option value="All">All Categories</option>
                            <option value="Artist">Artist</option>
                            <option value="Crew">Crew</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={criteria.role} onChange={e => setCriteria({ ...criteria, role: e.target.value })}>
                            <option value="All">All Roles</option>
                            {(criteria.category === 'Crew' ? CREW_ROLES : criteria.category === 'Artist' ? ARTIST_ROLES : [...ARTIST_ROLES, ...CREW_ROLES].sort()).map(r => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Experience Level</label>
                        <select value={criteria.experience} onChange={e => setCriteria({ ...criteria, experience: e.target.value })}>
                            <option value="">Any</option>
                            <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Age Range</label>
                        <select value={criteria.ageRange} onChange={e => setCriteria({ ...criteria, ageRange: e.target.value })}>
                            {ageRanges.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select value={criteria.gender} onChange={e => setCriteria({ ...criteria, gender: e.target.value })}>
                            {genders.map(g => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Skills (comma separated)</label>
                        <input placeholder="Dance, Singing..." value={criteria.skills}
                            onChange={e => setCriteria({ ...criteria, skills: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input placeholder="City or region" value={criteria.location}
                            onChange={e => setCriteria({ ...criteria, location: e.target.value })} />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                    {searching ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <Sparkles size={16} />
                            </motion.div>
                            AI is searching...
                        </>
                    ) : (
                        <><Search size={16} /> Find Matching Talent</>
                    )}
                </button>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {results !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title mb-0">
                                {results.length > 0 ? `${results.length} Matches Found` : 'No Matches'}
                            </h2>
                            {results.length > 0 && (
                                <span className="text-sm flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                                    <Sparkles size={14} /> AI Ranked
                                </span>
                            )}
                        </div>

                        {results.length === 0 ? (
                            <div className="card p-8 text-center">
                                <p style={{ color: 'var(--color-text-muted)' }}>No matches found. Try broadening your criteria.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="card card-interactive p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative">
                                                <div className="avatar avatar-lg">{user.firstName[0]}{user.lastName[0]}</div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
                                                    #{i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-base">{user.firstName} {user.lastName}</h3>
                                                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user.role} • {user.experience}</p>
                                                        <div className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                                                            <MapPin size={12} /> {user.location}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                                                            <Star size={14} /> {user.yearsOfExperience} yrs exp
                                                        </div>
                                                        <span className={`badge text-xs mt-1 ${user.availability === 'Immediately' ? 'badge-success' : 'badge-warning'}`}>
                                                            {user.availability}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{user.bio}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {user.skills?.slice(0, 4).map(s => <span key={s} className="badge text-xs">{s}</span>)}
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button className="btn btn-outline btn-sm"><Mail size={14} /> Connect</button>
                                                    <button className="btn btn-primary btn-sm"><MessageSquare size={14} /> Message</button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
