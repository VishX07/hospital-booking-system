import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import useAuthStore from '../../store/auth.store.js';

const HomeNavbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleDashboard = () => {
    if (user?.role === 'patient') {
      navigate('/patient/dashboard');
    } else if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}

        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            🏥
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">HealthCare+</h2>

            <p className="text-xs text-slate-500">Smart Healthcare</p>
          </div>
        </Link>

        {/* Desktop Nav */}

        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#departments"
            className="font-medium text-slate-600 hover:text-blue-600"
          >
            Departments
          </a>

          <Link
            to="/doctors"
            className="font-medium text-slate-600 hover:text-blue-600"
          >
            Doctors
          </Link>

          <a
            href="#features"
            className="font-medium text-slate-600 hover:text-blue-600"
          >
            Features
          </a>

          <a
            href="#faq"
            className="font-medium text-slate-600 hover:text-blue-600"
          >
            FAQ
          </a>
        </nav>

        {/* Right Side */}

        <div className="hidden items-center gap-3 lg:flex">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-5 py-2 font-medium text-slate-700"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleDashboard}
                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
              >
                Dashboard
              </button>

              <button onClick={logout} className="rounded-xl border px-5 py-2">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Button */}

        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}

      {menuOpen && (
        <div className="border-t bg-white lg:hidden">
          <div className="flex flex-col gap-4 p-5">
            <a href="#departments">Departments</a>

            <Link to="/doctors">Doctors</Link>

            <a href="#features">Features</a>

            <a href="#faq">FAQ</a>

            {!user ? (
              <>
                <Link to="/login">Login</Link>

                <Link to="/signup">Sign Up</Link>
              </>
            ) : (
              <>
                <button onClick={handleDashboard} className="text-left">
                  Dashboard
                </button>

                <button onClick={logout} className="text-left">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
