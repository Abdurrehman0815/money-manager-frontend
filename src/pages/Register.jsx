import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaEnvelope, FaWallet, FaArrowRight } from "react-icons/fa";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password.length < 6) return toast.error("Password must be at least 6 characters");

    const result = await register(username, email, password);
    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/login");
    } else {
      toast.error(result.msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white sm:bg-gray-50">
      
      {/* Top Section */}
      <div className="text-center mb-8">
        <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
          <FaWallet className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Money Manager</h1>
        <p className="text-gray-500 mt-2">Create your account</p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-xl sm:p-10 p-6">
        
        {/* Toggle Tabs */}
        <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-xl">
          <Link to="/login" className="flex-1 text-center text-gray-500 font-medium py-2 rounded-lg text-sm hover:text-gray-700 transition-all">
            Sign In
          </Link>
          <button className="flex-1 bg-white text-primary font-semibold py-2 rounded-lg shadow-sm text-sm transition-all">
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400"><FaUser /></span>
              <input type="text" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-gray-700"
                placeholder="John Doe"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400"><FaEnvelope /></span>
              <input type="email" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-gray-700"
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400"><FaLock /></span>
              <input type="password" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-gray-700"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit"
            className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-green-200 flex items-center justify-center gap-2 group">
            Sign Up
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;