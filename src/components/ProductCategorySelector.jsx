import { useState, useEffect, useRef } from "react";
import { XIcon, SearchIcon, FolderIcon, FolderOpenIcon, TagIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  const mouseDownOutside = useRef(false);

  // 處理滑鼠按下事件
  const handleMouseDown = (e) => {
    // 如果點擊是在模態視窗外部
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      mouseDownOutside.current = true;
      // 阻止事件冒泡，避免觸發主視窗的事件
      e.stopPropagation();
    } else {
      mouseDownOutside.current = false;
    }
  };

  // 處理滑鼠放開事件
  const handleMouseUp = (e) => {
    // 如果點擊是在模態視窗外部
    if (modalRef.current && !modalRef.current.contains(e.target) && mouseDownOutside.current) {
      // 阻止事件冒泡，避免觸發主視窗的事件
      e.stopPropagation();
      onClose();
    }
    mouseDownOutside.current = false;
  };

  // 設置全域事件監聽
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, onClose]);

  // 獲取商品或分類列表
  useEffect(() => {
    const fetchItems = async () => {
      try {
        let endpoint = '';
        if (type === 'products' || type === 'applicable_products') {
          endpoint = '/products';
        } else if (type === 'categories' || type === 'applicable_categories') {
          endpoint = '/product-classifications';
        } else if (type === 'users') {
          endpoint = '/users';
        }
        
        console.log(`正在獲取 ${type} 資料，使用 API 端點:`, endpoint);
        const response = await api.get(endpoint);
        console.log(`獲取到 ${type} 資料:`, response.data);
        setItems(response.data);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      }
    };

    // 如果是商品選擇器，同時獲取分類列表用於篩選
    const fetchCategories = async () => {
      try {
        const response = await api.get('/product-classifications');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchItems();
      if (type === 'products' || type === 'applicable_products') {
        fetchCategories();
      }
    }
  }, [isOpen]);

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
    if (!item || !item.name) return false;
    
    const searchField = filterType === "name" ? item.name : 
                        filterType === "sku" ? item.sku : 
                        (item.id || '').toString();
    return searchField.toLowerCase().includes(filter.toLowerCase());
  });

  // 處理產品選擇狀態變更
  const toggleProductSelection = (product) => {
    let newSelected = [...selected];
    
    // 獲取正確的product_id和spec_id
    const productId = product.product_id || product.main_product_id || '';
    const specId = product.spec_id || '';
    
    console.log('切換產品選擇狀態:', { productId, specId, product });
    
    if (!productId) {
      console.warn('無法切換選擇狀態: 產品缺少product_id', product);
    }
    
    // 檢查產品是否已被選中 - 使用spec_id或product_id作為識別依據
    const productIndex = newSelected.findIndex(p => {
      // 如果有spec_id，則按spec_id檢查，這是規格的唯一標識
      if (specId && p.spec_id === specId) {
        return true;
      }
      
      // 如果没有spec_id，則按product_id檢查，這是商品的唯一標識
      if (!specId && p.product_id === productId) {
        return true;
      }
      
      // 兼容舊數據格式
      return p.id === product.id;
    });
    
    const isSelected = productIndex !== -1;
    
    if (!isSelected) {
      // 添加新選擇
      if (product.variants || product.color || product.size) {
        // 選擇一個有規格的完整產品
        const completeProduct = {
          id: specId || `spec_${Math.random().toString(36).substring(2, 7)}`, // 以規格ID為優先
          spec_id: specId, // 規格流水號
          product_id: productId, // 商品編號（如"pa001"）
          product_main_id: product.product_main_id || productId,
          name: product.name || "未命名商品",
          price: product.price || 0,
          color: product.color === 'null' ? null : product.color,
          size: product.size === 'null' ? null : product.size,
          sku: product.sku || "",
          stock: product.stock || 0,
          image: product.image || "https://via.placeholder.com/100?text=無圖片",
          description: product.description || "",
          category_name: product.category_name || ""
        };
        newSelected.push(completeProduct);
      } else {
        // 選擇主產品或分類
        const completeItem = {
          ...product,
          id: product.id || productId, // 確保ID存在
          product_id: productId, // 商品編號
          spec_id: specId // 規格流水號
        };
        
        // 建立深度拷貝，避免參考關係問題
        const itemToAdd = JSON.parse(JSON.stringify(completeItem));
        newSelected.push(itemToAdd);
      }
    } else {
      // 移除已選產品
      newSelected.splice(productIndex, 1);
    }
    
    setSelected(newSelected);
    
    // 調試信息
    console.log('選擇/取消選擇：', product);
    console.log('當前選擇清單：', newSelected);
  };
  
  // 處理全選商品規格
  const toggleAllSpecifications = (product, specs, isSelected) => {
    let newSelected = [...selected];
    
    if (isSelected) {
      // 只移除當前產品的相關規格，而不影響其他產品的選擇
      newSelected = newSelected.filter(item => 
        !(item.product_main_id === product.id || 
          (item.id === product.id && item.spec_id))
      );
    } else {
      // 先移除當前產品的相關規格，保留其他產品的選擇
      newSelected = newSelected.filter(item => 
        !(item.product_main_id === product.id || 
          (item.id === product.id && item.spec_id))
      );
      
      // 添加所有規格，使用產品主圖而非規格圖片
      specs.forEach(spec => {
        // 確保規格資料完整
        if (!spec.spec_id && !spec.id) {
          console.warn('規格缺少ID:', spec);
          return;
        }
        
        const completeSpec = {
          id: spec.spec_id || spec.id, // 使用 spec_id 作為唯一識別符
          spec_id: spec.spec_id || spec.id,
          product_id: spec.product_id || product.id,
          product_main_id: product.id, // 保存與主產品的關聯
          name: spec.product_name || spec.name || product.name,
          sku: spec.sku,
          price: spec.price,
          stock: spec.stock,
          color: spec.color !== 'null' ? spec.color : null,
          size: spec.size !== 'null' ? spec.size : null,
          // 一律使用產品主圖，避免403錯誤
          image: product.image || "https://via.placeholder.com/100?text=無圖片"
        };
        
        // 使用深度拷貝避免參考問題
        newSelected.push(JSON.parse(JSON.stringify(completeSpec)));
      });
    }
    
    setSelected(newSelected);
  };

  // 重新組織產品分類資料結構 - 適用於從product_classification表獲取的數據
  const organizeProductClassifications = (classifications) => {
    // 檢查是否有資料
    if (!classifications || classifications.length === 0) {
      return [];
    }
    
    // 按父分類分組
    const parentCategories = {};
    
    classifications.forEach(item => {
      if (!item.parent_category) return;
      
      if (!parentCategories[item.parent_category]) {
        parentCategories[item.parent_category] = {
          id: `parent_${item.parent_category}`,
          name: item.parent_category,
          isParent: true,
          subCategories: []
        };
      }
      
      parentCategories[item.parent_category].subCategories.push({
        id: item.id || `child_${item.parent_category}_${item.child_category}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.child_category || '未命名子分類',
        fullName: `${item.parent_category} - ${item.child_category}`,
        parent_category: item.parent_category,
        isParent: false
      });
    });
    
    return Object.values(parentCategories);
  };

  // 分類選擇器組件
  const CategorySelector = () => {
    // 對分類資料進行組織
    const organizedCategories = organizeProductClassifications(items);
    
    // 判斷是否有過濾條件
    const hasFilter = !!filter.trim();
    
    // 如果有過濾條件，顯示過濾後的結果
    if (hasFilter) {
      // 尋找所有匹配的分類（包括父分類和子分類）
      const matchingCategories = [];
      
      organizedCategories.forEach(parent => {
        // 檢查父分類是否匹配
        const parentMatches = parent.name.toLowerCase().includes(filter.toLowerCase());
        
        // 找出匹配的子分類
        const matchingChildren = parent.subCategories.filter(child => 
          child.name.toLowerCase().includes(filter.toLowerCase()) ||
          (child.fullName && child.fullName.toLowerCase().includes(filter.toLowerCase()))
        );
        
        if (parentMatches || matchingChildren.length > 0) {
          // 創建副本以避免修改原始數據
          const parentCopy = {...parent};
          
          if (matchingChildren.length > 0) {
            // 只包含匹配的子分類
            parentCopy.subCategories = matchingChildren;
          }
          
          matchingCategories.push(parentCopy);
        }
      });
      
      if (matchingCategories.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <SearchIcon className="w-12 h-12 mb-4 text-gray-300" />
            <p>沒有符合「{filter}」的分類</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setFilter('')}
            >
              清除篩選
            </Button>
          </div>
        );
      }
      
      return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4">
          {matchingCategories.map(mainCat => (
            <div 
              key={mainCat.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white"
            >
              <div 
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer transition-colors",
                  selected.some(i => i.id === mainCat.id)
                    ? "bg-brandBlue-light text-brandBlue-dark font-medium"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
                onClick={() => toggleProductSelection(mainCat)}
              >
                <div className="flex items-center gap-2">
                  {selected.some(i => i.id === mainCat.id) ? 
                    <FolderOpenIcon className="h-5 w-5 text-brandBlue-normal" /> : 
                    <FolderIcon className="h-5 w-5 text-gray-500" />
                  }
                  <span className={selected.some(i => i.id === mainCat.id) ? "font-medium" : ""}>
                    {mainCat.name}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {mainCat.subCategories.length} 個子分類
                  </Badge>
                </div>
                <Checkbox 
                  checked={!!selected.find(i => i.id === mainCat.id)}
                  className="h-4 w-4 text-brandBlue-normal"
                />
              </div>
              
              {mainCat.subCategories?.length > 0 && (
                <div className="pl-4 pr-2 py-2 bg-white divide-y divide-gray-100">
                  {mainCat.subCategories.map(subCat => (
                    <div
                      key={subCat.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer my-1 transition-colors",
                        selected.some(i => i.id === subCat.id)
                          ? "bg-brandBlue-ultraLight"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => toggleProductSelection(subCat)}
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className={cn(
                          "h-4 w-4",
                          selected.some(i => i.id === subCat.id) ? "text-brandBlue-normal" : "text-gray-400"
                        )} />
                        <span className={cn(
                          "text-sm",
                          selected.some(i => i.id === subCat.id) && "font-medium text-brandBlue-dark"
                        )}>
                          {subCat.name}
                        </span>
                      </div>
                      <Checkbox 
                        checked={!!selected.find(i => i.id === subCat.id)}
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
    }
    
    // 標準顯示（無過濾條件）
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto p-4">
        {organizedCategories.length > 0 ? (
          organizedCategories.map(mainCat => (
            <div 
              key={mainCat.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white"
            >
              <div 
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer transition-colors",
                  selected.some(i => i.id === mainCat.id)
                    ? "bg-brandBlue-light text-brandBlue-dark font-medium"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
                onClick={() => toggleProductSelection(mainCat)}
              >
                <div className="flex items-center gap-2">
                  {selected.some(i => i.id === mainCat.id) ? 
                    <FolderOpenIcon className="h-5 w-5 text-brandBlue-normal" /> : 
                    <FolderIcon className="h-5 w-5 text-gray-500" />
                  }
                  <span className={selected.some(i => i.id === mainCat.id) ? "font-medium" : ""}>
                    {mainCat.name}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {mainCat.subCategories.length} 個子分類
                  </Badge>
                </div>
                <Checkbox 
                  checked={!!selected.find(i => i.id === mainCat.id)}
                  className="h-4 w-4 text-brandBlue-normal"
                />
              </div>
              
              {mainCat.subCategories?.length > 0 && (
                <div className="pl-4 pr-2 py-2 bg-white divide-y divide-gray-100">
                  {mainCat.subCategories.map(subCat => (
                    <div
                      key={subCat.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer my-1 transition-colors",
                        selected.some(i => i.id === subCat.id)
                          ? "bg-brandBlue-ultraLight"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => toggleProductSelection(subCat)}
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className={cn(
                          "h-4 w-4",
                          selected.some(i => i.id === subCat.id) ? "text-brandBlue-normal" : "text-gray-400"
                        )} />
                        <span className={cn(
                          "text-sm",
                          selected.some(i => i.id === subCat.id) && "font-medium text-brandBlue-dark"
                        )}>
                          {subCat.name}
                        </span>
                      </div>
                      <Checkbox 
                        checked={!!selected.find(i => i.id === subCat.id)}
                        className="h-4 w-4 text-brandBlue-normal"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FolderIcon className="w-12 h-12 mb-4 text-gray-300" />
            <p>正在加載分類資料，或尚無可用分類...</p>
          </div>
        )}
      </div>
    );
  };

  // 以更友好的方式組織和顯示商品數據
  const getFormattedItems = () => {
    // 如果不是商品類型，直接返回過濾後的項目
    if (type !== 'products' && type !== 'applicable_products') {
      return filteredItems;
    }
    
    // 按商品名稱分組，同時整合尺寸和顏色等規格信息
    const groupedItems = {};
    
    console.log('原始商品數據:', filteredItems);
    
    filteredItems.forEach(item => {
      // 確保 item 是有效的
      if (!item || !item.name) {
        console.warn('忽略無效項目:', item);
        return;
      }
      
      // 正確獲取product_id (例如 "pa001")
      const productId = item.product_id || item.main_product_id || '';
      
      // 正確獲取spec_id (規格流水號，例如 "1", "2" 等)
      const specId = item.spec_id || '';
      
      if (!productId) {
        console.warn('項目缺少product_id:', item);
      }
      
      console.log(`處理商品: ${item.name}, product_id: ${productId}, spec_id: ${specId}`);
      
      // 使用product_id作為分組鍵，確保同一個商品的不同規格被分到一起
      const key = productId || item.name;
      
      const productName = item.name;
      const price = item.price || 0;
      const image = item.image || '';
      const description = item.description || '';
      const size = (item.size === 'null' || !item.size) ? null : item.size;
      const color = (item.color === 'null' || !item.color) ? null : item.color;
      const stock = item.stock || 0;
      const sku = item.sku || '';
      
      if (!groupedItems[key]) {
        // 創建分組的基本信息
        groupedItems[key] = {
          id: productId, // 使用product_id作為主商品ID
          product_id: productId, // 商品編號 (例如 "pa001")
          name: productName,
          basePrice: price,
          image: image,
          description: description,
          variants: [],
          category_name: item.category_name || '',
          mainItem: item // 保存第一個規格作為主商品對象
        };
      }
      
      // 添加規格變體 (每個 API 返回的物件都是一個規格)
      groupedItems[key].variants.push({
        id: specId, // 以spec_id作為唯一標識
        spec_id: specId, // 規格流水號
        product_id: productId, // 商品編號
        size: size,
        color: color,
        stock: stock,
        price: price,
        sku: sku,
        fullItem: {
          ...item,
          product_id: productId, // 確保product_id正確
          spec_id: specId // 確保spec_id正確
        } // 保存完整的商品對象
      });
    });
    
    // 將分組對象轉換為數組
    const result = Object.values(groupedItems);
    console.log('格式化後的商品數據:', result);
    return result;
  };
  
  // 使用格式化的商品數據
  const formattedItems = getFormattedItems();
  
  // 處理變體選擇
  const handleVariantSelect = (variant, groupItem) => {
    // 從變體中獲取完整的商品資訊
    const fullItem = variant.fullItem || {};
    
    // 確保完整的商品資訊具有正確的規格資訊
    fullItem.spec_id = variant.spec_id || variant.id; // 規格流水號
    fullItem.product_id = variant.product_id || groupItem.product_id; // 商品編號
    
    // 使用主商品圖片，避免403錯誤
    fullItem.image = groupItem.image || "https://via.placeholder.com/100?text=無圖片";
    
    if (!fullItem.id && variant.id) {
      fullItem.id = variant.id; // 確保fullItem有ID
    }
    
    // 補充必要屬性
    fullItem.product_main_id = groupItem.id; // 設為product_id
    fullItem.product_id = groupItem.product_id; // 商品編號
    fullItem.name = fullItem.name || groupItem.name;
    
    // 使用深度拷貝，避免參考問題
    const itemToSelect = JSON.parse(JSON.stringify(fullItem));
    toggleProductSelection(itemToSelect);
  };
  
  // 處理全選該商品的所有規格
  const handleSelectAllVariants = (groupItem) => {
    // 使用toggleAllSpecifications進行全選
    toggleAllSpecifications(groupItem, groupItem.variants, false);
  };
  
  // 產品列表項目渲染
  const renderProductItem = (item) => {
    // 檢查是否有變體被選中
    const selectedVariants = item.variants.filter(v => 
      selected.some(s => s.id === v.id)
    );
    const isAllSelected = selectedVariants.length === item.variants.length && item.variants.length > 0;
    const isPartiallySelected = selectedVariants.length > 0 && !isAllSelected;
    
    // 確保有預設圖片
    const productImage = item.image || "https://via.placeholder.com/100?text=無圖片";
    
    return (
      <div 
        key={`product_${item.name}_${Math.random().toString(36).substring(2, 7)}`} 
        className={cn(
          "flex flex-col p-4 rounded-md border mb-4 transition-colors",
          selectedVariants.length > 0 && "border-brandBlue-normal bg-brandBlue-ultraLight",
          "shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-start">
          {/* 只顯示商品主圖，並處理圖片載入錯誤 */}
          <div className="w-20 h-20 rounded overflow-hidden border border-gray-200 mr-4 flex-shrink-0">
            <img 
              src={productImage} 
              alt={item.name} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=無圖片" }}
            />
          </div>
          
          {/* 商品資訊 */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">{item.name}</span>
              
              {/* 全選按鈕 */}
              {item.variants.length > 1 && (
                <div className="flex items-center">
                  <Checkbox
                    id={`all-${item.name}`}
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                    onCheckedChange={() => {
                      if (isAllSelected) {
                        // 如果全部選中，則取消選中所有
                        toggleAllSpecifications(item, item.variants, true);
                      } else {
                        // 使用toggleAllSpecifications進行全選
                        toggleAllSpecifications(item, item.variants, false);
                      }
                    }}
                    className="mr-2"
                  />
                  <Label 
                    htmlFor={`all-${item.name}`}
                    className="cursor-pointer text-sm"
                  >
                    全選規格
                  </Label>
                </div>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between mt-auto">
              <div className="text-sm text-gray-700">
                基本價格：<span className="font-medium text-brandBlue-dark">NT$ {item.basePrice}</span>
              </div>
              
              {item.variants.length > 0 && (
                <span className="text-xs text-gray-500">
                  {item.variants.length} 個規格 • 已選 {selectedVariants.length} 個
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 已選擇的規格摘要顯示 */}
        {selectedVariants.length > 0 && (
          <div className="mt-4 pl-2 border-t border-dashed border-gray-200 pt-2">
            <div className="text-xs font-medium text-gray-700 mb-2">已選規格：</div>
            <div className="flex flex-wrap gap-2">
              {selectedVariants.map(variant => {
                const hasSize = variant.size && variant.size !== 'null';
                const hasColor = variant.color && variant.color !== 'null';
                
                return (
                  <Badge 
                    key={variant.id} 
                    variant="outline"
                    className="bg-brandBlue-ultraLight text-xs py-1"
                  >
                    {!hasSize && !hasColor && "標準規格"}
                    {hasSize && `${variant.size}`}
                    {hasSize && hasColor ? ' / ' : ''}
                    {hasColor && variant.color}
                    {` - NT$ ${variant.price}`}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 規格變體列表 */}
        {item.variants.length > 0 && (
          <div className="mt-4 pl-2 pt-3 border-t border-dashed border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">可選規格：</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {item.variants.map(variant => {
                const isVariantSelected = selected.some(s => s.id === variant.id);
                const hasSize = variant.size && variant.size !== 'null';
                const hasColor = variant.color && variant.color !== 'null';
                
                return (
                  <div 
                    key={variant.id || `variant_${Math.random().toString(36).substring(2, 9)}`} 
                    className={cn(
                      "flex items-center p-2 rounded border cursor-pointer transition-all",
                      isVariantSelected ? "border-brandBlue-normal bg-brandBlue-ultraLight shadow-sm" : "hover:bg-gray-50 border-gray-200"
                    )}
                    onClick={() => handleVariantSelect(variant, item)}
                  >
                    <Checkbox
                      checked={isVariantSelected}
                      className="mr-2"
                      onCheckedChange={() => handleVariantSelect(variant, item)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {!hasSize && !hasColor && "標準規格"}
                          {hasSize && `${variant.size}`}
                          {hasSize && hasColor ? ' / ' : ''}
                          {hasColor && (
                            <span className="inline-flex items-center">
                              <span 
                                className="w-3 h-3 rounded-full mr-1 inline-block border border-gray-300"
                                style={{ 
                                  backgroundColor: 
                                    variant.color.toLowerCase() === 'black' ? '#000' :
                                    variant.color.toLowerCase() === 'white' ? '#fff' :
                                    variant.color.toLowerCase() === 'grey' || variant.color.toLowerCase() === 'gray' ? '#808080' :
                                    variant.color.toLowerCase()
                                }}
                              />
                              {variant.color}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>NT$ {variant.price}</span>
                        <span className={variant.stock <= 0 ? "text-red-500 font-medium" : "text-blue-600"}>
                          庫存: {variant.stock || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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
            選擇{
              type === "products" ? "商品" : 
              type === "applicable_products" ? "適用商品" : 
              type === "categories" ? "分類" : 
              type === "applicable_categories" ? "適用分類" : 
              "使用者"
            }
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
                placeholder={`搜尋${
                  type === "products" ? "商品" : 
                  type === "applicable_products" ? "適用商品" : 
                  type === "categories" ? "分類" : 
                  type === "applicable_categories" ? "適用分類" : 
                  "使用者"
                }...`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {(type === 'products' || type === 'applicable_products') && (
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
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="id">ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* 項目列表 */}
        <div className="flex-1 overflow-y-auto">
          {type === 'categories' || type === 'applicable_categories' ? (
            <CategorySelector />
          ) : (
            <div className="space-y-2 p-4">
              {formattedItems.length > 0 ? (
                formattedItems.map(renderProductItem)
              ) : (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  {filter ? 
                    <p>沒有符合 <span className="font-medium">"{filter}"</span> 的{type === "products" ? "商品" : "分類"}</p> : 
                    <p>沒有可選擇的{type === "products" ? "商品" : "分類"}</p>
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <div className="text-sm">
            已選擇: <span className="font-semibold text-brandBlue-dark">{selected.length}</span> 個項目
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirm}
            >
              確認
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategorySelector; 