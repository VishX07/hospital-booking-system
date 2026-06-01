import { Link } from 'react-router-dom';

const FooterSection = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-bold">HealthCare+</h3>

            <p className="mt-4 text-slate-400">
              Smart healthcare platform connecting patients and doctors.
            </p>
          </div>

          <div>
            <h4 className="font-bold">Quick Links</h4>

            <div className="mt-4 flex flex-col gap-2">
              <Link to="/">Home</Link>

              <Link to="/doctors">Doctors</Link>

              <Link to="/login">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold">Contact</h4>

            <div className="mt-4 space-y-2 text-slate-400">
              <p>support@healthcare.com</p>

              <p>+91 9876543210</p>

              <p>India</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-slate-500">
          © 2026 HealthCare+. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
