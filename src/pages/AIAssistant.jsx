import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User, Sparkles } from 'lucide-react'

const AI_RESPONSES = {
    greet: "Hello! I'm CastUp's AI Assistant. I can help you with:\n\n• Finding the right talent for your project\n• Tips on improving your profile\n• Understanding industry standards\n• Answering cinema-related questions\n\nHow can I help you today?",
    talent: "Based on the current talent pool, I'd recommend checking the Explore page with filters set to your specific needs. You can filter by role, experience level, availability, and location to find the perfect match for your project.",
    profile: "Here are some tips to improve your profile:\n\n1. Add a professional headshot\n2. List all your skills and specializations\n3. Include your recent works with descriptions\n4. Add portfolio links (YouTube/Vimeo)\n5. Keep your availability status updated\n6. Write a compelling bio highlighting your unique strengths",
    rates: "Industry rates vary by role and experience:\n\n• Beginner actors: ₹5,000 - ₹15,000/day\n• Experienced actors: ₹25,000 - ₹1,00,000/day\n• Cinematographers: ₹15,000 - ₹50,000/day\n• Directors: Project-based, typically 5-15% of budget\n• Editors: ₹10,000 - ₹30,000/day\n\nThese are approximate ranges and can vary by region and project scale.",
    default: "That's a great question! While I'm a demo AI assistant, in the full version I'd be able to provide detailed insights on cinema industry trends, talent recommendations, and project planning advice. Feel free to ask about talent, profiles, or industry rates!"
}

function getAIResponse(msg) {
    const lower = msg.toLowerCase()
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return AI_RESPONSES.greet
    if (lower.includes('talent') || lower.includes('find') || lower.includes('actor') || lower.includes('crew')) return AI_RESPONSES.talent
    if (lower.includes('profile') || lower.includes('improve') || lower.includes('tips')) return AI_RESPONSES.profile
    if (lower.includes('rate') || lower.includes('pay') || lower.includes('salary') || lower.includes('cost')) return AI_RESPONSES.rates
    return AI_RESPONSES.default
}

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: AI_RESPONSES.greet, time: new Date() }
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        const userMsg = { role: 'user', content: input, time: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setTyping(true)

        setTimeout(() => {
            const response = getAIResponse(input)
            setMessages(prev => [...prev, { role: 'ai', content: response, time: new Date() }])
            setTyping(false)
        }, 1000 + Math.random() * 1000)
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
