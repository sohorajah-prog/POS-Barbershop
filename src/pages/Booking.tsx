import { useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';

export default function Booking() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Jadwal Booking Pelanggan
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Lihat daftar pemesanan jadwal kapster dan kelola janji temu digital outlet Anda.
          </p>
        </div>
        
        {/* Date Filter & Plus Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            style={{ 
              padding: '8px 14px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <button className="btn-primary" style={{ padding: '9px 18px' }}>
            <Plus size={16} />
            Buat Booking
          </button>
        </div>
      </div>

      {/* Main Booking Content Card */}
      <div className="card" style={{ 
        minHeight: '380px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ 
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(207, 162, 67, 0.03)',
          border: '1px solid rgba(207, 162, 67, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-gold)',
          marginBottom: '16px'
        }}>
          <CalendarDays size={26} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '380px' }}>
          <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
            Tidak ada booking untuk tanggal {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Semua janji temu yang dijadwalkan pelanggan Anda melalui platform online akan muncul secara real-time di sini.
          </p>
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-gold)', 
            fontWeight: 700, 
            marginTop: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Integrasi Notifikasi WhatsApp & Google Calendar Hadir di Fase 2
          </p>
        </div>
      </div>

    </div>
  );
}
