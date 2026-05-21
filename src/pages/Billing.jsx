import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Printer, Save, CheckCircle } from 'lucide-react';
import api from '../api';
import { generatePDF } from '../utils/pdfGenerator';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [latestBill, setLatestBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchProducts = async (term) => {
    try {
      const res = await api.get(`/products/search?q=${term}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching products", error);
    }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert("Out of stock!");
      return;
    }
    
    const existingItem = cart.find(item => item.product === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert("Cannot exceed available stock!");
        return;
      }
      setCart(cart.map(item => 
        item.product === product._id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, {
        product: product._id,
        name: product.name,
        company: product.company,
        price: product.sellingPrice,
        quantity: 0,
        subtotal: 0,
        maxQty: product.quantity,
        unit: product.unit
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id, qty) => {
    const parsedQty = parseInt(qty);
    if (isNaN(parsedQty) || parsedQty < 0) return;
    
    setCart(cart.map(item => {
      if (item.product === id) {
        if (parsedQty > item.maxQty) {
          alert(`Only ${item.maxQty} available in stock!`);
          return item;
        }
        return { ...item, quantity: parsedQty, subtotal: parsedQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product !== id));
  };

  const grandTotal = cart.reduce((total, item) => total + item.subtotal, 0);

  const handleGenerateBill = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);
    
    try {
      const res = await api.post('/bills', {
        customerName,
        products: cart.map(item => ({
          product: item.product,
          name: item.name,
          company: item.company,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        totalAmount: grandTotal
      });
      
      setLatestBill(res.data);
      setSuccessMsg(`Bill ${res.data.billNumber} created successfully!`);
      generatePDF(res.data);
      
      // Reset
      setCart([]);
      setCustomerName('');
      setTimeout(() => {
        setSuccessMsg('');
        setLatestBill(null);
      }, 7000);
      
    } catch (error) {
      console.error("Error creating bill", error);
      alert(error.response?.data?.message || "Error creating bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Bill</h2>

      {successMsg && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="mr-3 text-green-600 flex-shrink-0" />
            <span className="text-lg font-medium">{successMsg}</span>
          </div>
          {latestBill && (
            <button 
              onClick={() => generatePDF(latestBill)} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl flex items-center transition-colors shadow-md text-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Printer className="mr-2" size={16} />
              Reprint Invoice
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Search */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative" ref={searchRef}>
            <h3 className="text-xl font-bold mb-4 text-gray-700">Add Items</h3>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-4 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Type product name..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none text-lg bg-gray-50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {searchResults.map(product => (
                  <div 
                    key={product._id} 
                    onClick={() => addToCart(product)}
                    className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category} • {product.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">₹{product.sellingPrice}</div>
                      <div className={`text-xs font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        Stock: {product.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-2xl font-bold text-gray-800">Current Bill</h3>
              <div className="w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Customer Name (Optional)" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white text-base shadow-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Printer size={64} className="mb-4 opacity-50" />
                  <p className="text-xl">No items in the bill yet</p>
                  <p className="text-sm mt-2">Search and add products from the left</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 border-b-2 border-gray-100">
                      <th className="pb-3 font-semibold">Item</th>
                      <th className="pb-3 font-semibold text-center">Qty</th>
                      <th className="pb-3 font-semibold text-right">Price</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                      <th className="pb-3 pl-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product} className="border-b border-gray-50">
                        <td className="py-4">
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.company}</div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center">
                            <input 
                              type="number" 
                              min="0" 
                              max={item.maxQty}
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.product, e.target.value)}
                              className="w-16 p-2 text-center border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="ml-2 text-sm text-gray-500">{item.unit}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-medium">₹{item.price}</td>
                        <td className="py-4 text-right font-bold text-blue-800 text-lg">₹{item.subtotal}</td>
                        <td className="py-4 pl-4 text-right">
                          <button onClick={() => removeFromCart(item.product)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-6 bg-blue-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-semibold text-gray-700">Grand Total:</span>
                <span className="text-4xl font-extrabold text-blue-800">₹{grandTotal.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleGenerateBill}
                disabled={cart.length === 0 || loading}
                className={`w-full py-5 rounded-xl text-xl font-bold flex items-center justify-center shadow-lg transition-all ${
                  cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                }`}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Printer className="mr-3" size={28} />
                    Generate & Print Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
