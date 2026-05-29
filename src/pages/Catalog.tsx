import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_SERVICES, MOCK_PRODUCTS, MOCK_BARBERS } from '../store/mockData';
import { Sparkles, Scissors, ShoppingBag, Users, Edit, Trash2, X } from 'lucide-react';

export default function Catalog() {
  const { user } = useAppStore();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'services' | 'products' | 'barbers'>('services');

  // Local CRUD States initialized from mock database
  const [services, setServices] = useState(MOCK_SERVICES);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [barbers, setBarbers] = useState(MOCK_BARBERS);

  // Modal Dialog States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editItem, setEditItem] = useState<any>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [commission, setCommission] = useState(0);
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState('active');

  // Trigger Deletion
  const handleDelete = (id: string, type: 'service' | 'product' | 'barber') => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini dari katalog?')) return;

    if (type === 'service') {
      setServices(services.filter(s => s.id !== id));
    } else if (type === 'product') {
      setProducts(products.filter(p => p.id !== id));
    } else if (type === 'barber') {
      setBarbers(barbers.filter(b => b.id !== id));
    }
  };

  // Open Modal for Creating
  const handleOpenAddModal = () => {
    setModalType('add');
    setEditItem(null);
    setName('');
    if (activeTab === 'services') {
      setCategory('Haircut');
      setPrice(75000);
      setDuration(35);
      setCommission(0.3);
    } else if (activeTab === 'products') {
      setCategory('Pomade');
      setPrice(120000);
      setStock(10);
    } else {
      setStatus('active');
    }
    setShowModal(true);
  };

  // Open Modal for Editing
  const handleOpenEditModal = (item: any) => {
    setModalType('edit');
    setEditItem(item);
    setName(item.name);
    setCategory(item.category || '');
    setPrice(item.price || 0);
    setDuration(item.duration || 0);
    setCommission(item.commissionRate || 0);
    setStock(item.stock || 0);
    setStatus(item.status || 'active');
    setShowModal(true);
  };

  // Save/Submit Form Changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'add') {
      const newId = `${activeTab === 'services' ? 'srv' : activeTab === 'products' ? 'prd' : 'kap'}-${Date.now()}`;
      
      if (activeTab === 'services') {
        setServices([...services, {
          id: newId,
          name,
          category,
          duration,
          price,
          commissionRate: commission
        }]);
      } else if (activeTab === 'products') {
        setProducts([...products, {
          id: newId,
          name,
          category,
          price,
          stock
        }]);
      } else if (activeTab === 'barbers') {
        setBarbers([...barbers, {
          id: newId,
          name,
          status
        }]);
      }
    } else {
      // Edit mode
      if (activeTab === 'services') {
        setServices(services.map(s => s.id === editItem.id ? {
          ...s,
          name,
          category,
          duration,
          price,
          commissionRate: commission
        } : s));
      } else if (activeTab === 'products') {
        setProducts(products.map(p => p.id === editItem.id ? {
          ...p,
          name,
          category,
          price,
          stock
        } : p));
      } else if (activeTab === 'barbers') {
        setBarbers(barbers.map(b => b.id === editItem.id ? {
          ...b,
          name,
          status
        } : b));
      }
    }

    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Katalog & Layanan {isAdmin && <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', border: '1px solid var(--color-gold-border)', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>Akses Admin</span>}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Kelola data master jasa barbershop, produk ritel, dan kapster/barber aktif.
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn-primary">
            <Sparkles size={16} />
            + Tambah {activeTab === 'services' ? 'Layanan' : activeTab === 'products' ? 'Produk' : 'Kapster'}
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        borderBottom: '1px solid var(--color-card-border)', 
        paddingBottom: '2px' 
      }}>
        <button 
          onClick={() => setActiveTab('services')}
          style={{ 
            background: 'transparent', 
            fontWeight: 600, 
            fontSize: '0.95rem',
            color: activeTab === 'services' ? 'var(--color-gold)' : 'var(--color-text-secondary)', 
            borderBottom: activeTab === 'services' ? '2px solid var(--color-gold)' : '2px solid transparent', 
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Scissors size={16} />
          Layanan & Jasa
        </button>

        <button 
          onClick={() => setActiveTab('products')}
          style={{ 
            background: 'transparent', 
            fontWeight: 600, 
            fontSize: '0.95rem',
            color: activeTab === 'products' ? 'var(--color-gold)' : 'var(--color-text-secondary)', 
            borderBottom: activeTab === 'products' ? '2px solid var(--color-gold)' : '2px solid transparent', 
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <ShoppingBag size={16} />
          Produk Ritel
        </button>

        <button 
          onClick={() => setActiveTab('barbers')}
          style={{ 
            background: 'transparent', 
            fontWeight: 600, 
            fontSize: '0.95rem',
            color: activeTab === 'barbers' ? 'var(--color-gold)' : 'var(--color-text-secondary)', 
            borderBottom: activeTab === 'barbers' ? '2px solid var(--color-gold)' : '2px solid transparent', 
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} />
          Daftar Kapster
        </button>
      </div>

      {/* Catalog Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.015)', borderBottom: '1px solid var(--color-card-border)' }}>
            <tr>
              {activeTab === 'services' && (
                <>
                  <th style={{ padding: '16px 20px' }}>Nama Layanan</th>
                  <th style={{ padding: '16px 20px' }}>Kategori</th>
                  <th style={{ padding: '16px 20px' }}>Durasi</th>
                  <th style={{ padding: '16px 20px' }}>Harga</th>
                  <th style={{ padding: '16px 20px' }}>Komisi Kapster</th>
                  {isAdmin && <th style={{ padding: '16px 20px', width: '150px' }}>Aksi</th>}
                </>
              )}
              {activeTab === 'products' && (
                <>
                  <th style={{ padding: '16px 20px' }}>Nama Produk</th>
                  <th style={{ padding: '16px 20px' }}>Kategori</th>
                  <th style={{ padding: '16px 20px' }}>Harga</th>
                  <th style={{ padding: '16px 20px' }}>Stok Tersedia</th>
                  {isAdmin && <th style={{ padding: '16px 20px', width: '150px' }}>Aksi</th>}
                </>
              )}
              {activeTab === 'barbers' && (
                <>
                  <th style={{ padding: '16px 20px' }}>Nama Kapster</th>
                  <th style={{ padding: '16px 20px' }}>ID Kapster</th>
                  <th style={{ padding: '16px 20px' }}>Status Operasional</th>
                  {isAdmin && <th style={{ padding: '16px 20px', width: '150px' }}>Aksi</th>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'services' && services.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</td>
                <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>{item.category}</td>
                <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>{item.duration} mnt</td>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-gold)' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '16px 20px', color: 'var(--color-success)', fontWeight: 500 }}>{item.commissionRate * 100}%</td>
                {isAdmin && (
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, 'service')}
                        style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {activeTab === 'products' && products.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</td>
                <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>{item.category}</td>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-gold)' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: item.stock < 10 ? 'var(--color-danger-bg)' : 'rgba(255,255,255,0.02)',
                    border: item.stock < 10 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                    color: item.stock < 10 ? 'var(--color-danger)' : 'var(--color-text-primary)' 
                  }}>
                    {item.stock} Unit
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, 'product')}
                        style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {activeTab === 'barbers' && barbers.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</td>
                <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{item.id}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    backgroundColor: item.status === 'active' ? 'var(--color-success-bg)' : 'rgba(255, 255, 255, 0.05)', 
                    color: item.status === 'active' ? 'var(--color-success)' : 'var(--color-text-secondary)', 
                    border: item.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px', 
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, 'barber')}
                        style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CRUD Overlay Modal (Admin Only) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '28px',
            position: 'relative',
            border: '1px solid var(--color-card-border)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-white)', marginBottom: '20px' }}>
              {modalType === 'add' ? 'Tambah' : 'Edit'} {activeTab === 'services' ? 'Layanan Jasa' : activeTab === 'products' ? 'Produk Ritel' : 'Kapster'}
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Common field: Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Nama {activeTab === 'services' ? 'Layanan' : activeTab === 'products' ? 'Produk' : 'Kapster'}
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="Contoh: Premium Gentle Cut / Hair Tonic"
                  required 
                />
              </div>

              {/* Service specific fields */}
              {activeTab === 'services' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Kategori Layanan</label>
                    <input 
                      type="text" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%' }}
                      placeholder="Contoh: Haircut / Beard / Coloring"
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Estimasi Durasi (Mnt)</label>
                      <input 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(Number(e.target.value))}
                        style={{ width: '100%' }}
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Harga (Rp)</label>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))}
                        style={{ width: '100%' }}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Komisi Kapster (%)</label>
                    <select 
                      value={commission} 
                      onChange={(e) => setCommission(Number(e.target.value))}
                      style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', padding: '10px 14px', borderRadius: '8px' }}
                    >
                      <option value={0.1} style={{ backgroundColor: 'var(--color-card)' }}>10%</option>
                      <option value={0.2} style={{ backgroundColor: 'var(--color-card)' }}>20%</option>
                      <option value={0.3} style={{ backgroundColor: 'var(--color-card)' }}>30%</option>
                      <option value={0.4} style={{ backgroundColor: 'var(--color-card)' }}>40%</option>
                      <option value={0.5} style={{ backgroundColor: 'var(--color-card)' }}>50%</option>
                    </select>
                  </div>
                </>
              )}

              {/* Product specific fields */}
              {activeTab === 'products' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Kategori Produk</label>
                    <input 
                      type="text" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%' }}
                      placeholder="Contoh: Pomade / Hair Tonic / Shaving Kit"
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Harga Jual (Rp)</label>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))}
                        style={{ width: '100%' }}
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Stok Unit</label>
                      <input 
                        type="number" 
                        value={stock} 
                        onChange={(e) => setStock(Number(e.target.value))}
                        style={{ width: '100%' }}
                        required 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Barber specific fields */}
              {activeTab === 'barbers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status Operasional</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', padding: '10px 14px', borderRadius: '8px' }}
                  >
                    <option value="active" style={{ backgroundColor: 'var(--color-card)' }}>ACTIVE (Aktif Bekerja)</option>
                    <option value="inactive" style={{ backgroundColor: 'var(--color-card)' }}>INACTIVE (Off / Cuti)</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
