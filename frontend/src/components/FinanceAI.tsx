import { useState, useRef } from 'react';
import { Wallet, Upload, ClipboardList, AlertCircle, TrendingUp, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { cn } from '../lib/utils';

const FinanceAI = () => {
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pasteData, setPasteData]       = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = async (data?: any) => {
    setLoading(true);
    const txs = (data || [
      { type: 'income',  amount: 800000, date: '2026-03-20' },
      { type: 'expense', amount: 200000, date: '2026-03-21' },
      { type: 'expense', amount: 150000, date: '2026-03-22' },
      { type: 'expense', amount:  50000, date: '2026-03-23' },
      { type: 'income',  amount: 100000, date: '2026-03-24' },
    ]).map((tx: any, idx: number) => ({
      ...tx,
      date: tx.date || new Date(Date.now() - idx * 86400000).toISOString().split('T')[0]
    }));
    setTransactions(txs);

    try {
      const response = await fetch('/api/finance/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: txs })
      });
      const resultData = await response.json();
      const income  = txs.reduce((acc: number, t: any) => t.type === 'income'  ? acc + t.amount : acc, 0);
      const expense = txs.reduce((acc: number, t: any) => t.type === 'expense' ? acc + t.amount : acc, 0);
      setResult({
        ...resultData,
        chartData: [
          { name: 'Income',   value: income,  color: '#4ade80' },
          { name: 'Expenses', value: expense, color: '#f87171' }
        ]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = () => {
    try {
      const parsed = JSON.parse(pasteData);
      handleAnalysis(Array.isArray(parsed) ? parsed : [parsed]);
    } catch {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        handleAnalysis(parsed);
      } catch {
        alert('Failed to parse file. Ensure it is a valid JSON array of transactions.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-2">
      <div className="glass p-4 md:p-8 rounded-2xl md:rounded-3xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3">
          <Wallet className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" /> Financial Predictor
        </h2>

        {!result ? (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Upload card */}
              <div className="glass-card p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center text-center space-y-3 md:space-y-4">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
                <h3 className="text-lg md:text-xl font-bold">Upload</h3>
                <p className="text-white/40 text-xs md:text-sm">Upload MoMo statement (JSON/CSV)</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json,.csv" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto bg-blue-500/20 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all text-sm"
                >
                  Select File
                </button>
              </div>

              {/* Paste card */}
              <div className="glass-card p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center text-center space-y-3 md:space-y-4">
                <ClipboardList className="w-10 h-10 md:w-12 md:h-12 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-bold">Paste</h3>
                <p className="text-white/40 text-xs md:text-sm">Paste transaction JSON directly</p>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder='[{"type": "income", "amount": 5000}, ...]'
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[10px] md:text-xs font-mono h-20 md:h-24 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                />
                <button
                  onClick={handlePaste}
                  className="w-full md:w-auto bg-yellow-500/20 text-yellow-400 px-6 py-2 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/30 transition-all text-sm"
                >
                  Analyze Paste
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/20">
                <span className="bg-[#0a0a0a] px-4">OR</span>
              </div>
            </div>

            <button
              onClick={() => handleAnalysis()}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl transition-all border border-white/10 text-sm md:text-base"
            >
              {loading ? 'Analyzing...' : 'Use Demo Data'}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10">
                <p className="text-[10px] md:text-sm text-white/40 mb-1 uppercase tracking-wider">Saving Allowance</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">{result.saving_allowance.toLocaleString()} RWF</p>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10">
                <p className="text-[10px] md:text-sm text-white/40 mb-1 uppercase tracking-wider">Wealth Trend</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">{result.wealth_trend}</p>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10">
                <p className="text-[10px] md:text-sm text-white/40 mb-1 uppercase tracking-wider">Poverty Risk</p>
                <p className="text-xl md:text-2xl font-bold text-red-400">{(result.poverty_probability * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white/5 p-4 md:p-8 rounded-xl md:rounded-2xl border border-white/10 h-[300px] md:h-[400px]">
              <h4 className="text-sm font-bold mb-6 text-white/60 uppercase tracking-widest">Income vs Expenses</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {result.chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Transactions */}
            <div className="bg-white/5 p-4 md:p-8 rounded-xl md:rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold mb-6 text-white/60 uppercase tracking-widest">Recent Transactions</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', tx.type === 'income' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400')}>
                        <TrendingUp className={cn('w-5 h-5', tx.type !== 'income' && 'rotate-180')} />
                      </div>
                      <div>
                        <p className="font-bold capitalize">{tx.type}</p>
                        <p className="text-xs text-white/40">{tx.date || 'No date'}</p>
                      </div>
                    </div>
                    <p className={cn('font-bold', tx.type === 'income' ? 'text-green-400' : 'text-red-400')}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} RWF
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 md:p-6 rounded-xl md:rounded-2xl flex gap-3 md:gap-4 items-start">
              <AlertCircle className="text-blue-400 shrink-0 w-5 h-5 md:w-6 md:h-6" />
              <div>
                <p className="font-bold text-blue-400 mb-1 text-sm md:text-base">AI Recommendation</p>
                <p className="text-white/80 text-xs md:text-sm">{result.recommendation}</p>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setTransactions([]); setPasteData(''); }}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl transition-all border border-white/10 text-sm md:text-base group"
            >
              <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-180 duration-500" />
              Reset Analysis
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FinanceAI;
