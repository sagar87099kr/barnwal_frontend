import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar } from 'lucide-react';
import api from '../api';

const History = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get('/bills');
      setBills(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bills", error);
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => 
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.customerName && bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Sales History</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search by Bill Number or Customer Name..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-lg">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-lg border-b">
                  <th className="p-4 font-semibold">Bill No.</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Items Sold</th>
                  <th className="p-4 font-semibold text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <FileText className="text-blue-500 mr-2" size={20} />
                        <span className="font-bold text-gray-900">{bill.billNumber}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">
                      {bill.customerName || <span className="text-gray-400 italic">Walk-in</span>}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-2 opacity-50" size={16} />
                        {new Date(bill.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {bill.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-blue-800 text-xl">
                      ₹{bill.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-lg">No bills found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
