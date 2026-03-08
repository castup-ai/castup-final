import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import api from '../services/api';

const RealAuthContext = createContext(null);

export function RealAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // We keep jobs locally for now or if we implement a job service we can swap it later
    const [registeredJobs, setRegisteredJobs] = useState(() => {
        try {
            const saved = localStorage.getItem('castup_jobs_real');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        const initAuth = async () => {
            const saved = localStorage.getItem('castup_auth_real');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setToken(parsed.token);

                    // Fetch fresh profile data using the token
                    const { success, data } = await authService.getProfile();
                    if (success) {
                        setUser(data);
                    } else {
                        // Token might be expired
                        logout();
                    }
                } catch (e) {
                    localStorage.removeItem('castup_auth_real');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const { success, data, error } = await authService.login(email, password);

        if (success) {
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('castup_auth_real', JSON.stringify({ token: data.token }));
            return { success: true, user: data.user };
        }

        return { success: false, error: error };
    };

    const register = async (data) => {
        const { success, data: resultData, error } = await authService.register(data);

        if (success) {
            setUser(resultData.user);
            setToken(resultData.token);
            localStorage.setItem('castup_auth_real', JSON.stringify({ token: resultData.token }));
            return { success: true, user: resultData.user };
        }

        return { success: false, error: error };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('castup_auth_real');
    };

    const addJob = (jobData) => {
        const newJob = {
            id: String(Date.now()),
            ...jobData,
            createdBy: user,
            createdAt: new Date().toISOString()
        }
        setRegisteredJobs(prev => {
            const updated = [newJob, ...prev];
            localStorage.setItem('castup_jobs_real', JSON.stringify(updated));
            return updated;
        })
        return { success: true, job: newJob }
    }

    const deleteJob = (jobId) => {
        setRegisteredJobs(prev => {
            const updated = prev.filter(j => j.id !== jobId);
            localStorage.setItem('castup_jobs_real', JSON.stringify(updated));
            return updated;
        })
        return { success: true }
    }

    const updateProfile = async (data) => {
        const { success, data: updatedUser, error } = await authService.updateProfile(data);

        if (success) {
            setUser(updatedUser);
            return { success: true };
        }
        return { success: false, error: error };
    };

    const requireAuth = (callback) => {
        if (!user) {
            setShowAuthModal(true);
            return false;
        }
        if (callback) callback();
        return true;
    };

    return (
        <RealAuthContext.Provider value={{
            user, token, login, register, logout, updateProfile, requireAuth,
            isAuthenticated: !!user,
            loading,
            showAuthModal, setShowAuthModal,
            allUsers: [], // Optional: Provide logic if needed to fetch all users
            allJobs: registeredJobs,
            addJob,
            deleteJob
        }}>
            {!loading && children}
        </RealAuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(RealAuthContext);
    if (!ctx) throw new Error('useAuth must be used within RealAuthProvider');
    return ctx;
};
