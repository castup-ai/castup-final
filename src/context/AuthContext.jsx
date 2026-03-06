import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = []

const MOCK_JOBS = []

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [registeredUsers, setRegisteredUsers] = useState(() => {
        try {
            const saved = localStorage.getItem('castup_registered')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })
    const [registeredJobs, setRegisteredJobs] = useState(() => {
        try {
            const saved = localStorage.getItem('castup_jobs')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })

    useEffect(() => {
        const saved = localStorage.getItem('castup_auth')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setUser(parsed.user)
                setToken(parsed.token)
            } catch (e) { localStorage.removeItem('castup_auth') }
        }

        // Clean up duplicate registered users by email if any exist
        setRegisteredUsers(prev => {
            const unique = []
            const emails = new Set()
            prev.forEach(u => {
                if (u.email && !emails.has(u.email)) {
                    emails.add(u.email)
                    unique.push(u)
                }
            })
            if (unique.length !== prev.length) {
                localStorage.setItem('castup_registered', JSON.stringify(unique))
            }
            return unique
        })
    }, [])

    const login = (email, password) => {
        // Check mock users first, then registered users
        const allKnown = [...MOCK_USERS, ...registeredUsers]
        const found = allKnown.find(u => u.email === email)
        if (found) {
            // If the user has a password set, enforce it. Old accounts without a password will accept any password.
            if (found.password && found.password !== password) {
                return { success: false, error: 'Invalid password' }
            }
            const mockToken = 'mock-jwt-' + Date.now()
            setUser(found)
            setToken(mockToken)
            localStorage.setItem('castup_auth', JSON.stringify({ user: found, token: mockToken }))
            return { success: true, user: found }
        }
        return { success: false, error: 'Invalid email' }
    }

    const register = (data) => {
        // Check if email already exists
        const allKnown = [...MOCK_USERS, ...registeredUsers]
        if (allKnown.some(u => u.email === data.email)) {
            return { success: false, error: 'Email already exists' }
        }

        const newUser = {
            id: String(Date.now()),
            ...data,
            department: '', role: '', experience: '', availability: '',
            location: data.country || '', languages: [], age: null, gender: '',
            height: '', weight: '', nextAvailable: '', bio: '', yearsOfExperience: 0,
            awards: '', skills: [], portfolioLink: '', socialMedia: {},
            projectType: '', recentWorks: [], photo: null
        }
        const mockToken = 'mock-jwt-' + Date.now()
        // Save to registered users list
        const updated = [...registeredUsers, newUser]
        setRegisteredUsers(updated)
        localStorage.setItem('castup_registered', JSON.stringify(updated))

        setUser(newUser)
        setToken(mockToken)
        localStorage.setItem('castup_auth', JSON.stringify({ user: newUser, token: mockToken }))
        return { success: true, user: newUser }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('castup_auth')
    }

    const addJob = (jobData) => {
        const newJob = {
            id: String(Date.now()),
            ...jobData,
            createdBy: user,
            createdAt: new Date().toISOString()
        }
        setRegisteredJobs(prev => {
            const updated = [newJob, ...prev]
            localStorage.setItem('castup_jobs', JSON.stringify(updated))
            return updated
        })
        return { success: true, job: newJob }
    }

    const deleteJob = (jobId) => {
        setRegisteredJobs(prev => {
            const updated = prev.filter(j => j.id !== jobId)
            localStorage.setItem('castup_jobs', JSON.stringify(updated))
            return updated
        })
        return { success: true }
    }

    const updateProfile = (data) => {
        const updated = { ...user, ...data }
        setUser(updated)
        localStorage.setItem('castup_auth', JSON.stringify({ user: updated, token }))
        // Also update in registered users list if applicable
        const regIdx = registeredUsers.findIndex(u => u.id === updated.id)
        if (regIdx !== -1) {
            const updatedReg = [...registeredUsers]
            updatedReg[regIdx] = updated
            setRegisteredUsers(updatedReg)
            localStorage.setItem('castup_registered', JSON.stringify(updatedReg))
        }
        return { success: true }
    }

    const requireAuth = (callback) => {
        if (!user) {
            setShowAuthModal(true)
            return false
        }
        if (callback) callback()
        return true
    }

    const uniqueJobs = Array.from(new Map([...MOCK_JOBS, ...registeredJobs].map(item => [item.id, item])).values())

    return (
        <AuthContext.Provider value={{
            user, token, login, register, logout, updateProfile, requireAuth,
            isAuthenticated: !!user,
            showAuthModal, setShowAuthModal,
            allUsers: [...MOCK_USERS, ...registeredUsers],
            allJobs: uniqueJobs,
            addJob,
            deleteJob
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
