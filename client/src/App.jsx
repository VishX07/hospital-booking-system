import { useEffect } from 'react';
import api from './api/axios';

function App() {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const res = await api.get('/test');
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    testBackend();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900 text-white text-3xl font-bold">
      Hospital Booking App
    </div>
  );
}

export default App;
