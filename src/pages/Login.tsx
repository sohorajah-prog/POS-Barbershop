import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock user login
    login({
      id: 'u1',
      name: role === 'admin' ? 'Budi (Admin)' : 'Eko Prasetyo',
      role: role,
      outletId: 'out-1'
    }, 
    { id: 'out-1', name: 'Barbertopia Pekayon', address: 'Jl. Raya Pekayon No. 45, Bekasi', taxRate: 10 });
    
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
            color: '#050506',
            fontSize: '1.6rem',
            fontWeight: '800',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(207, 162, 67, 0.3)'
          }}>
            B
          </div>
          <h1 style={{ color: 'var(--color-white)', fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 0 0', textAlign: 'center', letterSpacing: '-0.01em' }}>
            Barbertopia Pekayon
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
            Sistem Kasir & POS Barbershop Premium
          </p>
        </div>

        {/* Form Select simulation */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Pilih Peran Akun (Simulasi)
            </label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as any)}
              style={{ 
                width: '100%',
                padding: '10px 14px', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--color-text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="cashier" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>Eko Prasetyo (Kasir)</option>
              <option value="admin" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>Budi (Admin / Owner)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '1rem', 
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(207, 162, 67, 0.15)',
              marginTop: '8px'
            }}
          >
            Masuk ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
}
