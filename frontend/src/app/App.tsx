import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './styles/App.css'

import { AuthExternalPage } from '../pages/auth-external/ui/AuthExternalPage'
import { ClientsPage } from '../pages/clients/ui/ClientsPage'
import { LoginPage } from '../pages/login/ui/LoginPage'
import { RequireAuth } from './router/RequireAuth'
import { ApiError } from '../shared/api/client'
import { sessionQueryKey } from '../entities/session/api/useSessionQuery'
import { RequireRole } from './router/RequireRole'
import { AdminUsersPage } from '../pages/admin-users/ui/AdminUsersPage'
import { AppHeader } from '../widgets/app-header/ui/AppHeader'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          return false
        }

        return failureCount < 2
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.queryKey[0] === sessionQueryKey[0]) {
        return
      }

      if (error instanceof ApiError && error.status === 401) {
        queryClient.clear()
        window.location.assign('/login')
      }
    },
  }),
})

function AppLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/external" element={<AuthExternalPage />} />

          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/" element={<ClientsPage />} />
            <Route
              path="/admin/users"
              element={
                <RequireRole role="Admin">
                  <AdminUsersPage />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App