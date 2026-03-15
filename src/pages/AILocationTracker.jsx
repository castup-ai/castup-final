import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Users, Film, Navigation, Star, Sparkles } from 'lucide-react'
import { useAuth } from '../context/RealAuthContext'

export default function AILocationTracker() {
    const { allUsers } = useAuth()
    const [search, setSearch] = useState('')
    const [description, setDescription] = useState('')
    const [selected, setSelected] = useState(null)

    // Calculate dynamic locations based on real users
    const dynamicLocations = useMemo(() => {
        if (!allUsers || allUsers.length === 0) return [];
        
        const locMap = {};
        
        allUsers.forEach(user => {
            const rawLoc = user.location?.trim();
            if (!rawLoc) return; // Skip users without a location
            
            // Standardize capitalization (e.g., "mumbai" -> "Mumbai")
            const locName = rawLoc.charAt(0).toUpperCase() + rawLoc.slice(1).toLowerCase();
            
            if (!locMap[locName]) {
                locMap[locName] = {
                    id: locName,
                    name: locName,
                    region: 'India', // Could extract from Google Maps API later if needed
                    talent: 0,
                    active: 0,
                    roleCounts: {},
                    popularStudios: ['Independent/Local Studios']
                };
            }
            
            locMap[locName].talent += 1;
            
            // Count active ready workers
            if (user.availability === 'Available now' || user.availability === 'Ready to Work') {
                locMap[locName].active += 1;
            }
            
            // Aggregate roles
            if (user.role) {
                locMap[locName].roleCounts[user.role] = (locMap[locName].roleCounts[user.role] || 0) + 1;
            }
        });
        
        return Object.values(locMap).map((loc, index) => {
            // Get top 3 roles
            const topRoles = Object.entries(loc.roleCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(r => r[0]);
                
            return {
                id: index + 1,
                name: loc.name,
                region: loc.region,
                talent: loc.talent,
                active: loc.active,
                topRoles: topRoles.length > 0 ? topRoles : ['Various'],
                popularStudios: loc.popularStudios
            };
        }).sort((a, b) => b.talent - a.talent); // Sort by highest talent pool
    }, [allUsers]);

    const filtered = dynamicLocations.filter(l => {
        const term = search || description
        return !term || l.name.toLowerCase().includes(term.toLowerCase()) ||
            l.region.toLowerCase().includes(term.toLowerCase()) ||
            l.topRoles.some(r => r.toLowerCase().includes(term.toLowerCase())) ||
            l.popularStudios.some(s => s.toLowerCase().includes(term.toLowerCase()))
    })

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin size={22} style={{ color: 'var(--color-secondary)' }} /> AI Location Tracker
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Discover talent hubs and shooting locations across India
                </p>
            </motion.div>

            {/* Location Description Search (like Google Maps) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="card p-5 mb-5">
                <h2 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <Sparkles size={14} style={{ color: 'var(--color-accent)' }} /> Describe the Location You're Looking For
                </h2>
                <div className="flex gap-3">
                    <textarea
                        rows={2}
                        className="flex-1"
                        placeholder="e.g. A busy city with many Bollywood studios and actors available immediately in Western India..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <button
                        className="btn btn-secondary btn-sm self-end"
                        onClick={() => { setSearch(description) }}
                        disabled={!description.trim()}
                    >
                        <Search size={14} /> Search
                    </button>
                </div>
                {description && (
                    <button className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}
                        onClick={() => { setDescription(''); setSearch('') }}>Clear search</button>
                )}
            </motion.div>

            {/* Quick Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
                <input className="pl-10" placeholder="Quick search by city or state..." value={search}
                    onChange={e => { setSearch(e.target.value); setDescription('') }} />
            </div>

            {/* Map placeholder + Location cards */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Map area */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="lg:col-span-2 card p-0 overflow-hidden" style={{ minHeight: '400px' }}>
                    <div className="h-full flex flex-col items-center justify-center p-8 relative"
                        style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)' }}>
                        {/* Simulated map with dots */}
                        <div className="relative w-full h-80">
                            {dynamicLocations.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p style={{ color: 'var(--color-text-muted)' }}>No location data available yet. Users need to add locations to their profiles.</p>
                                </div>
                            ) : (
                                dynamicLocations.map((loc, i) => (
                                    <motion.div
                                        key={loc.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                                        className="absolute cursor-pointer group"
                                        style={{
                                            left: `${15 + (i % 3) * 30}%`,
                                            top: `${15 + Math.floor(i / 3) * 45}%`,
                                        }}
                                        onClick={() => setSelected(loc)}
                                    >
                                        <div className={`relative flex flex-col items-center`}>
                                            <div className={`w-4 h-4 rounded-full transition-all ${selected?.id === loc.id ? 'ring-4 ring-opacity-30' : ''}`}
                                                style={{
                                                    background: selected?.id === loc.id ? 'var(--color-primary)' : 'var(--color-secondary)',
                                                    ringColor: 'var(--color-primary)',
                                                    boxShadow: `0 0 ${Math.min(loc.talent * 2, 20)}px ${selected?.id === loc.id ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                                                }}>
                                                <motion.div
                                                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ background: 'var(--color-secondary)' }}
                                                />
                                            </div>
                                            <span className="text-xs mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                                style={{ color: 'var(--color-text)' }}>
                                                {loc.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <p className="text-xs mt-4" style={{ color: 'var(--color-text-dim)' }}>
                            <Navigation size={12} className="inline mr-1" /> Click on a location dot to view details
                        </p>
                    </div>
                </motion.div>

                {/* Location list */}
                <div className="space-y-3">
                    {filtered.map((loc, i) => (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`card p-4 cursor-pointer transition-all ${selected?.id === loc.id ? 'ring-1' : ''}`}
                            style={selected?.id === loc.id ? { borderColor: 'var(--color-primary)', ringColor: 'var(--color-primary)' } : {}}
                            onClick={() => setSelected(loc)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{loc.name}</h3>
                                <span className="badge badge-success text-xs">{loc.active} active</span>
                            </div>
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-dim)' }}>{loc.region}</p>
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <Users size={12} /> {loc.talent} professionals
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Selected location details */}
            {selected && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    className="card p-6 mt-6">
                    <h3 className="text-lg font-bold mb-4">{selected.name}, {selected.region}</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Statistics</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span style={{ color: 'var(--color-text-dim)' }}>Total Talent:</span> <strong>{selected.talent}</strong></div>
                                <div className="flex justify-between"><span style={{ color: 'var(--color-text-dim)' }}>Active Projects:</span> <strong>{selected.active}</strong></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Top Roles</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {selected.topRoles.map(r => <span key={r} className="badge text-xs">{r}</span>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Popular Studios</h4>
                            <div className="space-y-1">
                                {selected.popularStudios.map(s => (
                                    <div key={s} className="flex items-center gap-1.5 text-sm">
                                        <Film size={12} style={{ color: 'var(--color-accent)' }} /> {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
