import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Silakan masukkan email Anda terlebih dahulu.');
    
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setIsLoading(false);
    
    if (error) {
      toast.error('Gagal mengirim link reset: ' + error.message);
    } else {
      toast.success('Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk/spam.');
      setIsResetMode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Lengkapi email dan password!');
    
    setIsLoading(true);
    
    // Try sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      return toast.error(`Login gagal: ${error.message}`);
    }
    
    // Fetch profile and update local state so ProtectedRoute doesn't kick us out
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
      if (profile) {
        login({ id: userData.user.id, name: profile.name, role: profile.role, outletId: profile.outlet_id });
        await useAppStore.getState().initDb();
      } else {
        // Profile is missing (maybe because RLS blocked it during sign-up), create it now!
        const { data: outlets } = await supabase.from('outlets').select('id').limit(1);
        if (outlets && outlets.length > 0) {
          await supabase.from('profiles').insert([
            { id: userData.user.id, name: 'Admin Barbershop', role: 'admin', outlet_id: outlets[0].id }
          ]);
          login({ id: userData.user.id, name: 'Admin Barbershop', role: 'admin', outletId: outlets[0].id });
          await useAppStore.getState().initDb();
        }
      }
    }
    
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-canvas)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '36px 28px',
        border: '1px solid var(--color-card-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Centered Brand Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--color-gold)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#04100a',
            boxShadow: '0 4px 12px rgba(207, 162, 67, 0.3)'
          }}>
            <Scissors size={28} />
          </div>
          <h1 style={{ color: 'var(--color-white)', fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 0 0', textAlign: 'center', letterSpacing: '-0.01em' }}>
            Barbershop
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
            Sistem Kasir & POS Barbershop Premium
          </p>
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>powered by </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', opacity: 0.8 }}>Luddev v.1</span>
          </div>
        </div>

        {/* Form Select simulation */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                color: 'var(--color-text-secondary)'
              }}>
                Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-card-border)',
                  color: 'var(--color-text-primary)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

          {isResetMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="btn-primary" 
                style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Kirim Link Reset'}
              </button>
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  marginTop: '12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Kembali ke Login
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-gold)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Lupa Password?
                </button>
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={{ 
                  width: '100%',
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {!isResetMode && (
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk / Login'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
