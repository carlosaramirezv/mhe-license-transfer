import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransferProvider } from './context/TransferContext';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import BatchUploadPage from './pages/BatchUploadPage';
import AuditLogPage from './pages/AuditLogPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';

interface AppProps {
  basename?: string;
}

function App({ basename }: AppProps) {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <TransferProvider>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/batch" element={<BatchUploadPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </TransferProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
