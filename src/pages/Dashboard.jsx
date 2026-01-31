import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import AuthContext from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config/api";
import { FaWallet, FaArrowUp, FaArrowDown, FaPlus, FaUtensils, FaCar, FaMoneyBillWave, FaLandmark, FaMobileAlt, FaTrash, FaEdit, FaFilter } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import TransactionModal from "../components/TransactionModal";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]); // Stores Filtered List for Table
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 }); // Stores Global Summary
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [timeFilter, setTimeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [pieData, setPieData] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  const fetchData = async () => {
    try {
      // 1. Fetch Accounts
      const resAcc = await axios.get(`${API_URL}/api/transactions/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(resAcc.data);

      // 2. Prepare Time Filters ONLY (Do not send Category/Division to Backend)
      // We need ALL data to calculate the correct Total Income/Balance
      let queryParams = {};
      
      const now = new Date();
      if (timeFilter === 'week') {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        queryParams.startDate = lastWeek.toISOString();
        queryParams.endDate = new Date().toISOString();
      } else if (timeFilter === 'month') {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        queryParams.startDate = lastMonth.toISOString();
        queryParams.endDate = new Date().toISOString();
      } else if (timeFilter === 'year') {
        const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
        queryParams.startDate = lastYear.toISOString();
        queryParams.endDate = new Date().toISOString();
      } else if (timeFilter === 'custom' && startDate && endDate) {
        queryParams.startDate = startDate;
        queryParams.endDate = endDate;
      }

      // 3. Fetch ALL data for the selected time period
      const resTrans = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams
      });
      
      const allData = resTrans.data;

      // 4. Calculate Global Summary (Based on ALL data)
      // This ensures Income stays visible even if you filter the list to 'Food'
      let totalIncome = 0;
      let totalExpense = 0;
      
      allData.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expense' || t.type === 'p2p') totalExpense += t.amount;
      });

      setSummary({ 
        income: totalIncome, 
        expense: totalExpense, 
        balance: totalIncome - totalExpense 
      });

      // 5. Apply Client-Side Filtering for Table & Pie Chart
      let filteredData = allData;

      if (divisionFilter) {
        filteredData = filteredData.filter(t => t.division === divisionFilter);
      }
      if (categoryFilter) {
        filteredData = filteredData.filter(t => t.category === categoryFilter);
      }

      setTransactions(filteredData);

      // 6. Calculate Pie Data from Filtered Data
      const categoryTotals = {};
      filteredData.forEach(t => {
        if (t.type === 'expense' || t.type === 'p2p') {
            if(t.category) {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            }
        }
      });

      const formattedPie = Object.keys(categoryTotals).map(key => ({
        name: key,
        value: categoryTotals[key]
      }));
      setPieData(formattedPie);

    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, divisionFilter, categoryFilter, startDate, endDate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDelete = async (id, createdAt) => {
    const hoursDiff = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 12) return toast.error("Cannot delete > 12 hours old");
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Deleted");
      fetchData();
    } catch (error) { toast.error("Failed"); }
  };

  const handleEdit = (t) => {
    const hoursDiff = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 12) return toast.error("Cannot edit > 12 hours old");
    setEditData(t);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditData(null); 
    setIsModalOpen(true);
  };

  const chartData = [
    { name: "Income", amount: summary.income, color: "#10B981" },
    { name: "Expense", amount: summary.expense, color: "#EF4444" }
  ];

  const getAccountIcon = (type) => {
    if (type === 'Bank') return <FaLandmark />;
    if (type === 'Wallet') return <FaMobileAlt />;
    return <FaMoneyBillWave />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg"><FaWallet className="text-white" /></div>
          <h1 className="text-xl font-bold text-gray-800">Money Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden sm:block">Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ACCOUNTS */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">My Accounts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {accounts.map((acc) => (
            <div key={acc._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase">{acc.name}</p>
                <h3 className="text-xl font-bold text-gray-800">₹ {acc.balance}</h3>
              </div>
              <div className={`p-3 rounded-full ${acc.type === 'Bank' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                {getAccountIcon(acc.type)}
              </div>
            </div>
          ))}
        </div>

        {/* OVERVIEW (Stats) - These stay static based on time, ignoring category filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-1">Total Balance</p>
              <h3 className="text-3xl font-bold">₹ {summary.balance}</h3>
            </div>
            <FaWallet className="absolute right-4 bottom-4 text-emerald-400 opacity-50 text-6xl" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div><p className="text-gray-500 font-medium mb-1">Total Income</p><h3 className="text-2xl font-bold text-gray-800">₹ {summary.income}</h3></div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-500"><FaArrowUp size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div><p className="text-gray-500 font-medium mb-1">Total Expenses</p><h3 className="text-2xl font-bold text-gray-800">₹ {summary.expense}</h3></div>
            <div className="bg-red-100 p-3 rounded-full text-red-500"><FaArrowDown size={24} /></div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-500"><FaFilter /><span className="font-bold text-sm">FILTERS:</span></div>
            <select className="p-2 border rounded-lg text-sm bg-gray-50" value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 1 Year</option>
                <option value="custom">Custom Date</option>
            </select>
            {timeFilter === 'custom' && (
                <div className="flex gap-2 items-center">
                    <input type="date" className="p-2 border rounded-lg text-sm" onChange={e => setStartDate(e.target.value)} />
                    <span className="text-gray-400">-</span>
                    <input type="date" className="p-2 border rounded-lg text-sm" onChange={e => setEndDate(e.target.value)} />
                </div>
            )}
            <select className="p-2 border rounded-lg text-sm bg-gray-50" value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}>
                <option value="">All Divisions</option>
                <option value="Personal">Personal</option>
                <option value="Office">Office</option>
            </select>
            <select className="p-2 border rounded-lg text-sm bg-gray-50" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Fuel">Fuel</option>
                <option value="Salary">Salary</option>
                <option value="Shopping">Shopping</option>
            </select>
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className={`grid grid-cols-1 ${categoryFilter ? 'md:grid-cols-2' : ''} gap-6 mb-8`}>
            
            {/* 1. Bar Chart (Always Visible) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Income vs Expenses</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" barSize={30}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="amount" radius={[0, 10, 10, 0]}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Pie Chart (Visible ONLY when Category Filter is active) */}
            {categoryFilter && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Category Breakdown</h3>
                    {pieData.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <PieCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-400">No data for this category</p>
                    )}
                </div>
            )}
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.length === 0 ? <p className="text-center text-gray-400 py-4">No transactions found.</p> : transactions.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : t.type === 'deposit' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    {t.category === 'Food' ? <FaUtensils /> : t.category === 'Fuel' ? <FaCar /> : <FaMoneyBillWave />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{t.description || t.category}</p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.division} • {t.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className={`font-bold text-lg ${t.type === 'income' || t.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {t.type === 'income' || t.type === 'deposit' ? '+' : '-'} ₹{t.amount}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(t)} className="p-2 text-blue-400 hover:text-blue-600 rounded-lg"><FaEdit /></button>
                        <button onClick={() => handleDelete(t._id, t.createdAt)} className="p-2 text-red-400 hover:text-red-600 rounded-lg"><FaTrash /></button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <button onClick={handleAdd} className="fixed bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-300 transition-transform hover:scale-110 active:scale-95">
        <FaPlus size={24} />
      </button>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchData} 
        editData={editData}
        accounts={accounts} 
      />
    </div>
  );
};

export default Dashboard;