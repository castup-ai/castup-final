import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RealAuthProvider as AuthProvider } from '@/context/RealAuthContext'
import AppLayout from '@/components/layout/AppLayout'
import AuthModal from '@/components/AuthModal'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
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

          {/* App pages (with sidebar layout) */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/upload-work" element={<UploadWork />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ai-location" element={<AILocationTracker />} />
            <Route path="/ai-casting" element={<AICastingDirector />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
