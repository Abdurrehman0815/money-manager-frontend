import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaWallet, FaLock, FaEnvelope, FaArrowRight } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <FaWallet className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Money Manager</h1>
        <p className="text-gray-500 mt-2 text-sm">Take control of your finances</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
        
        {/* Tabs */}
        <div className="flex justify-between mb-8 bg-gray-50 p-1 rounded-xl">
           <button className="flex-1 bg-white text-emerald-600 font-bold py-2.5 rounded-lg text-sm shadow-sm transition-all">
             Sign In
           </button>
           <Link to="/register" className="flex-1 text-center text-gray-500 font-medium py-2.5 rounded-lg text-sm hover:text-gray-700 transition-all">
             Sign Up
           </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 text-lg"><FaEnvelope /></span>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 text-lg"><FaLock /></span>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group mt-2"
          >
            Sign In
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-500 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;