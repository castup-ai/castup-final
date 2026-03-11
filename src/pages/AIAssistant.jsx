import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User, Sparkles } from 'lucide-react'
import api from '@/services/api'

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm CastUp's AI Assistant. I can help you find talent, prepare for auditions, or answer industry questions. How can I help you today?", time: new Date() }
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return
        const userMsg = { role: 'user', content: input, time: new Date() }
        const currentMessages = [...messages, userMsg];
        setMessages(currentMessages)
        setInput('')
        setTyping(true)

        try {
            const res = await api.post('/ai/chat', {
                message: input,
                // Pass history excluding the very first greeting if preferred, but we can pass all
                history: currentMessages.map(m => ({ role: m.role, content: m.content }))
            })
            if (res.data?.success) {
                setMessages(prev => [...prev, { role: 'ai', content: res.data.response, time: new Date() }])
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble connecting right now.", time: new Date() }])
            }
        } catch (error) {
            console.error("AI chat error:", error)
            setMessages(prev => [...prev, { role: 'ai', content: "I'm offline at the moment. Please check your internet or try again later.", time: new Date() }])
        } finally {
            setTyping(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles size={22} style={{ color: 'var(--color-primary-light)' }} /> AI Assistant
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Your intelligent cinema industry companion
                </p>
            </motion.div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`avatar avatar-sm flex-shrink-0 ${msg.role === 'ai' ? '' : ''}`}
                            style={msg.role === 'ai' ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' } : { background: 'var(--color-surface-lighter)' }}>
                            {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
                        </div>
                        <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? '' : ''}`}
                            style={{
                                background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-light)',
                                color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                            }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                    </motion.div>
                ))}
                {typing && (
                    <div className="flex gap-3">
                        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                            <Bot size={14} />
                        </div>
                        <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-surface-light)' }}>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: 'var(--color-text-muted)' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me about cinema talent, profiles, rates..."
                    className="flex-1"
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}
