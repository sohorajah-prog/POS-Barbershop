import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { Sparkles, Shield, Building, AlertTriangle, Users, Scissors, Trash2, Plus, Key, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { insforge } from '../lib/insforge';

export default function Settings() {
  const { activeOutlet, clearAppStore, systemUsers, addUser, updateUser, removeUser, kapsters, addKapster, updateKapster, removeKapster } = useAppStore();
  const navigate = useNavigate();

  // State for new User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin'|'cashier'>('cashier');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // State for Outlet settings
  const [outletName, setOutletName] = useState(activeOutlet?.name || '');
  const [outletAddress, setOutletAddress] = useState(activeOutlet?.address || '');
  const [outletPhone, setOutletPhone] = useState(activeOutlet?.phone || '');
  const [outletTagline, setOutletTagline] = useState(activeOutlet?.tagline || '');
  const [outletLogo, setOutletLogo] = useState(activeOutlet?.logoUrl || '');
  const [outletTax, setOutletTax] = useState(activeOutlet?.taxRate || 0);

  // State for new Kapster
  const [newKapsterName, setNewKapsterName] = useState('');
  const [newKapsterCommType, setNewKapsterCommType] = useState<'percentage'|'nominal'>('percentage');
  const [newKapsterCommValue, setNewKapsterCommValue] = useState<number>(30);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<{id: string, name: string} | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return toast.error('Lengkapi semua data!');
    
    setIsAddingUser(true);
    
    // Register the user to Auth
    const { data: authData, error: authError } = await insforge.auth.signUp({
      email: newUserEmail,
      password: newUserPassword
    });

    if (authError) {
      setIsAddingUser(false);
      return toast.error('Gagal mendaftarkan email: ' + authError.message);
    }

    if (authData?.user) {
      // Create profile in database
      const { error: profileError } = await insforge.database.from('profiles').insert([
        { 
          id: authData.user.id, 
          name: newUserName, 
          role: newUserRole, 
          outlet_id: activeOutlet?.id || 'out-1' 
        }
      ]);
      
      if (profileError) {
        setIsAddingUser(false);
        return toast.error('Gagal membuat profil: ' + profileError.message);
      }

      // Sync local state
      addUser({
        id: authData.user.id,
        name: newUserName,
        role: newUserRole,
        outletId: activeOutlet?.id || 'out-1'
      });
      
      toast.success('Kasir berhasil ditambahkan!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    }
    
    setIsAddingUser(false);
  };

  const [isAddingKapster, setIsAddingKapster] = useState(false);
  const [isSavingOutlet, setIsSavingOutlet] = useState(false);

  const handleAddKapster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKapsterName) return;
    setIsAddingKapster(true);
    try {
      await addKapster({
        id: crypto.randomUUID(),
        name: newKapsterName,
        status: 'active',
        commissionType: newKapsterCommType,
        commissionValue: newKapsterCommValue
      });
      toast.success('Kapster berhasil ditambahkan');
      setNewKapsterName('');
      setNewKapsterCommValue(30);
    } catch (e: any) {
      toast.error('Gagal menambah kapster: ' + e.message);
    }
    setIsAddingKapster(false);
  };

  const handleUpdateK = async (id: string, data: any) => {
    try {
      await updateKapster(id, data);
      toast.success('Diperbarui');
    } catch (e: any) {
      toast.error('Gagal memperbarui: ' + e.message);
    }
  };

  const handleRemoveK = async (id: string) => {
    try {
      await removeKapster(id);
      toast.success('Dihapus');
    } catch (e: any) {
      toast.error('Gagal menghapus: ' + e.message);
    }
  };

  const handleReset = () => {
    toast.custom((t) => (
      <div style={{
        background: 'rgba(20, 20, 22, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.25)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        color: '#fff'
      }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '1.1rem' }}>
          <AlertTriangle size={20} />
          Peringatan Reset Sistem
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Anda yakin ingin menghapus seluruh data transaksi, kas, dan shift secara permanen? Aplikasi akan di-reset ke kondisi awal.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            onClick={() => toast.dismiss(t.id)}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Batal
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              clearAppStore();
              toast.success('Data sistem berhasil di-reset.');
              navigate('/login');
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--color-danger)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            Ya, Hapus Semua
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleSaveOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOutlet) return;
    setIsSavingOutlet(true);
    try {
      await useAppStore.getState().setActiveOutlet({
        ...activeOutlet,
        name: outletName,
        address: outletAddress,
        phone: outletPhone,
        tagline: outletTagline,
        logoUrl: outletLogo,
        taxRate: outletTax
      });
      toast.success('Pengaturan outlet berhasil disimpan!');
    } catch (e: any) {
      toast.error('Gagal menyimpan outlet: ' + e.message);
    }
    setIsSavingOutlet(false);
  };

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

        <form onSubmit={handleSaveOutlet} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nama Outlet</label>
            <input 
              type="text" 
              value={outletName} 
              onChange={e => setOutletName(e.target.value)}
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Alamat Lengkap</label>
            <textarea 
              value={outletAddress}
              onChange={e => setOutletAddress(e.target.value)}
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

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>No. Telepon / WA Outlet</label>
              <input 
                type="text" 
                value={outletPhone}
                onChange={e => setOutletPhone(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Pajak / PPN (%)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  value={outletTax}
                  onChange={e => setOutletTax(Number(e.target.value))}
                  style={{ width: '100%', paddingRight: '32px' }} 
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>%</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                URL Logo Outlet (Opsional)
              </label>
              <input 
                type="text" 
                value={outletLogo} 
                onChange={(e) => setOutletLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                style={{ 
                  width: '100%',
                  padding: '12px 14px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tagline Struk</label>
            <input 
              type="text" 
              value={outletTagline}
              onChange={e => setOutletTagline(e.target.value)}
              placeholder="Cth: GENTLEMAN UP YOUR HAIR STYLE!"
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={isSavingOutlet}>
              <Sparkles size={16} />
              {isSavingOutlet ? 'Menyimpan...' : 'Simpan Perubahan'}
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

      {/* Card 3: Manajemen Pengguna */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px'
        }}>
          <Users size={18} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
            Manajemen Pengguna (Akun Login)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-card-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>Nama</th>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>Peran</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {systemUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 4px', color: 'var(--color-white)' }}>{u.name}</td>
                  <td style={{ padding: '12px 4px', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                    <button 
                      onClick={() => {
                        setPasswordTargetUser({ id: u.id, name: u.name });
                        setNewPasswordValue('');
                        setShowPasswordModal(true);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', marginRight: '16px' }}
                      title="Ganti Password"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      onClick={() => removeUser(u.id)}
                      disabled={systemUsers.length === 1}
                      style={{ background: 'transparent', border: 'none', color: systemUsers.length === 1 ? '#555' : 'var(--color-danger)', cursor: systemUsers.length === 1 ? 'not-allowed' : 'pointer' }}
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={handleAddUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginTop: '8px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Nama</label>
              <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required placeholder="Cth: Siti" style={{ width: '100%' }} />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Email Login</label>
              <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required placeholder="siti@barbershop.com" style={{ width: '100%' }} />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Password Default</label>
              <input type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required placeholder="Minimal 6 karakter" style={{ width: '100%' }} />
            </div>
            <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Peran</label>
              <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} style={{ width: '100%', padding: '10px' }}>
                <option value="cashier" style={{background: '#071a11'}}>Kasir</option>
                <option value="admin" style={{background: '#071a11'}}>Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={isAddingUser} style={{ padding: '10px 16px', flex: '0 0 auto' }}>
              <Plus size={16} /> {isAddingUser ? 'Memproses...' : 'Tambah'}
            </button>
          </form>
        </div>
      </div>

      {/* Card 4: Manajemen Kapster */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px'
        }}>
          <Scissors size={18} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-white)', margin: 0 }}>
            Manajemen Kapster & Komisi
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-card-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>Nama Kapster</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>Komisi (%)</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kapsters.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 4px', color: 'var(--color-white)' }}>{k.name}</td>
                  <td style={{ padding: '12px 4px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <select
                        value={k.commissionType}
                        onChange={e => handleUpdateK(k.id, { commissionType: e.target.value as any })}
                        style={{ padding: '4px', fontSize: '0.8rem', width: '90px' }}
                      >
                        <option value="percentage">Persentase</option>
                        <option value="nominal">Nominal</option>
                      </select>
                      <input 
                        type="number" 
                        value={k.commissionValue} 
                        onChange={e => handleUpdateK(k.id, { commissionValue: Number(e.target.value) })}
                        style={{ width: '80px', padding: '4px 8px', textAlign: 'center' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '12px 4px', textAlign: 'center' }}>
                    <select 
                      value={k.status}
                      onChange={e => handleUpdateK(k.id, { status: e.target.value as any })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: k.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: k.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)', border: 'none' }}
                    >
                      <option value="active" style={{background: '#071a11'}}>Aktif</option>
                      <option value="inactive" style={{background: '#071a11'}}>Nonaktif</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                    <button onClick={() => handleRemoveK(k.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={handleAddKapster} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '8px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Nama Kapster</label>
              <input type="text" value={newKapsterName} onChange={e => setNewKapsterName(e.target.value)} required placeholder="Cth: Rendi" style={{ width: '100%' }} />
            </div>
            <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Jenis Komisi</label>
              <select value={newKapsterCommType} onChange={e => setNewKapsterCommType(e.target.value as any)} style={{ width: '100%', padding: '10px' }}>
                <option value="percentage" style={{background: '#071a11'}}>Persentase (%)</option>
                <option value="nominal" style={{background: '#071a11'}}>Nominal (Rp)</option>
              </select>
            </div>
            <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Nilai Komisi</label>
              <input type="number" value={newKapsterCommValue} onChange={e => setNewKapsterCommValue(Number(e.target.value))} min={0} required style={{ width: '100%' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={isAddingKapster} style={{ padding: '10px 16px' }}>
              <Plus size={16} /> {isAddingKapster ? 'Menambah...' : 'Tambah'}
            </button>
          </form>
        </div>
      </div>

      {/* Card 5: Danger Zone */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--color-card-border)', 
          paddingBottom: '14px'
        }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-danger)', margin: 0 }}>
            Zona Bahaya (Danger Zone)
          </h3>
        </div>

        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Aksi di bawah ini tidak dapat dibatalkan. Menghapus data akan me-reset kasir, status shift, transaksi, dan akan otomatis mengeluarkan (*logout*) Anda.
          </p>
          <button 
            onClick={handleReset}
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--color-danger)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
          >
            <AlertTriangle size={16} />
            Reset Seluruh Data Transaksi & Kas
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && passwordTargetUser && (
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
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newPasswordValue) {
              updateUser(passwordTargetUser.id, { password: newPasswordValue });
              toast.success('Password berhasil diubah!');
              setShowPasswordModal(false);
            }
          }} style={{
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
                  background: 'rgba(207, 162, 67, 0.1)', color: 'var(--color-gold)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <Key size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Ubah Password</h3>
              </div>
              <button type="button" onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Password Baru untuk {passwordTargetUser.name}</label>
              <input 
                type="password"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                placeholder="Masukkan password baru..."
                required
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '1rem'
                }}
              />
            </div>
            
            <button type="submit" style={{
              background: 'var(--color-gold)', border: 'none', padding: '14px', borderRadius: '8px',
              color: '#071a11', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={18} />
              Simpan Password
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
