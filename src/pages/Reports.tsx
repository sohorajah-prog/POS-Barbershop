import { BarChart2, Calendar, Download, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_BARBERS } from '../store/mockData';
// Halaman Laporan Penjualan

export default function Reports() {
  const { transactions } = useAppStore();

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalCount = transactions.length;
  const avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Laporan Penjualan
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Pantau ringkasan pendapatan, performa kapster, dan histori transaksi lengkap.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Calendar size={16} />
            Bulan Ini
          </button>
          <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Download size={16} />
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Pendapatan</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '8px' }}>Rp {totalRevenue.toLocaleString('id-ID')}</div>
          <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontWeight: 600 }}>
            <TrendingUp size={14} /> +0% dari bulan lalu
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Jumlah Transaksi</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '8px' }}>{totalCount}</div>
          <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontWeight: 600 }}>
            <TrendingUp size={14} /> +0% dari bulan lalu
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Rata-rata Nilai Transaksi</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '8px' }}>Rp {Math.round(avgValue).toLocaleString('id-ID')}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>
            Stabil
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 size={18} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-white)', margin: 0 }}>Histori Transaksi Terakhir</h3>
        </div>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Tanggal & Waktu</th>
              <th>Pelanggan</th>
              <th>Kapster</th>
              <th>Metode</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Belum ada histori transaksi.</td>
              </tr>
            ) : (
              [...transactions].reverse().map(trx => {
                // Determine kapster name from first service item
                const serviceItem = trx.items.find(i => i.type === 'service');
                const kapster = MOCK_BARBERS.find(b => b.id === serviceItem?.kapsterId);
                const kapsterName = kapster ? kapster.name : '-';
                
                return (
                  <tr key={trx.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>#{trx.id.substring(4)}</td>
                    <td>{new Date(trx.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                    <td>{trx.customerName || 'Walk-in'}</td>
                    <td>{kapsterName}</td>
                    <td>{trx.method}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>Rp {trx.total.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
