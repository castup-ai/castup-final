import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, CheckCircle, X, Upload, Send, Trash2, FileText } from 'lucide-react'

const subCategories = ['General Inquiry', 'Technical Support', 'Account Issues', 'Partnership', 'Report a Bug', 'Feature Request', 'Billing', 'Other']

export default function ContactUs() {
    const [submitted, setSubmitted] = useState(false)
    const initialForm = {
        email: '', phone: '', subject: '', subCategory: '', message: '', attachments: []
    }
    const [form, setForm] = useState(initialForm)

    const resetForm = () => setForm(initialForm)
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-16">
                <div className="avatar avatar-xl mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => {
                    resetForm()
                    setSubmitted(false)
                }}>Send Another</button>
            </motion.div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-1">Contact Us</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    Have a question or feedback? We'd love to hear from you.
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <form onSubmit={handleSubmit} className="card p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" placeholder="your@email.com" required value={form.email}
                                    onChange={e => update('email', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                                    onChange={e => update('phone', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subject *</label>
                            <input placeholder="What's this about?" required value={form.subject}
                                onChange={e => update('subject', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select required value={form.subCategory} onChange={e => update('subCategory', e.target.value)}>
                                <option value="">Select category</option>
                                {subCategories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea rows={5} placeholder="Tell us more..." required value={form.message}
                                onChange={e => update('message', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Attach Files</label>
                            <div className="file-upload" onClick={() => document.getElementById('contact-file')?.click()}>
                                <Upload size={20} className="mx-auto mb-2" />
                                <p className="text-sm">Click to attach files</p>
                            </div>
                            <input type="file" id="contact-file" multiple style={{ display: 'none' }}
                                onChange={e => {
                                    const newFiles = Array.from(e.target.files);
                                    update('attachments', [...form.attachments, ...newFiles]);
                                }} />

                            {form.attachments && form.attachments.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {form.attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-primary truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = form.attachments.filter((_, i) => i !== idx);
                                                    update('attachments', updated);
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

                        <div className="flex gap-3 pt-2">
                            <button type="button" className="btn btn-secondary flex-1" onClick={resetForm}>
                                <X size={16} /> Cancel
                            </button>
                            <button type="submit" className="btn btn-primary flex-1">
                                <Send size={16} /> Submit
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
