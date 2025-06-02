import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Loader, Brain, Zap } from 'lucide-react';
import axios from 'axios';
import TypewriterText from './TypewriterText';

interface Product {
  product_id: string;
  description: string;
  quantity: string;
  unit_price: number;
  total_price: number;
}

interface ExtractedData {
  customer_name: string;
  order_number: string;
  products: Product[];
}

interface DataPanelProps {
  filename: string | null;
}

const DataPanel: React.FC<DataPanelProps> = ({ filename }) => {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Product>('product_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showData, setShowData] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!filename) {
      setData(null);
      setError(null);
      setShowData(false);
      return;
    }

    fetchData();
  }, [filename]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setShowData(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const fetchData = async () => {
    if (!filename) return;

    setLoading(true);
    setError(null);
    setShowData(false);

    try {
      const response = await axios.get(`http://localhost:8000/data/${filename}`);
      setData(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Data fetch error:', error);
      setError('Failed to fetch extracted data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleFieldChange = (field: keyof ExtractedData, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const sortedProducts = data?.products ? [...data.products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  }) : [];

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: keyof Product }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-primary" /> : 
      <ChevronDown className="w-4 h-4 text-primary" />;
  };

  if (!filename) {
    return (
      <motion.div
        className="card bg-base-100 shadow-lg h-full relative overflow-hidden" dir="rtl">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="card-body items-center justify-center relative z-10">
          <div className="text-center w-full" dir="rtl">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🤖
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">AI Ready to Analyze</h3>
            <TypewriterText text="בחר קובץ PDF כדי להתחיל בחילוץ נתונים חכם" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card bg-base-100 shadow-lg h-full min-h-0 max-h-full flex flex-col relative overflow-hidden w-full lg:w-[98%] xl:w-[95%] mx-auto" dir="rtl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'backOut' }}
      whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="card-body p-4 flex-1 flex flex-col relative z-10 h-full min-h-0 max-h-full overflow-hidden">
        <motion.div
          className="flex items-center gap-2 mb-4 text-right"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Extracted Data</h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-yellow-500" />
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <motion.div
              className="flex flex-col items-center gap-4 text-right"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-12 h-12 text-primary" />
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <TypewriterText text="ה-AI מנתח את מבנה המסמך..." />
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-8 bg-primary/30 rounded"
                    animate={{ 
                      height: [8, 20, 8],
                      backgroundColor: ["rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.3)"]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        ) : error ? (
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center w-full" dir="rtl">
              <motion.div
                className="text-error text-4xl mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                ⚠️
              </motion.div>
              <p className="text-error">אירעה שגיאה בעת שליפת הנתונים</p>
              <motion.button
                onClick={fetchData}
                className="btn btn-sm btn-outline btn-primary mt-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                נסה שוב
              </motion.button>
            </div>
          </motion.div>
        ) : data ? (
          <AnimatePresence>
            <motion.div
              className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Editable Fields */}
              {data && (
                <div className="flex flex-row gap-4 mb-4 flex-shrink-0 w-full">
                  <div className="flex flex-col gap-1 w-1/2">
                    <label className="text-sm font-medium text-base-content/70" htmlFor="customer_name">שם לקוח</label>
                    <input
                      id="customer_name"
                      className="input input-bordered w-full text-right"
                      type="text"
                      value={data.customer_name || ''}
                      onChange={e => handleFieldChange('customer_name', e.target.value)}
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-1/2">
                    <label className="text-sm font-medium text-base-content/70" htmlFor="order_number">מספר הזמנה</label>
                    <input
                      id="order_number"
                      className="input input-bordered w-full text-right"
                      type="text"
                      value={data.order_number || ''}
                      onChange={e => handleFieldChange('order_number', e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>
              )}

              {/* Products Table */}
              <motion.div
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center justify-between mb-2 text-right flex-shrink-0">
                  <h4 className="font-semibold flex items-center gap-2">
                    מוצרים ({sortedProducts.length})
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      ⚙️
                    </motion.div>
                  </h4>
                  {totalPages > 1 && (
                    <div className="text-sm text-base-content/60">
                      עמוד {currentPage} מתוך {totalPages}
                    </div>
                  )}
                </div>

                <motion.div
                  className="flex-1 overflow-y-auto border border-base-300 rounded-lg min-h-0"
                  whileHover={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
                  transition={{ duration: 0.3 }}
                >
                  <table className="table table-pin-rows table-sm">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none text-right"
                          onClick={() => handleSort('product_id')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            מק"ט מוצר
                            <SortIcon field="product_id" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none text-right"
                          onClick={() => handleSort('description')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            תיאור
                            <SortIcon field="description" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none text-right"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            כמות
                            <SortIcon field="quantity" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none text-right"
                          onClick={() => handleSort('unit_price')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            מחיר יחידה
                            <SortIcon field="unit_price" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none text-right"
                          onClick={() => handleSort('total_price')}
                        >
                          <div className="flex items-center gap-1 justify-end">
                            מחיר כולל
                            <SortIcon field="total_price" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-base-content/60">
                            לא נמצאו מוצרים
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product, index) => (
                          <motion.tr
                            key={`${product.product_id}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-base-200/50"
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                          >
                            <td className="font-mono text-sm">{product.product_id}</td>
                            <td className="max-w-xs truncate" title={product.description}>
                              {product.description}
                            </td>
                            <td className="text-right font-mono">{product.quantity}</td>
                            <td className="text-right font-mono">
                              ₪{Number(product.unit_price).toFixed(2)}
                            </td>
                            <td className="text-right font-mono font-semibold">
                              ₪{Number(product.total_price).toFixed(2)}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="flex justify-center mt-4 flex-shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <div className="join">
                      <motion.button
                        className="join-item btn btn-sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        הקודם
                      </motion.button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <motion.button
                          key={page}
                          className={`join-item btn btn-sm ${
                            currentPage === page ? 'btn-active' : ''
                          }`}
                          onClick={() => setCurrentPage(page)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {page}
                        </motion.button>
                      ))}
                      <motion.button
                        className="join-item btn btn-sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        הבא
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center w-full" dir="rtl">
              <motion.div
                className="text-4xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <TypewriterText text="מוכן לחילוץ נתונים בדיוק של AI" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DataPanel;
