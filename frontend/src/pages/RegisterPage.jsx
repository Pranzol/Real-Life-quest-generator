import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Shield, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSubmitting(true);

    const result = await register(name, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/onboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-rpg-purple/10 blur-[100px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-10">
        <div className="w-full max-w-md glass border border-rpg-border p-8 rounded-2xl shadow-purple-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-rpg-purple/10 border border-rpg-purple/30 flex items-center justify-center text-rpg-purple-light mx-auto mb-4">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">Create Character</h2>
            <p className="text-xs text-gray-400 mt-1">Begin your quest for self-improvement</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rpg-danger/10 border border-rpg-danger/30 text-rpg-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Player Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="HeroName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-sm font-bold shadow-purple-glow hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 border border-rpg-purple/20 mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Character <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Already have a character?{' '}
              <Link to="/login" className="text-rpg-purple-light hover:underline font-bold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-rpg-border/10 bg-gray-950/40 py-6 text-center text-[10px] text-gray-600 relative z-10">
        &copy; {new Date().getFullYear()} RealLife Quest. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;
