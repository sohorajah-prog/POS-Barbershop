import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MOCK_SERVICES, MOCK_PRODUCTS, MOCK_BARBERS } from '../store/mockData';
import { ShoppingCart, Trash2, CheckCircle, User, ShieldAlert, X, Plus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'product';
  kapsterId?: string;
}

export default function POS() {
  const navigate = useNavigate();
  const { activeShift, activeOutlet, addTransaction } = useAppStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedKapster, setSelectedKapster] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Uang Tunai (Cash)');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);

  if (activeShift?.status !== 'open') {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', width: '100%' }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '40px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '16px' 
        }}>
          <div style={{ 
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-danger)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-white)', margin: 0 }}>
            Shift Kasir Belum Dibuka
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
            Untuk mematuhi guardrail transaksi, Anda wajib membuka shift kasir terlebih dahulu dengan menginput modal kas awal di menu **Manajemen Shift** sebelum dapat melayani penjualan pelanggan.
          </p>
          <button 
            onClick={() => navigate('/shift')}
            className="btn-primary" 
            style={{ padding: '10px 20px', marginTop: '8px' }}
          >
            Buka Shift Sekarang
          </button>
        </div>
      </div>
    );
  }

  const addToCart = (item: any, type: 'service' | 'product') => {
    if (type === 'service' && !selectedKapster) {
      alert('Pilih Kapster terlebih dahulu untuk melayani jasa/layanan!');
      return;
    }

    const existing = cart.find(c => c.id === item.id && c.kapsterId === selectedKapster);
    if (existing) {
      setCart(cart.map(c => c.id === item.id && c.kapsterId === selectedKapster ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        qty: 1, 
        type, 
        kapsterId: type === 'service' ? selectedKapster : undefined,
        commissionRate: type === 'service' ? item.commissionRate : undefined
      }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxRate = activeOutlet?.taxRate || 10;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax + tipAmount;

  const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBill = Math.max(0, total - totalPaid);

  const openPaymentModal = () => {
    if (cart.length === 0) return alert('Keranjang transaksi Anda masih kosong!');
    setIsPaymentModalOpen(true);
    setSplitPayments([]);
    setPaymentAmount(total);
  };

  const handleAddSplitPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setSplitPayments([...splitPayments, { method: paymentMethod, amount: Number(paymentAmount) }]);
    
    const newRemaining = Math.max(0, total - (totalPaid + Number(paymentAmount)));
    setPaymentAmount(newRemaining > 0 ? newRemaining : '');
  };

  const handleFinishTransaction = () => {
    if (totalPaid + Number(paymentAmount || 0) < total) {
      return alert('Total pembayaran belum mencukupi tagihan!');
    }

    const transactionMethod = splitPayments.length > 0 ? 'Split Payment' : paymentMethod;
    
    addTransaction({
      id: `trx-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      tip: tipAmount,
      total,
      method: transactionMethod,
      customerName: 'Pelanggan Walk-in'
    });

    alert(`Transaksi Berhasil Diselesaikan!\nTotal Pembayaran: Rp ${total.toLocaleString('id-ID')}\nMetode: ${transactionMethod}\nKomisi Kapster otomatis dicatat ke sistem.`);
    setCart([]);
    setIsPaymentModalOpen(false);
    setTipAmount(0);
    setSplitPayments([]);
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 100px)', width: '100%', alignItems: 'stretch' }}>
      
      {/* Left Column: Menu Selector */}
      <div style={{ 
        flex: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        overflowY: 'auto', 
        paddingRight: '6px' 
      }}>
        
        {/* Card Choose Kapster */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            Pilih Kapster / Barber (Wajib untuk Layanan)
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {MOCK_BARBERS.map(b => {
              const isSelected = selectedKapster === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedKapster(b.id)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? '#050506' : 'var(--color-text-secondary)',
                    border: `1px solid ${isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.06)'}`,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-gold-border)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services & Jasa section */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-white)', marginBottom: '14px' }}>
            Daftar Layanan & Jasa
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {MOCK_SERVICES.map(srv => (
              <button 
                key={srv.id} 
                className="card" 
                onClick={() => addToCart(srv, 'service')}
                style={{ 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  height: '100%',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-gold-border)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-card-border)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-white)' }}>{srv.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>{srv.duration} mnt</div>
                </div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1rem', marginTop: '10px' }}>
                  Rp {srv.price.toLocaleString('id-ID')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Products section */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-white)', marginBottom: '14px' }}>
            Produk Ritel Barbershop
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {MOCK_PRODUCTS.map(prd => (
              <button 
                key={prd.id} 
                className="card" 
                onClick={() => addToCart(prd, 'product')}
                style={{ 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  height: '100%',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-gold-border)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-card-border)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-white)' }}>{prd.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Stok: {prd.stock} unit</div>
                </div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1rem', marginTop: '10px' }}>
                  Rp {prd.price.toLocaleString('id-ID')}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Checkout Cart Drawer */}
      <div className="card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        minWidth: '350px',
        padding: '24px'
      }}>
        
        {/* Transaksi Title */}
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--color-white)',
          marginBottom: '20px', 
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px' 
        }}>
          <ShoppingCart size={18} style={{ color: 'var(--color-gold)' }} /> 
          Detail Transaksi Kasir
        </h3>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cart.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: 'var(--color-text-secondary)',
              gap: '10px',
              padding: '20px 0'
            }}>
              <ShoppingCart size={32} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.875rem' }}>Belum ada item terpilih</span>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map((item, index) => {
                const kapster = MOCK_BARBERS.find(b => b.id === item.kapsterId);
                return (
                  <li 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      padding: '12px 14px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.015)', 
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-white)' }}>{item.name}</div>
                      {kapster && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
                          Kapster: {kapster.name}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-white)' }}>
                        Rp {(item.qty * item.price).toLocaleString('id-ID')}
                      </span>
                      <button 
                        onClick={() => removeFromCart(index)} 
                        style={{ color: 'var(--color-danger)', cursor: 'pointer', transition: 'opacity 0.2s', padding: '2px' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Final Breakdown Billing Area */}
        <div style={{ 
          borderTop: '1px solid var(--color-card-border)', 
          paddingTop: '18px', 
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal Jasa & Produk</span>
            <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Pajak / PPN ({taxRate}%)</span>
            <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>Rp {tax.toLocaleString('id-ID')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', marginTop: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Tip Kapster</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Rp</span>
              <input 
                type="number" 
                value={tipAmount === 0 ? '' : tipAmount}
                onChange={(e) => setTipAmount(e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
                style={{ 
                  width: '90px', 
                  padding: '6px 8px', 
                  fontSize: '0.875rem', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  textAlign: 'right' 
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '10px',
            marginBottom: '16px',
            fontSize: '1.2rem', 
            fontWeight: 700, 
            color: 'var(--color-gold)' 
          }}>
            <span>Total Tagihan</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>

          <button 
            onClick={openPaymentModal} 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(207, 162, 67, 0.15)'
            }}
          >
            <CheckCircle size={18} />
            Lanjutkan Pembayaran
          </button>
        </div>

      </div>

      {/* Payment Modal Overlay */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '850px',
            padding: '0',
            position: 'relative',
            border: '1px solid var(--color-card-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              backgroundColor: 'rgba(255,255,255,0.01)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-white)', margin: 0 }}>
                Selesaikan Pembayaran
              </h2>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
              
              {/* Left Column (Input) */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Sisa Tagihan Box */}
                <div style={{ 
                  backgroundColor: '#1a1a1c', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>SISA TAGIHAN</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    Rp {remainingBill.toLocaleString('id-ID')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    PILIH METODE PEMBAYARAN
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <option value="Uang Tunai (Cash)">Uang Tunai (Cash)</option>
                    <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                    <option value="Kartu Debit / Kredit">Kartu Debit / Kredit</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    NOMINAL PEMBAYARAN (RUPIAH)
                  </label>
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                    style={{ width: '100%', padding: '12px', fontSize: '1.1rem', backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                  
                  {/* Quick Pills */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {[
                      { label: `${(remainingBill / 1000).toLocaleString('id-ID')}k`, val: remainingBill },
                      { label: '50k', val: 50000 },
                      { label: '100k', val: 100000 }
                    ].map(pill => (
                      <button 
                        key={pill.label}
                        onClick={() => setPaymentAmount(pill.val)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          color: 'var(--color-white)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    onClick={handleAddSplitPayment}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      backgroundColor: '#1a1a1c', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '8px',
                      color: 'var(--color-white)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#1a1a1c'}
                  >
                    <Plus size={18} /> Tambah Pembayaran (Split)
                  </button>
                </div>

              </div>

              {/* Right Column (Summary) */}
              <div style={{ 
                padding: '24px', 
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '16px' }}>
                  DAFTAR SPLIT PAYMENT
                </span>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {splitPayments.length === 0 ? (
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                      Belum ada metode bayar dipilih.
                    </div>
                  ) : (
                    splitPayments.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--color-white)', fontSize: '0.9rem' }}>{p.method}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>Rp {p.amount.toLocaleString('id-ID')}</span>
                          <button 
                            onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))}
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ 
                  borderTop: '1px dashed rgba(255,255,255,0.1)', 
                  paddingTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--color-white)' }}>
                    <span>Total Tagihan:</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--color-success)' }}>
                    <span>Total Dibayar:</span>
                    <span>Rp {(totalPaid + Number(paymentAmount || 0)).toLocaleString('id-ID')}</span>
                  </div>
                  
                  {remainingBill > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-danger)', marginTop: '4px' }}>
                      <span>Kurang:</span>
                      <span>Rp {remainingBill.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <button 
                    onClick={handleFinishTransaction}
                    className="btn-primary"
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      marginTop: '24px',
                      fontSize: '1rem',
                      borderRadius: '8px',
                      opacity: (totalPaid + Number(paymentAmount || 0)) < total ? 0.6 : 1,
                      cursor: (totalPaid + Number(paymentAmount || 0)) < total ? 'not-allowed' : 'pointer'
                    }}
                    disabled={(totalPaid + Number(paymentAmount || 0)) < total}
                  >
                    Selesaikan Transaksi <CheckCircle size={18} />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
