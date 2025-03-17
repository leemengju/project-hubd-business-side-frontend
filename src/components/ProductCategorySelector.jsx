import { useState, useEffect, useRef } from "react";
import { XIcon, SearchIcon } from "lucide-react";
import api from "../services/api";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]); // 所有分類選項
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("name");

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

  // 當選擇器打開時，根據已選項目設置初始狀態
  useEffect(() => {
    if (isOpen && selectedItems) {
      setSelected(selectedItems);
    }
  }, [isOpen, selectedItems]);

  // 處理確認選擇
  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  // 過濾項目
  const filteredItems = items.filter(item => {
    const searchField = filterType === "name" ? item.name : 
                        filterType === "sku" ? item.sku : 
                        item.id.toString();
    return searchField.toLowerCase().includes(filter.toLowerCase());
  });

  // 切換選中狀態
  const toggleSelection = (item) => {
    setSelected(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      return isSelected 
        ? prev.filter(i => i.id !== item.id) 
        : [...prev, item];
    });
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
            onClick={() => toggleSelection(mainCat)}
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
                  onClick={() => toggleSelection(subCat)}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg border-2 border-gray-300 shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題區域 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            選擇{type === "products" ? "商品" : "分類"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="關閉"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 搜尋區域 */}
        <div className="p-4 border-b">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`搜尋${type === "products" ? "商品" : "分類"}...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="w-40">
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="搜尋欄位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">名稱</SelectItem>
                  {type === "products" && <SelectItem value="sku">SKU</SelectItem>}
                  <SelectItem value="id">ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 項目列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center p-3 rounded-md border hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selected.some(i => i.id === item.id)}
                      onCheckedChange={() => toggleSelection(item)}
                    />
                    <Label 
                      htmlFor={`item-${item.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{item.name}</div>
                      {type === "products" && (
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku} | 價格: NT$ {item.price}
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                找不到符合條件的{type === "products" ? "商品" : "分類"}
              </div>
            )}
          </div>
        </div>

        {/* 按鈕區域 */}
        <div className="p-4 border-t flex justify-end gap-4">
          <div className="flex-1 text-sm text-gray-500 self-center">
            已選擇 {selected.length} 個{type === "products" ? "商品" : "分類"}
          </div>
          <Button
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
          >
            確認選擇
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCategorySelector; 