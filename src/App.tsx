import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/shared/context/AuthContext'
import { AppProvider } from '@/shared/context/AppContext'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { ClientsPage, ClientProfilePage } from '@/features/clients'
import { CategoriesPage, CategoryBuilderPage } from '@/features/categories'
import { RequestsPage, NewRequestPage } from '@/features/requests'
import { ActivityLogPage } from '@/features/activity'
import { NotificationsPage } from '@/features/notifications'
import { SettingsPage } from '@/features/settings'
import { SubmissionPage } from '@/features/submission'
import { CheckInPage } from '@/features/checkin'
import { DashboardLayout } from '@/shared/components'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit/:token" element={<SubmissionPage />} />
            <Route path="/check-in/:token" element={<CheckInPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientProfilePage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/new" element={<CategoryBuilderPage />} />
              <Route path="categories/:id/edit" element={<CategoryBuilderPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="requests/new" element={<NewRequestPage />} />
              <Route path="activity" element={<ActivityLogPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
