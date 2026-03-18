import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/RealAuthContext'
import { MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Inbox() {
    const { notifications, markAllRead } = useAuth()
    const navigate = useNavigate()
    
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
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <MessageSquare size={24} style={{ color: 'var(--color-primary)' }}/> Inbox
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Your recent conversations and messages
                </p>
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
        </div>
    )
}
