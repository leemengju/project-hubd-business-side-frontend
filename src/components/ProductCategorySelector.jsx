import { useState, useEffect, useRef } from "react";
import api from "../services/api";

const ProductCategorySelector = ({ 
  isOpen, 
  onClose, 
  selectedItems,
  onConfirm,
  type // 'products' or 'categories'
}) => {
  const modalRef = useRef(null);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(selectedItems || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]); // 所有分類選項
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "all", // all, 0-500, 501-1000, 1001-2000, 2000+
    stockStatus: "all", // all, in-stock, low-stock, out-of-stock
    sortBy: "name" // name, price-asc, price-desc, stock
  });

  // 處理點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 獲取商品或分類列表
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const endpoint = type === 'products' ? '/products' : '/categories';
        const response = await api.get(endpoint);
        setItems(response.data);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      }
    };

    // 如果是商品選擇器，同時獲取分類列表用於篩選
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchItems();
      if (type === 'products') {
        fetchCategories();
      }
    }
  }, [isOpen, type]);

  // 篩選和排序邏輯
  const getFilteredItems = () => {
    return items.filter(item => {
      // 搜尋詞篩選
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (type === 'products') {
        // 分類篩選
        if (filters.category && item.category_id !== filters.category) {
          return false;
        }

        // 價格範圍篩選
        const price = Number(item.price);
        switch (filters.priceRange) {
          case "0-500":
            if (price > 500) return false;
            break;
          case "501-1000":
            if (price <= 500 || price > 1000) return false;
            break;
          case "1001-2000":
            if (price <= 1000 || price > 2000) return false;
            break;
          case "2000+":
            if (price <= 2000) return false;
            break;
        }

        // 庫存狀態篩選
        const stock = Number(item.stock);
        switch (filters.stockStatus) {
          case "in-stock":
            if (stock <= 10) return false;
            break;
          case "low-stock":
            if (stock <= 0 || stock > 10) return false;
            break;
          case "out-of-stock":
            if (stock > 0) return false;
            break;
        }
      }
      
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "stock":
          return Number(b.stock) - Number(a.stock);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredItems = getFilteredItems();

  const handleToggleSelect = (item) => {
    const isSelected = selected.find(i => i.id === item.id);
    if (isSelected) {
      setSelected(selected.filter(i => i.id !== item.id));
    } else {
      setSelected([...selected, item]);
    }
  };

  // 重新組織分類資料結構
  const organizeCategories = (categories) => {
    const mainCategories = categories.filter(cat => !cat.parent_id);
    return mainCategories.map(main => ({
      ...main,
      subCategories: categories.filter(sub => sub.parent_id === main.id)
    }));
  };

  // 分類選擇器組件
  const CategorySelector = () => (
    <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-4">
      {organizeCategories(categories).map(mainCat => (
        <div 
          key={mainCat.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div 
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
              selected.find(i => i.id === mainCat.id)
                ? 'bg-brandBlue-light'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleToggleSelect(mainCat)}
          >
            <div className="flex items-center gap-2">
              {mainCat.icon && (
                <img src={mainCat.icon} alt="" className="w-6 h-6" />
              )}
              <span className="font-medium">{mainCat.name}</span>
            </div>
            <input 
              type="checkbox"
              checked={!!selected.find(i => i.id === mainCat.id)}
              onChange={() => {}}
              className="h-4 w-4 text-brandBlue-normal"
            />
          </div>
          
          {mainCat.subCategories?.length > 0 && (
            <div className="ml-4 mt-2 space-y-1">
              {mainCat.subCategories.map(subCat => (
                <div
                  key={subCat.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    selected.find(i => i.id === subCat.id)
                      ? 'bg-brandBlue-light'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleSelect(subCat)}
                >
                  <span className="text-sm">{subCat.name}</span>
                  <input 
                    type="checkbox"
                    checked={!!selected.find(i => i.id === subCat.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-brandBlue-normal"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div 
        ref={modalRef}
        className="relative top-20 mx-auto p-5 border w-[1000px] shadow-lg rounded-lg bg-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            選擇{type === 'products' ? '商品' : '分類'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'categories' ? (
          // 分類選擇視圖
          <CategorySelector />
        ) : (
          // 商品選擇視圖
          <>
            {/* 搜尋和篩選區 */}
            <div className="mb-4 space-y-4">
              {/* 搜尋欄 */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder={`搜尋${type === 'products' ? '商品' : '分類'}名稱...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                {type === 'products' && (
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="name">依名稱排序</option>
                    <option value="price-asc">價格由低到高</option>
                    <option value="price-desc">價格由高到低</option>
                    <option value="stock">庫存量排序</option>
                  </select>
                )}
              </div>

              {/* 分類篩選改為水平標籤式顯示 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({...filters, category: ""})}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.category === ""
                      ? 'bg-brandBlue-normal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setFilters({...filters, category: category.id})}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.category === category.id
                        ? 'bg-brandBlue-normal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* 其他篩選選項 */}
              <div className="flex gap-4">
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="all">所有價格</option>
                  <option value="0-500">NT$ 0-500</option>
                  <option value="501-1000">NT$ 501-1000</option>
                  <option value="1001-2000">NT$ 1001-2000</option>
                  <option value="2000+">NT$ 2000+</option>
                </select>

                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="all">所有庫存狀態</option>
                  <option value="in-stock">庫存充足</option>
                  <option value="low-stock">庫存不足</option>
                  <option value="out-of-stock">無庫存</option>
                </select>
              </div>
            </div>

            {/* 選擇項目統計 */}
            <div className="mb-4 text-sm text-gray-600">
              已選擇 {selected.length} 項 / 共 {filteredItems.length} 項
            </div>

            {/* 商品列表 */}
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto mb-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleToggleSelect(item)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected.find(i => i.id === item.id)
                      ? 'border-brandBlue-normal bg-brandBlue-light'
                      : 'hover:border-gray-400'
                  }`}
                >
                  {type === 'products' && item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover mb-2 rounded"
                    />
                  )}
                  <p className="font-medium">{item.name}</p>
                  {type === 'products' && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">NT$ {item.price}</p>
                      <p className={`text-sm ${
                        item.stock > 10 
                          ? 'text-green-600' 
                          : item.stock > 0 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        庫存: {item.stock}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelected([])}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            清除所有選擇
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => {
                onConfirm(selected);
                onClose();
              }}
              className="px-4 py-2 bg-brandBlue-normal hover:bg-brandBlue-normalHover text-white rounded-lg"
            >
              確認選擇 ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategorySelector; 