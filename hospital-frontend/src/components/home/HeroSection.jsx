import { Link } from 'react-router-dom';
import useAuthStore from '../../store/auth.store.js';

const HeroSection = () => {
  const { user } = useAuthStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white">
      <div className="mx-auto flex min-h-[650px] max-w-7xl flex-col items-center justify-between gap-10 px-6 py-20 lg:flex-row">
        <div className="max-w-2xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Smart Healthcare Platform
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-6xl">
            Book Doctor Appointments
            <br />
            Anytime, Anywhere
          </h1>

          <p className="mt-6 text-lg text-blue-100">
            Find doctors, manage appointments, access prescriptions and stay
            connected with healthcare professionals.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {!user && (
              <>
                <Link
                  to="/signup"
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700"
                >
                  Get Started
                </Link>

                <Link
                  to="/doctors"
                  className="rounded-2xl border border-white px-6 py-3"
                >
                  Find Doctors
                </Link>
              </>
            )}

            {user?.role === 'patient' && (
              <>
                <Link
                  to="/patient/dashboard"
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700"
                >
                  Dashboard
                </Link>

                <Link
                  to="/doctors"
                  className="rounded-2xl border border-white px-6 py-3"
                >
                  Find Doctors
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex h-80 w-80 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg">
          <div className="text-center">
            <div className="text-8xl">🏥</div>
            <p className="mt-4 text-lg font-semibold">Healthcare Made Easy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
