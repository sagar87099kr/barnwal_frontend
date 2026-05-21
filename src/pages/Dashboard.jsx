import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todaysSalesCount: 0,
    todaysRevenue: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/bills/stats/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center">
      <div className={`p-4 rounded-xl mr-6 ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={32} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-xl">Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-blue-100" 
        />
        <StatCard 
          title="Low Stock Alert" 
          value={stats.lowStockProducts} 
          icon={AlertTriangle} 
          color="bg-red-100" 
        />
        <StatCard 
          title="Today's Sales" 
          value={stats.todaysSalesCount} 
          icon={TrendingUp} 
          color="bg-green-100" 
        />
        <StatCard 
          title="Today's Revenue" 
          value={`₹${stats.todaysRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-purple-100" 
        />
      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Quick Actions</h3>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <a href="/billing" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-md transition-all">
            Create New Bill
          </a>
          <a href="/products" className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-medium shadow-sm transition-all">
            Manage Products
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
