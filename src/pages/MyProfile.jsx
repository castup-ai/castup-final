import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
    User, Save, X, Camera, MapPin, Calendar, Award, Globe,
    Briefcase, Languages, Edit3, CheckCircle, Trash2
} from 'lucide-react'

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
const experienceLevels = ['Beginner', 'Intermediate', 'Expert']
const availabilityOptions = ['Immediately', 'Next Week', 'Next Month', 'Not Available']

export default function MyProfile() {
    const { user, updateProfile } = useAuth()
    const [editing, setEditing] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', country: '',
        role: '', category: 'Artist', experience: '', availability: '', location: '',
        languages: '', age: '', gender: '', height: '', weight: '',
        nextAvailable: '', bio: '', yearsOfExperience: '', awards: '',
        skills: '', portfolioLink: '', socialMedia: '',
        projectType: '', photo: null
    })

    useEffect(() => {
        if (user && !editing) {
            setForm({
                firstName: user.firstName || '', lastName: user.lastName || '',
                email: user.email || '', phone: user.phone || '', country: user.country || '',
                role: user.role || '', category: user.category || (CREW_ROLES.includes(user.role) ? 'Crew' : 'Artist'),
                experience: user.experience || '',
                availability: user.availability || '', location: user.location || '',
                languages: user.languages?.join(', ') || '', age: user.age || '',
                gender: user.gender || '', height: user.height || '', weight: user.weight || '',
                nextAvailable: user.nextAvailable || '', bio: user.bio || '',
                yearsOfExperience: user.yearsOfExperience || '', awards: user.awards || '',
                skills: user.skills?.join(', ') || '', portfolioLink: user.portfolioLink || '',
                socialMedia: user.socialMedia ? JSON.stringify(user.socialMedia) : '',
                projectType: user.projectType || '', photo: user.photo || null
            })
        }
    }, [user, editing])

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSave = () => {
        if (form.age && Number(form.age) <= 0) {
            alert("Age cannot be negative or zero.");
            return;
        }
        updateProfile({
            ...form,
            languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            age: form.age ? Number(form.age) : null,
            yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : 0,
        })
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 3000)
    }

    if (!user) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Please log in to view your profile</h2>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage your professional identity</p>
                </div>
                {!editing ? (
                    <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                        <Edit3 size={14} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                            <X size={14} /> Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSave}>
                            <Save size={14} /> Save
                        </button>
                    </div>
                )}
            </motion.div>

            {saved && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                    style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={16} /> Profile updated successfully!
                </motion.div>
            )}

            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="card p-6 mb-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="avatar avatar-xl">
                            {user.photo
                                ? <img src={user.photo} alt={user.firstName} />
                                : <>{user.firstName?.[0]}{user.lastName?.[0]}</>
                            }
                        </div>
                        {editing && (
                            <>
                                <button
                                    type="button"
                                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                                    style={{ background: 'var(--color-primary)', color: 'white' }}
                                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                                >
                                    <Camera size={14} />
                                </button>
                                {user.photo && (
                                    <button
                                        type="button"
                                        className="absolute bottom-0 -left-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-white dark:bg-gray-800 border border-border shadow-sm text-danger"
                                        onClick={() => updateProfile({ ...user, photo: null })}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                <input
                                    type="file"
                                    id="profile-photo-input"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                const base64String = reader.result;
                                                update('photo', base64String);
                                                updateProfile({ photo: base64String });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <div className="flex-1">
                        {editing ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                                <p style={{ color: 'var(--color-text-muted)' }}>{user.role || 'Complete your profile'}</p>
                                <div className="flex items-center gap-1 text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
                                    <MapPin size={14} /> {user.location || 'Location not set'}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Professional Details */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="card p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase size={16} style={{ color: 'var(--color-primary-light)' }} /> Professional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label>Category</label>
                        {editing ? (
                            <select value={form.category} onChange={e => update('category', e.target.value)}>
                                <option value="">Choose a category</option>
                                <option value="Artist">Artist</option>
                                <option value="Crew">Crew</option>
                            </select>
                        ) : <div className="text-sm font-medium py-2">{form.category || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        {editing ? (
                            <select value={form.role} onChange={e => update('role', e.target.value)}>
                                <option value="">Select role</option>
                                {(form.category === 'Crew' ? CREW_ROLES : ARTIST_ROLES).map(r => <option key={r}>{r}</option>)}
                            </select>
                        ) : <div className="text-sm font-medium py-2">{user.role || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Experience Level</label>
                        {editing ? (
                            <select value={form.experience} onChange={e => update('experience', e.target.value)}>
                                <option value="">Select level</option>
                                {experienceLevels.map(l => <option key={l}>{l}</option>)}
                            </select>
                        ) : <div className="text-sm font-medium py-2">{user.experience || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Years of Experience</label>
                        {editing ? <input type="number" min="0" value={form.yearsOfExperience} onChange={e => update('yearsOfExperience', e.target.value)} />
                            : <div className="text-sm font-medium py-2">{user.yearsOfExperience || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Availability</label>
                        {editing ? (
                            <select value={form.availability} onChange={e => update('availability', e.target.value)}>
                                <option value="">Select</option>
                                {availabilityOptions.map(a => <option key={a}>{a}</option>)}
                            </select>
                        ) : <div className="text-sm font-medium py-2">
                            <span className={`badge ${user.availability === 'Immediately' ? 'badge-success' : 'badge-warning'} `}>
                                {user.availability || 'Not set'}
                            </span>
                        </div>}
                    </div>
                    <div className="form-group">
                        <label>Project Type</label>
                        {editing ? <input value={form.projectType} onChange={e => update('projectType', e.target.value)} placeholder="e.g. Feature Film" />
                            : <div className="text-sm font-medium py-2">{user.projectType || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Next Available Date</label>
                        {editing ? <input type="date" value={form.nextAvailable} onChange={e => update('nextAvailable', e.target.value)} />
                            : <div className="text-sm font-medium py-2">{user.nextAvailable || '—'}</div>}
                    </div>
                </div>
                <div className="form-group mt-4">
                    <label>Skills (comma separated)</label>
                    {editing ? <input value={form.skills} onChange={e => update('skills', e.target.value)} placeholder="Acting, Dance, Singing..." />
                        : <div className="flex flex-wrap gap-1.5 py-2">{user.skills?.map(s => <span key={s} className="badge">{s}</span>) || <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>—</span>}</div>}
                </div>
            </motion.div>

            {/* Personal Details */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="card p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User size={16} style={{ color: 'var(--color-secondary)' }} /> Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Location', field: 'location', placeholder: 'City, Country' },
                        { label: 'Languages (comma separated)', field: 'languages', placeholder: 'English, Hindi...' },
                        { label: 'Age', field: 'age', type: 'number' },
                        { label: 'Gender', field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                        { label: 'Height', field: 'height', placeholder: "5'6\"" },
                        { label: 'Weight', field: 'weight', placeholder: '55 kg' },
                        { label: 'Phone', field: 'phone' },
                        { label: 'Email', field: 'email', type: 'email' },
                        { label: 'Country', field: 'country' },
                    ].map(item => (
                        <div key={item.field} className="form-group">
                            <label>{item.label}</label>
                            {editing ? (
                                item.type === 'select' ? (
                                    <select value={form[item.field]} onChange={e => update(item.field, e.target.value)}>
                                        <option value="">Select</option>
                                        {item.options.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                ) : (
                                    <input type={item.type || 'text'} value={form[item.field]} min={item.type === 'number' ? "0" : undefined}
                                        placeholder={item.placeholder || ''} onChange={e => update(item.field, e.target.value)} />
                                )
                            ) : <div className="text-sm font-medium py-2">{form[item.field] || '—'}</div>}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Bio & Awards */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="card p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award size={16} style={{ color: 'var(--color-accent)' }} /> Bio & Achievements
                </h3>
                <div className="space-y-4">
                    <div className="form-group">
                        <label>Description / Bio</label>
                        {editing ? <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell us about yourself..." />
                            : <p className="text-sm py-2">{user.bio || '—'}</p>}
                    </div>
                    <div className="form-group">
                        <label>Awards & Recognition</label>
                        {editing ? <input value={form.awards} onChange={e => update('awards', e.target.value)} placeholder="Best Actor - Festival 2025..." />
                            : <p className="text-sm py-2">{user.awards || '—'}</p>}
                    </div>
                    <div className="form-group">
                        <label>Portfolio Link</label>
                        {editing ? <input value={form.portfolioLink} onChange={e => update('portfolioLink', e.target.value)} placeholder="https://..." />
                            : <p className="text-sm py-2">{user.portfolioLink ? <a href={user.portfolioLink} target="_blank" style={{ color: 'var(--color-primary-light)' }}>{user.portfolioLink}</a> : '—'}</p>}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
