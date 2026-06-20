import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// =========================================================
// MOCK DATA FALLBACK (If connection is not configured yet)
// =========================================================
let mockMembers = [
  { id: 'm1', name: 'Jay Patel', phone: '9012345678', email: 'jay@gmail.com', joined_date: '2026-03-12', status: 'Active' },
  { id: 'm2', name: 'Priya Mehta', phone: '9123456780', email: 'priya@gmail.com', joined_date: '2026-01-05', status: 'Active' },
  { id: 'm3', name: 'Aman Verma', phone: '9234567801', email: 'aman@gmail.com', joined_date: '2025-06-10', status: 'Active' },
  { id: 'm4', name: 'Rahul Shah', phone: '9345678012', email: 'rahul@gmail.com', joined_date: '2026-06-01', status: 'Active' },
  { id: 'm5', name: 'Neha Kapadia', phone: '9456780123', email: 'neha@gmail.com', joined_date: '2026-02-15', status: 'Inactive' }
];

let mockPayments = [
  { id: 'p1', member_id: 'm1', amount: 1799, payment_method: 'GPay', payment_date: '2026-06-18', period_months: 1, notes: 'Forged monthly plan' },
  { id: 'p2', member_id: 'm2', amount: 4899, payment_method: 'GPay', payment_date: '2026-06-15', period_months: 3, notes: 'Forged quarterly plan' },
  { id: 'p3', member_id: 'm3', amount: 16499, payment_method: 'Card', payment_date: '2026-06-10', period_months: 12, notes: 'Forged annual plan' },
  { id: 'p4', member_id: 'm4', amount: 999, payment_method: 'Cash', payment_date: '2026-06-19', period_months: 1, notes: 'Raw monthly' },
  { id: 'p5', member_id: 'm5', amount: 2699, payment_method: 'Cash', payment_date: '2026-05-01', period_months: 3, notes: 'Raw quarterly' },
  { id: 'p6', member_id: 'm1', amount: 1799, payment_method: 'PhonePe', payment_date: '2026-05-18', period_months: 1, notes: 'Renewal' }
];

const getInMemoryMemberName = (memberId) => {
  const m = mockMembers.find(member => member.id === memberId);
  return m ? m.name : 'Unknown Member';
};

export const getDatabaseMode = () => {
  return isSupabaseConfigured ? 'Supabase Live' : 'Mock DB';
};

// =========================================================
// DATA ACCESS SERVICE
// =========================================================
export const dbService = {
  // --- MEMBERS METHODS ---
  async getMembers() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Supabase error fetching members:", err.message);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
      return [...mockMembers].sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  async addMember(name, phone, email, status = 'Active') {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('members')
          .insert([{ name, phone, email, status }])
          .select();
        if (error) throw error;
        return data[0];
      } catch (err) {
        console.error("Supabase error adding member:", err.message);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
      if (mockMembers.some(m => m.phone === phone)) {
        throw new Error("A member with this phone number already exists.");
      }
      const newMember = {
        id: 'm_' + Math.random().toString(36).substr(2, 9),
        name,
        phone,
        email: email || '',
        joined_date: new Date().toISOString().split('T')[0],
        status
      };
      mockMembers.push(newMember);
      return newMember;
    }
  },

  async updateMember(id, name, phone, email, status) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('members')
          .update({ name, phone, email, status })
          .eq('id', id)
          .select();
        if (error) throw error;
        return data[0];
      } catch (err) {
        console.error("Supabase error updating member:", err.message);
        throw err;
      }
    } else {
      const idx = mockMembers.findIndex(m => m.id === id);
      if (idx !== -1) {
        mockMembers[idx] = { ...mockMembers[idx], name, phone, email, status };
        return mockMembers[idx];
      }
      throw new Error("Member not found");
    }
  },

  async deleteMember(memberId) {
    if (isSupabaseConfigured) {
      try {
        // Cascade delete payments in cloud manually if needed
        await supabase.from('payments').delete().eq('member_id', memberId);
        const { error } = await supabase.from('members').delete().eq('id', memberId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase error deleting member:", err.message);
        throw err;
      }
    } else {
      mockMembers = mockMembers.filter(m => m.id !== memberId);
      mockPayments = mockPayments.filter(p => p.member_id !== memberId);
      return true;
    }
  },

  // --- PAYMENTS METHODS ---
  async getPayments() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            members (name)
          `)
          .order('payment_date', { ascending: false });
        if (error) throw error;
        return data.map(p => ({
          ...p,
          member_name: p.members ? p.members.name : 'Unknown Member'
        }));
      } catch (err) {
        console.error("Supabase error fetching payments:", err.message);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
      return mockPayments
        .map(p => ({
          ...p,
          member_name: getInMemoryMemberName(p.member_id)
        }))
        .sort((a, b) => b.payment_date.localeCompare(a.payment_date));
    }
  },

  async addPayment(memberId, amount, paymentMethod, periodMonths, notes = '') {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Invalid payment amount.");
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([{
            member_id: memberId,
            amount: numAmount,
            payment_method: paymentMethod,
            period_months: parseInt(periodMonths, 10),
            notes
          }])
          .select();
        if (error) throw error;
        return data[0];
      } catch (err) {
        console.error("Supabase error inserting payment:", err.message);
        throw err;
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
      const newPayment = {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        member_id: memberId,
        amount: numAmount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        period_months: parseInt(periodMonths, 10),
        notes
      };
      mockPayments.push(newPayment);
      return {
        ...newPayment,
        member_name: getInMemoryMemberName(memberId)
      };
    }
  },

  async deletePayment(paymentId) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('payments').delete().eq('id', paymentId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase error deleting payment:", err.message);
        throw err;
      }
    } else {
      mockPayments = mockPayments.filter(p => p.id !== paymentId);
      return true;
    }
  }
};


