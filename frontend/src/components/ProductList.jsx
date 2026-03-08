// مثال على مكون في React | Example React Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/api';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'device',
    city: 'الرياض',
    page: 1,
    limit: 10,
  });

  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement fetching
      // const response = await productService.getAll(filters);
      // setProducts(response.data.products);
      
      console.log('Products fetched');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">جاري التحميل...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">المنتجات المتاحة</h1>
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="device">أجهزة</option>
          <option value="costume">ملابس تنكرية</option>
          <option value="service">خدمات</option>
        </select>

        <input 
          type="text" 
          placeholder="المدينة" 
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="border rounded-lg p-2"
        />

        <button 
          onClick={fetchProducts}
          className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600"
        >
          بحث
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
            <img 
              src={product.images[0]?.url || 'placeholder.jpg'} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">
                  {product.pricePerDay} ريال/يوم
                </span>
                <span className="text-yellow-500">⭐ {product.rating}</span>
              </div>
              <button className="w-full mt-4 bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600">
                حجز الآن
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
