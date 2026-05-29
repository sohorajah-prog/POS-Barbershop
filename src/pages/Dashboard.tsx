import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  TrendingUp, 
  Hourglass, 
  Coins, 
  Ticket, 
  Sparkles, 
  Briefcase 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions, activeShift } = useAppStore();
  const [timeString, setTimeString] = useState('');

  // Calculate metrics
  const todayTransactions = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString());
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const todayCount = todayTransactions.length;
  const todayCommission = todayTransactions.reduce((sum, t) => {
    return sum + (t.tip || 0) + t.items.reduce((itemSum, item) => {
      // Assuming commision is a percentage, e.g. 20%
      const commRate = item.commissionRate || 0;
      return itemSum + (item.price * item.qty * (commRate / 100));
    }, 0);
  }, 0);

  // Clock widget real-time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      setTimeString(`${dayName}, ${date} ${monthName} ${year} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // SVG Chart Data Points (X: scaled, Y: scaled based on reference mockup curve)
  const chartPoints = [
    { label: '09:00', x: 35, y: 31.5 },
    { label: '10:00', x: 105, y: 97.4 },
    { label: '11:00', x: 175, y: 136.9 },
    { label: '12:00', x: 245, y: 102.3 },
    { label: '13:00', x: 315, y: 130.3 },
    { label: '14:00', x: 385, y: 94.1 },
    { label: '15:00', x: 455, y: 64.4 },
    { label: '16:00', x: 525, y: 119.6 },
    { label: '17:00', x: 595, y: 119.6 },
    { label: '18:00', x: 665, y: 113.9 }
  ];

  // Build SVG Path
  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 665 170 L 35 170 Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      
      {/* Dashboard Top Header & Clock Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Dashboard Utama
          </h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Ringkasan performa penjualan harian, tren omzet, dan antrian barbershop.
          </p>
        </div>
        
        {/* Glowing Gold Time/Date Badge */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: 'rgba(207, 162, 67, 0.04)',
          border: '1px solid rgba(207, 162, 67, 0.15)',
          borderRadius: '8px',
          color: 'var(--color-gold)',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: '0 0 10px rgba(207, 162, 67, 0.05)',
          whiteSpace: 'nowrap'
        }}>
          {timeString}
        </div>
      </div>

      {/* 4-Columns Key Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        width: '100%'
      }}>
        {/* Omzet Hari Ini Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(207, 162, 67, 0.05)',
            border: '1px solid rgba(207, 162, 67, 0.12)',
            color: 'var(--color-gold)'
          }}>
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Omzet Hari Ini
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-white)', marginTop: '2px' }}>
              Rp {todayRevenue.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Jumlah Transaksi Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.12)',
            color: '#38bdf8'
          }}>
            <Ticket size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Jumlah Transaksi
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-white)', marginTop: '2px' }}>
              {todayCount}
            </div>
          </div>
        </div>

        {/* Total Komisi + Tip Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
            color: 'var(--color-success)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Total Komisi + Tip
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-white)', marginTop: '2px' }}>
              Rp {todayCommission.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Modal Kas Shift Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.12)',
            color: '#f43f5e'
          }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Modal Kas Shift
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-white)', marginTop: '2px' }}>
              Rp {(activeShift?.startCash || 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Line Chart & Quick Queue Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2.4fr 1fr', 
        gap: '24px',
        alignItems: 'stretch',
        width: '100%'
      }}>
        
        {/* Left Card: Tren Penjualan SVG Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={20} style={{ color: 'var(--color-gold)' }} />
            <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
              Tren Penjualan Hari Ini
            </h2>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <svg 
              viewBox="0 0 700 200" 
              width="100%" 
              height="100%" 
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                {/* Gold Glow Gradient */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.0" />
                </linearGradient>
                {/* Line Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Horizontal Guide Lines */}
              <line x1="30" y1="30" x2="670" y2="30" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              <line x1="30" y1="65" x2="670" y2="65" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              <line x1="30" y1="100" x2="670" y2="100" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              <line x1="30" y1="135" x2="670" y2="135" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              <line x1="30" y1="170" x2="670" y2="170" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />

              {/* Gradient Filled Area */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Glowing Line */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="var(--color-gold)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Data Points Dots */}
              {chartPoints.map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="var(--color-canvas)" 
                    stroke="var(--color-gold)" 
                    strokeWidth="2" 
                  />
                  {/* Subtle outer dot hover glow */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="8" 
                    fill="var(--color-gold)" 
                    fillOpacity="0.08" 
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              ))}
            </svg>
            
            {/* X-Axis Labels Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingLeft: '3%', 
              paddingRight: '3%', 
              marginTop: '12px' 
            }}>
              {chartPoints.map((p, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500
                  }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Status Antrian Cepat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Hourglass size={20} style={{ color: 'var(--color-gold)' }} />
            <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
              Status Antrian Cepat
            </h2>
          </div>

          {/* Empty Queue State */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '30px 10px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Antrian kosong saat ini.
            </p>
          </div>

          {/* Solid Gold Action Button */}
          <button 
            onClick={() => navigate('/queue')}
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '0.925rem',
              fontWeight: '700',
              backgroundColor: 'var(--color-gold)',
              color: '#050506',
              boxShadow: '0 4px 12px rgba(207, 162, 67, 0.15)',
              marginTop: 'auto'
            }}
          >
            Kelola Semua Antrian
          </button>
        </div>

      </div>

    </div>
  );
}
