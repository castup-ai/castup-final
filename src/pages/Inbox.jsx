import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { MessageSquare, Clock, ArrowRight, Plus, X, User, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Inbox() {
    const { notifications, markAllRead, allUsers, connectedUserIds } = useAuth()
    const navigate = useNavigate()
    const [showNewMessage, setShowNewMessage] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    
    // Filter messages
    const messages = notifications.filter(n => n.type === 'message')
    
    // Group by sender
    const groupedMessages = messages.reduce((acc, msg) => {
        const senderId = msg.metadata?.senderId
        if (!senderId) return acc;
        if (!acc[senderId]) {
            acc[senderId] = {
                senderId,
                senderName: msg.metadata?.senderName || 'User',
                messages: [],
                unread: 0,
                lastMessage: msg
            }
        }
        acc[senderId].messages.push(msg)
        if (!msg.read) acc[senderId].unread++
        
        // Update last message if this one is newer
        if (new Date(msg.timestamp) > new Date(acc[senderId].lastMessage.timestamp)) {
            acc[senderId].lastMessage = msg
        }
        return acc
    }, {})
    
    const threads = Object.values(groupedMessages).sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    )

    useEffect(() => {
        // Optionally mark all read when visiting inbox
        if (messages.some(m => !m.read)) {
            markAllRead()
        }
    }, [messages, markAllRead])

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <MessageSquare size={24} style={{ color: 'var(--color-primary)' }}/> Inbox
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Your recent conversations and messages
                    </p>
                </div>
                <button 
                    onClick={() => setShowNewMessage(true)}
                    className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                    title="New Message"
                >
                    <Plus size={20} />
                </button>
            </motion.div>

            <div className="space-y-4">
                {threads.length === 0 ? (
                    <div className="card p-8 text-center" style={{ background: 'var(--color-bg-offset)' }}>
                        <div className="avatar mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <MessageSquare size={24} style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                        <h3 className="font-semibold mb-1">No Messages Yet</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            When you connect with people and message them, conversations will appear here.
                        </p>
                    </div>
                ) : (
                    threads.map((thread, i) => (
                        <motion.div
                            key={thread.senderId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate('/explore', { state: { viewProfileId: thread.senderId } })}
                            className="card p-4 hover:border-primary transition-colors cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{thread.senderName}</h3>
                                    {thread.unread > 0 && (
                                        <span className="badge badge-primary text-[10px] px-1.5 min-w-[20px] text-center">
                                            {thread.unread} new
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm truncate max-w-md text-gray-400">
                                    {thread.lastMessage.message}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(thread.lastMessage.timestamp).toLocaleDateString()}
                                </span>
                                <ArrowRight size={16} className="text-primary mt-1" />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* New Message Modal */}
            <AnimatePresence>
                {showNewMessage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewMessage(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-bg-offset border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold">New Message</h2>
                                <button onClick={() => setShowNewMessage(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="relative mb-4">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input 
                                        type="text" 
                                        placeholder="Search connections..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {allUsers
                                        .filter(u => connectedUserIds.includes(u.id))
                                        .filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(conn => (
                                            <button
                                                key={conn.id}
                                                onClick={() => {
                                                    navigate('/explore', { state: { viewProfileId: conn.id, autoMessage: true } });
                                                    setShowNewMessage(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                                    {conn.photo ? (
                                                        <img src={conn.photo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-primary" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{conn.name}</p>
                                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">{conn.role || 'Professional'}</p>
                                                </div>
                                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))
                                    }
                                    {connectedUserIds.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-sm opacity-60">You don't have any connections yet.</p>
                                            <button 
                                                onClick={() => navigate('/explore')}
                                                className="text-xs text-primary font-bold mt-2 hover:underline"
                                            >
                                                Find people to connect with
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
