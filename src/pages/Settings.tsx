import { useAppStore } from '../store/useAppStore';
import { Sparkles, Shield, Building } from 'lucide-react';

export default function Settings() {
  const activeOutlet = useAppStore(state => state.activeOutlet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px', width: '100%' }}>
      
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
          Pengaturan Outlet
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Konfigurasi detail outlet, perpajakan, dan pembatasan operasional (guardrails) kasir.
        </p>
      </div>

      {/* Card 1: Informasi Dasar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px'
        }}>
          <Building size={18} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
            Informasi Dasar Outlet
          </h3>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nama Outlet</label>
            <input 
              type="text" 
              defaultValue={activeOutlet?.name || 'Barbertopia Pekayon'} 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Alamat Lengkap</label>
            <textarea 
              defaultValue={activeOutlet?.address || 'Jl. Raya Pekayon No. 45, Bekasi Selatan'} 
              style={{ 
                width: '100%', 
                minHeight: '80px',
                resize: 'vertical',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                outline: 'none'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Pajak / PPN (%)</label>
            <div style={{ position: 'relative', width: '150px' }}>
              <input 
                type="number" 
                defaultValue={activeOutlet?.taxRate || 10} 
                style={{ width: '100%', paddingRight: '32px' }} 
              />
              <span style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                %
              </span>
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <button type="button" className="btn-primary">
              <Sparkles size={16} />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Guardrails */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px'
        }}>
          <Shield size={18} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
            Pengaturan Kasir & Keamanan (Guardrails)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)'
          }}>
            <input 
              type="checkbox" 
              defaultChecked 
              style={{ 
                width: '18px', 
                height: '18px', 
                accentColor: 'var(--color-gold)', 
                cursor: 'pointer' 
              }} 
            /> 
            <span>Wajibkan kasir untuk memilih Kapster saat transaksi jasa/layanan</span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)'
          }}>
            <input 
              type="checkbox" 
              style={{ 
                width: '18px', 
                height: '18px', 
                accentColor: 'var(--color-gold)', 
                cursor: 'pointer' 
              }} 
            /> 
            <span>Izinkan kasir memberikan diskon manual di luar katalog promo</span>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)'
          }}>
            <input 
              type="checkbox" 
              style={{ 
                width: '18px', 
                height: '18px', 
                accentColor: 'var(--color-gold)', 
                cursor: 'pointer' 
              }} 
            /> 
            <span>Izinkan transaksi kasir berjalan tanpa shift yang terbuka (Sangat Tidak Direkomendasikan)</span>
          </label>
        </div>
      </div>

    </div>
  );
}
