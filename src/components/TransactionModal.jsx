import { useState, useContext, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api.js";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

const TransactionModal = ({ isOpen, onClose, refreshData, editData, accounts = [] }) => {
  const { token } = useContext(AuthContext);
  
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const isZeroBalance = totalBalance <= 0;

  const [type, setType] = useState("deposit"); 
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [division, setDivision] = useState("Personal");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  
  const [modalAccounts, setModalAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const expenseCategories = ["Food", "Fuel", "Movie", "Loan", "Medical", "Shopping", "Other"];
  const incomeCategories = ["Income", "Freelancer", "Investment", "Others"];

  useEffect(() => {
    if (isOpen) {
const fetchAccounts = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/transactions/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setModalAccounts(res.data);
          
          if(res.data.length > 0) {
             setSelectedAccount(res.data[0]._id);
             if(res.data.length > 1) setTransferTo(res.data[1]._id);
             
             setCategory(type === 'income' ? incomeCategories[0] : expenseCategories[0]);

             if (editData) {
                setType(editData.type === 'p2p' ? 'send' : editData.type);
                setAmount(editData.amount);
                setDescription(editData.description);
                setCategory(editData.category);
                setDivision(editData.division);
                setDate(new Date(editData.date).toISOString().slice(0, 16));
                if(editData.accountFrom || editData.accountTo) {
                    setSelectedAccount(editData.accountFrom || editData.accountTo);
                }
             } else {
                if (isZeroBalance) setType("deposit");
             }
          }
        } catch (error) { console.error(error); }
      };
      fetchAccounts();
    }
  }, [isOpen, token, editData, isZeroBalance]);

  useEffect(() => {
    if (type === 'income') setCategory(incomeCategories[0]);
    else setCategory(expenseCategories[0]);
  }, [type]);

  const handleAccountChange = (e) => {
    const newAccount = e.target.value;
    setSelectedAccount(newAccount);
    if (type === 'transfer' && newAccount === transferTo) {
        const otherAccount = modalAccounts.find(acc => acc._id !== newAccount);
        if (otherAccount) setTransferTo(otherAccount._id);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let backendType = type;
    let finalAccountFrom = null;
    let finalAccountTo = null;

    if (type === 'deposit') {
      finalAccountTo = selectedAccount; 
    } 
    else if (type === 'expense') {
      finalAccountFrom = selectedAccount; 
    } 
    else if (type === 'transfer') {
      finalAccountFrom = selectedAccount; 
      finalAccountTo = transferTo;        
    }
    else if (type === 'send') {
      backendType = 'p2p';
      finalAccountFrom = selectedAccount; 
    }

    const transactionData = {
      type: backendType,
      amount: Number(amount),
      description: type === 'send' ? `Sent to ${recipientEmail}` : description,
      category: type === 'transfer' || type === 'deposit' ? 'Transfer' : category,
      division,
      date,
      accountFrom: finalAccountFrom,
      accountTo: finalAccountTo,
      recipientEmail: type === 'send' ? recipientEmail : null
    };

    try {
      if (editData) {
await axios.put(`${API_URL}/api/transactions/${editData._id}`, transactionData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Updated!");
      } else {
await axios.post(`${API_URL}/api/transactions/add`, transactionData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Success!");
      }
      refreshData(); onClose();
      setAmount(""); setDescription(""); setRecipientEmail("");
    } catch (error) { 
      toast.error(error.response?.data?.message || "Failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{editData ? "Edit" : "New"} Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
            {['deposit', 'income', 'expense', 'transfer', 'send'].map((t) => {
                const label = t === 'deposit' ? 'Add Money' : t;
                const isDisabled = isZeroBalance && t !== 'deposit' && !editData;
                return (
                  <button key={t} disabled={isDisabled} onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                      type === t ? "bg-white text-emerald-600 shadow-md" : isDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {label}
                  </button>
                )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Amount (Enabled for Income/Expense editing) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount</label>
              <input 
                type="number" 
                required 
                // Disabled if Editing AND NOT Income OR Expense
                disabled={editData && (type !== 'income' && type !== 'expense')} 
                className={`w-full p-3 border border-gray-200 rounded-xl outline-none text-lg font-mono ${editData && (type !== 'income' && type !== 'expense') ? 'bg-gray-100 text-gray-400' : ''}`}
                placeholder="₹ 0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
              />
            </div>

            {/* DEPOSIT */}
            {type === 'deposit' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Add To Account</label>
                <select className="w-full p-3 border rounded-xl bg-white" value={selectedAccount} onChange={handleAccountChange}>
                  {modalAccounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance})</option>)}
                </select>
              </div>
            )}

            {/* INCOME */}
            {type === 'income' && (
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                    <select className="w-full p-3 border rounded-xl bg-white" value={category} onChange={e => setCategory(e.target.value)}>
                        {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 {/* Added Division */}
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Division</label>
                    <select className="w-full p-3 border rounded-xl bg-white" value={division} onChange={e => setDivision(e.target.value)}>
                        <option value="Personal">Personal</option>
                        <option value="Office">Office</option>
                    </select>
                 </div>
              </div>
            )}

            {/* EXPENSE */}
            {type === 'expense' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pay From</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={selectedAccount} onChange={handleAccountChange}>
                    {modalAccounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                      <select className="w-full p-3 border rounded-xl bg-white" value={category} onChange={e => setCategory(e.target.value)}>
                          {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Division</label>
                      <select className="w-full p-3 border rounded-xl bg-white" value={division} onChange={e => setDivision(e.target.value)}>
                          <option value="Personal">Personal</option>
                          <option value="Office">Office</option>
                      </select>
                   </div>
                </div>
              </>
            )}

            {/* TRANSFER */}
            {type === 'transfer' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">From</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={selectedAccount} onChange={handleAccountChange}>
                    {modalAccounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">To</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                    {modalAccounts.filter(a => a._id !== selectedAccount).map(acc => <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance})</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* SEND */}
            {type === 'send' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pay From</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={selectedAccount} onChange={handleAccountChange}>
                    {modalAccounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Friend's Email</label>
                  <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400"><FaPaperPlane /></span>
                      <input type="email" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none" placeholder="friend@email.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {type !== 'transfer' && type !== 'send' && (
               <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                  <input type="text" className="w-full p-3 border rounded-xl" placeholder="Note" value={description} onChange={e => setDescription(e.target.value)} />
               </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
              <input type="datetime-local" required className="w-full p-3 border rounded-xl text-gray-600" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform active:scale-95 bg-emerald-500 hover:bg-emerald-600`}>
              {loading ? "Processing..." : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;