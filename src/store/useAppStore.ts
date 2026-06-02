import { create } from 'zustand';
import type { AppState } from '../types';
import { insforge } from '../lib/insforge';

export const useAppStore = create<AppState>()(
  (set, get) => ({
    user: null,
    activeOutlet: {
      id: '',
      name: '',
      address: '',
      phone: '',
      tagline: '',
      taxRate: 10
    },
    activeShift: null,
    transactions: [],
    systemUsers: [],
    kapsters: [],
    walkinQueue: [],
    services: [],
    products: [],

    login: (user) => set({ user }),
    logout: () => {
      insforge.auth.signOut();
      set({ user: null, activeShift: null });
    },

    setActiveOutlet: async (outlet) => {
      const { error } = await insforge.database.from('outlets').update({
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        tagline: outlet.tagline,
        tax_rate: outlet.taxRate
      }).eq('id', outlet.id);
      if (error) throw error;
      set({ activeOutlet: outlet });
    },
    openShift: async (shift) => {
      const { data, error } = await insforge.database.from('shifts').insert([{
        cashier_id: shift.cashierId,
        outlet_id: shift.outletId,
        start_time: shift.startTime,
        start_cash: shift.startCash,
        status: shift.status
      }]).select().single();
      if (error) throw error;
      set({ activeShift: { ...shift, id: data.id } });
    },
    closeShift: async (endCash, expectedCash) => {
      const state = get();
      if (!state.activeShift) return;
      const endTime = new Date().toISOString();
      const { error } = await insforge.database.from('shifts').update({
        status: 'closed',
        end_time: endTime,
        end_cash: endCash,
        expected_cash: expectedCash
      }).eq('id', state.activeShift.id);
      if (error) throw error;
      set({
        activeShift: {
          ...state.activeShift,
          status: 'closed',
          endTime,
          endCash,
          expectedCash
        }
      });
    },

    addTransaction: async (transaction) => {
      const { error: txError } = await insforge.database.from('transactions').insert([{
        id: transaction.id,
        outlet_id: get().activeOutlet?.id,
        shift_id: get().activeShift?.id,
        cashier_id: get().user?.id,
        date: transaction.date,
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        tip: transaction.tip,
        total: transaction.total,
        method: transaction.method,
        customer_name: transaction.customerName
      }]);
      if (txError) throw txError;
      
      const items = transaction.items.map(item => ({
        transaction_id: transaction.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        type: item.type,
        kapster_id: item.kapsterId,
        commission_type: item.commissionType,
        commission_value: item.commissionValue
      }));
      
      if (items.length > 0) {
        const { error: itemsError } = await insforge.database.from('transaction_items').insert(items);
        if (itemsError) throw itemsError;
      }

      // Decrease stock for product items
      const productItems = transaction.items.filter(item => item.type === 'product');
      if (productItems.length > 0) {
        const updatedProducts = [...get().products];
        
        for (const item of productItems) {
          const productIndex = updatedProducts.findIndex(p => p.id === item.id);
          if (productIndex !== -1) {
            const product = updatedProducts[productIndex];
            const newStock = Math.max(0, Number(product.stock) - Number(item.qty));
            
            const { error: stockError } = await insforge.database.from('products')
              .update({ stock: newStock })
              .eq('id', product.id);
            
            if (stockError) throw stockError;
            
            updatedProducts[productIndex] = { ...product, stock: newStock };
          }
        }
        
        set({ products: updatedProducts });
      }
      
      set((state) => ({ transactions: [...state.transactions, { ...transaction, shiftId: get().activeShift?.id }] }));
    },

    removeTransaction: async (id) => {
      const { error } = await insforge.database.from('transactions').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    },

    clearAppStore: async () => {
      const outletId = get().activeOutlet?.id;
      if (outletId) {
        const { error: err1 } = await insforge.database.from('transactions').delete().eq('outlet_id', outletId);
        if (err1) throw err1;
        const { error: err2 } = await insforge.database.from('shifts').delete().eq('outlet_id', outletId);
        if (err2) throw err2;
      }
      set({
        user: null,
        activeShift: null,
        transactions: [],
        walkinQueue: []
      });
    },

    addUser: (user) => set((state) => ({ systemUsers: [...state.systemUsers, { ...user, password: user.password || '1234' }] })),
    updateUser: (id, data) => set((state) => ({
      systemUsers: state.systemUsers.map(u => u.id === id ? { ...u, ...data } : u)
    })),
    removeUser: (userId) => set((state) => ({ 
      systemUsers: state.systemUsers.filter(u => u.id !== userId) 
    })),

    addKapster: async (kapster) => {
      const { data, error } = await insforge.database.from('kapsters').insert([{
        outlet_id: get().activeOutlet?.id,
        name: kapster.name,
        status: kapster.status,
        commission_type: kapster.commissionType,
        commission_value: kapster.commissionValue
      }]).select().single();
      if (error) throw error;
      set((state) => ({ kapsters: [...state.kapsters, { ...kapster, id: data.id }] }));
    },
    updateKapster: async (id, data) => {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.status !== undefined) updates.status = data.status;
      if (data.commissionType !== undefined) updates.commission_type = data.commissionType;
      if (data.commissionValue !== undefined) updates.commission_value = data.commissionValue;
      
      const { error } = await insforge.database.from('kapsters').update(updates).eq('id', id);
      if (error) throw error;
      set((state) => ({ kapsters: state.kapsters.map(k => k.id === id ? { ...k, ...data } : k) }));
    },
    removeKapster: async (id) => {
      const { error } = await insforge.database.from('kapsters').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ kapsters: state.kapsters.filter(k => k.id !== id) }));
    },

    setWalkinQueue: (queue) => set({ walkinQueue: queue }),
    setServices: (services) => set({ services }),
    addService: async (service) => {
      const { data, error } = await insforge.database.from('services').insert([{
        outlet_id: get().activeOutlet?.id,
        name: service.name, category: service.category, price: service.price, duration: service.duration,
        commission_type: service.commissionType, commission_value: service.commissionValue
      }]).select().single();
      if (error) throw error;
      set((state) => ({ services: [...state.services, { ...service, id: data.id }] }));
    },
    updateService: async (id, data) => {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.category !== undefined) updates.category = data.category;
      if (data.price !== undefined) updates.price = data.price;
      if (data.duration !== undefined) updates.duration = data.duration;
      if (data.commissionType !== undefined) updates.commission_type = data.commissionType;
      if (data.commissionValue !== undefined) updates.commission_value = data.commissionValue;
      
      const { error } = await insforge.database.from('services').update(updates).eq('id', id);
      if (error) throw error;
      set((state) => ({ services: state.services.map(s => s.id === id ? { ...s, ...data } : s) }));
    },
    removeService: async (id) => {
      const { error } = await insforge.database.from('services').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ services: state.services.filter(s => s.id !== id) }));
    },

    setProducts: (products) => set({ products }),
    addProduct: async (product) => {
      const { data, error } = await insforge.database.from('products').insert([{
        outlet_id: get().activeOutlet?.id,
        name: product.name, category: product.category, price: product.price, stock: product.stock
      }]).select().single();
      if (error) throw error;
      set((state) => ({ products: [...state.products, { ...product, id: data.id }] }));
    },
    updateProduct: async (id, data) => {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.category !== undefined) updates.category = data.category;
      if (data.price !== undefined) updates.price = data.price;
      if (data.stock !== undefined) updates.stock = data.stock;
      
      const { error } = await insforge.database.from('products').update(updates).eq('id', id);
      if (error) throw error;
      set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...data } : p) }));
    },
    removeProduct: async (id) => {
      const { error } = await insforge.database.from('products').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    },
    
    // Add initialization action
    initDb: async () => {
      // For now, load outlets and some setup
      const { data: outlets } = await insforge.database.from('outlets').select('*').limit(1);
      if (outlets && outlets.length > 0) {
        set({ 
          activeOutlet: {
            id: outlets[0].id,
            name: outlets[0].name,
            address: outlets[0].address || '',
            phone: outlets[0].phone || '',
            tagline: outlets[0].tagline || '',
            taxRate: outlets[0].tax_rate
          } 
        });
      }
      
      const outletId = get().activeOutlet?.id;
      if (!outletId) return;

      const [kapstersRes, servicesRes, productsRes, profilesRes, shiftsRes, txRes] = await Promise.all([
        insforge.database.from('kapsters').select('*').eq('outlet_id', outletId),
        insforge.database.from('services').select('*').eq('outlet_id', outletId),
        insforge.database.from('products').select('*').eq('outlet_id', outletId),
        insforge.database.from('profiles').select('*').eq('outlet_id', outletId),
        insforge.database.from('shifts').select('*').eq('outlet_id', outletId).eq('status', 'open').order('start_time', { ascending: false }).limit(1),
        insforge.database.from('transactions')
          .select('*, transaction_items(*)')
          .eq('outlet_id', outletId)
          .gte('date', new Date(new Date().setHours(0,0,0,0)).toISOString())
      ]);
      
      if (kapstersRes.data) {
        set({ kapsters: kapstersRes.data.map((k: any) => ({
          id: k.id, name: k.name, status: k.status, commissionType: k.commission_type, commissionValue: k.commission_value
        }))});
      }
      if (servicesRes.data) {
        set({ services: servicesRes.data.map((s: any) => ({
          id: s.id, name: s.name, category: s.category, duration: s.duration, price: s.price, commissionType: s.commission_type, commissionValue: s.commission_value
        }))});
      }
      if (productsRes.data) {
        set({ products: productsRes.data.map((p: any) => ({
          id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock
        }))});
      }
      if (profilesRes.data) {
        set({ systemUsers: profilesRes.data.map((p: any) => ({
          id: p.id, name: p.name, role: p.role, outletId: p.outlet_id
        }))});
      }
      if (shiftsRes.data && shiftsRes.data.length > 0) {
        const s = shiftsRes.data[0];
        set({ activeShift: {
          id: s.id, cashierId: s.cashier_id, outletId: s.outlet_id, 
          startTime: s.start_time, startCash: s.start_cash, status: s.status
        }});
      } else {
        set({ activeShift: null });
      }
      if (txRes.data) {
        set({ transactions: txRes.data.map((t: any) => ({
          id: t.id, date: t.date, subtotal: t.subtotal, tax: t.tax, tip: t.tip, total: t.total, method: t.method, customerName: t.customer_name, shiftId: t.shift_id,
          items: (t.transaction_items || []).map((i: any) => ({
            id: i.id, name: i.name, price: i.price, qty: i.qty, type: i.type, kapsterId: i.kapster_id, commissionType: i.commission_type, commissionValue: i.commission_value
          }))
        }))});
      }
    }
  })
);
