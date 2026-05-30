
import type { ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Scissors, 
  ClipboardList, 
  BarChart2,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, activeOutlet } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigasi menu disesuaikan dengan gambar referensi
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { label: 'POS Kasir', icon: <ShoppingCart size={18} />, path: '/pos' },
    { label: 'Antrian Walk-in', icon: <Users size={18} />, path: '/queue' },
    { label: 'Booking Jadwal', icon: <Calendar size={18} />, path: '/booking' },
    { label: 'Katalog & Layanan', icon: <Scissors size={18} />, path: '/catalog' },
    { label: 'Manajemen Shift', icon: <ClipboardList size={18} />, path: '/shift' },
    { label: 'Laporan Penjualan', icon: <BarChart2 size={18} />, path: '/reports' },
    ...(user?.role === 'admin' ? [{ label: 'Pengaturan', icon: <SettingsIcon size={18} />, path: '/settings' }] : []),
  ];

  // Ambil huruf pertama user untuk avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}>
      {/* Sidebar Gelap Premium */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--color-sidebar)',
        borderRight: '1px solid var(--color-card-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Branding Logo Area */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.02)'
        }}>
          {activeOutlet?.logoUrl ? (
            <img 
              src={activeOutlet.logoUrl} 
              alt="Logo" 
              style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            />
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--color-gold)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050506',
              fontSize: '1.25rem',
              fontWeight: '800',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 2px 8px rgba(207, 162, 67, 0.3)'
            }}>
              <Scissors size={20} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ 
              fontSize: '1.15rem', 
              fontWeight: '800', 
              color: 'var(--color-white)', 
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
              marginBottom: '4px'
            }} title={activeOutlet?.name || 'Barbertopia'}>
              {activeOutlet?.name || 'Barbertopia'}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              fontWeight: '500', 
              fontStyle: 'italic',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeOutlet?.tagline || 'POS System'}</span>
              <span style={{ color: 'var(--color-gold)', marginLeft: '2px', fontWeight: '900', flexShrink: 0 }}>.</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Area */}
        <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    style={{
                      width: 'calc(100% - 24px)',
                      margin: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'var(--color-gold-translucent)' : 'transparent',
                      color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                      border: `1px solid ${isActive ? 'var(--color-gold-border)' : 'transparent'}`,
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 600 : 500
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Shift Status (Bottom) */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              border: '1px solid var(--color-gold-border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--color-gold)', 
              fontWeight: '700',
              backgroundColor: 'var(--color-gold-translucent)',
              fontSize: '0.95rem'
            }}>
              {userInitial}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {user?.name || 'Eko Prasetyo'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {user?.role || 'Kasir'}
              </div>
            </div>
          </div>

          {/* Shift Status Pill */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '6px',
            color: 'var(--color-success)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-success)', 
              boxShadow: '0 0 6px var(--color-success)',
              display: 'inline-block'
            }} />
            Shift Buka
          </div>



          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              color: 'var(--color-danger)', 
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              width: '100%', 
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area - No stiff white headers */}
      <main style={{ 
        flex: 1, 
        height: '100vh', 
        overflowY: 'auto', 
        padding: '32px 40px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div key={location.pathname} style={{ animation: 'fadeIn 0.25s ease-out forwards', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>


    </div>
  );
}
