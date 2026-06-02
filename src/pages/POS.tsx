import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { ShoppingCart, Trash2, CheckCircle, User, ShieldAlert, X, Plus, Printer, MessageCircle, Send } from 'lucide-react';
import type { Transaction } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'product';
  kapsterId?: string;
  commissionType?: 'percentage' | 'nominal';
  commissionValue?: number;
}

export default function POS() {
  const navigate = useNavigate();
  const { activeShift, activeOutlet, addTransaction, kapsters, user, systemUsers, services, products } = useAppStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedKapsterId, setSelectedKapsterId] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Uang Tunai (Cash)');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Receipt Modal State
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    // Reset local states (termasuk tip konsumen) saat kas/shift berganti
    setCart([]);
    setTipAmount(0);
  }, [activeShift?.id]);

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
    if (type === 'service' && !selectedKapsterId) {
      toast.error('Pilih Kapster terlebih dahulu untuk melayani jasa/layanan!');
      return;
    }

    const existing = cart.find(c => c.id === item.id && (type === 'product' || c.kapsterId === selectedKapsterId));
    if (existing) {
      setCart(cart.map(c => c.id === item.id && (type === 'product' || c.kapsterId === selectedKapsterId) ? { ...c, qty: c.qty + 1 } : c));
    } else {
      const kapster = type === 'service' ? kapsters.find(k => k.id === selectedKapsterId) : undefined;
      setCart([...cart, { 
        ...item, 
        qty: 1, 
        type, 
        kapsterId: type === 'service' ? selectedKapsterId : undefined,
        commissionType: kapster?.commissionType || 'percentage',
        commissionValue: kapster?.commissionValue || 0
      }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxRate = activeOutlet?.taxRate ?? 10;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax + tipAmount;

  const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBill = Math.max(0, total - totalPaid);

  const openPaymentModal = () => {
    if (cart.length === 0) return toast.error('Keranjang transaksi Anda masih kosong!');
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

  const handleFinishTransaction = async () => {
    if (totalPaid + Number(paymentAmount || 0) < total) {
      return toast.error('Total pembayaran belum mencukupi tagihan!');
    }

    setIsProcessing(true);
    
    let transactionMethod = paymentMethod;
    
    if (splitPayments.length > 0) {
      const allPayments = [...splitPayments];
      if (paymentAmount && Number(paymentAmount) > 0) {
        allPayments.push({ method: paymentMethod, amount: Number(paymentAmount) });
      }
      
      let cashAmt = 0;
      let qrisAmt = 0;
      let debitAmt = 0;
      
      allPayments.forEach(p => {
        if (p.method === 'Uang Tunai (Cash)') cashAmt += p.amount;
        else if (p.method === 'QRIS / E-Wallet') qrisAmt += p.amount;
        else debitAmt += p.amount;
      });

      // Handle change (kembalian) which is typically taken from cash
      const totalAllPaid = cashAmt + qrisAmt + debitAmt;
      if (totalAllPaid > total) {
        const change = totalAllPaid - total;
        cashAmt -= change;
      }

      const parts = [];
      if (cashAmt > 0) parts.push(`Tunai: ${cashAmt}`);
      if (qrisAmt > 0) parts.push(`QRIS: ${qrisAmt}`);
      if (debitAmt > 0) parts.push(`Debit: ${debitAmt}`);
      
      transactionMethod = `Split Payment (${parts.join(', ')})`;
    }

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      tip: tipAmount,
      total,
      method: transactionMethod,
      customerName: 'Pelanggan Walk-in'
    };
    
    try {
      await addTransaction(newTransaction);
      setCompletedTransaction(newTransaction);
      setCart([]);
      setIsPaymentModalOpen(false);
      setTipAmount(0);
      setSplitPayments([]);
      toast.success('Transaksi berhasil!');
    } catch (e: any) {
      toast.error('Gagal mencatat transaksi: ' + e.message);
    }
    setIsProcessing(false);
  };

  const getCashierName = () => {
    if (!activeShift) return 'Admin';
    const found = systemUsers.find(u => u.id === activeShift.cashierId);
    return found ? found.name : (user?.name || 'Admin');
  };

  const getKapsterName = (kapsterId?: string) => {
    if (!kapsterId) return '-';
    const found = kapsters.find(k => k.id === kapsterId);
    return found ? found.name : kapsterId;
  };

  const handlePrintReceipt = () => {
    const receiptEl = document.getElementById('receipt-paper');
    if (!receiptEl) return;

    const printWindow = window.open('', '_blank', 'width=400,height=700');
    if (!printWindow) return;

    const receiptHTML = receiptEl.innerHTML;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Struk Pembayaran</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0; size: 80mm auto; }
  body {
    width: 80mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    color: #000;
    background: #fff;
    padding: 10px 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h2, h3, p, span, div { font-family: 'Courier New', Courier, monospace; color: #000; }
  div { display: block; }
</style>
</head>
<body>${receiptHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleWhatsAppReceipt = () => {
    if (!completedTransaction) return;
    setWaPhone('');
    setShowWaModal(true);
  };

  const executeWhatsAppSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedTransaction) return;
    
    setIsGeneratingPdf(true);

    try {
      // 1. Generate PDF from receipt
      const receiptEl = document.getElementById('receipt-paper');
      if (receiptEl) {
        const canvas = await html2canvas(receiptEl, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        
        // Receipt paper width is 80mm
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Create PDF with exactly the dimensions of the receipt
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Struk-POS-${completedTransaction.id}.pdf`);
      }

      // 2. Format WA text and open WA
      let cleanedPhone = waPhone.replace(/[\s-]/g, '');
      if (cleanedPhone.startsWith('0')) {
        cleanedPhone = '62' + cleanedPhone.substring(1);
      }
      
      let text = `*STRUK PEMBAYARAN - ${activeOutlet?.name?.toUpperCase() || 'BARBERTOPIA'}*\n`;
      text += `ID: ${completedTransaction.id}\n`;
      text += `Waktu: ${new Date(completedTransaction.date).toLocaleString('id-ID')}\n`;
      text += `--------------------------------\n`;
      
      completedTransaction.items.forEach(item => {
        text += `${item.name} (x${item.qty})\n`;
        text += `Rp ${(item.price * item.qty).toLocaleString('id-ID')}\n`;
      });
      
      text += `--------------------------------\n`;
      text += `Subtotal: Rp ${completedTransaction.subtotal.toLocaleString('id-ID')}\n`;
      text += `Pajak: Rp ${completedTransaction.tax.toLocaleString('id-ID')}\n`;
      if (completedTransaction.tip > 0) {
        text += `Tip: Rp ${completedTransaction.tip.toLocaleString('id-ID')}\n`;
      }
      text += `*TOTAL: Rp ${completedTransaction.total.toLocaleString('id-ID')}*\n`;
      text += `Metode: ${completedTransaction.method}\n`;
      text += `--------------------------------\n`;
      text += `Terima kasih atas kunjungan Anda!\n\n`;
      text += `_(Catatan Kasir: Silakan cek lampiran PDF untuk struk resmi)_`;

      const encodedText = encodeURIComponent(text);
      const waUrl = cleanedPhone ? `https://wa.me/${cleanedPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
      
      // Delay slightly to ensure download starts before navigation
      setTimeout(() => {
        window.open(waUrl, '_blank');
        setShowWaModal(false);
        setIsGeneratingPdf(false);
      }, 800);
      
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat PDF Struk');
      setIsGeneratingPdf(false);
    }
  };

  const closeReceiptAndContinue = () => {
    setCompletedTransaction(null);
  };

  return (
    <div className="responsive-row" style={{ gap: '24px', flex: 1, width: '100%', alignItems: 'stretch', minHeight: 0 }}>
      
      {/* Left Column: Menu Selector */}
      <div style={{ 
        flex: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        overflowY: 'auto', 
        paddingRight: '6px',
        minHeight: '400px'
      }}>
        
        {/* Card Choose Kapster */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            Pilih Kapster / Barber (Wajib untuk Layanan)
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {kapsters.filter(k => k.status === 'active').map(b => {
              const isSelected = selectedKapsterId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedKapsterId(b.id)}
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
            {services.map(srv => (
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
            {products.map(prd => (
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
      <div className="card w-full-mobile" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'fit-content', 
        position: 'sticky',
        top: '24px',
        maxHeight: 'calc(100vh - 100px)',
        minHeight: '400px',
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
                const kapster = kapsters.find(b => b.id === item.kapsterId);
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
            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
              
              {/* Left Column (Input) */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Sisa Tagihan Box */}
                <div style={{ 
                  backgroundColor: '#071a11', 
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
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', backgroundColor: '#071a11', border: '1px solid rgba(255,255,255,0.05)' }}
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
                    style={{ width: '100%', padding: '12px', fontSize: '1.1rem', backgroundColor: '#071a11', border: '1px solid rgba(255,255,255,0.05)' }}
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
                      backgroundColor: '#071a11', 
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
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#071a11'}
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
                    disabled={(totalPaid + Number(paymentAmount || 0)) < total || isProcessing}
                  >
                    {isProcessing ? 'Memproses...' : <>Selesaikan Transaksi <CheckCircle size={18} /></>}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Input Modal */}
      {showWaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }}>
          <form onSubmit={executeWhatsAppSend} style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(37, 211, 102, 0.1)', color: '#25D366',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <MessageCircle size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Kirim via WhatsApp</h3>
              </div>
              <button type="button" onClick={() => setShowWaModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Nomor WhatsApp Pelanggan</label>
              <input 
                type="tel"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="0812... atau 62812..."
                required
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '1rem'
                }}
              />
            </div>
            
            <button type="submit" disabled={isGeneratingPdf} style={{
              background: '#25D366', border: 'none', padding: '14px', borderRadius: '8px',
              color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: isGeneratingPdf ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              opacity: isGeneratingPdf ? 0.7 : 1
            }}>
              <Send size={18} />
              {isGeneratingPdf ? 'Memproses PDF...' : 'Kirim Struk & Buka WA'}
            </button>
          </form>
        </div>
      )}

      {/* Receipt Modal */}
      {completedTransaction && (
        <div className="receipt-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#04100a',
            borderRadius: '16px',
            border: '1px solid var(--color-card-border)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-white)', margin: 0 }}>Transaksi Berhasil!</h2>
              <button onClick={closeReceiptAndContinue} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Receipt Wrapper */}
            <div className="no-print-wrapper" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
            
            {/* The Actual Receipt Paper */}
            <div id="receipt-paper" style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#fff',
              color: '#000',
              fontFamily: "'Courier New', Courier, monospace",
              padding: '30px 24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative'
            }}>
              {/* Receipt Content */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', letterSpacing: '1px', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>{activeOutlet?.name || ''}</h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#333', whiteSpace: 'pre-wrap' }}>{activeOutlet?.address || ''}</p>
                {activeOutlet?.phone && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#333' }}>Telp: {activeOutlet.phone}</p>}
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '14px 0' }}></div>
              
              <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div>No: {completedTransaction.id.substring(0, 14)}</div>
                  <div style={{ marginTop: '6px' }}>Kasir: {getCashierName()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{new Date(completedTransaction.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ marginTop: '6px' }}>Status: LUNAS</div>
                </div>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '14px 0' }}></div>
              
              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedTransaction.items.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.name}</span>
                      <span>Rp {(item.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', marginTop: '4px', fontSize: '10px' }}>
                      <span>{item.type === 'service' ? `Kapster: ${getKapsterName(item.kapsterId)}` : 'Produk'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', color: '#555', marginTop: '2px', fontSize: '10px' }}>
                      <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '14px 0' }}></div>
              
              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Subtotal:</span>
                  <span>Rp {completedTransaction.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Pajak PPN ({activeOutlet?.taxRate ?? 10}%):</span>
                  <span>Rp {completedTransaction.tax.toLocaleString('id-ID')}</span>
                </div>
                {completedTransaction.tip > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Tip Kapster:</span>
                    <span>Rp {completedTransaction.tip.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', margin: '10px 0' }}>
                <span>TOTAL BILL:</span>
                <span>Rp {completedTransaction.total.toLocaleString('id-ID')}</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

              <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                <span>{completedTransaction.method.toUpperCase()}:</span>
                <span>Rp {completedTransaction.total.toLocaleString('id-ID')}</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '14px 0' }}></div>
              
              <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '20px', color: '#333', lineHeight: '1.4' }}>
                <p style={{ margin: 0 }}>Terima Kasih Atas Kunjungan Anda</p>
                <p style={{ margin: '4px 0 0 0' }}>{activeOutlet?.tagline || 'GENTLEMAN UP YOUR HAIR STYLE!'}</p>
                <p style={{ margin: '4px 0 0 0' }}>Powered by Luddev v.1</p>
              </div>
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="no-print" style={{ 
            padding: '20px 24px', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            justifyContent: 'center',
            gap: '16px',
            backgroundColor: '#04100a'
          }}>
            <button 
              onClick={handleWhatsAppReceipt}
              style={{ 
                padding: '12px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: '#071a11', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#113322'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#071a11'}
            >
              <MessageCircle size={18} /> WA Struk
            </button>
            <button 
              onClick={handlePrintReceipt}
              style={{ 
                padding: '12px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: 'var(--color-gold)', 
                color: '#000', 
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Printer size={18} /> Cetak Struk
            </button>
          </div>
          </div>
        </div>
      )}



    </div>
  );
}
