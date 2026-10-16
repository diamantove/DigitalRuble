import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/App.css'

import { AuthExternalPage } from '../pages/auth-external/ui/AuthExternalPage'
import { ClientsPage } from '../pages/clients/ui/ClientsPage'
import { LoginPage } from '../pages/login/ui/LoginPage'
import { RequireAuth } from './router/RequireAuth'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/external" element={<AuthExternalPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <ClientsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App