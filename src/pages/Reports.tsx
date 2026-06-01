import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { BarChart2, Calendar, Download, TrendingUp, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Reports() {
  const { transactions, kapsters, user, removeTransaction } = useAppStore();
  
  // Format YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );

  // Get list of available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add(new Date().toISOString().substring(0, 7)); // Always include current month
    transactions.forEach(t => {
      months.add(t.date.substring(0, 7));
    });
    return Array.from(months).sort().reverse(); // Newest first
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalCount = filteredTransactions.length;
  const avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data untuk diunduh pada bulan ini.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // Header
    csvContent += "ID Transaksi,Tanggal,Pelanggan,Metode Pembayaran,Layanan/Produk,Kapster,Harga,Qty,Total Harga,Komisi Kapster,Tip Kapster,Pajak,Total Bayar\n";

    filteredTransactions.forEach(trx => {
      const dateStr = new Date(trx.date).toLocaleString('id-ID');
      
      trx.items.forEach((item, index) => {
        let kapsterName = '-';
        let commission = 0;
        
        if (item.kapsterId) {
          const k = kapsters.find(k => k.id === item.kapsterId);
          kapsterName = k ? k.name : item.kapsterId;
          
          if (item.commissionType === 'nominal') {
            commission = item.commissionValue || 0;
          } else {
            // Percentage
            commission = (item.price * item.qty) * ((item.commissionValue || 0) / 100);
          }
        }

        // Only first item row gets the total, tax, tip info to avoid duplication
        const isFirst = index === 0;
        const total = isFirst ? trx.total : 0;
        const tax = isFirst ? trx.tax : 0;
        const tip = isFirst ? trx.tip : 0;

        const row = [
          trx.id,
          dateStr,
          trx.customerName || 'Walk-in',
          trx.method,
          item.name,
          kapsterName,
          item.price,
          item.qty,
          item.price * item.qty,
          commission,
          tip,
          tax,
          total
        ];

        // Wrap strings in quotes to handle commas
        const csvRow = row.map(cell => typeof cell === 'string' ? `"${cell}"` : cell).join(',');
        csvContent += csvRow + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-card-border)', borderRadius: '8px', padding: '0 12px' }}>
            <Calendar size={16} color="var(--color-text-secondary)" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '8px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all" style={{background: '#071a11'}}>Semua Waktu</option>
              {availableMonths.map(m => {
                const date = new Date(`${m}-01`);
                return <option key={m} value={m} style={{background: '#071a11'}}>{date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</option>;
              })}
            </select>
          </div>
          <button onClick={handleDownloadCSV} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
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
              {user?.role === 'admin' && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Belum ada histori transaksi.</td>
              </tr>
            ) : (
              [...filteredTransactions].reverse().map(trx => {
                // Determine kapster name from first service item
                const serviceItem = trx.items.find(i => i.type === 'service');
                const kapster = kapsters.find(b => b.id === serviceItem?.kapsterId);
                const kapsterName = kapster ? kapster.name : '-';
                
                return (
                  <tr key={trx.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>#{trx.id.substring(4)}</td>
                    <td>{new Date(trx.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                    <td>{trx.customerName || 'Walk-in'}</td>
                    <td>{kapsterName}</td>
                    <td>{trx.method}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>Rp {trx.total.toLocaleString('id-ID')}</td>
                    {user?.role === 'admin' && (
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={async () => {
                            if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                              try {
                                await removeTransaction(trx.id);
                                toast.success('Transaksi berhasil dihapus');
                              } catch (e: any) {
                                toast.error('Gagal menghapus: ' + e.message);
                              }
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
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
