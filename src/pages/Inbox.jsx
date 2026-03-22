import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { MessageSquare, Clock, ArrowRight, Plus, X, User, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Inbox() {
    const { user, notifications, markAllRead, allUsers, connectedUserIds, sendTargetedNotification, deleteNotification, refreshPlatformData } = useAuth()
    const navigate = useNavigate()
    const [showNewMessage, setShowNewMessage] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRecipient, setSelectedRecipient] = useState(null)
    const [selectedThread, setSelectedThread] = useState(null)
    const [messageText, setMessageText] = useState('')
    const [sending, setSending] = useState(false)
    const [deleting, setDeleting] = useState(null) // ID of message being deleted
    
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
            // If we are in a thread, update selectedThread.messages
            if (selectedThread) {
                refreshPlatformData()
            } else {
                refreshPlatformData()
            }
        }
    }

    const handleDeleteMessage = async (msgId, e) => {
        e?.stopPropagation()
        if (!confirm('Are you sure you want to delete this message?')) return
        
        setDeleting(msgId)
        const { success } = await deleteNotification(msgId)
        setDeleting(null)
        
        if (success && selectedThread) {
            // Update local thread state
            setSelectedThread(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== msgId)
            }))
        }
    }

    const handleDeleteThread = async (peerId, e) => {
        e?.stopPropagation()
        const thread = groupedMessages[peerId]
        if (!thread || !confirm(`Delete entire conversation with ${thread.peerName}?`)) return
        
        setSending(true)
        for (const msg of thread.messages) {
            await deleteNotification(msg.id)
        }
        setSending(false)
        setSelectedThread(null)
        refreshPlatformData()
    }

    useEffect(() => {
        // Optionally mark all read when visiting inbox
        if (messages.some(m => !m.read)) {
            markAllRead()
        }
    }, [messages, markAllRead])

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <MessageSquare size={24} style={{ color: 'var(--color-primary)' }}/> Inbox
                    </h1>
                    <p className="text-sm opacity-60">
                        {selectedThread ? `Conversation with ${selectedThread.peerName}` : 'Your recent conversations and messages'}
                    </p>
                </div>
                {!selectedThread && (
                    <button 
                        onClick={() => setShowNewMessage(true)}
                        className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                        title="New Message"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </motion.div>

            <div className="space-y-4">
                {/* Threads List */}
                {!selectedThread ? (
                    <div className="flex flex-col gap-4">
                        {threads.length === 0 ? (
                            <div className="card text-center py-20 bg-white/5 border-dashed border-white/10">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <h2 className="text-xl font-bold mb-2">No Messages Yet</h2>
                                <p className="text-sm opacity-60">When you connect with people and message them, conversations will appear here.</p>
                                <button 
                                    onClick={() => setShowNewMessage(true)}
                                    className="btn btn-primary btn-sm mt-6"
                                >
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            threads.map((thread, i) => (
                                <motion.div
                                    key={thread.peerId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedThread(thread)}
                                    className="card p-4 hover:border-primary transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                            {thread.peerPhoto ? (
                                                <img src={thread.peerPhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-primary" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">{thread.peerName}</h3>
                                                {thread.unread > 0 && (
                                                    <span className="badge badge-primary text-[10px] px-1.5 min-w-[20px] text-center">
                                                        {thread.unread} new
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs opacity-60 line-clamp-1 italic">
                                                {thread.lastMessage.user_id !== user?.id ? 'You: ' : ''}{thread.lastMessage.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] opacity-40 uppercase tracking-widest font-black">
                                            {new Date(thread.lastMessage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDeleteThread(thread.peerId, e)}
                                            className="p-2 opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-danger transition-all rounded-lg hover:bg-white/5"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    /* Conversation View */
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-[70vh] card p-0 overflow-hidden bg-white/[0.02]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedThread(null)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all mr-1"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div 
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                                    onClick={() => navigate('/explore', { state: { viewProfileId: selectedThread.peerId } })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                        {selectedThread.peerPhoto ? (
                                            <img src={selectedThread.peerPhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm tracking-tight">{selectedThread.peerName}</h3>
                                        <span className="text-[9px] text-primary font-bold uppercase tracking-widest">View Profile</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteThread(selectedThread.peerId, e)}
                                className="p-2 opacity-40 hover:opacity-100 hover:text-danger transition-all rounded-xl hover:bg-white/5"
                                title="Delete Conversation"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Messages List List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                            {selectedThread.messages
                                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                .map((msg, idx) => {
                                    // Received: user_id == myId
                                    // Sent: metadata->senderId == myId (and user_id != myId)
                                    const sentByMe = msg.user_id !== user?.id || msg.metadata?.senderId === user?.id;
                                    
                                    return (
                                        <div key={msg.id} className={`flex ${sentByMe ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                                            {!sentByMe && (
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20 mb-4">
                                                    {selectedThread.peerPhoto ? (
                                                        <img src={selectedThread.peerPhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={12} className="text-primary" />
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col max-w-[80%]">
                                                <div className={`relative px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                                    sentByMe 
                                                        ? 'bg-primary text-white rounded-tr-none' 
                                                        : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                                }`}>
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                    
                                                    {/* Delete single message button */}
                                                    <button 
                                                        disabled={deleting === msg.id}
                                                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                                                        className={`absolute -top-2 ${sentByMe ? '-left-8' : '-right-8'} p-1.5 opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-danger transition-all rounded-lg bg-white/5`}
                                                        title="Delete message"
                                                    >
                                                        {deleting === msg.id ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Trash2 size={12} />}
                                                    </button>
                                                </div>
                                                <span className={`text-[8px] mt-1 opacity-40 uppercase tracking-widest font-black ${sentByMe ? 'text-right mr-1' : 'text-left ml-1'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {sentByMe && (
                                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 mb-4">
                                                    {user?.photo ? (
                                                        <img src={user.photo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={12} className="opacity-40" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            }
                        </div>

                        {/* Quick Reply Box */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.03]">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    placeholder={`Reply to ${selectedThread.peerName}...`}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all shadow-inner"
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !sending && messageText.trim() && (setSelectedRecipient({ id: selectedThread.peerId, name: selectedThread.peerName }), handleSendMessage())}
                                />
                                <button 
                                    onClick={() => {
                                        setSelectedRecipient({ id: selectedThread.peerId, name: selectedThread.peerName });
                                        handleSendMessage();
                                    }}
                                    disabled={sending || !messageText.trim()}
                                    className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
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
                                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
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
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary outline-none min-h-[120px] transition-all shadow-inner"
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
    );
}
