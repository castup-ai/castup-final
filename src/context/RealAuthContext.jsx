import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { castingService } from '../services/casting.service';
import { adminService } from '../services/admin.service';
import api from '../services/api';

const RealAuthContext = createContext(null);

export function RealAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [allWorks, setAllWorks] = useState([]);

    const refreshPlatformData = async () => {
        try {
            const [jobsRes, usersRes, worksRes] = await Promise.all([
                castingService.getAll(),
                authService.getAllUsers(),
                adminService.getAllWorks()
            ]);

            if (jobsRes.success) setAllJobs(jobsRes.data || []);
            if (usersRes.success) setAllUsers(usersRes.data || []);
            if (worksRes.success) setAllWorks(worksRes.data || []);
        } catch (error) {
            console.error("Error refreshing platform data:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const saved = localStorage.getItem('castup_auth_real');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setToken(parsed.token);

                    const { success, data } = await authService.getProfile();
                    if (success) {
                        setUser(data);
                    } else {
                        logout();
                    }
                } catch (e) {
                    localStorage.removeItem('castup_auth_real');
                }
            }

            // Fetch initial data
            await refreshPlatformData();
            
            setLoading(false);
        };
        initAuth();
    }, []);

    // Load user-specific data when user changes
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                const [notifsRes] = await Promise.all([
                    authService.getNotifications()
                ]);

                if (notifsRes.success) {
                    setNotifications(notifsRes.data || []);
                }

                // Still use localStorage for appliedJobs temporarily
                try {
                    const userKey = `castup_data_${user.id}`;
                    const savedData = JSON.parse(localStorage.getItem(userKey) || '{}');
                    setAppliedJobs(savedData.appliedJobs || []);
                } catch (e) {
                    console.error("Error loading local user data", e);
                }
            };
            loadData();
        } else {
            setNotifications([]);
            setAppliedJobs([]);
        }
    }, [user]);

    const saveUserData = (userId, updates) => {
        try {
            const userKey = `castup_data_${userId}`;
            const current = JSON.parse(localStorage.getItem(userKey) || '{}');
            localStorage.setItem(userKey, JSON.stringify({ ...current, ...updates }));
        } catch (e) {
            console.error("Error saving user data", e);
        }
    };

    const login = async (email, password) => {
        const { success, data, error } = await authService.login(email, password);

        if (success) {
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('castup_auth_real', JSON.stringify({ token: data.token }));
            await refreshPlatformData();
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
            await refreshPlatformData();
            return { success: true, user: resultData.user };
        }

        return { success: false, error: error };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('castup_auth_real');
    };

    const addJob = async (jobData) => {
        const { success, data, error } = await castingService.create(jobData);
        if (success) {
            setAllJobs(prev => [data, ...prev]);
            return { success: true, job: data };
        }
        return { success: false, error };
    }

    const deleteJob = async (jobId) => {
        const { success, error } = await adminService.deleteJob(jobId);
        if (success) {
            setAllJobs(prev => prev.filter(j => j.id !== jobId));
            return { success: true };
        }
        return { success: false, error };
    }

    const deleteUser = async (userId) => {
        const { success, error } = await adminService.deleteUser(userId);
        if (success) {
            setAllUsers(prev => prev.filter(u => u.id !== userId));
            // Also refresh other data in case cascaded deletes happened
            refreshPlatformData();
            return { success: true };
        }
        return { success: false, error };
    }

    const deleteWork = async (workId, userId, isPortfolio) => {
        const { success, error } = await adminService.deleteWork(workId, userId, isPortfolio);
        if (success) {
            setAllWorks(prev => prev.filter(w => w.id !== workId));
            return { success: true };
        }
        return { success: false, error };
    }

    const addNotification = async (notif) => {
        if (!user) return;
        
        if (notif.targetUserId) {
            const { success } = await authService.sendNotification(notif.targetUserId, {
                type: notif.type,
                title: notif.title,
                message: notif.message,
                metadata: notif.metadata
            });
            return { success };
        }

        const newNotif = { 
            id: Date.now(), 
            ...notif, 
            timestamp: new Date().toISOString(), 
            read: false 
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    };

    const sendTargetedNotification = async (targetUserId, notifData) => {
        return await addNotification({ ...notifData, targetUserId });
    };

    const markAllRead = async () => {
        if (!user) return;
        const { success } = await authService.markNotificationsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const applyForJob = async (jobId) => {
        if (!user) return;

        const { success, error } = await castingService.apply(jobId);
        if (success) {
            setAppliedJobs(prev => {
                if (prev.includes(jobId)) return prev;
                const updated = [...prev, jobId];
                saveUserData(user.id, { appliedJobs: updated });
                return updated;
            });

            const job = allJobs.find(j => j.id === jobId);
            if (job) {
                addNotification({
                    type: 'applied',
                    title: 'Application Submitted',
                    message: `You applied for "${job.title}"`,
                    jobId
                });
            }
            return { success: true };
        }
        return { success: false, error };
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
            allJobs,
            allWorks,
            addJob,
            deleteJob,
            deleteUser,
            deleteWork,
            refreshPlatformData,
            notifications,
            addNotification,
            sendTargetedNotification,
            markAllRead,
            appliedJobs,
            applyForJob,
            updateProfile
        }}>
            {children}
        </RealAuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(RealAuthContext);
    if (!ctx) throw new Error('useAuth must be used within RealAuthProvider');
    return ctx;
};
