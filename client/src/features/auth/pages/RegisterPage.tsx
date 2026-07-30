import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User as UserIcon, AtSign, Mail, Lock, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering, registerError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!formData.name.trim()) {
      setClientError('Please enter your full name');
      return;
    }
    if (!formData.username.trim()) {
      setClientError('Please enter a username');
      return;
    }
    if (!formData.email.trim()) {
      setClientError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 8) {
      setClientError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setClientError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setClientError('Password must contain at least one number');
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      setClientError('Username can only contain letters, numbers, dots, underscores, and hyphens (no @ symbol)');
      return;
    }

    try {
      await register(formData);
      navigate('/org/create');
    } catch {
      // Error handled via registerError state
    }
  };

  return (
    <div className="bg-[#0e0e12]/80 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600" />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="text-sm text-zinc-400">
          Join your software engineering team on TeamFlow AI
        </p>
      </div>

      {(clientError || registerError) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {clientError && <span>{clientError}</span>}
            {!clientError && registerError && (
              Array.isArray(registerError.errors)
                ? registerError.errors.map((e: { field: string; message: string }, i: number) => (
                    <span key={i}><span className="font-semibold capitalize">{e.field.replace('body.', '')}</span>: {e.message}</span>
                  ))
                : <span>{registerError.message || 'Registration failed. Please verify your details.'}</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <UserIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Alex Vance"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <AtSign className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => {
                // Strip @ prefix if user types it — icon already shows @
                const raw = e.target.value.replace(/^@+/, '');
                setFormData({ ...formData, username: raw });
              }}
              placeholder="alex_vance"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@teamflow.ai"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 chars, 1 upper, 1 lower, 1 number"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isRegistering ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/60">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-indigo-400 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
