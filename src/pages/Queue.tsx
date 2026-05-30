import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { Clock, Plus, Play, CheckCircle, X } from 'lucide-react';

export default function Queue() {
  const kapsters = useAppStore(state => state.kapsters);
  const queue = useAppStore(state => state.walkinQueue);
  const setQueue = useAppStore(state => state.setWalkinQueue);
  const services = useAppStore(state => state.services);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedKapster, setSelectedKapster] = useState('');

  const handleAddQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedService || !selectedKapster) return toast.error('Lengkapi semua data!');

    const service = services.find(s => s.id === selectedService);
    const kapster = kapsters.find(k => k.id === selectedKapster);
    
    if (!service || !kapster) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setQueue([...queue, {
      id: `q-${Date.now()}`,
      name: customerName,
      service,
      kapster,
      status: 'waiting',
      time: timeStr
    }]);

    setIsModalOpen(false);
    setCustomerName('');
    setSelectedService('');
    setSelectedKapster('');
  };

  const handleNextStatus = (id: string, currentStatus: string) => {
    setQueue(queue.map(q => {
      if (q.id === id) {
        if (currentStatus === 'waiting') return { ...q, status: 'serving' };
        if (currentStatus === 'serving') return { ...q, status: 'done' };
      }
      return q;
    }));
  };

  const activeQueues = queue.filter(q => q.status !== 'done');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Antrian Walk-in
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Pantau dan atur urutan pelanggan walk-in yang sedang menunggu atau dilayani secara real-time.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Tambah Antrian
        </button>
      </div>

      {/* Queue List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeQueues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Belum ada antrian aktif saat ini.</p>
          </div>
        ) : (
          activeQueues.map(q => {
            const isServing = q.status === 'serving';
            return (
              <div 
                key={q.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '18px 24px',
                  border: isServing ? '1px solid rgba(207, 162, 67, 0.25)' : '1px solid var(--color-card-border)',
                  borderRadius: '10px',
                  backgroundColor: isServing ? 'rgba(207, 162, 67, 0.03)' : 'var(--color-card)',
                  boxShadow: isServing ? '0 4px 20px rgba(207, 162, 67, 0.05)' : 'var(--shadow-sm)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: isServing ? 'var(--color-gold)' : 'var(--color-white)' 
                  }}>
                    {q.name}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    color: 'var(--color-text-secondary)', 
                    fontSize: '0.85rem',
                    marginTop: '6px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong>Layanan:</strong> {q.service.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong>Kapster:</strong> {q.kapster.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {q.time}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    backgroundColor: isServing ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.02)',
                    color: isServing ? '#050506' : 'var(--color-text-secondary)',
                    border: isServing ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: isServing ? '0 2px 8px rgba(207, 162, 67, 0.2)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isServing && <Play size={10} fill="currentColor" />}
                    {isServing ? 'Sedang Dilayani' : 'Menunggu'}
                  </span>

                  {/* Actions Button */}
                  <button 
                    onClick={() => handleNextStatus(q.id, q.status)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: isServing ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-gold-translucent)',
                      color: isServing ? 'var(--color-success)' : 'var(--color-gold)',
                      border: `1px solid ${isServing ? 'rgba(16, 185, 129, 0.2)' : 'var(--color-gold-border)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    {isServing ? <><CheckCircle size={14} /> Selesai</> : <><Play size={14} /> Proses</>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Queue Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-white)', fontSize: '1.25rem' }}>Tambah Antrian Baru</h3>
            
            <form onSubmit={handleAddQueue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nama Pelanggan</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Layanan</label>
                <select 
                  value={selectedService} 
                  onChange={(e) => setSelectedService(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', padding: '10px 14px', borderRadius: '8px' }}
                >
                  <option value="" disabled style={{ backgroundColor: 'var(--color-card)' }}>Pilih Layanan</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id} style={{ backgroundColor: 'var(--color-card)' }}>{s.name} - Rp {s.price.toLocaleString('id-ID')}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Kapster</label>
                <select 
                  value={selectedKapster}
                  onChange={e => setSelectedKapster(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Kapster</option>
                  {kapsters.filter(b => b.status === 'active').map(b => <option key={b.id} value={b.id} style={{backgroundColor: 'var(--color-card)'}}>{b.name}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Simpan ke Antrian
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
