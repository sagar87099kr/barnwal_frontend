import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="billing" element={<Billing />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
