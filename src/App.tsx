import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { insforge } from './lib/insforge';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Shift from './pages/Shift';
import Queue from './pages/Queue';
import Booking from './pages/Booking';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore(state => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  const initDb = useAppStore(state => state.initDb);
  const login = useAppStore(state => state.login);

  useEffect(() => {
    // Initial fetch
    initDb();

    // Setup Auth Check
    insforge.auth.getCurrentUser().then(({ data: { user } }) => {
      if (user) {
        insforge.database.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
          if (profile) {
            login({ id: user.id, name: profile.name, role: profile.role, outletId: profile.outlet_id });
            initDb();
          }
        });
      }
    });

  }, [initDb, login]);

  return (
    <Router>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.9)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
              fontWeight: '600',
              border: '1px solid rgba(16, 185, 129, 1)',
              backdropFilter: 'blur(8px)'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/shift" element={<ProtectedRoute><Shift /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

// Force HMR reload
