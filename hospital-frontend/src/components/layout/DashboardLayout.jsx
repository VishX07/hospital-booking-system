import { useState } from 'react';

import useAuthStore from '../../store/auth.store.js';

import Navbar from './Navbar.jsx';
import PatientSidebar from './PatientSidebar.jsx';
import DoctorSidebar from './DoctorSidebar.jsx';

const DashboardLayout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {user?.role === 'patient' ? (
        <PatientSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      ) : (
        <DoctorSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
