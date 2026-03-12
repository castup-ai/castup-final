import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import api from '../services/api';

const RealAuthContext = createContext(null);

export function RealAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    // Notifications system
    const [notifications, setNotifications] = useState(() => {
        try { return JSON.parse(localStorage.getItem('castup_notifications') || '[]'); }
        catch { return []; }
    });

    // Track applied jobs per user (prevent duplicate applications)
    const [appliedJobs, setAppliedJobs] = useState(() => {
        try { return JSON.parse(localStorage.getItem('castup_applied_jobs') || '[]'); }
        catch { return []; }
    });

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

            // Fetch generic public users list for Explore
            const pubUsers = await authService.getAllUsers();
            if (pubUsers.success && pubUsers.data) {
                setAllUsers(pubUsers.data);
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

    const addNotification = (notif) => {
        const newNotif = { id: Date.now(), ...notif, timestamp: new Date().toISOString(), read: false };
        setNotifications(prev => {
            const updated = [newNotif, ...prev].slice(0, 50); // keep last 50
            localStorage.setItem('castup_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const markAllRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem('castup_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const applyForJob = (jobId) => {
        setAppliedJobs(prev => {
            if (prev.includes(jobId)) return prev;
            const updated = [...prev, jobId];
            localStorage.setItem('castup_applied_jobs', JSON.stringify(updated));
            return updated;
        });
        // Notify the job creator
        const job = registeredJobs.find(j => j.id === jobId);
        if (job && user) {
            // Notification for the current user (applicant confirmation)
            addNotification({
                type: 'applied',
                title: 'Application Submitted',
                message: `You applied for "${job.title}"`,
                jobId
            });
        }
        return { success: true };
    };

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
            allUsers,
            allJobs: registeredJobs,
            addJob,
            deleteJob,
            notifications,
            addNotification,
            markAllRead,
            appliedJobs,
            applyForJob
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
