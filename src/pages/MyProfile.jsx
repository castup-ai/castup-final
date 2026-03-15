import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import {
    User, Save, X, Camera, MapPin, Calendar, Award, Globe,
    Briefcase, Languages, Edit3, CheckCircle, Trash2, Film, Image as ImageIcon,
    Play, ZoomIn, Upload, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '@/services/api'

const PROJECT_TYPES = [
    'Feature Film', 'Short Film', 'Web Series', 'Documentary',
    'Music Video', 'Commercial', 'Ad Film', 'Corporate Video', 'Other'
]

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
    const location = useLocation()
    const navigate = useNavigate()
    
    // Check URL parameters for auto-edit mode (e.g., redirect from signup)
    const [editing, setEditing] = useState(() => {
        const params = new URLSearchParams(location.search)
        return params.get('edit') === 'true'
    })
    const [saved, setSaved] = useState(false)
    const [portfolio, setPortfolio] = useState(null)
    const [lightbox, setLightbox] = useState(null) // { project, fileIndex }
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', country: '',
        role: '', category: 'Artist', experience: '', availability: '', location: '',
        languages: '', age: '', gender: '', height: '', weight: '',
        nextAvailable: '', bio: '', yearsOfExperience: '', awards: '',
        skills: '', portfolioLink: '', socialMedia: '',
        projectType: '', photo: null
    })

    useEffect(() => {
        if (user) {
            const nameParts = (user.name || '').split(' ');
            const firstName = nameParts.length > 0 ? nameParts[0] : '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            // Only update form if it's currently empty or we're not explicitly editing (to avoid overwriting unsaved changes)
            // But for the FIRST load, we MUST populate it even if editing is true
            setForm(prev => {
                // If the email is empty, it's likely the first load after registration
                if (!prev.email || !editing) {
                    return {
                        firstName: firstName, lastName: lastName,
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
                    };
                }
                return prev;
            });
            
            if (!editing) {
                // Fetch Portfolio Media only when not in initial registration edit mode
                const fetchPortfolio = async () => {
                    try {
                        const res = await api.get('/portfolios/me')
                        if (res.data?.success && res.data.portfolio) {
                            setPortfolio(res.data.portfolio)
                        }
                    } catch(e) {
                        console.error("Failed to load portfolio works", e)
                    }
                }
                fetchPortfolio()
            }
        }
    }, [user, editing])

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSave = async () => {
        if (form.age && Number(form.age) <= 0) {
            alert("Age cannot be negative or zero.");
            return;
        }
        const result = await updateProfile({
            ...form,
            name: `${form.firstName} ${form.lastName}`.trim(),
            languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            age: form.age ? Number(form.age) : null,
            yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : 0,
        });
        
        if (result.success) {
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert(`Error saving profile: \${result.error || 'Unknown error. Check backend logs.'}`);
        }
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
                                ? <img src={user.photo} alt={user.name} />
                                : <>{(user.name || 'User').substring(0, 2).toUpperCase()}</>
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
                                <h2 className="text-xl font-bold">{user.name}</h2>
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
                        {editing ? (
                            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
                                <option value="">Select Project Type</option>
                                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        ) : <div className="text-sm font-medium py-2">{user.projectType || '—'}</div>}
                    </div>
                    <div className="form-group">
                        <label>Next Available Date</label>
                        {editing ? <input type="date" value={form.nextAvailable} onChange={e => update('nextAvailable', e.target.value)} />
                            : (
                                <div className="py-2">
                                    {user.nextAvailable ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--color-primary-light)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                            <Calendar size={12} /> {new Date(user.nextAvailable).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    ) : <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>—</span>}
                                </div>
                            )}
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

            {/* My Works / Projects Grid */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Film size={18} style={{ color: 'var(--color-secondary)' }} /> My Works
                    </h3>
                    <button
                        onClick={() => navigate('/upload-work')}
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                    >
                        <Upload size={14} /> Upload Work
                    </button>
                </div>
                
                {(!portfolio?.media || portfolio.media.length === 0) ? (
                    <div className="card p-8 text-center border-dashed">
                        <div className="avatar avatar-lg mx-auto mb-3" style={{ background: 'var(--color-bg-offset)', color: 'var(--color-text-dim)' }}>
                            <ImageIcon size={24} />
                        </div>
                        <h4 className="font-semibold mb-1">No Projects Yet</h4>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Upload videos and images to showcase your best work on your profile.</p>
                        <button onClick={() => navigate('/upload-work')} className="btn btn-primary btn-sm mx-auto">Upload Work</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolio.media.map((project, pi) => (
                            <div
                                key={project.id || project.title}
                                className="card overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300"
                                onClick={() => setLightbox({ project, fileIndex: 0 })}
                            >
                                {/* Thumbnail */}
                                <div className="w-full bg-black relative flex items-center justify-center overflow-hidden" style={{ minHeight: '180px', maxHeight: '260px' }}>
                                    {project.files && project.files.length > 0 && project.files[0].data ? (
                                        project.files[0].type?.startsWith('video/') ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <video
                                                    src={project.files[0].data}
                                                    className="w-full h-auto max-h-[260px] object-contain"
                                                    preload="metadata"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all">
                                                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                                                        <Play size={20} className="text-primary ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full">
                                                <img
                                                    src={project.files[0].data}
                                                    alt={project.title}
                                                    className="w-full h-auto max-h-[260px] object-contain group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20">
                                                    <ZoomIn size={28} className="text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/20" style={{ height: '180px' }}>
                                            <Film size={32} className="opacity-20 text-white mb-2" />
                                            <span className="text-xs text-white/40">No preview</span>
                                        </div>
                                    )}
                                    {project.files && project.files.length > 1 && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <div className="bg-black/60 backdrop-blur-md rounded-full px-2 py-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-white shadow">
                                                <ImageIcon size={10} /> +{project.files.length - 1}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--color-secondary)' }}>{project.type}</p>
                                    <h4 className="font-semibold leading-tight line-clamp-1 mb-2">{project.title}</h4>
                                    <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: 'var(--color-text-dim)' }}>{project.description}</p>
                                    <div className="pt-3 mt-auto border-t border-border flex items-center justify-between">
                                        <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}
                                        </div>
                                        <span className="text-[10px] font-bold text-primary opacity-60">Tap to open</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.92)' }}
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setLightbox(null)}
                                className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm font-bold"
                            >
                                <X size={18} /> Close
                            </button>

                            {/* Media Viewer */}
                            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '70vh' }}>
                                {(() => {
                                    const file = lightbox.project.files?.[lightbox.fileIndex]
                                    if (!file?.data) return (
                                        <div className="text-white/30 text-sm p-12">No media to display</div>
                                    )
                                    return file.type?.startsWith('video/') ? (
                                        <video src={file.data} controls autoPlay className="max-w-full max-h-[70vh] object-contain" style={{ width: '100%' }} />
                                    ) : (
                                        <img src={file.data} alt={lightbox.project.title} className="max-w-full max-h-[70vh] object-contain" />
                                    )
                                })()}
                            </div>

                            {/* Navigation for multiple files */}
                            {lightbox.project.files && lightbox.project.files.length > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <button
                                        onClick={() => setLightbox(prev => ({ ...prev, fileIndex: Math.max(0, prev.fileIndex - 1) }))}
                                        disabled={lightbox.fileIndex === 0}
                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30"
                                    ><ChevronLeft size={20} /></button>
                                    <span className="text-white/60 text-sm">{lightbox.fileIndex + 1} / {lightbox.project.files.length}</span>
                                    <button
                                        onClick={() => setLightbox(prev => ({ ...prev, fileIndex: Math.min(lightbox.project.files.length - 1, prev.fileIndex + 1) }))}
                                        disabled={lightbox.fileIndex === lightbox.project.files.length - 1}
                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30"
                                    ><ChevronRight size={20} /></button>
                                </div>
                            )}

                            {/* Info Row */}
                            <div className="mt-4 text-center">
                                <h3 className="text-white font-bold text-lg">{lightbox.project.title}</h3>
                                <p className="text-white/50 text-sm mt-1">{lightbox.project.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
