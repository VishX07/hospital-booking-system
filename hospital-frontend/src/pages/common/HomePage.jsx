import { useEffect, useState } from 'react';

import {
  getPublicStats,
  getDepartments,
  getAllDoctors,
} from '../../api/home.api.js';
import HeroSection from '../../components/home/HeroSection.jsx';
import StatsSection from '../../components/home/StatsSection.jsx';
import DepartmentsSection from '../../components/home/DepartmentsSection.jsx';
import FeaturedDoctorsSection from '../../components/home/FeaturedDoctorsSection.jsx';
import HowItWorksSection from '../../components/home/HowItWorksSection.jsx';
import FeaturesSection from '../../components/home/FeaturesSection.jsx';
import FaqSection from '../../components/home/FaqSection.jsx';
import FooterSection from '../../components/home/FooterSection.jsx';
import HomeNavbar from '../../components/home/HomeNavbar.jsx';

const HomePage = () => {
  const [stats, setStats] = useState(null);

  const [departments, setDepartments] = useState([]);

  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [statsRes, departmentsRes, doctorsRes] = await Promise.all([
        getPublicStats(),
        getDepartments(),
        getAllDoctors(),
      ]);

      setStats(statsRes.data.stats);

      setDepartments(departmentsRes.data.departments);

      setDoctors(doctorsRes.data.doctors);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HomeNavbar />

      <HeroSection />

      <StatsSection stats={stats} />

      <DepartmentsSection departments={departments} />

      <FeaturedDoctorsSection doctors={doctors} />

      <HowItWorksSection />

      <FeaturesSection />

      <FaqSection />

      <FooterSection />
    </div>
  );
};

export default HomePage;
