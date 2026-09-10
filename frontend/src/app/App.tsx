import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/App.css'
import { ClientsPage } from '../pages/clients/ui/ClientsPage'

const queryClient = new QueryClient()

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <ClientsPage />
      </QueryClientProvider>
  )
}

export default App