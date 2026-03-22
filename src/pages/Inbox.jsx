import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { MessageSquare, Clock, ArrowRight, Plus, X, User, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Inbox() {
    const { user, notifications, markAllRead, allUsers, connectedUserIds, sendTargetedNotification, refreshPlatformData } = useAuth()
    const navigate = useNavigate()
    const [showNewMessage, setShowNewMessage] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRecipient, setSelectedRecipient] = useState(null)
    const [messageText, setMessageText] = useState('')
    const [sending, setSending] = useState(false)
    
    // Filter messages
    const messages = notifications.filter(n => n.type === 'message')
    
    // Group by Peer (the other person in the conversation)
    const groupedMessages = messages.reduce((acc, msg) => {
        const myId = user?.id
        // If I am the recipient, the peer is the sender. If I am the sender, the peer is the user_id (target).
        const peerId = msg.user_id === myId ? msg.metadata?.senderId : msg.user_id
        
        if (!peerId || peerId === myId) return acc;
        
        if (!acc[peerId]) {
            const peerUser = allUsers.find(u => String(u.id) === String(peerId))
            acc[peerId] = {
                peerId,
                peerName: msg.user_id === myId ? (peerUser?.name || msg.metadata?.senderName || 'User') : (msg.metadata?.recipientName || peerUser?.name || 'User'),
                peerPhoto: peerUser?.photo || (msg.user_id === myId ? null : msg.metadata?.recipientPhoto),
                messages: [],
                unread: 0,
                lastMessage: msg
            }
        }
        acc[peerId].messages.push(msg)
        if (!msg.read && msg.user_id === myId) acc[peerId].unread++
        
        // Update last message if this one is newer
        if (new Date(msg.timestamp) > new Date(acc[peerId].lastMessage.timestamp)) {
            acc[peerId].lastMessage = msg
        }
        return acc
    }, {})
    
    const threads = Object.values(groupedMessages).sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    )

    const handleSendMessage = async () => {
        if (!selectedRecipient || !messageText.trim()) return
        
        setSending(true)
        const { success } = await sendTargetedNotification(selectedRecipient.id, {
            type: 'message',
            title: 'New Message',
            message: messageText,
            metadata: { 
                senderId: user.id, 
                senderName: user.name,
                recipientName: selectedRecipient.name,
                recipientPhoto: selectedRecipient.photo
            }
        })
        
        setSending(false)
        if (success) {
            setMessageText('')
            setSelectedRecipient(null)
            setShowNewMessage(false)
            // Refresh notifications to show the sent message immediately
            refreshPlatformData()
        }
    }

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
                            key={thread.peerId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate('/explore', { state: { viewProfileId: thread.peerId } })}
                            className="card p-4 hover:border-primary transition-colors cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{thread.peerName}</h3>
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
                                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {!selectedRecipient ? (
                                        <>
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
                                            {allUsers
                                                .filter(u => connectedUserIds.includes(u.id))
                                                .filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(conn => (
                                                    <button
                                                        key={conn.id}
                                                        onClick={() => setSelectedRecipient(conn)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
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
                                        </>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                                    {selectedRecipient.photo ? (
                                                        <img src={selectedRecipient.photo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-primary" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm tracking-tight">{selectedRecipient.name}</p>
                                                    <button onClick={() => setSelectedRecipient(null)} className="text-[10px] text-primary font-bold hover:underline">Change recipient</button>
                                                </div>
                                            </div>

                                            <textarea 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary outline-none min-h-[120px] transition-all"
                                                placeholder={`Write your message to ${selectedRecipient.name.split(' ')[0]}...`}
                                                value={messageText}
                                                onChange={e => setMessageText(e.target.value)}
                                                autoFocus
                                            />
                                            
                                            <button 
                                                onClick={handleSendMessage}
                                                disabled={sending || !messageText.trim()}
                                                className="w-full h-12 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                            >
                                                {sending ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>
                                    )}
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
