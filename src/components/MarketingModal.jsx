import { useEffect, useState, useRef, useCallback } from "react";
import ProductCategorySelector from "./ProductCategorySelector";
import UserSelector from "./UserSelector";
import { cn } from "@/lib/utils";
import { XIcon, AlertCircleIcon, AlertTriangle, FolderIcon, ShoppingBagIcon, UsersIcon, TagIcon, EyeIcon } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import apiService from "../services/api";
import { toast } from "react-hot-toast";

const MarketingModal = ({ 
  isOpen, 
  onClose, 
  type, 
  mode, 
  formData, 
  setFormData, 
  onSubmit,
  isLoading 
}) => {
  const modalRef = useRef(null);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorType, setSelectorType] = useState('products');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [dateError, setDateError] = useState("");
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const codeCheckTimeout = useRef(null);
  const mouseDownOutside = useRef(false);
  const isInitialMount = useRef(true);
  const initialLoadDone = useRef(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDateRangeEnabled, setIsDateRangeEnabled] = useState(true);
  const closeConfirmRef = useRef(null);
  const token = localStorage.getItem('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectorJustClosed, setSelectorJustClosed] = useState(false);
  const [showApplicableModal, setShowApplicableModal] = useState(false);
  const [selectedSelectorItems, setSelectedSelectorItems] = useState([]);
  // 添加初始化追蹤 ref
  const formInitialized = useRef(false);
  // 添加儲存之前選擇的項目的 ref，避免重複 API 調用
  const previousSelectedItems = useRef({
    products: [],
    applicable_products: [],
    categories: [],
    applicable_categories: [],
    users: []
  });

  // 輔助函數：判斷是否為已排程狀態（開始日期在將來）
  const isScheduled = (dateString) => {
    if (!dateString) return false;
    const startDate = new Date(dateString);
    const now = new Date();
    return startDate > now;
  };
  
  // 輔助函數：判斷是否已過期（結束日期在過去）
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const endDate = new Date(dateString);
    const now = new Date();
    return endDate < now;
  };
  
  // 輔助函數：獲取狀態顯示文本
  const getStatusText = (status) => {
    if (status === "active") {
      return type === 'coupons' ? '啟用' : '進行中';
    } else if (status === "disabled") {
      return type === 'coupons' ? '停用' : '已停用';
    } else if (status === "expired") {
      return type === 'coupons' ? '已過期' : '已結束';
    }
    return '';
  };

  // 格式化日期為 YYYY-MM-DD 格式
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("日期格式化錯誤:", e);
      return '';
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(type === 'coupons' ? {
        title: "",
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
        description: "",
        products: [],
        categories: [],
        users: [], // 確保是空陣列
        buy_quantity: "",
        free_quantity: "",
        status: "active" // 預設狀態為啟用
      } : {
        name: "",
        type: "discount",
        discount_method: "percentage",
        discount_value: "",
        buy_quantity: "",
        free_quantity: "",
        bundle_quantity: "",
        bundle_discount: "",
        flash_sale_start_time: "",
        flash_sale_end_time: "",
        flash_sale_discount: "",
        start_date: "",
        end_date: "",
        stock_limit: "",
        per_user_limit: "",
        applicable_products: [],
        applicable_categories: [],
        description: "",
        status: "active", // 預設狀態為啟用
        users: [] // 確保活動也有 users 欄位，且為空陣列
      });
      // 重置所有狀態
      setIsDirty(false);
      isInitialMount.current = true;
    } else if (isOpen) {
      // 每次打開窗口時重置初始標記
      isInitialMount.current = true;
      
      // 加載完成後重置 isDirty 狀態，確保初始化不算作變更
      setIsDirty(false);
      
      // 如果是添加模式，設置預設日期
      if (mode === 'add') {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        
        if (type === 'campaigns') {
          // 對於行銷活動，預設設置日期範圍，但不標記為已修改
          setFormData(prev => ({
            ...prev,
            start_date: todayStr,
            end_date: nextMonthStr
          }));
        }
      }
    }
  }, [isOpen, type, mode]);

  // 監控表單變更狀態
  useEffect(() => {
    // 如果模態窗口未打開，不處理變更
    if (!isOpen) return;
    
    // 初始載入時不標記為已修改
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // 表單有任何變更時標記為已修改
    setIsDirty(true);
  }, [formData, isOpen]);

  // 監聽ESC按鍵
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        // 先檢查確認視窗是否開啟，如果是則關閉確認視窗
        if (showCloseConfirmation) {
          setShowCloseConfirmation(false);
        } 
        // 如果確認視窗未開啟，則處理主視窗的關閉
        else {
          // 複製 handleCloseRequest 函數的邏輯
          if (isDirty) {
            // 對於活動，再次檢查是否真的有用戶輸入
            if (type === 'campaigns' && mode === 'add') {
              // 檢查是否真的有填寫關鍵內容
              const hasRealContent = formData.name || 
                                  (formData.discount_value && formData.discount_value !== "0") ||
                                  formData.applicable_products?.length > 0;
              
              // 如果實際沒有內容，直接關閉
              if (!hasRealContent) {
                onClose();
                return;
              }
            }
            
            // 對於優惠券，檢查是否有必填項
            if (type === 'coupons' && mode === 'add') {
              const hasRequiredFields = formData.title || formData.code || formData.discount_value;
              if (!hasRequiredFields) {
                onClose();
                return;
              }
            }
            
            // 如果上述檢查通過，說明確實有內容，顯示確認窗口
            setShowCloseConfirmation(true);
          } else {
            // 如果表單未修改，直接關閉
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDirty, showCloseConfirmation, onClose]);

  // 控制背景滾動
  useEffect(() => {
    if (isOpen) {
      // 禁用背景滾動
      document.body.style.overflow = 'hidden';
    } else {
      // 恢復背景滾動
      document.body.style.overflow = '';
    }
    
    // 組件卸載時恢復背景滾動
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 處理滑鼠按下事件
  const handleMouseDown = (e) => {
    // 檢查滑鼠按下是否在背景層 (也就是視窗外)
    if (e.target === e.currentTarget) {
      mouseDownOutside.current = true;
    } else {
      mouseDownOutside.current = false;
    }
  };

  // 處理外部點擊 (改為滑鼠放開事件)
  const handleMouseUp = (e) => {
    // 只有當滑鼠按下和放開都在視窗外時，且沒有選擇器顯示時，才觸發關閉確認
    if (e.target === e.currentTarget && mouseDownOutside.current && !showSelector && !showUserSelector && !selectorJustClosed) {
      handleCloseRequest();
    }
    // 重置滑鼠按下狀態
    mouseDownOutside.current = false;
  };

  // 處理確認關閉
  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  // 處理取消關閉
  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  // 處理關閉請求，確認用戶是否真的需要保存數據
  const handleCloseRequest = () => {
    // 如果選擇器正在顯示，則先關閉選擇器而不是顯示確認框
    if (showSelector) {
      handleSelectorClose();
      return;
    }
    
    if (showUserSelector) {
      setShowUserSelector(false);
      return;
    }

    // 如果有未保存的更改，顯示確認框
    if (isDirty) {
      // 對於活動，再次檢查是否真的有用戶輸入
      if (type === 'campaigns' && mode === 'add') {
        // 檢查是否真的有填寫關鍵內容
        const hasRealContent = formData.name || 
                            (formData.discount_value && formData.discount_value !== "0") ||
                            formData.applicable_products?.length > 0;
        
        // 如果實際沒有內容，直接關閉
        if (!hasRealContent) {
          onClose();
          return;
        }
      }
      
      // 對於優惠券，檢查是否有必填項
      if (type === 'coupons' && mode === 'add') {
        const hasRequiredFields = formData.title || formData.code || formData.discount_value;
        if (!hasRequiredFields) {
          onClose();
          return;
        }
      }
      
      // 如果上述檢查通過，說明確實有內容，顯示確認窗口
      setShowCloseConfirmation(true);
    } else {
      // 如果表單未修改，直接關閉
      onClose();
    }
  };

  // 開啟選擇器（優化版）
  const openSelector = useCallback((type) => {
    // 如果選擇器剛剛關閉，避免立即再次打開
    if (selectorJustClosed) {
      return;
    }

    setSelectorType(type);
    
    if (type === 'products') {
      // 獲取目前已選取的商品
      const currentlySelected = formData.products || [];
      
      // 如果選擇的商品沒變，避免重新設置狀態和打開選擇器
      if (JSON.stringify(currentlySelected) === JSON.stringify(previousSelectedItems.current.products)) {
        console.log('產品選擇沒變化，使用緩存數據');
        setSelectedSelectorItems(currentlySelected);
      } else {
        console.log('產品選擇有變化，更新選擇器狀態');
        setSelectedSelectorItems(currentlySelected);
        // 更新記錄
        previousSelectedItems.current.products = [...currentlySelected];
      }
      
      setShowSelector(true);
    } 
    else if (type === 'applicable_products') {
      // 獲取目前已選取的適用商品
      const currentlySelected = formData.applicable_products || [];
      
      // 如果選擇的商品沒變，避免重新設置狀態和打開選擇器
      if (JSON.stringify(currentlySelected) === JSON.stringify(previousSelectedItems.current.applicable_products)) {
        console.log('適用產品選擇沒變化，使用緩存數據');
        setSelectedSelectorItems(currentlySelected);
      } else {
        console.log('適用產品選擇有變化，更新選擇器狀態');
        setSelectedSelectorItems(currentlySelected);
        // 更新記錄
        previousSelectedItems.current.applicable_products = [...currentlySelected];
      }
      
      setShowSelector(true);
    }
    else if (type === 'categories' || type === 'applicable_categories') {
      // 獲取目前已選取的分類
      const currentlySelected = type === 'categories' 
        ? formData.categories || [] 
        : formData.applicable_categories || [];
      
      // 如果選擇的分類沒變，避免重新設置狀態和打開選擇器
      const cacheKey = type === 'categories' ? 'categories' : 'applicable_categories';
      if (JSON.stringify(currentlySelected) === JSON.stringify(previousSelectedItems.current[cacheKey])) {
        console.log(`${cacheKey} 選擇沒變化，使用緩存數據`);
        setSelectedSelectorItems(currentlySelected);
      } else {
        console.log(`${cacheKey} 選擇有變化，更新選擇器狀態`);
        setSelectedSelectorItems(currentlySelected);
        // 更新記錄
        previousSelectedItems.current[cacheKey] = [...currentlySelected];
      }
      
      setShowSelector(true);
    }
    else if (type === 'users') {
      // 設置選擇器狀態
      setShowUserSelector(true);
    }
  }, [formData, selectorJustClosed]);

  // 開啟用戶選擇器
  const openUserSelector = useCallback(() => {
    setShowUserSelector(true);
  }, []);

  // 處理選擇的商品或分類項目
  const handleSelectedItems = (items, type) => {
    console.log(`Received selected ${type}:`, items);
    
    // 根據不同類型設置狀態
    if (type === 'products' || type === 'applicable_products') {
      // 產品選擇處理
      setSelectedSelectorItems(items);
      setSelectorType(type);
    } else if (type === 'categories' || type === 'applicable_categories') {
      // 分類選擇處理，確保能夠正確處理分類對象
      // 確保所有分類對象都具有必要的屬性
      const processedCategories = items.map(category => {
        if (!category) return null;
        
        // 確保分類對象具有完整的結構
        return {
          id: category.id,
          name: category.name || (category.child_category ? `${category.parent_category} - ${category.child_category}` : '未命名分類'),
          parent_category: category.parent_category || null,
          child_category: category.child_category || null,
          isCategory: true
        };
      }).filter(Boolean); // 過濾掉空值
      
      console.log('Processed categories:', processedCategories);
      setSelectedSelectorItems(processedCategories);
      setSelectorType(type);
    } else if (type === 'users') {
      // 用戶選擇處理
      setSelectedUsers(items);
    }
  };

  // 商品/分類選擇確認
  const handleSelectorConfirm = (items) => {
    if (selectorType === 'products') {
      // 確保所有商品都有必要的屬性
      const formattedProducts = items.map(item => ({
        id: item.id || item.spec_id || `product_${Math.random().toString(36).substring(2, 9)}`, // 確保ID存在
        spec_id: item.spec_id || null,
        product_id: item.product_id || null,
        product_main_id: item.product_main_id || item.product_id || null,
        name: item.name || item.product_name || '未命名商品',
        sku: item.sku || '',
        price: item.price || 0,
        color: item.color === 'null' ? null : (item.color || null),
        size: item.size === 'null' ? null : (item.size || null),
        image: item.image || ''
      }));
      
      // 更新表單資料
      setFormData(prev => ({
        ...prev,
        products: formattedProducts
      }));
      
      // 標記表單已修改
      setIsDirty(true);
      
      // 記錄日誌
      console.log('已選擇商品:', formattedProducts);
    } 
    else if (selectorType === 'applicable_products') {
      // 確保所有適用商品都有必要的屬性
      const formattedApplicableProducts = items.map(item => {
        // 正確獲取product_id和spec_id
        const productId = item.product_id || item.main_product_id || '';
        const specId = item.spec_id || '';
        
        // 產品資訊完整性檢查
        console.log('處理適用商品項目:', {
          name: item.name,
          product_id: productId,
          spec_id: specId
        });
        
        if (!productId) {
          console.warn('警告: 商品缺少product_id', item);
        }
        
        return {
          id: specId || `applicable_product_${Math.random().toString(36).substring(2, 9)}`,
          spec_id: specId, // 規格流水號
          product_id: productId, // 商品編號，如 "pa001"
          product_main_id: item.product_main_id || productId, // 主商品ID，用於分組
          name: item.name || item.product_name || '未命名商品',
          sku: item.sku || '',
          price: item.price || 0,
          color: item.color === 'null' ? null : (item.color || null),
          size: item.size === 'null' ? null : (item.size || null),
          image: item.image || '',
          stock: item.stock || 0,
          category_name: item.category_name || '',
          description: item.description || '',
          // 添加用於偵錯的訊息
          _debug_info: `product_id: ${productId}, spec_id: ${specId}, stock: ${item.stock || 0}`
        };
      });
      
      // 驗證並過濾無效數據
      const validProducts = formattedApplicableProducts.filter(product => {
        return product.product_id && product.name;
      });
      
      if (validProducts.length < formattedApplicableProducts.length) {
        console.warn(`已忽略 ${formattedApplicableProducts.length - validProducts.length} 個無效商品數據`);
      }
      
      // 更新表單資料
      setFormData(prev => ({
        ...prev,
        applicable_products: validProducts
      }));
      
      // 標記表單已修改
      setIsDirty(true);
      
      // 記錄日誌
      console.log('已選擇適用商品:', validProducts);
    }
    else if (selectorType === 'categories') {
      // 確保所有分類都有必要的屬性
      const formattedCategories = items.map(item => ({
        id: item.id || `category_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name || '未命名分類',
        parent_category: item.parent_category || null,
        child_category: item.child_category || null
      }));
      
      // 更新表單資料
      setFormData(prev => ({
        ...prev,
        categories: formattedCategories
      }));
      
      // 標記表單已修改
      setIsDirty(true);
      
      // 記錄日誌
      console.log('已選擇分類:', formattedCategories);
    }
    else if (selectorType === 'applicable_categories') {
      // 確保所有適用分類都有必要的屬性
      const formattedApplicableCategories = items.map(item => ({
        id: item.id || `applicable_category_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name || '未命名分類',
        parent_category: item.parent_category || null,
        child_category: item.child_category || null
      }));
      
      // 更新表單資料
      setFormData(prev => ({
        ...prev,
        applicable_categories: formattedApplicableCategories
      }));
      
      // 標記表單已修改
      setIsDirty(true);
      
      // 記錄日誌
      console.log('已選擇適用分類:', formattedApplicableCategories);
    }
    
    // 關閉選擇器
    setShowSelector(false);
  };

  // 處理啟用/禁用日期範圍
  const handleDateRangeToggle = (checked) => {
    if (!checked) {
      // 如果取消勾選，清空日期
      setFormData({...formData, start_date: "", end_date: ""});
      setDateError("");
    } else {
      // 如果勾選但尚未填寫日期，設置默認值為今天和一個月後
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        ...formData, 
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0]
      });
    }
  };

  // 驗證日期
  const validateDates = (startDate, endDate) => {
    // 如果狀態為已過期，則不對開始日期進行驗證
    if (formData.status === 'expired') {
      // 但仍需檢查是否有結束日期
      if (!endDate && type === 'campaigns') {
        setDateError("即使設為已結束狀態，仍需設定結束日期");
        return false;
      }
      setDateError("");
      return true;
    }
    
    // 優惠券的有效期間是可選項
    if (type === 'coupons') {
      // 如果啟用了日期範圍但未完整填寫，顯示錯誤
      if ((startDate && !endDate) || (!startDate && endDate)) {
        setDateError("請完整填寫開始和結束日期");
        return false;
      }
      
      // 如果沒有設置日期，視為有效
      if (!startDate && !endDate) {
        setDateError("");
        return true;
      }
    }

    // 行銷活動的有效期間是必填項
    if (type === 'campaigns' && (!startDate || !endDate)) {
      setDateError("請設定開始和結束日期");
      return false;
    }

    // 如果有填寫日期，則進行有效性驗證
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // 設置為今天的開始時間，以便比較日期

      // 如果是已啟用狀態，但結束日期已過，提醒用戶
      if (formData.status === 'active' && isExpired(endDate)) {
        setDateError("結束日期已過，將自動設為已過期狀態");
        // 自動設為已過期狀態
        setTimeout(() => {
          setFormData({...formData, status: 'expired'});
        }, 0);
        return false;
      }

      // 如果是新增且不是已過期狀態，開始日期不能早於今天
      if (start < now && mode === 'add' && formData.status !== 'expired') {
        setDateError("開始日期不能早於今天");
        return false;
      }

      if (end < start) {
        setDateError("結束日期必須晚於或等於開始日期");
        return false;
      }
    }

    setDateError("");
    return true;
  };

  // 驗證優惠券代碼格式
  const validateCouponCode = (code) => {
    if (!code) return "優惠券代碼為必填";
    if (code.length < 5) return "優惠券代碼至少需要5碼";
    if (code.length > 10) return "優惠券代碼最多10碼";
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(code)) return "優惠券代碼必須以英文字母開頭，且只能包含英文字母和數字";
    return "";
  };

  // 檢查優惠券代碼是否存在
  const checkCouponCodeExists = async (code) => {
    try {
      setIsCheckingCode(true);
      const response = await apiService.get(`/coupons/check-code/${code}`);
      if (response.data.exists) {
        setCodeError("此優惠券代碼已存在");
        return true;
      }
      setCodeError("");
      return false;
    } catch (error) {
      console.error("檢查優惠券代碼時發生錯誤:", error);
      // 發生錯誤時不阻止用戶繼續，只顯示警告
      setCodeError("無法檢查優惠券代碼是否重複");
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  // 處理優惠券代碼變更
  const handleCodeChange = (e) => {
    const newCode = e.target.value.toUpperCase(); // 自動轉為大寫
    setFormData({...formData, code: newCode});
    
    // 即時驗證格式
    const formatError = validateCouponCode(newCode);
    setCodeError(formatError);
  };

  // 處理優惠券代碼失去焦點
  const handleCodeBlur = () => {
    const code = formData.code;
    const formatError = validateCouponCode(code);
    
    if (formatError) {
      setCodeError(formatError);
      return;
    }

    // 清除之前的 timeout
    if (codeCheckTimeout.current) {
      clearTimeout(codeCheckTimeout.current);
    }

    // 設定新的 timeout 以防止過於頻繁的 API 呼叫
    codeCheckTimeout.current = setTimeout(() => {
      if (mode === 'add' || (mode === 'edit' && code !== formData.originalCode)) {
        checkCouponCodeExists(code);
      }
    }, 300);
  };

  // 表單驗證
  const validateForm = (formData) => {
    const errors = {};

    // 基本驗證 - 名稱必填
    if (type === 'coupons') {
      if (!formData.title?.trim()) {
        errors.name = '優惠券名稱為必填';
      }
      
      if (!formData.code?.trim()) {
        errors.code = '優惠券代碼為必填';
      } else {
        // 驗證優惠券代碼格式
        const codeError = validateCouponCode(formData.code);
        if (codeError) {
          errors.code = codeError;
        }
      }
    } else {
      if (!formData.name?.trim()) {
        errors.name = '活動名稱為必填';
      }
    }

    // 日期驗證
    if (type === 'campaigns') {
      // 活動必須有日期範圍
      if (!formData.start_date) {
        errors.start_date = '開始日期為必填';
      }

      if (!formData.end_date) {
        errors.end_date = '結束日期為必填';
      }
    } else if (type === 'coupons' && isDateRangeEnabled) {
      // 優惠券如果啟用了日期範圍，則需要驗證
      if (!formData.start_date) {
        errors.start_date = '開始日期為必填';
      }

      if (!formData.end_date) {
        errors.end_date = '結束日期為必填';
      }
    }

    // 如果有開始和結束日期，檢查日期順序是否正確
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      // 確保日期有效
      if (isNaN(start.getTime())) {
        errors.start_date = '開始日期格式無效';
      }
      
      if (isNaN(end.getTime())) {
        errors.end_date = '結束日期格式無效';
      }
      
      // 檢查日期順序
      if (!errors.start_date && !errors.end_date && start > end) {
        errors.end_date = '結束日期不能早於開始日期';
      }
    }

    // 如果項目已過期但狀態為啟用，顯示警告
    if (isExpired(formData.end_date) && formData.status === 'active') {
      errors.status = '已過期項目無法設置為啟用狀態，請先修改結束日期';
    }

    // 檢查活動類型特定的必填欄位
    if (type === 'campaigns') {
      if (formData.type === 'discount') {
        if (!formData.discount_value) {
          errors.discount_value = '折扣值為必填';
        }
      } else if (formData.type === 'buy_x_get_y') {
        if (!formData.buy_quantity) {
          errors.buy_quantity = '購買數量為必填';
        }
        if (!formData.free_quantity) {
          errors.free_quantity = '贈送數量為必填';
        }
      } else if (formData.type === 'bundle') {
        if (!formData.bundle_quantity) {
          errors.bundle_quantity = '組合商品數量為必填';
        }
        if (!formData.bundle_discount) {
          errors.bundle_discount = '組合折扣為必填';
        }
      } else if (formData.type === 'flash_sale') {
        if (!formData.flash_sale_start_time) {
          errors.flash_sale_start_time = '限時特賣開始時間為必填';
        }
        if (!formData.flash_sale_end_time) {
          errors.flash_sale_end_time = '限時特賣結束時間為必填';
        }
        if (!formData.flash_sale_discount) {
          errors.flash_sale_discount = '限時特賣折扣為必填';
        }
      }
    }

    return errors;
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 先確保 users 欄位為陣列
    if (!Array.isArray(formData.users)) {
      const updatedFormData = {
        ...formData,
        users: []
      };
      setFormData(updatedFormData);
      // 使用更新後的資料進行驗證
      const errors = validateForm(updatedFormData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        
        // 顯示第一個錯誤訊息
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }
      
      // 繼續處理提交，使用更新後的資料
      proceedWithSubmit(e, updatedFormData);
    } else {
      // 使用原始資料進行驗證
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        
        // 顯示第一個錯誤訊息
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }
      
      // 繼續處理提交，使用原始資料
      proceedWithSubmit(e, formData);
    }
  };
  
  // 實際處理提交的函數
  const proceedWithSubmit = (e, dataToSubmit) => {
    // 確保 users 欄位為陣列
    const submitData = { 
      ...dataToSubmit,
      users: Array.isArray(dataToSubmit.users) ? dataToSubmit.users : []
    };

    // 確保日期格式正確 (YYYY-MM-DD)
    if (submitData.start_date) {
      const startDate = new Date(submitData.start_date);
      submitData.start_date = startDate.toISOString().split('T')[0];
    }
    
    if (submitData.end_date) {
      const endDate = new Date(submitData.end_date);
      submitData.end_date = endDate.toISOString().split('T')[0];
    }

    // 確保數值欄位被轉換為數值類型
    if (submitData.discount_value !== undefined && submitData.discount_value !== null && submitData.discount_value !== '') {
      // 確保保留原始精確值，不要使用Number轉換
      submitData.discount_value = submitData.discount_value.toString();
    }
    
    // 確保其他數值欄位也被轉換為數值類型
    const numericFields = ['min_purchase_amount', 'usage_limit', 'buy_quantity', 'free_quantity', 'bundle_quantity', 'bundle_discount', 'flash_sale_discount'];
    numericFields.forEach(field => {
      if (submitData[field] !== undefined && submitData[field] !== null && submitData[field] !== '') {
        submitData[field] = Number(submitData[field]);
      }
    });

    // 如果已過期，強制設置狀態為 disabled
    if (isExpired(submitData.end_date)) {
      submitData.status = 'disabled';
    }

    setIsSubmitting(true);
    try {
      console.log('提交資料:', submitData);
      onSubmit(e, submitData);
    } catch (error) {
      console.error("提交表單時發生錯誤:", error);
      toast.error("提交表單時發生錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 初始化表單狀態
  useEffect(() => {
    if (isOpen) {
      // 如果表單已經有開始或結束日期，設置日期範圍為啟用
      setIsDateRangeEnabled(!!(formData.start_date || formData.end_date));
      
      // 設置初始狀態，防止未定義
      setFormErrors({});
      setHasChanges(false);
      
      // 如果沒有狀態設置，默認為 active
      if (!formData.status) {
        const updatedFormData = {
          ...formData,
          status: 'active'
        };
        setFormData(updatedFormData);
      }
      
      // 確保 users 欄位為陣列
      if (!Array.isArray(formData.users)) {
        const updatedFormData = {
          ...formData,
          users: []
        };
        setFormData(updatedFormData);
      }
      
      // 如果項目已過期但狀態為啟用，自動修正狀態
      if (isExpired(formData.end_date) && formData.status === 'active') {
        const updatedFormData = {
          ...formData,
          status: 'disabled'
        };
        setFormData(updatedFormData);
        toast("由於日期已過期，狀態已自動設為停用", {
          icon: '📝',
          style: {
            background: '#2196F3',
            color: '#fff',
          }
        });
      }
      
      // 確保日期格式正確 (YYYY-MM-DD)
      let formDataUpdated = false;
      let updatedData = {...formData};
      
      if (formData.start_date) {
        const formattedStartDate = formatDate(formData.start_date);
        if (formattedStartDate !== formData.start_date) {
          updatedData.start_date = formattedStartDate;
          formDataUpdated = true;
        }
      }
      
      if (formData.end_date) {
        const formattedEndDate = formatDate(formData.end_date);
        if (formattedEndDate !== formData.end_date) {
          updatedData.end_date = formattedEndDate;
          formDataUpdated = true;
        }
      }
      
      if (formDataUpdated) {
        setFormData(updatedData);
      }
      
      // 確保狀態是否已正確設置，避免未定義問題
      console.log("打開表單：", { mode, type, formData });
    }
  }, [isOpen]);

  // 處理表單變更（優化版）
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 標記表單已修改
    setIsDirty(true);
    
    // 清除該欄位的錯誤 (如果有)
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  // 折價券底部表單
  const renderCouponForm = () => (
    <div className="mt-4 space-y-6">
      {/* 基本設定 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基本設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">開始時間</label>
            <input
              type="datetime-local"
              className={inputClasses}
              value={formData.start_time || ''}
              onChange={(e) => handleFormChange('start_time', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium">結束時間</label>
            <input
              type="datetime-local"
              className={inputClasses}
              value={formData.end_time || ''}
              onChange={(e) => handleFormChange('end_time', e.target.value)}
            />
          </div>
        </div>
        {/* 日期時間錯誤 */}
        {dateRangeError && (
          <div className="text-red-500 flex items-center text-sm">
            <AlertCircleIcon className="h-4 w-4 mr-1" />
            <span>{dateRangeError}</span>
          </div>
        )}
      </div>

      {/* 折扣設定 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">折扣設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">折扣類型</label>
            <select
              className={inputClasses}
              value={formData.discount_type || 'percentage'}
              onChange={(e) => handleFormChange('discount_type', e.target.value)}
            >
              <option value="percentage">百分比折扣</option>
              <option value="fixed">固定金額折扣</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block font-medium">
              {formData.discount_type === 'fixed' ? '折扣金額' : '折扣百分比'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                className={inputClasses}
                value={formData.discount_value || ''}
                onChange={(e) => {
                  // 保持精確的數值
                  const value = e.target.value === '' ? '' : e.target.value;
                  handleFormChange('discount_value', value);
                }}
                step="any"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.discount_type === 'fixed' ? 'NT$' : '%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 使用條件 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">使用條件</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">最低消費金額</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                className={inputClasses}
                value={formData.min_purchase_amount || ''}
                onChange={(e) => handleFormChange('min_purchase_amount', e.target.value)}
                placeholder="不限制請留空"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">NT$</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-medium">使用次數上限</label>
            <input
              type="number"
              min="0"
              className={inputClasses}
              value={formData.usage_limit || ''}
              onChange={(e) => handleFormChange('usage_limit', e.target.value)}
              placeholder="不限制請留空"
            />
          </div>
        </div>
      </div>

      {/* 適用範圍設定 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">適用範圍</h3>
          {/* 添加總覽按鈕 */}
          {(formData.products?.length > 0 || formData.categories?.length > 0 || formData.users?.length > 0) && (
            <button
              type="button"
              onClick={() => setShowApplicableModal(true)}
              className="flex items-center text-sm font-medium text-brandBlue-normal hover:text-brandBlue-dark transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              總覽
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block font-medium">適用商品</label>
              <button
                type="button"
                className="text-sm text-brandBlue-normal hover:text-brandBlue-dark transition-colors"
                onClick={() => openSelector('products')}
              >
                選擇商品
              </button>
            </div>
            <div className="border rounded-md p-2 min-h-[40px] bg-gray-50 text-sm">
              {formData.products && formData.products.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.products.map(item => (
                    <div key={item.id} className="inline-flex items-center bg-white rounded-full pl-2 pr-1 py-1 text-xs border">
                      <span className="truncate max-w-[150px]">
                        {item.name}
                        {item.color && item.color !== 'null' && ` (${item.color})`}
                        {item.size && item.size !== 'null' && ` (${item.size})`}
                      </span>
                      <button 
                        className="ml-1 text-gray-500 hover:text-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                        onClick={() => removeItem('products', item.id)}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">所有商品</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block font-medium">適用分類</label>
              <button
                type="button"
                className="text-sm text-brandBlue-normal hover:text-brandBlue-dark transition-colors"
                onClick={() => openSelector('categories')}
              >
                選擇分類
              </button>
            </div>
            <div className="border rounded-md p-2 min-h-[40px] bg-gray-50 text-sm">
              {formData.categories && formData.categories.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.categories.map(item => (
                    <div key={item.id} className="inline-flex items-center bg-white rounded-full pl-2 pr-1 py-1 text-xs border">
                      <span className="truncate max-w-[150px]">{item.name || item.child_category}</span>
                      <button 
                        className="ml-1 text-gray-500 hover:text-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                        onClick={() => removeItem('categories', item.id)}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">所有分類</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 適用對象設定 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">適用對象</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="block font-medium">特定使用者</label>
            <button
              type="button"
              className="text-sm text-brandBlue-normal hover:text-brandBlue-dark transition-colors"
              onClick={() => openUserSelector()}
            >
              選擇使用者
            </button>
          </div>
          <div className="border rounded-md p-2 min-h-[40px] bg-gray-50 text-sm">
            {formData.users && formData.users.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {formData.users.map(item => (
                  <div key={item.id} className="inline-flex items-center bg-white rounded-full pl-2 pr-1 py-1 text-xs border">
                    <span className="truncate max-w-[150px]">{item.name || item.email}</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={() => removeItem('users', item.id)}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">所有使用者</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 適用產品概覽視窗
  const renderApplicableModal = () => {
    const renderItem = (item) => {
      // 根據不同的項目類型顯示不同的內容
      if (item.isParent) {
        // 這是一個父分類
        return (
          <div key={item.id} className="p-3 border-b last:border-b-0">
            <div className="flex items-center">
              <FolderIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium">{item.name}</span>
            </div>
          </div>
        );
      } else if (item.color !== undefined || item.size !== undefined) {
        // 這是一個商品規格
        return (
          <div key={item.id} className="p-3 border-b last:border-b-0 flex items-center space-x-2">
            {item.image && (
              <div className="w-12 h-12 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=無圖片" }}
                />
              </div>
            )}
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {item.sku && <span>SKU: {item.sku}</span>}
                {item.color && item.color !== 'null' && (
                  <span className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-1 inline-block border border-gray-300"
                      style={{ 
                        backgroundColor: 
                          item.color.toLowerCase() === 'black' ? '#000' :
                          item.color.toLowerCase() === 'white' ? '#fff' :
                          item.color.toLowerCase() === 'grey' || item.color.toLowerCase() === 'gray' ? '#808080' :
                          item.color.toLowerCase()
                      }}
                    />
                    {item.color}
                  </span>
                )}
                {item.size && item.size !== 'null' && <span>尺寸: {item.size}</span>}
                {item.stock !== undefined && <span>庫存: {item.stock}</span>}
              </div>
            </div>
          </div>
        );
      } else if (item.child_category) {
        // 這是一個子分類
        return (
          <div key={item.id} className="p-3 border-b last:border-b-0">
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span>{item.child_category}</span>
              {item.parent_category && (
                <span className="text-xs text-gray-500 ml-2">
                  (屬於 {item.parent_category})
                </span>
              )}
            </div>
          </div>
        );
      } else if (item.email) {
        // 這是一個使用者
        return (
          <div key={item.id} className="p-3 border-b last:border-b-0">
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-gray-500">{item.email}</span>
            </div>
          </div>
        );
      } else {
        // 一般項目
        return (
          <div key={item.id} className="p-3 border-b last:border-b-0">
            <span>{item.name || item.title || `項目 #${item.id}`}</span>
          </div>
        );
      }
    };

    // 選擇要顯示的數據（根據表單類型）
    const productsToDisplay = formData.type === 'coupon' ? formData.products : formData.applicable_products;
    const categoriesToDisplay = formData.type === 'coupon' ? formData.categories : formData.applicable_categories;

    // 按類型對項目進行分組
    const groupedProducts = {};
    
    // 商品分組
    if (productsToDisplay && productsToDisplay.length > 0) {
      productsToDisplay.forEach(product => {
        const productName = product.name;
        if (!groupedProducts[productName]) {
          groupedProducts[productName] = {
            name: productName,
            items: []
          };
        }
        groupedProducts[productName].items.push(product);
      });
    }

    return (
      <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center 
        ${showApplicableModal ? "opacity-100" : "opacity-0 pointer-events-none"} 
        transition-opacity duration-300`}
      >
        <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold">適用範圍總覽</h3>
            <button 
              onClick={() => setShowApplicableModal(false)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y">
            {/* 適用分類 */}
            {categoriesToDisplay && categoriesToDisplay.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                  <FolderIcon className="h-4 w-4 mr-1" />
                  適用分類 ({categoriesToDisplay.length})
                </h4>
                <div className="border rounded-md divide-y">
                  {categoriesToDisplay.map(renderItem)}
                </div>
              </div>
            )}
            
            {/* 適用商品 */}
            {productsToDisplay && productsToDisplay.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                  <ShoppingBagIcon className="h-4 w-4 mr-1" />
                  適用商品 ({productsToDisplay.length})
                </h4>
                
                {Object.keys(groupedProducts).length > 0 ? (
                  <div className="space-y-4">
                    {Object.values(groupedProducts).map((group, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <div className="p-2 bg-gray-50 font-medium">
                          {group.name} ({group.items.length} 個規格)
                        </div>
                        <div className="divide-y">
                          {group.items.map(renderItem)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {productsToDisplay.map(renderItem)}
                  </div>
                )}
              </div>
            )}
            
            {/* 適用使用者 */}
            {formData.users && formData.users.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  適用使用者 ({formData.users.length})
                </h4>
                <div className="border rounded-md divide-y">
                  {formData.users.map(renderItem)}
                </div>
              </div>
            )}
            
            {/* 沒有適用範圍 */}
            {(!categoriesToDisplay || categoriesToDisplay.length === 0) && 
             (!productsToDisplay || productsToDisplay.length === 0) && 
             (!formData.users || formData.users.length === 0) && (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-gray-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
                <p className="mb-2">尚未設定任何適用範圍</p>
                <p className="text-sm">請選擇適用的商品、分類或使用者</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <button
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition-colors"
              onClick={() => setShowApplicableModal(false)}
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 處理編輯模式的資料載入
  useEffect(() => {
    // 只有在編輯模式開啟且還未初始化時才執行
    if (isOpen && mode === 'edit' && formData && !formInitialized.current) {
      // 標記已初始化，避免重複執行
      formInitialized.current = true;
      
      // 確保適用商品資料格式正確
      let applicable_products = formData.applicable_products || [];
      if (typeof applicable_products === 'string') {
        try {
          applicable_products = JSON.parse(applicable_products);
        } catch (error) {
          console.error('解析適用商品資料錯誤:', error);
          applicable_products = [];
        }
      }
      
      // 確保適用分類資料格式正確
      let applicable_categories = formData.applicable_categories || [];
      if (typeof applicable_categories === 'string') {
        try {
          applicable_categories = JSON.parse(applicable_categories);
        } catch (error) {
          console.error('解析適用分類資料錯誤:', error);
          applicable_categories = [];
        }
      }
      
      // 確保使用者資料格式正確
      let users = formData.users || [];
      if (typeof users === 'string') {
        try {
          users = JSON.parse(users);
        } catch (error) {
          console.error('解析使用者資料錯誤:', error);
          users = [];
        }
      }
      
      // 更新表單資料，確保所有物件都有正確的格式
      setFormData(prev => ({
        ...prev,
        applicable_products: applicable_products.map(item => ({
          id: item.id || item.spec_id,
          spec_id: item.spec_id,
          product_id: item.product_id || item.id,
          product_main_id: item.product_main_id,
          name: item.name || item.product_name || '未命名商品',
          sku: item.sku || '',
          price: item.price || 0,
          color: item.color || null,
          size: item.size || null,
          image: item.image || '',
          // 確保不會丟失任何重要屬性
          stock: item.stock,
          category_name: item.category_name || item.category,
          description: item.description
        })),
        applicable_categories: applicable_categories.map(item => ({
          id: item.id,
          name: item.name || `${item.parent_category} - ${item.child_category}`,
          parent_category: item.parent_category,
          child_category: item.child_category
        })),
        users: users.map(user => ({
          id: user.id,
          name: user.name || '未命名用戶',
          email: user.email || '',
          phone: user.phone || '',
          created_at: user.created_at || null
        }))
      }));
    }
    
    // 當模態視窗關閉時重置初始化狀態
    if (!isOpen) {
      formInitialized.current = false;
    }
  }, [isOpen, mode]); // 移除 formData 依賴，避免循環

  // 處理使用者選擇器確認
  const handleUserSelectorConfirm = (selectedUsers) => {
    // 確保所有使用者都有必要的屬性
    const formattedUsers = selectedUsers.map(user => ({
      id: user.id,
      name: user.name || '未命名用戶',
      email: user.email || '',
      phone: user.phone || '',
      created_at: user.created_at || null
    }));
    
    // 更新表單資料
    setFormData(prev => ({
      ...prev,
      users: formattedUsers
    }));
    
    // 標記表單已修改
    setIsDirty(true);
    
    // 記錄日誌
    console.log('已選擇使用者:', formattedUsers);
    
    // 關閉使用者選擇器
    setShowUserSelector(false);
  };

  // 優化適用範圍清單的處理
  const renderApplicableProducts = useCallback(() => {
    const products = formData.applicable_products || [];
    if (!products.length) return <div className="text-gray-500 italic">尚未選擇適用商品</div>;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {products.map((product, index) => (
          <div 
            key={`product-${product.id}-${index}`}
            className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
          >
            <span className="truncate max-w-[200px]">
              {product.name}
              {product.color && product.size && ` (${product.color}/${product.size})`}
              {product.color && !product.size && ` (${product.color})`}
              {!product.color && product.size && ` (${product.size})`}
            </span>
            <button
              type="button"
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                const newProducts = formData.applicable_products.filter(p => 
                  p.id !== product.id
                );
                setFormData(prev => ({
                  ...prev,
                  applicable_products: newProducts
                }));
                setIsDirty(true);
              }}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }, [formData.applicable_products]);
  
  // 優化適用分類清單的處理
  const renderApplicableCategories = useCallback(() => {
    const categories = formData.applicable_categories || [];
    if (!categories.length) return <div className="text-gray-500 italic">尚未選擇適用分類</div>;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {categories.map((category, index) => (
          <div 
            key={`category-${category.id}-${index}`}
            className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
          >
            <span className="truncate max-w-[200px]">
              {category.name || `${category.parent_category} - ${category.child_category}`}
            </span>
            <button
              type="button"
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                const newCategories = formData.applicable_categories.filter(c => 
                  c.id !== category.id
                );
                setFormData(prev => ({
                  ...prev,
                  applicable_categories: newCategories
                }));
                setIsDirty(true);
              }}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }, [formData.applicable_categories]);
  
  // 優化指定會員清單的處理
  const renderUsers = useCallback(() => {
    const users = formData.users || [];
    if (!users.length) return <div className="text-gray-500 italic">尚未選擇指定會員</div>;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {users.map((user, index) => (
          <div 
            key={`user-${user.id}-${index}`}
            className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
          >
            <span className="truncate max-w-[200px]">
              {user.name} ({user.email})
            </span>
            <button
              type="button"
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                const newUsers = formData.users.filter(u => 
                  u.id !== user.id
                );
                setFormData(prev => ({
                  ...prev,
                  users: newUsers
                }));
                setIsDirty(true);
              }}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }, [formData.users]);

  // 監聽模態窗口打開和關閉
  useEffect(() => {
    if (isOpen) {
      // 模態窗口打開時的初始化邏輯
      if (mode === 'edit') {
        // 在編輯模式下，設置日期範圍開關狀態
        setIsDateRangeEnabled(Boolean(formData.start_date || formData.end_date));
      } else {
        // 在新增模式下重置表單狀態
        setIsDirty(false);
        
        // 如果是活動類型，默認設置日期範圍
        if (type === 'campaigns') {
          // 活動默認必須有日期範圍
          setIsDateRangeEnabled(true);
        } else {
          // 優惠券可以選擇是否有日期範圍
          setIsDateRangeEnabled(false);
        }
      }
    } else {
      // 模態窗口關閉時的清理邏輯
      setFormErrors({});
      setIsDirty(false);
      formInitialized.current = false;
    }
  }, [isOpen, mode, type]);

  // 修改選擇器關閉處理函數，防止立即重新打開
  const handleSelectorClose = useCallback(() => {
    setShowSelector(false);
    // 設置標記，表明選擇器剛剛關閉
    setSelectorJustClosed(true);
    
    // 100ms 後重置標記，允許再次打開選擇器
    setTimeout(() => {
      setSelectorJustClosed(false);
    }, 100);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all ease-in-out duration-300"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div 
            ref={modalRef}
            className={cn(
              "bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-all ease-out duration-300 animate-in fade-in-0 zoom-in-95 will-change-transform will-change-opacity",
              "border border-border relative"
            )}
            onClick={(e) => {
              e.stopPropagation();
              // 阻止事件冒泡，防止點擊模態窗內部時觸發外層的關閉
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            {/* 標題區域 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'add' ? '新增' : '編輯'}{type === 'coupons' ? '優惠券' : '行銷活動'}
                </h2>
                {mode === 'edit' && (
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isExpired(formData.end_date) ? "bg-red-100 text-red-800" :
                    isScheduled(formData.start_date) && formData.status === 'active' ? "bg-blue-100 text-blue-800" :
                    formData.status === 'active' ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  )}>
                    {isExpired(formData.end_date) ? 
                      (type === 'coupons' ? '已過期' : '已結束') :
                      isScheduled(formData.start_date) && formData.status === 'active' ? 
                      (type === 'coupons' ? '排程中' : '即將開始') : 
                      formData.status === 'active' ? (type === 'coupons' ? '啟用' : '進行中') : 
                      (type === 'coupons' ? '停用' : '已停用')}
                  </div>
                )}
              </div>
              <button 
                onClick={handleCloseRequest}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="關閉"
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* 表單區域 */}
            <div className="p-4 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 狀態選擇 */}
                <div className="space-y-2">
                  <Label htmlFor="status">狀態</Label>
                  <Select 
                    value={formData.status || 'active'}
                    onValueChange={(value) => {
                      // 檢查如果狀態設為active，但項目已過期
                      if (value === 'active' && isExpired(formData.end_date)) {
                        toast.error('已過期項目無法設為啟用狀態，請先修改結束日期');
                        return;
                      }
                      
                      setFormData({...formData, status: value});
                    }}
                  >
                    <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">啟用</SelectItem>
                      <SelectItem value="disabled">停用</SelectItem>
                    </SelectContent>
                  </Select>
                  {isExpired(formData.end_date) && formData.status === 'active' && (
                    <p className="text-amber-500 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      此{type === 'coupons' ? '優惠券' : '活動'}已過期，無法設為啟用狀態
                    </p>
                  )}
                  {isScheduled(formData.start_date) && (
                    <p className="text-blue-500 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      此{type === 'coupons' ? '優惠券' : '活動'}尚未開始，將在開始日期後自動啟用
                    </p>
                  )}
                  {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
                </div>
                
                {/* 允許與其他優惠併用 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="can_combine" 
                      checked={formData.can_combine || false}
                      onCheckedChange={(checked) => {
                        setFormData({...formData, can_combine: checked});
                      }}
                    />
                    <Label htmlFor="can_combine" className="font-normal">
                      允許與其他優惠併用
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    {type === 'coupons' 
                      ? '若勾選，此優惠券可以與行銷活動折扣一起使用'
                      : '若勾選，此活動可以與優惠券一起使用'}
                  </p>
                </div>

                {/* 適用對象選擇 */}
                {type === 'coupons' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">優惠券名稱</Label>
                      <Input
                        id="title"
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        required
                        placeholder="輸入優惠券名稱"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">優惠碼</Label>
                      <div className="relative">
                        <Input
                          id="code"
                          type="text"
                          value={formData.code || ""}
                          onChange={(e) => {
                            const newCode = e.target.value.toUpperCase(); // 自動轉為大寫
                            handleFormChange('code', newCode);
                            
                            // 即時驗證格式
                            const formatError = validateCouponCode(newCode);
                            setCodeError(formatError);
                          }}
                          onBlur={handleCodeBlur}
                          className={cn(
                            "uppercase",
                            codeError && "border-destructive focus-visible:ring-destructive"
                          )}
                          required
                          maxLength={10}
                          placeholder="例：SUMMER2024"
                          disabled={isCheckingCode}
                        />
                        {isCheckingCode && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-brandBlue-normal border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {codeError && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircleIcon className="h-4 w-4" />
                          {codeError}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        • 優惠碼必須以英文字母開頭
                        <br />
                        • 長度為5-10個字元
                        <br />
                        • 僅能使用英文字母和數字
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount_type">折扣類型</Label>
                      <Select
                        value={formData.discount_type || "percentage"}
                        onValueChange={(value) => setFormData({...formData, discount_type: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選擇折扣類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">百分比折扣</SelectItem>
                          <SelectItem value="fixed">固定金額折扣</SelectItem>
                          <SelectItem value="shipping">免運費</SelectItem>
                          <SelectItem value="buy_x_get_y">買X送Y</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 根據折扣類型顯示不同的輸入欄位 */}
                    {formData.discount_type === 'buy_x_get_y' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buy_quantity">購買數量</Label>
                          <Input
                            id="buy_quantity"
                            type="number"
                            value={formData.buy_quantity || ""}
                            onChange={(e) => setFormData({...formData, buy_quantity: e.target.value})}
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="free_quantity">贈送數量</Label>
                          <Input
                            id="free_quantity"
                            type="number"
                            value={formData.free_quantity || ""}
                            onChange={(e) => setFormData({...formData, free_quantity: e.target.value})}
                            min="1"
                            required
                          />
                        </div>
                      </div>
                    ) : formData.discount_type !== 'shipping' && (
                      <div className="space-y-2">
                        <Label htmlFor="discount_value">
                          折扣值{formData.discount_type === 'percentage' ? ' (%)' : ' (NT$)'}
                        </Label>
                        <input
                          type="number"
                          min="0"
                          id="discount_value"
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          value={formData.discount_value || ""}
                          onChange={(e) => {
                            // 保持精確的數值
                            const value = e.target.value === '' ? '' : e.target.value;
                            setFormData({...formData, discount_value: value});
                          }}
                          step="any"
                        />
                      </div>
                    )}

                    {/* 適用範圍選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>適用商品</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedSelectorItems(formData.applicable_products || []);
                            setSelectorType('applicable_products');
                            setShowSelector(true);
                          }}
                        >
                          選擇商品
                        </Button>
                      </div>
                      {renderApplicableProducts()}
                    </div>

                    {/* 新增適用分類選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>適用分類</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedSelectorItems(formData.applicable_categories || []);
                            setSelectorType('applicable_categories');
                            setShowSelector(true);
                          }}
                        >
                          選擇分類
                        </Button>
                      </div>
                      {renderApplicableCategories()}
                    </div>

                    {/* 使用條件 */}
                    <div className="space-y-2">
                      <Label htmlFor="min_purchase">最低消費金額 (NT$)</Label>
                      <Input
                        id="min_purchase"
                        type="number"
                        value={formData.min_purchase || ""}
                        onChange={(e) => handleFormChange('min_purchase', e.target.value)}
                        placeholder="0 表示無最低消費限制"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usage_limit">使用次數限制</Label>
                      <Input
                        id="usage_limit"
                        type="number"
                        value={formData.usage_limit || ""}
                        onChange={(e) => handleFormChange('usage_limit', e.target.value)}
                        placeholder="0 表示無使用次數限制"
                      />
                    </div>

                    {/* 在優惠券表單中添加會員選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>指定會員</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowUserSelector(true);
                          }}
                        >
                          選擇會員
                        </Button>
                      </div>
                      {renderUsers()}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canCombine"
                        checked={formData.canCombine || false}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, canCombine: checked})
                        }
                      />
                      <Label htmlFor="canCombine" className="text-sm text-gray-600">
                        允許與其他優惠併用
                      </Label>
                    </div>

                    {/* 日期範圍選擇 */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="date_range" className="font-medium">使用期限</Label>
                          {!isDateRangeEnabled && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">永久有效</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{isDateRangeEnabled ? '已啟用' : '未啟用'}</span>
                          <Switch
                            id="date_range_toggle"
                            checked={isDateRangeEnabled}
                            onCheckedChange={value => {
                              setIsDateRangeEnabled(value);
                              if (!value) {
                                // 清除日期並刪除相關錯誤
                                handleFormChange('start_date', '');
                                handleFormChange('end_date', '');
                                
                                // 清除日期相關錯誤
                                if (formErrors.start_date || formErrors.end_date) {
                                  const newErrors = { ...formErrors };
                                  delete newErrors.start_date;
                                  delete newErrors.end_date;
                                  setFormErrors(newErrors);
                                }
                              } else {
                                // 啟用日期範圍時，設定默認值
                                const today = new Date();
                                const nextMonth = new Date();
                                nextMonth.setMonth(today.getMonth() + 1);
                                
                                handleFormChange('start_date', formatDate(today));
                                handleFormChange('end_date', formatDate(nextMonth));
                              }
                            }}
                            className="data-[state=checked]:bg-brandBlue-normal"
                          />
                        </div>
                      </div>
                      
                      {isDateRangeEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="start_date">開始日期 <span className="text-red-500">*</span></Label>
                            <Input
                              id="start_date"
                              name="start_date"
                              type="date"
                              value={formData.start_date || ''}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                handleFormChange('start_date', newDate);
                                
                                // 如果結束日期早於新的開始日期，自動調整結束日期
                                if (formData.end_date && new Date(newDate) > new Date(formData.end_date)) {
                                  // 把結束日期設為開始日期
                                  handleFormChange('end_date', newDate);
                                  toast("已自動調整結束日期與開始日期一致", {
                                    icon: '📅',
                                    style: {
                                      background: '#2196F3',
                                      color: '#fff',
                                    }
                                  });
                                }
                              }}
                              className={formErrors.start_date ? "border-red-500" : ""}
                              required
                            />
                            {formErrors.start_date && <p className="text-red-500 text-sm">{formErrors.start_date}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="end_date">結束日期 <span className="text-red-500">*</span></Label>
                            <Input
                              id="end_date"
                              name="end_date"
                              type="date"
                              value={formData.end_date || ''}
                              min={formData.start_date} // 限制結束日期不能早於開始日期
                              onChange={(e) => {
                                const newDate = e.target.value;
                                handleFormChange('end_date', newDate);
                                
                                // 驗證結束日期不能早於開始日期
                                if (formData.start_date && new Date(newDate) < new Date(formData.start_date)) {
                                  setFormErrors({
                                    ...formErrors,
                                    end_date: '結束日期不能早於開始日期'
                                  });
                                } else {
                                  // 清除此欄位的錯誤
                                  if (formErrors.end_date) {
                                    const newErrors = { ...formErrors };
                                    delete newErrors.end_date;
                                    setFormErrors(newErrors);
                                  }
                                  
                                  // 如果項目過期但狀態為啟用，提示用戶
                                  if (isExpired(newDate) && formData.status === 'active') {
                                    setFormErrors({
                                      ...formErrors,
                                      status: '已過期項目無法設置為啟用狀態，請先修改結束日期或狀態'
                                    });
                                  }
                                }
                              }}
                              className={formErrors.end_date ? "border-red-500" : ""}
                              required
                            />
                            {formErrors.end_date && <p className="text-red-500 text-sm">{formErrors.end_date}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows="3"
                        placeholder="輸入描述文字..."
                      />
                    </div>
                  </>
                ) : (
                  // 活動表單
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">活動名稱</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                        placeholder="例：夏季特賣會"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">活動類型</Label>
                      <Select
                        value={formData.type || "discount"}
                        onValueChange={(value) => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選擇活動類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">折扣優惠</SelectItem>
                          <SelectItem value="buy_x_get_y">買X送Y</SelectItem>
                          <SelectItem value="bundle">組合優惠</SelectItem>
                          <SelectItem value="flash_sale">限時特價</SelectItem>
                          <SelectItem value="free_shipping">免運活動</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 根據活動類型顯示不同的設定選項 */}
                    {formData.type === 'discount' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount_method">折扣類型</Label>
                          <Select
                            value={formData.discount_method || "percentage"}
                            onValueChange={(value) => setFormData({...formData, discount_method: value})}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="選擇折扣類型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">百分比折扣</SelectItem>
                              <SelectItem value="fixed">固定金額折扣</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount_value">
                            折扣值{formData.discount_method === 'percentage' ? ' (%)' : ' (NT$)'}
                          </Label>
                          <input
                            type="number"
                            min="0"
                            id="discount_value"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            value={formData.discount_value || ""}
                            onChange={(e) => {
                              // 保持精確的數值
                              const value = e.target.value === '' ? '' : e.target.value;
                              setFormData({...formData, discount_value: value});
                            }}
                            step="any"
                          />
                        </div>
                      </div>
                    )}

                    {formData.type === 'buy_x_get_y' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buy_quantity">購買數量</Label>
                          <Input
                            id="buy_quantity"
                            type="number"
                            value={formData.buy_quantity || ""}
                            onChange={(e) => setFormData({...formData, buy_quantity: e.target.value})}
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="free_quantity">贈送數量</Label>
                          <Input
                            id="free_quantity"
                            type="number"
                            value={formData.free_quantity || ""}
                            onChange={(e) => setFormData({...formData, free_quantity: e.target.value})}
                            min="1"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {formData.type === 'bundle' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bundle_quantity">組合商品數量</Label>
                          <Input
                            id="bundle_quantity"
                            type="number"
                            value={formData.bundle_quantity || ""}
                            onChange={(e) => setFormData({...formData, bundle_quantity: e.target.value})}
                            min="2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bundle_discount">組合折扣 (%)</Label>
                          <Input
                            id="bundle_discount"
                            type="number"
                            value={formData.bundle_discount || ""}
                            onChange={(e) => setFormData({...formData, bundle_discount: e.target.value})}
                            min="0"
                            max="100"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* 活動特有欄位 */}
                    {type === 'campaigns' && formData.type === 'flash_sale' && (
                      <div className="sm:col-span-2 border p-4 rounded-md bg-gray-50 space-y-4">
                        <h3 className="font-medium text-gray-700">限時特賣設定</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="flash_sale_start_time">限時特賣開始時間</Label>
                            <Input
                              id="flash_sale_start_time"
                              name="flash_sale_start_time"
                              type="datetime-local"
                              value={formData.flash_sale_start_time || ''}
                              onChange={(e) => handleFormChange('flash_sale_start_time', e.target.value)}
                              className={formErrors.flash_sale_start_time ? "border-red-500" : ""}
                            />
                            {formErrors.flash_sale_start_time && <p className="text-red-500 text-sm">{formErrors.flash_sale_start_time}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="flash_sale_end_time">限時特賣結束時間</Label>
                            <Input
                              id="flash_sale_end_time"
                              name="flash_sale_end_time"
                              type="datetime-local"
                              value={formData.flash_sale_end_time || ''}
                              onChange={(e) => handleFormChange('flash_sale_end_time', e.target.value)}
                              className={formErrors.flash_sale_end_time ? "border-red-500" : ""}
                            />
                            {formErrors.flash_sale_end_time && <p className="text-red-500 text-sm">{formErrors.flash_sale_end_time}</p>}
                          </div>
                          <div className="space-y-1.5 col-span-2">
                            <Label htmlFor="flash_sale_discount">限時特賣折扣 (%)</Label>
                            <Input
                              id="flash_sale_discount"
                              name="flash_sale_discount"
                              type="number"
                              min="1"
                              max="99"
                              value={formData.flash_sale_discount || ''}
                              onChange={(e) => handleFormChange('flash_sale_discount', e.target.value)}
                              className={formErrors.flash_sale_discount ? "border-red-500" : ""}
                            />
                            {formErrors.flash_sale_discount && <p className="text-red-500 text-sm">{formErrors.flash_sale_discount}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 適用商品選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>適用商品</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedSelectorItems(formData.applicable_products || []);
                            setSelectorType('applicable_products');
                            setShowSelector(true);
                          }}
                        >
                          選擇商品
                        </Button>
                      </div>
                      {renderApplicableProducts()}
                    </div>

                    {/* 適用分類選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>適用分類</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedSelectorItems(formData.applicable_categories || []);
                            setSelectorType('applicable_categories');
                            setShowSelector(true);
                          }}
                        >
                          選擇分類
                        </Button>
                      </div>
                      {renderApplicableCategories()}
                    </div>

                    {/* 指定會員選擇 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>指定會員</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowUserSelector(true);
                          }}
                        >
                          選擇會員
                        </Button>
                      </div>
                      {renderUsers()}
                    </div>

                    {/* 活動限制 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock_limit">活動庫存限制</Label>
                        <Input
                          id="stock_limit"
                          type="number"
                          value={formData.stock_limit || ""}
                          onChange={(e) => handleFormChange('stock_limit', e.target.value)}
                          min="0"
                          placeholder="0 表示無限制"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="per_user_limit">每人限購數量</Label>
                        <Input
                          id="per_user_limit"
                          type="number"
                          value={formData.per_user_limit || ""}
                          onChange={(e) => handleFormChange('per_user_limit', e.target.value)}
                          min="0"
                          placeholder="0 表示無限制"
                        />
                      </div>
                    </div>

                    {/* 日期範圍選擇 - 活動必須有日期範圍 */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="date_range" className="font-medium">活動期限</Label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="start_date">開始日期 <span className="text-red-500">*</span></Label>
                          <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={formData.start_date || ''}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              handleFormChange('start_date', newDate);
                              
                              // 如果結束日期早於新的開始日期，自動調整結束日期
                              if (formData.end_date && new Date(newDate) > new Date(formData.end_date)) {
                                // 把結束日期設為開始日期
                                handleFormChange('end_date', newDate);
                                toast("已自動調整結束日期與開始日期一致", {
                                  icon: '📅',
                                  style: {
                                    background: '#2196F3',
                                    color: '#fff',
                                  }
                                });
                              }
                            }}
                            className={formErrors.start_date ? "border-red-500" : ""}
                            required
                          />
                          {formErrors.start_date && <p className="text-red-500 text-sm">{formErrors.start_date}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="end_date">結束日期 <span className="text-red-500">*</span></Label>
                          <Input
                            id="end_date"
                            name="end_date"
                            type="date"
                            value={formData.end_date || ''}
                            min={formData.start_date} // 限制結束日期不能早於開始日期
                            onChange={(e) => {
                              const newDate = e.target.value;
                              handleFormChange('end_date', newDate);
                              
                              // 驗證結束日期不能早於開始日期
                              if (formData.start_date && new Date(newDate) < new Date(formData.start_date)) {
                                setFormErrors({
                                  ...formErrors,
                                  end_date: '結束日期不能早於開始日期'
                                });
                              } else {
                                // 清除此欄位的錯誤
                                if (formErrors.end_date) {
                                  const newErrors = { ...formErrors };
                                  delete newErrors.end_date;
                                  setFormErrors(newErrors);
                                }
                                
                                // 如果項目過期但狀態為啟用，提示用戶
                                if (isExpired(newDate) && formData.status === 'active') {
                                  setFormErrors({
                                    ...formErrors,
                                    status: '已過期項目無法設置為啟用狀態，請先修改結束日期或狀態'
                                  });
                                }
                              }
                            }}
                            className={formErrors.end_date ? "border-red-500" : ""}
                            required
                          />
                          {formErrors.end_date && <p className="text-red-500 text-sm">{formErrors.end_date}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canCombine"
                        checked={formData.canCombine || false}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, canCombine: checked})
                        }
                      />
                      <Label htmlFor="canCombine" className="text-sm text-gray-600">
                        允許與其他優惠併用
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">活動描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows="3"
                        placeholder="請輸入活動相關說明..."
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseRequest}
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="default" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        處理中...
                      </div>
                    ) : (
                      mode === 'add' ? '新增' : '儲存'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Product/Category Selector Modal */}
            {showSelector && (
              <ProductCategorySelector
                isOpen={showSelector}
                onClose={handleSelectorClose} // 使用新的處理函數
                selectedItems={selectedSelectorItems}
                onConfirm={handleSelectorConfirm}
                type={selectorType}
              />
            )}

            {/* User Selector Modal */}
            <UserSelector
              isOpen={showUserSelector}
              onClose={() => setShowUserSelector(false)}
              selectedUsers={formData.users || []}
              onConfirm={handleUserSelectorConfirm}
            />
          </div>
        </div>
      )}

      {/* 未儲存資料關閉確認 */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all ease-in-out duration-300 animate-in fade-in-0" onClick={() => setShowCloseConfirmation(false)}>
          <div 
            className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md border animate-in fade-in-0 zoom-in-95 duration-300 ease-out will-change-transform will-change-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">確定要關閉嗎？</h3>
            <p className="text-gray-600 mb-4">
              {mode === 'add' ? 
                `您正在新增${type === 'coupons' ? '優惠券' : '活動'}，關閉視窗將會遺失已輸入的資料。` : 
                `您有尚未儲存的${type === 'coupons' ? '優惠券' : '活動'}變更，關閉視窗將會遺失這些修改。`}
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={handleCancelClose}
              >
                取消
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmClose}
              >
                確定關閉
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 適用產品概覽視窗 */}
      {renderApplicableModal()}
    </>
  );
};

export default MarketingModal; 