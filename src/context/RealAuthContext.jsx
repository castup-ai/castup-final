import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { castingService } from '../services/casting.service';
import { adminService } from '../services/admin.service';
import api from '../services/api';

const RealAuthContext = createContext(null);

export function RealAuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('castup_auth_real');
        if (saved) {
            try {
                const { user: savedUser } = JSON.parse(saved);
                return savedUser || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [token, setToken] = useState(() => {
        const saved = localStorage.getItem('castup_auth_real');
        if (saved) {
            try {
                const { token: savedToken } = JSON.parse(saved);
                return savedToken || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [worksLoading, setWorksLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [userApplications, setUserApplications] = useState([]);
    const [connectedUserIds, setConnectedUserIds] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [allWorks, setAllWorks] = useState([]);
    const [connectionCount, setConnectionCount] = useState(0);
    const [userStats, setUserStats] = useState({ connections: 0, projects: 0, profileViews: 0 });
    const [recentActivity, setRecentActivity] = useState([]);

    const fetchUserStats = async () => {
        if (!token) return;
        try {
            const res = await api.get('/users/stats');
            if (res.data && res.data.success && res.data.stats) {
                setUserStats(res.data.stats);
                setConnectionCount(res.data.stats.connections || 0);
            }
        } catch (e) {
            console.error("Error fetching user stats:", e);
        }
    };

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const notifsRes = await authService.getNotifications();
            if (notifsRes.success) {
                setNotifications(notifsRes.data || []);
            }
        } catch (e) {
            console.error("Error fetching notifications:", e);
        }
    };

    const fetchConnections = async () => {
        if (!token) return;
        try {
            const [connRes, connIdsRes] = await Promise.all([
                api.get('/users/connections/count').catch(() => ({ data: { count: 0 } })),
                api.get('/users/connections/ids').catch(() => ({ data: { ids: [] } }))
            ]);
            setConnectionCount(connRes.data?.count || 0);
            setConnectedUserIds(connIdsRes.data?.ids || []);
        } catch (e) {
            console.error("Error fetching connections:", e);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const res = await api.get('/users/recent');
            if (res.data.success) {
                setRecentActivity(res.data.data);
            }
        } catch (e) {
            console.error("Error fetching recent activity:", e);
        }
    };

    const refreshPlatformData = async () => {
        try {
            setUsersLoading(true);
            setJobsLoading(true);
            setWorksLoading(true);

            // Fetch concurrently but handle individually
            const jobsPromise = castingService.getAll();
            // Only fetch all users and all works if needed (e.g. for Explore or Admin)
            // For general hydration, we'll fetch stats and recent activity instead
            const usersPromise = authService.getAllUsers();
            const worksPromise = adminService.getAllWorks();

            const [jobsRes, usersRes, worksRes] = await Promise.all([
                jobsPromise, usersPromise, worksPromise
            ]);

            if (jobsRes && jobsRes.success) setAllJobs(jobsRes.data || []);
            setJobsLoading(false);

            if (usersRes && usersRes.success) setAllUsers(usersRes.data || []);
            setUsersLoading(false);

            if (worksRes && worksRes.success) setAllWorks(worksRes.data || []);
            setWorksLoading(false);
            
            const isKnownAdmin = ['castup4862446@gmail.com', 'castupaiapp@gmail.com'].includes(user?.email);
            const hasAdminRole = user?.role === 'admin' || user?.role === 'Admin';

            if (token && (isKnownAdmin || hasAdminRole)) {
                const contactRes = await adminService.getContactMessages();
                if (contactRes.success) setContactMessages(contactRes.data || []);
            }

            // Also fetch stats/recent/notifications/connections
            fetchUserStats();
            fetchRecentActivity();
            fetchNotifications();
            fetchConnections();
        } catch (error) {
            console.error("Error refreshing platform data:", error);
        } finally {
            setUsersLoading(false);
            setJobsLoading(false);
            setWorksLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const profileRes = await authService.getProfile();
                    if (profileRes.success) {
                        setUser(profileRes.data);
                        // Update the stored user with the latest profile data
                        localStorage.setItem('castup_auth_real', JSON.stringify({ token, user: profileRes.data }));
                    } else if (profileRes.error === 'Unauthorized' || profileRes.error === 'jwt expired') {
                        logout();
                    }
                } catch (e) {
                    console.error("Auth init error:", e);
                }
            }

            // Fetch initial data in background, don't block render
            refreshPlatformData();
            
            setLoading(false);
        };
        initAuth();
    }, []);

    // Load user-specific data when user changes
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                await Promise.all([
                    fetchNotifications(),
                    fetchConnections(),
                    fetchUserStats()
                ]);

                // Still use localStorage for appliedJobs temporarily
                try {
                    const userKey = `castup_data_${user.id}`;
                    const savedData = JSON.parse(localStorage.getItem(userKey) || '{}');
                    setAppliedJobs(savedData.appliedJobs || []);
                    
                    // Fetch full application history from server
                    const appsRes = await castingService.getMyApplications();
                    if (appsRes && appsRes.success && Array.isArray(appsRes.data)) {
                        setUserApplications(appsRes.data);
                        // Sync appliedJobs IDs
                        const ids = appsRes.data.map(a => a.job_id);
                        setAppliedJobs(ids);
                        saveUserData(user.id, { appliedJobs: ids });
                    }
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
            // Persist both token and user object for better session stability
            localStorage.setItem('castup_auth_real', JSON.stringify({ 
                token: data.token,
                user: data.user 
            }));
            refreshPlatformData(); // Fetch in background, do not block login
            return { success: true, user: data.user };
        }

        return { success: false, error: error };
    };

    const register = async (data) => {
        const { success, data: resultData, error } = await authService.register(data);

        if (success) {
            setUser(resultData.user);
            setToken(resultData.token);
            // Persist both token and user object for better session stability
            localStorage.setItem('castup_auth_real', JSON.stringify({ 
                token: resultData.token,
                user: resultData.user 
            }));
            refreshPlatformData(); // Fetch in background, do not block register
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
        const result = await castingService.create(jobData);
        if (result.success) {
            setAllJobs(prev => [result.data, ...prev]);
            return { success: true, job: result.data };
        }
        return result; // contains success: false, error, details, code
    }

    const updateJob = async (jobId, jobData) => {
        const result = await castingService.update(jobId, jobData);
        if (result.success) {
            setAllJobs(prev => prev.map(j => j.id === jobId ? result.castingCall : j));
            return { success: true, job: result.castingCall };
        }
        return result;
    }

    const deleteJob = async (jobId) => {
        const { success, error } = await castingService.delete(jobId);
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

    const acceptConnection = async (notification) => {
        const meta = typeof notification.metadata === 'string' ? JSON.parse(notification.metadata || '{}') : (notification.metadata || {});
        try {
            // Call backend to persist connection + mark notification read + notify sender
            await api.post('/users/connections/accept', {
                notificationId: notification.id,
                senderId: meta.senderId
            });
            // Update client-side notification state
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, status: 'accepted' } : n));
            // Update connection count
            setConnectionCount(prev => prev + 1);
        } catch (e) {
            console.error('Accept connection error:', e);
            // Still update UI optimistically
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, status: 'accepted' } : n));
            setConnectionCount(prev => prev + 1);
        }
    };

    const declineConnection = async (notificationId) => {
        try {
            await api.post('/users/connections/decline', { notificationId });
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, status: 'declined' } : n));
        } catch (e) {
            console.error('Decline connection error:', e);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, status: 'declined' } : n));
        }
    };

    const applyForJob = async (jobId, applicationData) => {
        if (!user) return;

        const { success, error } = await castingService.apply(jobId, applicationData);
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
            isProfileComplete: !!(user && user.name && (user.role || user.department)),
            loading,
            usersLoading,
            jobsLoading,
            worksLoading,
            showAuthModal, setShowAuthModal,
            allUsers,
            allJobs,
            allWorks,
            connections: connectionCount,
            userStats,
            recentActivity,
            addJob,
            deleteJob,
            deleteUser,
            deleteWork,
            refreshPlatformData,
            notifications,
            addNotification,
            sendTargetedNotification,
            markAllRead,
            acceptConnection,
            declineConnection,
            appliedJobs,
            userApplications,
            connectedUserIds,
            contactMessages,
            applyForJob,
            updateJob,
            fetchUserStats,
            fetchRecentActivity
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
