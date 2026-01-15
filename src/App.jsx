import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { 
  DollarSign, Plus, TrendingUp, Trash2, Loader2, 
  MessageSquare, X, Calendar, Edit3, ChevronRight, Moon, Sun,
  AlertTriangle, ArrowLeft, Wallet, Target, CreditCard,
  BarChart3, ChevronDown, ChevronUp, Search,
  ChevronLeft, Repeat, PieChart, Activity, Sparkles, Bell,
  LogOut, Mail, Lock, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend,
  CartesianGrid
} from 'recharts';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGAnm5OkFPqTZGJmFWz-kRZi6-ofwsiLA",
  authDomain: "budget-app-14be9.firebaseapp.com",
  databaseURL: "https://budget-app-14be9-default-rtdb.firebaseio.com",
  projectId: "budget-app-14be9",
  storageBucket: "budget-app-14be9.firebasestorage.app",
  messagingSenderId: "536504310786",
  appId: "1:536504310786:web:68a72b0b11e1655ca59b1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fixed user ID for your data
const userId = 'bradley_budget';

// Storage helper - syncs to Firebase
const storage = {
  get: async (key) => {
    try {
      const snapshot = await get(ref(db, `users/${userId}/${key}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (e) {
      console.error('Firebase read error:', e);
      return null;
    }
  },
  set: async (key, value) => {
    try {
      await set(ref(db, `users/${userId}/${key}`), value);
    } catch (e) {
      console.error('Firebase write error:', e);
    }
  }
};

// Utility functions
const formatCurrency = (amount, short = false) => {
  if (short && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getDaysRemaining = (date) => {
  const now = new Date();
  if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
    return date > now ? getDaysInMonth(date) : 0;
  }
  return getDaysInMonth(date) - now.getDate();
};

// Color system
const colors = {
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500', hex: '#10b981' },
  blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-500', hex: '#3b82f6' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-pink-500', hex: '#8b5cf6' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-red-500', hex: '#f97316' },
  pink: { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-500 to-rose-500', hex: '#ec4899' },
  teal: { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-500 to-cyan-500', hex: '#14b8a6' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-yellow-500', hex: '#f59e0b' },
  rose: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-500 to-red-500', hex: '#f43f5e' },
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6', '#f59e0b', '#f43f5e'];
const categoryIcons = ['🏠', '🍔', '🚗', '🎬', '🏦', '💊', '👕', '🎁', '📱', '✈️', '🏋️', '📚', '🐕', '💇', '🔧', '💡', '🎵', '🎮', '☕', '🛒'];

// Default data generator
const generateDefaultData = (monthKey) => ({
  income: [
    { id: 1, name: 'Salary', amount: 5500, recurring: true },
    { id: 2, name: 'Side Income', amount: 800, recurring: false }
  ],
  categories: [
    {
      id: 1, name: 'Housing', icon: '🏠', color: 'emerald',
      items: [
        { id: 1, name: 'Rent', planned: 1800, recurring: true, dueDay: 1 },
        { id: 2, name: 'Utilities', planned: 150, recurring: true, dueDay: 15 },
        { id: 3, name: 'Internet', planned: 80, recurring: true, dueDay: 10 }
      ]
    },
    {
      id: 2, name: 'Food', icon: '🍔', color: 'orange',
      items: [
        { id: 4, name: 'Groceries', planned: 500 },
        { id: 5, name: 'Restaurants', planned: 250 },
        { id: 6, name: 'Coffee', planned: 60 }
      ]
    },
    {
      id: 3, name: 'Transportation', icon: '🚗', color: 'blue',
      items: [
        { id: 7, name: 'Gas', planned: 180 },
        { id: 8, name: 'Car Insurance', planned: 120, recurring: true, dueDay: 1 },
        { id: 9, name: 'Maintenance', planned: 50 }
      ]
    },
    {
      id: 4, name: 'Entertainment', icon: '🎬', color: 'purple',
      items: [
        { id: 10, name: 'Streaming', planned: 45, recurring: true, dueDay: 1 },
        { id: 11, name: 'Games/Apps', planned: 30 },
        { id: 12, name: 'Events', planned: 100 }
      ]
    },
    {
      id: 5, name: 'Savings', icon: '🏦', color: 'teal',
      items: [
        { id: 13, name: 'Emergency Fund', planned: 400, recurring: true, dueDay: 1 },
        { id: 14, name: 'Vacation', planned: 200 },
        { id: 15, name: 'Investments', planned: 300, recurring: true, dueDay: 15 }
      ]
    }
  ],
  transactions: [
    { id: 1, itemId: 1, amount: 1800, description: 'Monthly rent', date: `${monthKey}-01` },
    { id: 2, itemId: 2, amount: 145, description: 'Electric + water', date: `${monthKey}-05` },
    { id: 3, itemId: 3, amount: 80, description: 'Fiber internet', date: `${monthKey}-10` },
    { id: 4, itemId: 4, amount: 127, description: 'Whole Foods', date: `${monthKey}-02` },
    { id: 5, itemId: 4, amount: 89, description: 'Trader Joes', date: `${monthKey}-05` },
    { id: 6, itemId: 4, amount: 76, description: 'Costco run', date: `${monthKey}-08` },
    { id: 7, itemId: 5, amount: 67, description: 'Thai dinner', date: `${monthKey}-03` },
    { id: 8, itemId: 5, amount: 45, description: 'Pizza night', date: `${monthKey}-07` },
    { id: 9, itemId: 6, amount: 18, description: 'Starbucks', date: `${monthKey}-01` },
    { id: 10, itemId: 6, amount: 12, description: 'Local cafe', date: `${monthKey}-04` },
    { id: 11, itemId: 7, amount: 52, description: 'Shell station', date: `${monthKey}-04` },
    { id: 12, itemId: 7, amount: 48, description: 'Chevron', date: `${monthKey}-09` },
    { id: 13, itemId: 8, amount: 120, description: 'Car insurance', date: `${monthKey}-01` },
    { id: 14, itemId: 10, amount: 45, description: 'Netflix + Spotify', date: `${monthKey}-01` },
    { id: 15, itemId: 11, amount: 15, description: 'App Store', date: `${monthKey}-06` },
    { id: 16, itemId: 13, amount: 400, description: 'Emergency fund', date: `${monthKey}-01` },
    { id: 17, itemId: 15, amount: 300, description: 'Index funds', date: `${monthKey}-15` },
  ],
  goals: [
    { id: 1, name: 'Emergency Fund', target: 10000, current: 6500, icon: '🛡️', color: 'emerald' },
    { id: 2, name: 'Japan Trip', target: 5000, current: 1800, icon: '✈️', color: 'purple', deadline: '2026-06-01' },
    { id: 3, name: 'New Laptop', target: 2000, current: 650, icon: '💻', color: 'blue' }
  ]
});

// AI Suggested Prompts
const AI_PROMPTS = [
  { text: "How am I doing this month?", icon: "📊" },
  { text: "Where can I cut spending?", icon: "✂️" },
  { text: "Am I on track for my goals?", icon: "🎯" },
  { text: "What's my biggest expense?", icon: "💸" },
  { text: "Tips to save more money", icon: "💡" },
  { text: "Analyze my food spending", icon: "🍔" },
];

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [view, setView] = useState('budget');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({});
  
  const [monthlyData, setMonthlyData] = useState({});
  const [goals, setGoals] = useState([]);
  
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [formData, setFormData] = useState({});
  
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [customReminders, setCustomReminders] = useState([]);
  const [pastItemNames, setPastItemNames] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);

  const monthKey = getMonthKey(currentMonth);
  const currentData = monthlyData[monthKey] || { income: [], categories: [], transactions: [] };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const saved = await storage.get('budget-pro-v2');
      const savedGoals = await storage.get('budget-pro-goals-v2');
      const savedDarkMode = await storage.get('budget-pro-dark-v2');
      const savedReminders = await storage.get('budget-pro-reminders-v2');
      const savedItemNames = await storage.get('budget-pro-itemnames-v2');
      
      if (saved) {
        setMonthlyData(saved);
      } else {
        const defaultMonth = getMonthKey(new Date(2026, 0, 1));
        setMonthlyData({ [defaultMonth]: generateDefaultData(defaultMonth) });
      }
      
      setGoals(savedGoals || generateDefaultData('2026-01').goals);
      setDarkMode(savedDarkMode || false);
      setCustomReminders(savedReminders || []);
      setPastItemNames(savedItemNames || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Save data
  useEffect(() => {
    if (!loading && Object.keys(monthlyData).length > 0) {
      storage.set('budget-pro-v2', monthlyData);
    }
  }, [monthlyData, loading]);

  useEffect(() => {
    if (!loading) {
      storage.set('budget-pro-goals-v2', goals);
      storage.set('budget-pro-dark-v2', darkMode);
      storage.set('budget-pro-reminders-v2', customReminders);
      storage.set('budget-pro-itemnames-v2', pastItemNames);
    }
  }, [goals, darkMode, customReminders, pastItemNames, loading]);

  // Swipe back gesture handler
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchEnd - touchStart;
    
    // Swipe right from left edge to go back
    if (diff > 100 && touchStart < 50) {
      if (viewingItem) {
        setViewingItem(null);
      } else if (viewingGoal) {
        setViewingGoal(null);
      } else if (showAI) {
        setShowAI(false);
      }
    }
    setTouchStart(null);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [modal]);

  // Check if current month needs to be created
  const needsMonthSetup = !loading && !monthlyData[monthKey];
  
  // Find previous month for copying
  const previousMonthData = useMemo(() => {
    if (!needsMonthSetup) return null;
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    const previousMonth = sortedMonths.find(m => m < monthKey);
    if (previousMonth && monthlyData[previousMonth]) {
      const prevDate = new Date(previousMonth + '-01');
      return {
        key: previousMonth,
        name: prevDate.toLocaleDateString('en-US', { month: 'long' }),
        data: monthlyData[previousMonth]
      };
    }
    return null;
  }, [needsMonthSetup, monthlyData, monthKey]);

  const createMonthBudget = (copyFromPrevious = true) => {
    if (copyFromPrevious && previousMonthData) {
      const prevData = previousMonthData.data;
      const newMonthData = {
        income: prevData.income ? prevData.income.map(inc => ({ ...inc, id: Date.now() + Math.random() })) : [],
        categories: prevData.categories ? prevData.categories.map(cat => ({
          ...cat,
          id: Date.now() + Math.random(),
          items: cat.items ? cat.items.map(item => ({
            ...item,
            id: Date.now() + Math.random() + Math.random()
          })) : []
        })) : [],
        transactions: []
      };
      setMonthlyData(prev => ({ ...prev, [monthKey]: newMonthData }));
    } else {
      setMonthlyData(prev => ({ ...prev, [monthKey]: { income: [], categories: [], transactions: [] } }));
    }
  };

  useEffect(() => {
    if (currentData.categories?.length > 0 && Object.keys(expandedCats).length === 0) {
      setExpandedCats({ 0: true });
    }
  }, [currentData.categories]);

  // Calculations
  const calculations = useMemo(() => {
    const income = currentData.income?.reduce((s, i) => s + i.amount, 0) || 0;
    const planned = currentData.categories?.reduce((s, c) => 
      s + (c.items?.reduce((a, i) => a + (i.planned || 0), 0) || 0), 0) || 0;
    
    // Calculate savings (categories marked as savings)
    const savingsPlanned = currentData.categories?.reduce((s, c) => 
      c.isSavings ? s + (c.items?.reduce((a, i) => a + (i.planned || 0), 0) || 0) : s, 0) || 0;
    
    // Unallocated = income minus all planned spending
    const unallocated = income - planned;
    
    // Spendable is total planned minus savings PLUS any unallocated money
    const spendablePlanned = (planned - savingsPlanned) + Math.max(0, unallocated);
    
    const getItemSpent = (itemId) => 
      currentData.transactions?.filter(t => t.itemId === itemId).reduce((s, t) => s + t.amount, 0) || 0;
    
    const spent = currentData.categories?.reduce((s, c) => 
      s + (c.items?.reduce((a, i) => a + getItemSpent(i.id), 0) || 0), 0) || 0;
    
    // Spent on non-savings categories only
    const spentNonSavings = currentData.categories?.reduce((s, c) => 
      c.isSavings ? s : s + (c.items?.reduce((a, i) => a + getItemSpent(i.id), 0) || 0), 0) || 0;
    
    // Calculate today's spending (non-savings)
    const today = new Date().toISOString().split('T')[0];
    const nonSavingsItemIds = new Set();
    currentData.categories?.forEach(c => {
      if (!c.isSavings) {
        c.items?.forEach(i => nonSavingsItemIds.add(i.id));
      }
    });
    const spentToday = currentData.transactions?.filter(t => t.date === today && nonSavingsItemIds.has(t.itemId)).reduce((s, t) => s + t.amount, 0) || 0;
    
    const remaining = income - planned;
    // Left to spend = spendable budget minus what's been spent (includes unallocated)
    const leftToSpend = spendablePlanned - spentNonSavings;
    const daysLeft = getDaysRemaining(currentMonth);
    const dailyBudget = daysLeft > 0 ? leftToSpend / daysLeft : 0;
    const spentPercent = spendablePlanned > 0 ? (spentNonSavings / spendablePlanned) * 100 : 0;
    
    return { income, planned, spent, remaining, leftToSpend, daysLeft, dailyBudget, spentPercent, spentToday, savingsPlanned, spendablePlanned, unallocated, getItemSpent };
  }, [currentData, currentMonth]);

  // Upcoming bills - finds recurring items with due dates that haven't been paid
  const upcomingBills = useMemo(() => {
    const today = new Date().getDate();
    const bills = [];
    
    currentData.categories?.forEach(cat => {
      cat.items?.forEach(item => {
        if (item.recurring && item.dueDay) {
          // Check if this bill has been paid this month
          const isPaid = currentData.transactions?.some(t => 
            t.itemId === item.id && t.amount >= item.planned * 0.9
          );
          
          if (!isPaid) {
            const daysUntil = item.dueDay >= today 
              ? item.dueDay - today 
              : getDaysInMonth(currentMonth) - today + item.dueDay;
            
            bills.push({
              ...item,
              catName: cat.name,
              catIcon: cat.icon,
              catColor: cat.color,
              daysUntil,
              isOverdue: item.dueDay < today
            });
          }
        }
      });
    });
    
    return bills.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [currentData, currentMonth]);

  // Chart Data
  const chartData = useMemo(() => {
    // Spending by category for pie chart
    const categorySpending = currentData.categories?.map((cat, idx) => ({
      name: cat.name,
      value: cat.items?.reduce((s, i) => s + calculations.getItemSpent(i.id), 0) || 0,
      color: colors[cat.color]?.hex || CHART_COLORS[idx % CHART_COLORS.length],
      icon: cat.icon
    })).filter(c => c.value > 0) || [];

    // Daily spending for area chart - only up to today
    const dailySpending = [];
    const today = new Date();
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    const maxDay = isCurrentMonth ? today.getDate() : getDaysInMonth(currentMonth);
    
    const currentMonthTransactions = currentData.transactions?.filter(t => {
      if (!t.date) return false;
      return t.date.startsWith(monthKey);
    }) || [];
    
    for (let day = 1; day <= maxDay; day++) {
      const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
      const dayTotal = currentMonthTransactions.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0);
      dailySpending.push({
        day: day,
        amount: dayTotal,
        cumulative: dailySpending.length > 0 
          ? dailySpending[dailySpending.length - 1].cumulative + dayTotal 
          : dayTotal
      });
    }

    // Budget vs Actual for bar chart - with over budget flag
    const budgetVsActual = currentData.categories?.map(cat => {
      const planned = cat.items?.reduce((s, i) => s + (i.planned || 0), 0) || 0;
      const spent = cat.items?.reduce((s, i) => s + calculations.getItemSpent(i.id), 0) || 0;
      return {
        name: cat.name,
        icon: cat.icon,
        planned,
        spent,
        isOver: spent > planned
      };
    }) || [];

    // Weekly spending - only transactions from current month
    const weeklySpending = [
      { week: 'Week 1', amount: 0 },
      { week: 'Week 2', amount: 0 },
      { week: 'Week 3', amount: 0 },
      { week: 'Week 4', amount: 0 },
      { week: 'Week 5', amount: 0 },
    ];
    currentMonthTransactions.forEach(t => {
      if (!t.date) return;
      const dateParts = t.date.split('-');
      if (dateParts.length < 3) return;
      const day = parseInt(dateParts[2], 10);
      if (isNaN(day)) return;
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 4);
      weeklySpending[weekIdx].amount += t.amount;
    });

    return { categorySpending, dailySpending, budgetVsActual, weeklySpending: weeklySpending.filter(w => w.amount > 0) };
  }, [currentData, calculations, monthKey, currentMonth]);

  const getAllTransactions = useMemo(() => {
    if (!currentData.transactions) return [];
    return currentData.transactions.map(txn => {
      let itemName = 'Unknown', catName = 'Unknown', icon = '📦', color = 'emerald';
      currentData.categories?.forEach(cat => {
        const item = cat.items?.find(i => i.id === txn.itemId);
        if (item) { itemName = item.name; catName = cat.name; icon = cat.icon; color = cat.color; }
      });
      return { ...txn, itemName, catName, icon, color };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [currentData]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return getAllTransactions;
    const q = searchQuery.toLowerCase();
    return getAllTransactions.filter(t => 
      t.description?.toLowerCase().includes(q) ||
      t.itemName?.toLowerCase().includes(q) ||
      t.catName?.toLowerCase().includes(q)
    );
  }, [getAllTransactions, searchQuery]);

  const getCategoryStats = useMemo(() => {
    return currentData.categories?.map((cat, idx) => {
      const planned = cat.items?.reduce((s, i) => s + (i.planned || 0), 0) || 0;
      const spent = cat.items?.reduce((s, i) => s + calculations.getItemSpent(i.id), 0) || 0;
      const txnCount = cat.items?.reduce((s, i) => 
        s + (currentData.transactions?.filter(t => t.itemId === i.id).length || 0), 0) || 0;
      const pct = planned > 0 ? (spent / planned) * 100 : 0;
      return { ...cat, idx, planned, spent, txnCount, pct };
    }).sort((a, b) => b.spent - a.spent) || [];
  }, [currentData, calculations]);

  // Calculate average monthly savings across all months
  const savingsStats = useMemo(() => {
    const monthKeys = Object.keys(monthlyData).sort();
    const today = new Date();
    const currentMonthKey = getMonthKey(today);
    
    // Only include completed months (not current month)
    const completedMonths = monthKeys.filter(mk => mk < currentMonthKey);
    
    if (completedMonths.length === 0) {
      return { avgSavings: 0, totalSavings: 0, monthCount: 0, monthlyBreakdown: [] };
    }
    
    const monthlyBreakdown = completedMonths.map(mk => {
      const data = monthlyData[mk];
      if (!data?.categories) return { month: mk, savings: 0 };
      
      // Calculate actual savings for that month (what was put into savings categories)
      const savingsSpent = data.categories?.reduce((s, c) => {
        if (!c.isSavings) return s;
        return s + (c.items?.reduce((a, i) => {
          const itemSpent = data.transactions?.filter(t => t.itemId === i.id).reduce((sum, t) => sum + t.amount, 0) || 0;
          return a + itemSpent;
        }, 0) || 0);
      }, 0) || 0;
      
      return { month: mk, savings: savingsSpent };
    });
    
    const totalSavings = monthlyBreakdown.reduce((s, m) => s + m.savings, 0);
    const avgSavings = completedMonths.length > 0 ? totalSavings / completedMonths.length : 0;
    
    return { avgSavings, totalSavings, monthCount: completedMonths.length, monthlyBreakdown };
  }, [monthlyData]);

  const updateMonthData = (updater) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: updater(prev[monthKey] || { income: [], categories: [], transactions: [] })
    }));
  };

  const openModal = (type, data = {}) => {
    setModal(type);
    setModalData(data);
    setFormData(data.initial || {});
  };

  const closeModal = () => {
    setModal(null);
    setModalData({});
    setFormData({});
  };

  const handleSaveIncome = () => {
    if (!formData.name || !formData.amount) return;
    updateMonthData(data => {
      const income = [...(data.income || [])];
      if (modalData.editing) {
        const idx = income.findIndex(i => i.id === modalData.id);
        if (idx >= 0) income[idx] = { ...income[idx], ...formData, amount: parseFloat(formData.amount) };
      } else {
        income.push({ id: Date.now(), ...formData, amount: parseFloat(formData.amount) });
      }
      return { ...data, income };
    });
    closeModal();
  };

  const handleSaveCategory = () => {
    if (!formData.name) return;
    updateMonthData(data => {
      const categories = [...(data.categories || [])];
      if (modalData.editing) {
        categories[modalData.catIdx] = { ...categories[modalData.catIdx], name: formData.name, icon: formData.icon, color: formData.color, isSavings: formData.isSavings || false };
      } else {
        categories.push({ id: Date.now(), name: formData.name, icon: formData.icon || '📦', color: formData.color || 'emerald', isSavings: formData.isSavings || false, items: [] });
      }
      return { ...data, categories };
    });
    closeModal();
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.planned) return;
    
    // Add to past item names for suggestions (keep unique, max 50)
    if (formData.name && !pastItemNames.includes(formData.name)) {
      setPastItemNames(prev => [formData.name, ...prev].slice(0, 50));
    }
    
    updateMonthData(data => {
      const categories = [...(data.categories || [])];
      const cat = { ...categories[modalData.catIdx] };
      const items = [...(cat.items || [])];
      const itemData = { 
        name: formData.name, 
        planned: parseFloat(formData.planned), 
        recurring: formData.recurring || false,
        dueDay: formData.recurring && formData.dueDay ? parseInt(formData.dueDay) : null
      };
      if (modalData.editing) {
        items[modalData.itemIdx] = { ...items[modalData.itemIdx], ...itemData };
      } else {
        items.push({ id: Date.now(), ...itemData });
      }
      cat.items = items;
      categories[modalData.catIdx] = cat;
      return { ...data, categories };
    });
    closeModal();
  };

  const handleSaveTransaction = () => {
    if (!formData.amount || !formData.itemId) return;
    updateMonthData(data => {
      const transactions = [...(data.transactions || [])];
      transactions.push({
        id: Date.now(),
        itemId: parseInt(formData.itemId),
        amount: parseFloat(formData.amount),
        description: formData.description || 'Transaction',
        date: formData.date || new Date().toISOString().split('T')[0],
      });
      return { ...data, transactions };
    });
    closeModal();
    setShowQuickAdd(false);
  };

  const handleSaveGoal = () => {
    if (!formData.name || !formData.target) return;
    if (modalData.editing) {
      setGoals(prev => prev.map(g => g.id === modalData.id ? { ...g, ...formData, target: parseFloat(formData.target), current: parseFloat(formData.current || 0) } : g));
    } else {
      setGoals(prev => [...prev, { id: Date.now(), ...formData, target: parseFloat(formData.target), current: parseFloat(formData.current || 0) }]);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (modalData.type === 'income') {
      updateMonthData(data => ({ ...data, income: data.income.filter(i => i.id !== modalData.id) }));
    } else if (modalData.type === 'category') {
      updateMonthData(data => ({ ...data, categories: data.categories.filter((_, i) => i !== modalData.catIdx) }));
    } else if (modalData.type === 'item') {
      updateMonthData(data => {
        const categories = [...data.categories];
        categories[modalData.catIdx].items.splice(modalData.itemIdx, 1);
        return { ...data, categories };
      });
    } else if (modalData.type === 'transaction') {
      updateMonthData(data => ({ ...data, transactions: data.transactions.filter(t => t.id !== modalData.txnId) }));
    } else if (modalData.type === 'goal') {
      setGoals(prev => prev.filter(g => g.id !== modalData.id));
    }
    closeModal();
  };

  const addToGoal = (goalId, amount) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + amount } : g));
  };

  const navigateMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  // Smart AI Budget Coach - generates intelligent responses based on actual budget data
  const generateSmartResponse = (question) => {
    const q = question.toLowerCase();
    const topCategory = getCategoryStats[0];
    const overBudgetCats = getCategoryStats.filter(c => c.pct > 100);
    const warningCats = getCategoryStats.filter(c => c.pct > 80 && c.pct <= 100);
    const underBudgetCats = getCategoryStats.filter(c => c.pct < 50);
    const totalGoalProgress = goals.length > 0 ? goals.reduce((s, g) => s + (g.current / g.target), 0) / goals.length * 100 : 0;
    
    // How am I doing / budget status
    if (q.includes('how am i doing') || q.includes('status') || q.includes('doing this month') || q.includes('overview')) {
      let status = '';
      if (calculations.spentPercent < 50) {
        status = `Great news! 🎉 You're doing really well this month. You've only spent ${calculations.spentPercent.toFixed(0)}% of your budget (${formatCurrency(calculations.spent)} of ${formatCurrency(calculations.planned)}).`;
      } else if (calculations.spentPercent < 80) {
        status = `You're on track! 👍 You've spent ${calculations.spentPercent.toFixed(0)}% of your budget so far (${formatCurrency(calculations.spent)} of ${formatCurrency(calculations.planned)}).`;
      } else if (calculations.spentPercent < 100) {
        status = `Heads up! ⚠️ You've used ${calculations.spentPercent.toFixed(0)}% of your budget (${formatCurrency(calculations.spent)} of ${formatCurrency(calculations.planned)}). You're getting close to your limit.`;
      } else {
        status = `Budget alert! 🚨 You've exceeded your planned budget - spent ${formatCurrency(calculations.spent)} of ${formatCurrency(calculations.planned)} (${calculations.spentPercent.toFixed(0)}%).`;
      }
      
      status += `\n\nYou have ${formatCurrency(calculations.leftToSpend)} left to spend over ${calculations.daysLeft} days, which is about ${formatCurrency(calculations.dailyBudget)} per day.`;
      
      if (overBudgetCats.length > 0) {
        status += `\n\n⚠️ Watch out: ${overBudgetCats.map(c => `${c.icon} ${c.name}`).join(', ')} ${overBudgetCats.length > 1 ? 'are' : 'is'} over budget.`;
      }
      
      return status;
    }
    
    // Cut spending / save money
    if (q.includes('cut') || q.includes('save') || q.includes('reduce') || q.includes('spending less')) {
      let advice = `Here are some ways to cut spending based on your budget: 💡\n\n`;
      
      if (topCategory) {
        advice += `1. **${topCategory.icon} ${topCategory.name}** is your biggest expense at ${formatCurrency(topCategory.spent)}. `;
        if (topCategory.name.toLowerCase().includes('food') || topCategory.name.toLowerCase().includes('restaurant')) {
          advice += `Try meal prepping or cooking at home more often.\n\n`;
        } else if (topCategory.name.toLowerCase().includes('entertainment')) {
          advice += `Consider free alternatives like parks, libraries, or free streaming options.\n\n`;
        } else {
          advice += `Look for ways to reduce this - even a 10% cut would save ${formatCurrency(topCategory.spent * 0.1)}/month.\n\n`;
        }
      }
      
      if (overBudgetCats.length > 0) {
        advice += `2. You're over budget on ${overBudgetCats.map(c => `${c.icon} ${c.name}`).join(', ')}. Focus on bringing these back in line first.\n\n`;
      }
      
      const discretionary = getCategoryStats.filter(c => 
        c.name.toLowerCase().includes('entertainment') || 
        c.name.toLowerCase().includes('restaurant') || 
        c.name.toLowerCase().includes('coffee') ||
        c.name.toLowerCase().includes('shopping')
      );
      
      if (discretionary.length > 0) {
        const discretionaryTotal = discretionary.reduce((s, c) => s + c.spent, 0);
        advice += `3. Your discretionary spending (${discretionary.map(c => c.name).join(', ')}) totals ${formatCurrency(discretionaryTotal)}. This is often the easiest place to cut.`;
      }
      
      return advice;
    }
    
    // Goals progress
    if (q.includes('goal') || q.includes('track') || q.includes('saving') || q.includes('progress')) {
      if (goals.length === 0) {
        return "You haven't set up any savings goals yet! 🎯 Go to the Goals tab to create one. Having specific targets helps you stay motivated and track your progress.";
      }
      
      let response = `Here's your goals progress: 🎯\n\n`;
      goals.forEach(g => {
        const pct = (g.current / g.target) * 100;
        const emoji = pct >= 100 ? '✅' : pct >= 75 ? '🔥' : pct >= 50 ? '💪' : '🌱';
        response += `${emoji} **${g.icon} ${g.name}**: ${formatCurrency(g.current)} of ${formatCurrency(g.target)} (${pct.toFixed(0)}%)\n`;
      });
      
      response += `\nOverall, you're ${totalGoalProgress.toFixed(0)}% of the way to all your goals. `;
      
      if (totalGoalProgress < 25) {
        response += `Keep going - every little bit counts!`;
      } else if (totalGoalProgress < 50) {
        response += `You're making solid progress!`;
      } else if (totalGoalProgress < 75) {
        response += `Great work - you're over halfway there!`;
      } else {
        response += `Amazing progress! You're almost there! 🎉`;
      }
      
      return response;
    }
    
    // Biggest expense
    if (q.includes('biggest') || q.includes('most') || q.includes('top') || q.includes('highest')) {
      if (!topCategory) return "You haven't recorded any spending yet this month.";
      
      const pctOfTotal = calculations.spent > 0 ? (topCategory.spent / calculations.spent) * 100 : 0;
      return `Your biggest expense this month is **${topCategory.icon} ${topCategory.name}** at ${formatCurrency(topCategory.spent)}, which is ${pctOfTotal.toFixed(0)}% of your total spending. 💸\n\nYou've made ${topCategory.txnCount} transactions in this category, averaging ${formatCurrency(topCategory.spent / Math.max(topCategory.txnCount, 1))} per transaction.\n\nYour top 3 spending categories:\n${getCategoryStats.slice(0, 3).map((c, i) => `${i + 1}. ${c.icon} ${c.name}: ${formatCurrency(c.spent)}`).join('\n')}`;
    }
    
    // Food / specific category analysis
    const categoryKeywords = ['food', 'housing', 'transport', 'entertainment', 'shopping', 'utilities', 'savings'];
    const matchedCategory = categoryKeywords.find(kw => q.includes(kw));
    if (matchedCategory || q.includes('analyze') || q.includes('breakdown')) {
      const targetCat = getCategoryStats.find(c => 
        c.name.toLowerCase().includes(matchedCategory || '') ||
        (q.includes('analyze') && c === topCategory)
      ) || topCategory;
      
      if (!targetCat) return "I couldn't find that category in your budget.";
      
      const catTxns = getAllTransactions.filter(t => t.catName === targetCat.name);
      return `📊 **${targetCat.icon} ${targetCat.name} Analysis**\n\n` +
        `• Spent: ${formatCurrency(targetCat.spent)} of ${formatCurrency(targetCat.planned)} planned\n` +
        `• Budget used: ${targetCat.pct.toFixed(0)}%\n` +
        `• Transactions: ${targetCat.txnCount}\n` +
        `• Average transaction: ${formatCurrency(targetCat.spent / Math.max(targetCat.txnCount, 1))}\n\n` +
        `Recent transactions:\n${catTxns.slice(0, 5).map(t => `• ${t.description}: ${formatCurrency(t.amount)}`).join('\n')}` +
        (targetCat.pct > 80 ? `\n\n⚠️ You're at ${targetCat.pct.toFixed(0)}% of budget - consider slowing down spending here.` : '');
    }
    
    // Tips / advice
    if (q.includes('tip') || q.includes('advice') || q.includes('suggest') || q.includes('recommend') || q.includes('help')) {
      let tips = `Here are some personalized tips based on your budget: 💡\n\n`;
      
      if (calculations.remaining > 0) {
        tips += `1. You have ${formatCurrency(calculations.remaining)} unallocated! Consider putting this toward savings or an emergency fund.\n\n`;
      }
      
      if (overBudgetCats.length > 0) {
        tips += `2. ${overBudgetCats[0].icon} ${overBudgetCats[0].name} is over budget. Try to avoid additional spending here for the rest of the month.\n\n`;
      } else if (warningCats.length > 0) {
        tips += `2. ${warningCats[0].icon} ${warningCats[0].name} is at ${warningCats[0].pct.toFixed(0)}% - watch this category closely.\n\n`;
      }
      
      tips += `3. Your daily budget is ${formatCurrency(calculations.dailyBudget)}. Try tracking each purchase against this to stay on target.\n\n`;
      
      if (goals.length > 0 && totalGoalProgress < 50) {
        tips += `4. Your savings goals are at ${totalGoalProgress.toFixed(0)}%. Even small automatic transfers can help build momentum!`;
      } else if (goals.length === 0) {
        tips += `4. Set up a savings goal! Having a specific target makes it easier to stay motivated.`;
      }
      
      return tips;
    }
    
    // Default response
    return `Thanks for your question! 😊 Here's a quick summary:\n\n` +
      `• **Budget Status**: ${calculations.spentPercent.toFixed(0)}% used (${formatCurrency(calculations.spent)} of ${formatCurrency(calculations.planned)})\n` +
      `• **Left to Spend**: ${formatCurrency(calculations.leftToSpend)} (${formatCurrency(calculations.dailyBudget)}/day)\n` +
      `• **Top Category**: ${topCategory ? `${topCategory.icon} ${topCategory.name} at ${formatCurrency(topCategory.spent)}` : 'N/A'}\n` +
      `• **Goals Progress**: ${goals.length > 0 ? `${totalGoalProgress.toFixed(0)}% average` : 'No goals set'}\n\n` +
      `Try asking me:\n• "How am I doing this month?"\n• "Where can I cut spending?"\n• "Am I on track for my goals?"`;
  };

  const sendAIMessage = async (messageText) => {
    const userMessage = messageText || aiInput;
    if (!userMessage.trim()) return;
    
    const newMessages = [...aiMessages, { role: 'user', content: userMessage }];
    setAiMessages(newMessages);
    setAiInput('');
    setAiLoading(true);

    // Small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const response = generateSmartResponse(userMessage);
    setAiMessages([...newMessages, { role: 'assistant', content: response }]);
    setAiLoading(false);
  };

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${theme.card} ${theme.text} px-3 py-2 rounded-lg shadow-lg border ${theme.border}`}>
          <p className="font-medium">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="text-sm">
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Modal Component - extracted so it can be used in all views
  const renderModal = () => {
    if (!modal) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={closeModal}
      >
        {/* Modal positioned above bottom nav */}
        <div 
          className={`${theme.card} ${theme.text} absolute left-0 right-0 rounded-t-3xl`}
          style={{ bottom: '70px', maxHeight: 'calc(100vh - 140px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className={`w-10 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
          </div>
          
          {/* Scrollable content */}
          <div 
            className="px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          >
            {modal === 'delete' ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete {modalData.type}?</h3>
                  <p className={theme.textMuted}>This cannot be undone</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold">Delete</button>
              </div>
            </>
          ) : modal === 'income' ? (
            <>
              <h3 className="text-xl font-bold mb-4">{modalData.editing ? 'Edit' : 'Add'} Income</h3>
              <div className="space-y-3 mb-6">
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Income name" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleSaveIncome} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Save</button>
              </div>
            </>
          ) : modal === 'category' ? (
            <>
              <h3 className="text-xl font-bold mb-4">{modalData.editing ? 'Edit' : 'Add'} Category</h3>
              <div className="space-y-4 mb-6">
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Category name" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${formData.isSavings ? (darkMode ? 'bg-emerald-900/30 border-emerald-600' : 'bg-emerald-50 border-emerald-300') : theme.border}`}>
                  <input type="checkbox" checked={formData.isSavings || false} onChange={(e) => setFormData({ ...formData, isSavings: e.target.checked })} className="w-5 h-5 rounded accent-emerald-500" />
                  <div>
                    <span className={`font-medium ${formData.isSavings ? 'text-emerald-400' : ''}`}>Savings Category</span>
                    <p className={`text-xs ${theme.textMuted}`}>Excludes from "left to spend" calculations</p>
                  </div>
                </label>
                <div>
                  <p className={`text-sm ${theme.textMuted} mb-2`}>Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryIcons.map(icon => (
                      <button key={icon} onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.icon === icon ? 'bg-emerald-100 ring-2 ring-emerald-500' : `${theme.card} border ${theme.border}`}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${theme.textMuted} mb-2`}>Color</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(colors).map(color => (
                      <button key={color} onClick={() => setFormData({ ...formData, color })} className={`w-10 h-10 rounded-lg ${colors[color].bg} ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleSaveCategory} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Save</button>
              </div>
            </>
          ) : modal === 'item' ? (
            <>
              <h3 className="text-xl font-bold mb-4">{modalData.editing ? 'Edit' : 'Add'} Budget Item</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} list="item-suggestions" />
                  {pastItemNames.length > 0 && formData.name && formData.name.length > 0 && (
                    <div className={`mt-1 flex flex-wrap gap-1`}>
                      {pastItemNames
                        .filter(n => n.toLowerCase().includes(formData.name.toLowerCase()) && n.toLowerCase() !== formData.name.toLowerCase())
                        .slice(0, 5)
                        .map((name, i) => (
                          <button key={i} onClick={() => setFormData({ ...formData, name })} className={`text-xs px-2 py-1 rounded-full ${theme.card} border ${theme.border} hover:border-emerald-500`}>
                            {name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                  <input type="number" value={formData.planned || ''} onChange={(e) => setFormData({ ...formData, planned: e.target.value })} placeholder="Planned amount" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                </div>
                <label className={`flex items-center gap-3 p-3 rounded-xl border ${theme.border} cursor-pointer`}>
                  <input type="checkbox" checked={formData.recurring || false} onChange={(e) => setFormData({ ...formData, recurring: e.target.checked, dueDay: e.target.checked ? formData.dueDay : null })} className="w-5 h-5 rounded accent-emerald-500" />
                  <span>Recurring bill</span>
                </label>
                {formData.recurring && (
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                    <input type="number" min="1" max="31" value={formData.dueDay || ''} onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })} placeholder="Due day of month (1-31)" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleSaveItem} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Save</button>
              </div>
            </>
          ) : modal === 'transaction' ? (
            <>
              <h3 className="text-xl font-bold mb-4">Add Transaction</h3>
              <div className="space-y-3 mb-6">
                <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                </div>
                <input type="date" value={formData.date || new Date().toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleSaveTransaction} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Add</button>
              </div>
            </>
          ) : modal === 'goal' ? (
            <>
              <h3 className="text-xl font-bold mb-4">{modalData.editing ? 'Edit' : 'Add'} Goal</h3>
              <div className="space-y-3 mb-6">
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Goal name" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                    <input type="number" value={formData.target || ''} onChange={(e) => setFormData({ ...formData, target: e.target.value })} placeholder="Target" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                  </div>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                    <input type="number" value={formData.current || ''} onChange={(e) => setFormData({ ...formData, current: e.target.value })} placeholder="Current" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${theme.textMuted} mb-2`}>Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {['🎯', '🏦', '✈️', '🏠', '🚗', '💻', '📚', '💍', '🛡️', '🎓'].map(icon => (
                      <button key={icon} onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.icon === icon ? 'bg-emerald-100 ring-2 ring-emerald-500' : `${theme.card} border ${theme.border}`}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${theme.textMuted} mb-2`}>Color</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(colors).map(color => (
                      <button key={color} onClick={() => setFormData({ ...formData, color })} className={`w-10 h-10 rounded-lg ${colors[color].bg} ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={handleSaveGoal} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Save</button>
              </div>
            </>
          ) : modal === 'reminder' ? (
            <>
              <h3 className="text-xl font-bold mb-4">{modalData.editing ? 'Edit' : 'Add'} Reminder</h3>
              <div className="space-y-3 mb-6">
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Reminder name" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <input type="number" min="1" max="31" value={formData.dueDay || ''} onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })} placeholder="Day of month (1-31)" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
                <input type="text" value={formData.note || ''} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Note (optional)" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
                <button onClick={() => {
                  if (!formData.name || !formData.dueDay) return;
                  if (modalData.editing) {
                    setCustomReminders(prev => prev.map(r => r.id === modalData.id ? { ...r, ...formData, dueDay: parseInt(formData.dueDay) } : r));
                  } else {
                    setCustomReminders(prev => [...prev, { id: Date.now(), name: formData.name, dueDay: parseInt(formData.dueDay), note: formData.note }]);
                  }
                  closeModal();
                }} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Save</button>
              </div>
            </>
          ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className={theme.textMuted}>Loading your budget...</p>
        </div>
      </div>
    );
  }

  // Month setup screen
  if (needsMonthSetup) {
    const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{currentMonthName}</h1>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="relative">
              <div className={`w-16 h-20 ${theme.card} rounded-lg shadow-md flex flex-col p-2 border ${theme.border}`}>
                <div className={`h-2 w-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded mb-1`}></div>
                <div className={`h-1 w-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-1`}></div>
                <div className={`h-1 w-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
              </div>
              {previousMonthData && (
                <div className="absolute -right-4 top-2">
                  <ChevronRight className="w-6 h-6 text-emerald-500" />
                </div>
              )}
              {previousMonthData && (
                <div className={`absolute -right-12 top-0 w-16 h-20 ${theme.card} rounded-lg shadow-md flex flex-col p-2 border-2 border-emerald-500`}>
                  <div className="h-2 w-8 bg-emerald-200 rounded mb-1"></div>
                  <div className="h-1 w-10 bg-emerald-100 rounded mb-1"></div>
                  <div className="h-1 w-6 bg-emerald-100 rounded"></div>
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-center">
            {previousMonthData ? `Create your ${currentMonth.toLocaleDateString('en-US', { month: 'long' })} budget` : 'Start your budget'}
          </h2>
          <p className={`${theme.textMuted} text-center mb-8`}>
            {previousMonthData 
              ? `We'll copy your ${previousMonthData.name} budget to get you started.`
              : 'Create your first budget to start tracking expenses.'}
          </p>
          
          <button 
            onClick={() => createMonthBudget(!!previousMonthData)}
            className="w-full max-w-xs bg-emerald-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-emerald-600 transition-colors"
          >
            {previousMonthData ? `Create ${currentMonth.toLocaleDateString('en-US', { month: 'long' })} Budget` : 'Create Budget'}
          </button>
          
          {previousMonthData && (
            <button 
              onClick={() => createMonthBudget(false)}
              className={`mt-4 ${theme.textMuted} text-sm underline`}
            >
              Start fresh instead
            </button>
          )}
        </div>
      </div>
    );
  }

  // Item detail view
  if (viewingItem) {
    const cat = currentData.categories[viewingItem.catIdx];
    const item = cat?.items[viewingItem.itemIdx];
    if (!item) { setViewingItem(null); return null; }
    
    const spent = calculations.getItemSpent(item.id);
    const pct = item.planned > 0 ? (spent / item.planned) * 100 : 0;
    const itemTxns = currentData.transactions?.filter(t => t.itemId === item.id).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
    const clr = colors[cat.color] || colors.emerald;
    
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} pb-24`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {renderModal()}
        <div className={`bg-gradient-to-br ${clr.gradient} text-white p-4 sticky top-0 z-10`}>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setViewingItem(null)} className="p-2 -ml-2 rounded-full hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{item.name}</h1>
              <p className="text-sm opacity-80">{cat.icon} {cat.name}</p>
            </div>
            <button onClick={() => openModal('item', { catIdx: viewingItem.catIdx, itemIdx: viewingItem.itemIdx, editing: true, initial: { name: item.name, planned: item.planned } })} className="p-2 rounded-full hover:bg-white/20">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-80">Spent</p>
              <p className="text-xl font-bold">{formatCurrency(spent)}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-80">Planned</p>
              <p className="text-xl font-bold">{formatCurrency(item.planned)}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-80">Left</p>
              <p className={`text-xl font-bold ${pct > 100 ? 'text-red-200' : ''}`}>{formatCurrency(item.planned - spent)}</p>
            </div>
          </div>
          
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-xs text-center mt-1 opacity-80">{pct.toFixed(0)}% used</p>
        </div>
        
        <div className="p-4 space-y-4">
          <button onClick={() => openModal('transaction', { initial: { itemId: item.id, date: new Date().toISOString().split('T')[0] } })} className={`w-full ${clr.bg} text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg`}>
            <Plus className="w-5 h-5" /> Add Transaction
          </button>

          <div className={`${theme.card} rounded-2xl overflow-hidden shadow-sm`}>
            <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
              <h3 className="font-bold">Transactions</h3>
              <span className={`text-sm ${theme.textMuted}`}>{itemTxns.length} total</span>
            </div>
            {itemTxns.length === 0 ? (
              <div className={`p-8 text-center ${theme.textMuted}`}>
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {itemTxns.map((txn) => (
                  <div key={txn.id} className={`p-4 flex items-center gap-3 ${theme.hover}`}>
                    <div className={`${clr.light} ${darkMode ? 'bg-opacity-20' : ''} p-2.5 rounded-full`}>
                      <span className="text-lg">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{txn.description}</p>
                      <p className={`text-sm ${theme.textMuted}`}>{formatDate(txn.date)}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(txn.amount)}</p>
                    <button onClick={() => openModal('delete', { type: 'transaction', txnId: txn.id })} className="p-2 text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Goal detail view
  if (viewingGoal) {
    const goal = goals.find(g => g.id === viewingGoal);
    if (!goal) { setViewingGoal(null); return null; }
    
    const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    const clr = colors[goal.color] || colors.emerald;
    
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} pb-24`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {renderModal()}
        <div className={`bg-gradient-to-br ${clr.gradient} text-white p-4 sticky top-0 z-10`}>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setViewingGoal(null)} className="p-2 -ml-2 rounded-full hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-3xl">{goal.icon}</span>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{goal.name}</h1>
              {goal.deadline && <p className="text-sm opacity-80">Target: {formatDate(goal.deadline)}</p>}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-4xl font-bold">{formatCurrency(goal.current)}</p>
            <p className="opacity-80">of {formatCurrency(goal.target)}</p>
          </div>
          
          <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-white transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-center text-sm">{pct.toFixed(1)}% complete • {formatCurrency(goal.target - goal.current)} to go</p>
        </div>
        
        <div className="p-4 space-y-4">
          <div className={`${theme.card} rounded-2xl p-4`}>
            <h3 className="font-bold mb-4">Quick Add</h3>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(amt => (
                <button key={amt} onClick={() => addToGoal(goal.id, amt)} className={`py-3 rounded-xl ${clr.light} ${clr.text} font-semibold ${darkMode ? 'bg-opacity-20' : ''}`}>
                  +${amt}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => openModal('goal', { editing: true, id: goal.id, initial: goal })} className={`${theme.card} p-4 rounded-xl flex items-center justify-center gap-2 ${theme.textMuted}`}>
              <Edit3 className="w-5 h-5" /> Edit Goal
            </button>
            <button onClick={() => openModal('delete', { type: 'goal', id: goal.id })} className={`${theme.card} p-4 rounded-xl flex items-center justify-center gap-2 text-red-500`}>
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} pb-24`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-white/20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold">{getMonthName(currentMonth)}</h1>
              <p className="text-xs text-emerald-100">{calculations.daysLeft} days left</p>
            </div>
            <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-white/20">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowReminders(!showReminders)} className="p-2 rounded-full hover:bg-white/20 relative">
              <Bell className="w-5 h-5" />
              {(upcomingBills.length > 0 || customReminders.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-white/20">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowAI(true)} className="p-2 rounded-full hover:bg-white/20 relative">
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white/15 backdrop-blur rounded-xl p-2.5 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{formatCurrency(calculations.income, true)}</p>
            <p className="text-[10px] opacity-70">Income</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-2.5 text-center">
            <CreditCard className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{formatCurrency(calculations.spent, true)}</p>
            <p className="text-[10px] opacity-70">Spent</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-2.5 text-center">
            <Target className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{formatCurrency(calculations.spentToday)}</p>
            <p className="text-[10px] opacity-70">Today</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-2.5 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{formatCurrency(calculations.dailyBudget)}</p>
            <p className="text-[10px] opacity-70">/day left</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{formatCurrency(calculations.spent)} spent</span>
            <span>{formatCurrency(calculations.leftToSpend)} left</span>
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${calculations.spentPercent > 100 ? 'bg-red-400' : calculations.spentPercent > 80 ? 'bg-amber-300' : 'bg-white'}`}
              style={{ width: `${Math.min(calculations.spentPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subtle Bill Reminders Dropdown */}
      {showReminders && (
        <div className="fixed inset-0 z-30" onClick={() => setShowReminders(false)}>
          <div 
            className={`${theme.card} absolute top-20 right-4 w-72 rounded-2xl shadow-xl border ${theme.border} overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-3 border-b ${theme.border} flex items-center justify-between`}>
              <span className="font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" /> Reminders
              </span>
              <button onClick={() => setShowReminders(false)} className={theme.textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {upcomingBills.length === 0 && customReminders.length === 0 ? (
              <div className={`p-4 text-center ${theme.textMuted}`}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm mb-3">No reminders</p>
              </div>
            ) : (
              <div className={`max-h-48 overflow-y-auto divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {upcomingBills.slice(0, 4).map((bill, i) => (
                  <div key={`bill-${i}`} className={`p-3 flex items-center gap-3 ${bill.isOverdue ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') : ''}`}>
                    <span className="text-lg">{bill.catIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{bill.name}</p>
                      <p className={`text-xs ${bill.isOverdue ? 'text-red-500' : theme.textMuted}`}>
                        {bill.isOverdue ? 'Overdue' : `Due in ${bill.daysUntil} day${bill.daysUntil !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(bill.planned)}</p>
                  </div>
                ))}
                {customReminders.map((reminder) => {
                  const today = new Date().getDate();
                  const daysUntil = reminder.dueDay >= today 
                    ? reminder.dueDay - today 
                    : getDaysInMonth(currentMonth) - today + reminder.dueDay;
                  const isOverdue = reminder.dueDay < today;
                  return (
                    <div key={`rem-${reminder.id}`} className={`p-3 flex items-center gap-3 ${isOverdue ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') : ''}`}>
                      <span className="text-lg">📌</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{reminder.name}</p>
                        <p className={`text-xs ${isOverdue ? 'text-red-500' : theme.textMuted}`}>
                          {isOverdue ? 'Overdue' : `Day ${reminder.dueDay}`} {reminder.note && `• ${reminder.note}`}
                        </p>
                      </div>
                      <button onClick={() => setCustomReminders(prev => prev.filter(r => r.id !== reminder.id))} className="p-1 text-red-500 opacity-50 hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button 
              onClick={() => { setShowReminders(false); openModal('reminder'); }}
              className={`w-full p-3 text-sm font-medium text-emerald-600 border-t ${theme.border} hover:bg-emerald-50 transition-colors ${darkMode ? 'hover:bg-emerald-900/20' : ''}`}
            >
              + Add Reminder
            </button>
          </div>
        </div>
      )}

      {/* Quick Add FAB */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-105"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center" onClick={() => setShowQuickAdd(false)}>
          <div className={`${theme.card} w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6`} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Quick Add Transaction</h3>
            <div className="space-y-3 mb-6">
              <select value={formData.itemId || ''} onChange={(e) => setFormData({ ...formData, itemId: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${theme.input}`}>
                <option value="">Select category...</option>
                {currentData.categories?.map(cat => (
                  <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                    {cat.items?.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input}`} />
              </div>
              <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description (optional)" className={`w-full px-4 py-3 rounded-xl border ${theme.input}`} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowQuickAdd(false); setFormData({}); }} className={`flex-1 py-3 border-2 ${theme.border} rounded-xl font-semibold`}>Cancel</button>
              <button onClick={handleSaveTransaction} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className={`${theme.card} h-full flex flex-col`}>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3">
              <button onClick={() => setShowAI(false)} className="p-2 -ml-2 rounded-full hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> AI Budget Coach
                </h3>
                <p className="text-xs text-purple-200">Ask me anything about your finances</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message if no messages */}
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Hi! I'm your AI Budget Coach</h3>
                  <p className={`${theme.textMuted} mb-6`}>I can help you understand your spending, find savings, and reach your goals.</p>
                  
                  {/* Suggested Prompts */}
                  <div className="grid grid-cols-2 gap-2">
                    {AI_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendAIMessage(prompt.text)}
                        className={`${theme.card} border ${theme.border} rounded-xl p-3 text-left hover:border-purple-400 transition-colors`}
                      >
                        <span className="text-xl mb-1 block">{prompt.icon}</span>
                        <span className="text-sm font-medium">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-purple-500 text-white rounded-br-md' 
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-bl-md`
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {aiLoading && (
                <div className="flex justify-start">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-3 flex items-center gap-2`}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested prompts when there are messages */}
            {aiMessages.length > 0 && !aiLoading && (
              <div className={`px-4 py-2 border-t ${theme.border} overflow-x-auto`}>
                <div className="flex gap-2">
                  {AI_PROMPTS.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendAIMessage(prompt.text)}
                      className={`${theme.card} border ${theme.border} rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap hover:border-purple-400`}
                    >
                      {prompt.icon} {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`p-4 border-t ${theme.border} flex gap-2`}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                placeholder="Ask about your budget..."
                className={`flex-1 px-4 py-3 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button onClick={() => sendAIMessage()} disabled={aiLoading || !aiInput.trim()} className="bg-purple-500 text-white px-5 rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {renderModal()}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {view === 'budget' ? (
          <>
            {calculations.remaining > 0 && (
              <div className={`${darkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border rounded-xl p-3 flex items-center gap-3`}>
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className={`font-medium ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>{formatCurrency(calculations.remaining)} unallocated</p>
              </div>
            )}

            {/* Income */}
            <div className={`${theme.card} rounded-2xl overflow-hidden shadow-sm`}>
              <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold">Income</h2>
                    <p className={`text-sm ${theme.textMuted}`}>{formatCurrency(calculations.income)}</p>
                  </div>
                </div>
                <button onClick={() => openModal('income')} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {currentData.income?.map(inc => (
                  <div key={inc.id} className={`p-4 flex items-center justify-between ${theme.hover}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{inc.name}</span>
                      {inc.recurring && <Repeat className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{formatCurrency(inc.amount)}</span>
                      <button onClick={() => openModal('income', { editing: true, id: inc.id, initial: inc })} className={`p-1.5 ${theme.textMuted}`}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal('delete', { type: 'income', id: inc.id })} className="p-1.5 text-red-500 opacity-50 hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            {currentData.categories?.map((cat, catIdx) => {
              const clr = colors[cat.color] || colors.emerald;
              const catSpent = cat.items?.reduce((s, i) => s + calculations.getItemSpent(i.id), 0) || 0;
              const catPlan = cat.items?.reduce((s, i) => s + (i.planned || 0), 0) || 0;
              const catPct = catPlan > 0 ? (catSpent / catPlan) * 100 : 0;
              const isExpanded = expandedCats[catIdx];
              
              return (
                <div key={cat.id} className={`${theme.card} rounded-2xl overflow-hidden shadow-sm`}>
                  <button onClick={() => setExpandedCats(prev => ({ ...prev, [catIdx]: !prev[catIdx] }))} className={`w-full p-4 flex items-center justify-between ${clr.light} ${darkMode ? 'bg-opacity-10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{cat.name}</h3>
                          {cat.isSavings && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Savings</span>}
                        </div>
                        <p className={`text-sm ${theme.textMuted}`}>{formatCurrency(catSpent)} of {formatCurrency(catPlan)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${catPct > 100 ? 'text-red-500' : catPct > 80 ? 'text-amber-500' : clr.text}`}>
                        {catPct.toFixed(0)}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <>
                      <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {cat.items?.map((item, itemIdx) => {
                          const spent = calculations.getItemSpent(item.id);
                          const pct = item.planned > 0 ? (spent / item.planned) * 100 : 0;
                          const isOver = pct > 100;
                          const isWarning = pct > 80 && !isOver;
                          
                          return (
                            <div key={item.id} className={`p-4 ${theme.hover} transition-colors`}>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setViewingItem({ catIdx, itemIdx })}>
                                  <span className="font-medium">{item.name}</span>
                                  {item.recurring && <Repeat className="w-3 h-3 text-emerald-500" />}
                                  {isOver && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : ''}`}>
                                    {formatCurrency(spent)}
                                  </span>
                                  <span className={theme.textMuted}>/ {formatCurrency(item.planned)}</span>
                                  <button onClick={(e) => { e.stopPropagation(); openModal('delete', { type: 'item', catIdx, itemIdx }); }} className="p-1 text-red-500 opacity-40 hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <ChevronRight className={`w-4 h-4 ${theme.textMuted} cursor-pointer`} onClick={() => setViewingItem({ catIdx, itemIdx })} />
                                </div>
                              </div>
                              <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden cursor-pointer`} onClick={() => setViewingItem({ catIdx, itemIdx })}>
                                <div className={`h-full transition-all ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : clr.bg}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className={`p-3 border-t ${theme.border} flex gap-2`}>
                        <button onClick={() => openModal('item', { catIdx })} className={`flex-1 py-2.5 ${clr.bg} text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1`}>
                          <Plus className="w-4 h-4" /> Add Item
                        </button>
                        <button onClick={() => openModal('category', { editing: true, catIdx, initial: { name: cat.name, icon: cat.icon, color: cat.color, isSavings: cat.isSavings } })} className={`px-4 py-2.5 border ${theme.border} rounded-xl`}>
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('delete', { type: 'category', catIdx })} className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            <button onClick={() => openModal('category', { initial: { icon: '📦', color: 'emerald' } })} className={`w-full ${theme.card} rounded-2xl p-4 border-2 border-dashed ${theme.border} flex items-center justify-center gap-2 font-semibold text-emerald-600`}>
              <Plus className="w-5 h-5" /> Add Category
            </button>
          </>
        ) : view === 'insights' ? (
          <>
            {/* Search */}
            <div className={`${theme.card} rounded-xl p-3 flex items-center gap-3`}>
              <Search className={`w-5 h-5 ${theme.textMuted}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search transactions..." className={`flex-1 bg-transparent outline-none ${theme.text}`} />
              {searchQuery && <button onClick={() => setSearchQuery('')} className={theme.textMuted}><X className="w-4 h-4" /></button>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${theme.card} rounded-xl p-4`}>
                <p className={`text-sm ${theme.textMuted}`}>Left to Spend</p>
                <p className={`text-2xl font-bold ${calculations.leftToSpend < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(calculations.leftToSpend)}</p>
              </div>
              <div className={`${theme.card} rounded-xl p-4`}>
                <p className={`text-sm ${theme.textMuted}`}>Transactions</p>
                <p className="text-2xl font-bold">{getAllTransactions.length}</p>
              </div>
            </div>

            {/* Average Monthly Savings Card */}
            <div className={`${theme.card} rounded-2xl p-4`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> Savings Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>This Month (Planned)</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(calculations.savingsPlanned)}</p>
                </div>
                <div>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Monthly Average</p>
                  <p className="text-xl font-bold text-blue-600">
                    {savingsStats.monthCount > 0 ? formatCurrency(savingsStats.avgSavings) : '—'}
                  </p>
                  {savingsStats.monthCount > 0 && (
                    <p className={`text-xs ${theme.textMuted}`}>over {savingsStats.monthCount} month{savingsStats.monthCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              {savingsStats.monthCount > 0 && (
                <div className={`mt-4 pt-4 border-t ${theme.border}`}>
                  <p className={`text-xs ${theme.textMuted} mb-2`}>Total Saved (All Time)</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(savingsStats.totalSavings)}</p>
                </div>
              )}
            </div>

            {/* Spending Pie Chart */}
            {chartData.categorySpending.length > 0 && (
              <div className={`${theme.card} rounded-2xl p-4`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-500" /> Spending Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData.categorySpending}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {chartData.categorySpending.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm">{cat.icon} {cat.name}</span>
                      <span className={`text-sm font-medium ml-auto ${theme.textMuted}`}>{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cumulative Spending Chart */}
            <div className={`${theme.card} rounded-2xl p-4`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Spending Over Time
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.dailySpending}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cumulative" name="Total Spent" stroke="#10b981" strokeWidth={2} fill="url(#colorSpending)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className={`${theme.card} rounded-2xl p-4`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" /> Budget vs Actual
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.budgetVsActual} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="planned" name="Planned" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]}>
                      {chartData.budgetVsActual.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isOver ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Spending */}
            {chartData.weeklySpending.length > 0 && (
              <div className={`${theme.card} rounded-2xl p-4`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-500" /> Weekly Spending
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.weeklySpending}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" name="Spent" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Transactions */}
            <div className={`${theme.card} rounded-2xl overflow-hidden`}>
              <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
                <h3 className="font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" /> Transactions
                </h3>
                <span className={`text-sm ${theme.textMuted}`}>{filteredTransactions.length} total</span>
              </div>
              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'} max-h-96 overflow-y-auto`}>
                {filteredTransactions.length === 0 ? (
                  <div className={`p-8 text-center ${theme.textMuted}`}>
                    <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  filteredTransactions.slice(0, 30).map((txn) => {
                    const clr = colors[txn.color] || colors.emerald;
                    return (
                      <div key={txn.id} className={`p-4 flex items-center gap-3 ${theme.hover}`}>
                        <div className={`${clr.light} ${darkMode ? 'bg-opacity-20' : ''} p-2 rounded-full`}>
                          <span className="text-lg">{txn.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{txn.description}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{txn.itemName} • {formatDate(txn.date)}</p>
                        </div>
                        <p className="font-bold">{formatCurrency(txn.amount)}</p>
                        <button onClick={(e) => { e.stopPropagation(); openModal('delete', { type: 'transaction', txnId: txn.id }); }} className="p-2 text-red-500 opacity-50 hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          /* Goals */
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Savings Goals</h2>
              <button onClick={() => openModal('goal', { initial: { icon: '🎯', color: 'emerald' } })} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Plus className="w-4 h-4" /> New Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className={`${theme.card} rounded-2xl p-8 text-center`}>
                <Target className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-30`} />
                <p className={theme.textMuted}>No goals yet. Create one to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(goal => {
                  const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                  const clr = colors[goal.color] || colors.emerald;
                  
                  return (
                    <div key={goal.id} onClick={() => setViewingGoal(goal.id)} className={`${theme.card} rounded-2xl p-4 cursor-pointer ${theme.hover} transition-all`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 ${clr.light} ${darkMode ? 'bg-opacity-20' : ''} rounded-xl flex items-center justify-center text-2xl`}>
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{goal.name}</h3>
                          <p className={`text-sm ${theme.textMuted}`}>
                            {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                          </p>
                        </div>
                        <p className={`text-2xl font-bold ${clr.text}`}>{pct.toFixed(0)}%</p>
                      </div>
                      <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div className={`h-full ${clr.bg} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border} z-50`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around py-2">
          {[
            { id: 'budget', icon: Wallet, label: 'Budget' },
            { id: 'insights', icon: BarChart3, label: 'Insights' },
            { id: 'goals', icon: Target, label: 'Goals' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${view === tab.id ? 'text-emerald-600' : theme.textMuted}`}>
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
