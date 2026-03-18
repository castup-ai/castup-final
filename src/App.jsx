import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RealAuthProvider as AuthProvider } from '@/context/RealAuthContext'
import AppLayout from '@/components/layout/AppLayout'
import AuthModal from '@/components/AuthModal'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import Explore from '@/pages/Explore'
import PostRequest from '@/pages/PostRequest'
import FindWork from '@/pages/FindWork'
import UploadWork from '@/pages/UploadWork'
import ContactUs from '@/pages/ContactUs'
import MyProfile from '@/pages/MyProfile'
import AIAssistant from '@/pages/AIAssistant'
import AILocationTracker from '@/pages/AILocationTracker'
import AICastingDirector from '@/pages/AICastingDirector'
import AdminDashboard from '@/pages/AdminDashboard'
import PublicProfile from '@/pages/PublicProfile'
import Inbox from '@/pages/Inbox'
import { useAuth } from '@/context/RealAuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-bg">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }
  
  if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthModal />
        <Routes>
          {/* Standalone pages (no sidebar) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* Guest-accessible with sidebar */}
          <Route element={<AppLayout />}>
              <Route path="/find-work" element={<FindWork />} />
              <Route path="/explore" element={<Explore />} />
          </Route>

          {/* App pages (with sidebar layout) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/home" element={<Home />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/upload-work" element={<UploadWork />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ai-location" element={<AILocationTracker />} />
            <Route path="/ai-casting" element={<AICastingDirector />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
