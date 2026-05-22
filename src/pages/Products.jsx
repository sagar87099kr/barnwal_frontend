import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedCompanies, setExpandedCompanies] = useState({});
  
  const initialFormState = {
    name: '', company: '', printPrice: '', purchaseDiscount: '', sellingDiscount: '', quantity: '', unit: 'piece'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const company = product.company || 'Other';
    if (!acc[company]) acc[company] = [];
    acc[company].push(product);
    return acc;
  }, {});

  const toggleCompany = (company) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [company]: !prev[company]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData(initialFormState);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Error saving product. Check details.");
    }
  };

  const handleEdit = (product) => {
    const printPrice = product.printPrice !== undefined ? product.printPrice : product.sellingPrice;
    const purchaseDiscount = product.purchaseDiscount !== undefined ? product.purchaseDiscount : 
      (product.sellingPrice ? Math.round((1 - product.purchasePrice / product.sellingPrice) * 100) : 0);
    const sellingDiscount = product.sellingDiscount !== undefined ? product.sellingDiscount : 0;

    setEditingProduct(product);
    setFormData({
      name: product.name,
      company: product.company,
      printPrice: printPrice,
      purchaseDiscount: purchaseDiscount,
      sellingDiscount: sellingDiscount,
      quantity: product.quantity,
      unit: product.unit
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
      }
    }
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manage Products</h2>
        <button 
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center shadow-md font-medium text-lg w-full md:w-auto justify-center"
        >
          <Plus className="mr-2" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search products by name or company..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {Object.keys(groupedProducts).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-lg">
          No products found.
        </div>
      ) : (
        Object.keys(groupedProducts).map(company => (
          <div key={company} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div 
              className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCompany(company)}
            >
              <h3 className="text-xl font-bold text-gray-800">{company}</h3>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mr-4">
                  {groupedProducts[company].length} items
                </span>
                {(expandedCompanies[company] || searchTerm.trim() !== '') ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
              </div>
            </div>
            
            {(expandedCompanies[company] || searchTerm.trim() !== '') && (
              <div className="overflow-x-auto border-t border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-700 text-lg border-b">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Stock</th>
                      <th className="p-4 font-semibold">Print Price</th>
                      <th className="p-4 font-semibold">Buy Price</th>
                      <th className="p-4 font-semibold">Sell Price</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedProducts[company].map((product) => {
                      const printPrice = product.printPrice !== undefined ? product.printPrice : product.sellingPrice;
                      const purchaseDiscount = product.purchaseDiscount !== undefined ? product.purchaseDiscount : 
                        (product.sellingPrice ? Math.round((1 - product.purchasePrice / product.sellingPrice) * 100) : 0);
                      const sellingDiscount = product.sellingDiscount !== undefined ? product.sellingDiscount : 0;

                      return (
                        <tr key={product._id} className="border-b hover:bg-gray-50 text-lg">
                          <td className="p-4 font-medium text-gray-900">{product.name}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${product.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {product.quantity} {product.unit}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-gray-600">₹{printPrice}</td>
                          <td className="p-4 font-medium text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <span>₹{product.purchasePrice.toFixed(2)}</span>
                              {purchaseDiscount > 0 && (
                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold border border-green-200">
                                  -{purchaseDiscount}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <span>₹{product.sellingPrice.toFixed(2)}</span>
                              {sellingDiscount > 0 && (
                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold border border-blue-200">
                                  -{sellingDiscount}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 flex justify-center space-x-4">
                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                              <Edit2 size={24} />
                            </button>
                            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                              <Trash2 size={24} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Company/Brand</label>
                  <input type="text" name="company" required value={formData.company} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg bg-white">
                    <option value="piece">Piece (pc)</option>
                    <option value="box">Box</option>
                    <option value="kg">Kg</option>
                    <option value="litre">Litre</option>
                    <option value="feet">Feet</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Print Price (₹)</label>
                  <input 
                    type="number" 
                    name="printPrice" 
                    required 
                    min="0" 
                    step="0.01" 
                    value={formData.printPrice} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Opening Stock Quantity</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    required 
                    min="0" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Purchase Discount (%)</label>
                  <input 
                    type="number" 
                    name="purchaseDiscount" 
                    min="0" 
                    max="100" 
                    step="0.01" 
                    value={formData.purchaseDiscount} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" 
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Sell Discount (%)</label>
                  <input 
                    type="number" 
                    name="sellingDiscount" 
                    min="0" 
                    max="100" 
                    step="0.01" 
                    value={formData.sellingDiscount} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg" 
                    placeholder="0"
                  />
                </div>

                {formData.printPrice && (
                  <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex justify-around shadow-inner mt-2">
                    <div className="text-center">
                      <span className="text-sm font-semibold text-gray-500 block mb-1">Calculated Buy Price</span>
                      <span className="text-2xl font-extrabold text-gray-800">
                        ₹{(parseFloat(formData.printPrice || 0) * (1 - parseFloat(formData.purchaseDiscount || 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center border-l border-blue-200 pl-8">
                      <span className="text-sm font-semibold text-blue-600 block mb-1">Calculated Sell Price</span>
                      <span className="text-2xl font-extrabold text-blue-700">
                        ₹{(parseFloat(formData.printPrice || 0) * (1 - parseFloat(formData.sellingDiscount || 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-colors">
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
