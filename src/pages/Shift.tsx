import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Clock, ShieldAlert, Sparkles, LogOut } from 'lucide-react';

export default function Shift() {
  const { activeShift, user, activeOutlet, openShift, closeShift } = useAppStore();
  const [startCash, setStartCash] = useState<number>(0);
  const [endCash, setEndCash] = useState<number>(0);

  // Mock calculated expected cash
  const expectedCash = activeShift ? activeShift.startCash + 1500000 : 0; 

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeOutlet) return alert("Anda harus login dan berada di outlet");
    
    openShift({
      id: `shift-${Date.now()}`,
      cashierId: user.id,
      outletId: activeOutlet.id,
      startTime: new Date().toISOString(),
      startCash,
      status: 'open'
    });
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(endCash, expectedCash);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      
      {/* Card Wrapper */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Manajemen Shift Kasir
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Buka laci kasir, input modal awal shift, dan lakukan rekonsiliasi kas aktual saat penutupan laci.
          </p>
        </div>

        {activeShift?.status === 'open' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Banner Shift Berjalan */}
            <div style={{ 
              backgroundColor: 'var(--color-success-bg)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--color-text-primary)', 
              padding: '20px', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.95rem' }}>
                <Clock size={16} />
                Shift Sedang Berjalan
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Kasir Aktif: <strong style={{ color: 'var(--color-white)' }}>{user?.name}</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Waktu Mulai: <strong style={{ color: 'var(--color-white)' }}>{new Date(activeShift.startTime).toLocaleString('id-ID')}</strong>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-success)' }}>
                Kas Awal: Rp {activeShift.startCash.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Form Tutup Shift */}
            <form onSubmit={handleCloseShift} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Ekspektasi Kas Sistem (Omzet + Modal Awal)
                </label>
                <input 
                  type="text" 
                  value={`Rp ${expectedCash.toLocaleString('id-ID')}`} 
                  disabled 
                  style={{ width: '100%', fontWeight: 600 }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Kas Fisik Aktual (Hitung Laci Kasir)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}>
                    Rp
                  </span>
                  <input 
                    type="number" 
                    value={endCash || ''} 
                    onChange={(e) => setEndCash(Number(e.target.value))}
                    style={{ width: '100%', paddingLeft: '44px' }} 
                    placeholder="Contoh: 1745000"
                    required
                  />
                </div>
              </div>

              {/* Rekonsiliasi Selisih */}
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid rgba(255, 255, 255, 0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Selisih Kas Aktual:</span>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 700, 
                  color: endCash - expectedCash < 0 ? 'var(--color-danger)' : 'var(--color-success)' 
                }}>
                  Rp {(endCash - expectedCash).toLocaleString('id-ID')}
                </span>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  backgroundColor: 'var(--color-danger)', 
                  color: 'white', 
                  marginTop: '10px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                }}
              >
                <LogOut size={16} />
                Tutup Shift & Rekonsiliasi
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleOpenShift} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Warning Shift Belum Buka */}
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: 'var(--color-warning)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '0.9rem'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Shift Kasir Belum Dibuka:</strong> Anda wajib membuka shift terlebih dahulu dengan memasukkan kas awal (modal laci) sebelum dapat melakukan checkout di modul POS.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Kas Modal Awal Laci
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Rp
                </span>
                <input 
                  type="number" 
                  value={startCash || ''} 
                  onChange={(e) => setStartCash(Number(e.target.value))}
                  style={{ width: '100%', paddingLeft: '44px' }} 
                  placeholder="Contoh: 500000"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <Sparkles size={16} />
              Buka Shift Sekarang
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
