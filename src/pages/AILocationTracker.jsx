import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Users, Film, Navigation, Star } from 'lucide-react'

const MOCK_LOCATIONS = [
    {
        id: 1, name: 'Mumbai', region: 'Maharashtra', talent: 342, active: 15, lat: '19.0760', lng: '72.8777',
        topRoles: ['Actor', 'Director', 'Producer'], popularStudios: ['Film City', 'Mehboob Studios']
    },
    {
        id: 2, name: 'Chennai', region: 'Tamil Nadu', talent: 218, active: 8, lat: '13.0827', lng: '80.2707',
        topRoles: ['Actor', 'Music Director', 'Cinematographer'], popularStudios: ['AVM Studios', 'Prasad Studios']
    },
    {
        id: 3, name: 'Hyderabad', region: 'Telangana', talent: 186, active: 12, lat: '17.3850', lng: '78.4867',
        topRoles: ['Actor', 'Producer', 'VFX Artist'], popularStudios: ['Ramoji Film City', 'Annapurna Studios']
    },
    {
        id: 4, name: 'Kochi', region: 'Kerala', talent: 124, active: 6, lat: '9.9312', lng: '76.2673',
        topRoles: ['Actor', 'Director', 'Editor'], popularStudios: ['Revathi Kalamandir', 'Udaya Studios']
    },
    {
        id: 5, name: 'Bangalore', region: 'Karnataka', talent: 97, active: 5, lat: '12.9716', lng: '77.5946',
        topRoles: ['VFX Artist', 'Sound Designer', 'Editor'], popularStudios: ['Kanteerava Studios']
    },
    {
        id: 6, name: 'Delhi NCR', region: 'Delhi', talent: 156, active: 9, lat: '28.7041', lng: '77.1025',
        topRoles: ['Actor', 'Screenwriter', 'Director'], popularStudios: ['Noida Film City', 'Marwah Studios']
    },
]

export default function AILocationTracker() {
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)

    const filtered = MOCK_LOCATIONS.filter(l =>
        !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.region.toLowerCase().includes(search.toLowerCase())
    )

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

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
                <input className="pl-10" placeholder="Search locations..." value={search}
                    onChange={e => setSearch(e.target.value)} />
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
                            {MOCK_LOCATIONS.map((loc, i) => (
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
                                                boxShadow: `0 0 ${loc.talent / 20}px ${selected?.id === loc.id ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
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
                            ))}
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
