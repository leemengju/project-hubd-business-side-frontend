import { useEffect, useState, useRef } from "react";
import ProductCategorySelector from "./ProductCategorySelector";
import UserSelector from "./UserSelector";
import { cn } from "@/lib/utils";
import { XIcon, AlertCircleIcon } from "lucide-react";
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
import api from "../services/api";

const MarketingModal = ({ 
  isOpen, 
  onClose, 
  type, 
  mode, 
  formData, 
  setFormData, 
  onSubmit 
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(type === 'coupons' ? {
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
        description: "",
        users: [],
        canCombine: false // Reset canCombine
      } : {
        name: "",
        type: "discount",
        discount_value: "",
        start_date: "",
        end_date: "",
        applicable_categories: [],
        description: "",
        canCombine: false // Reset canCombine
      });
      setIsDirty(false);
    }
  }, [isOpen]);

  // 監控表單變更狀態
  useEffect(() => {
    if (isOpen) {
      setIsDirty(true);
    }
  }, [formData]);

  // 監聽ESC按鍵
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        // 先檢查確認視窗是否開啟，如果是則關閉確認視窗
        if (showCloseConfirmation) {
          setShowCloseConfirmation(false);
        } 
        // 如果確認視窗未開啟，則處理主視窗的關閉
        else if (isDirty) {
          setShowCloseConfirmation(true);
        } else {
          onClose();
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
    // 只有當滑鼠按下和放開都在視窗外時，才觸發關閉確認
    if (e.target === e.currentTarget && mouseDownOutside.current) {
      if (isDirty) {
        setShowCloseConfirmation(true);
      } else {
        onClose();
      }
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

  const handleSelectorConfirm = (selectedItems) => {
    if (type === 'coupons') {
      setFormData({
        ...formData,
        [selectorType]: selectedItems
      });
    } else {
      setFormData({
        ...formData,
        applicable_items: selectedItems
      });
    }
  };

  // 驗證日期
  const validateDates = (startDate, endDate) => {
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

      if (start < now && mode === 'add') {
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
      const response = await api.get(`/coupons/check-code/${code}`);
      if (response.data.exists) {
        setCodeError("此優惠券代碼已存在");
        return true;
      }
      setCodeError("");
      return false;
    } catch (error) {
      console.error("檢查優惠券代碼時發生錯誤:", error);
      setCodeError("檢查優惠券代碼時發生錯誤");
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

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === 'coupons') {
      const formatError = validateCouponCode(formData.code);
      if (formatError) {
        setCodeError(formatError);
        return;
      }

      if (mode === 'add' || (mode === 'edit' && formData.code !== formData.originalCode)) {
        const exists = await checkCouponCodeExists(formData.code);
        if (exists) return;
      }
    }
    
    // 驗證日期
    if (!validateDates(formData.start_date, formData.end_date)) {
      return;
    }

    onSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div 
          ref={modalRef}
          className={cn(
            "bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col",
            "border border-border"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題區域 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'add' ? '新增' : '編輯'}{type === 'coupons' ? '優惠券' : '行銷活動'}
            </h2>
            <button 
              onClick={() => {
                if (isDirty) {
                  setShowCloseConfirmation(true);
                } else {
                  onClose();
                }
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="關閉"
            >
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* 表單區域 */}
          <div className="p-4 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 日期錯誤提示 */}
              {dateError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span className="text-sm">{dateError}</span>
                </div>
              )}

              {type === 'coupons' ? (
                // 優惠券表單
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">優惠券名稱</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">優惠碼</Label>
                    <div className="relative">
                      <Input
                        id="code"
                        type="text"
                        value={formData.code || ""}
                        onChange={handleCodeChange}
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
                      <Input
                        id="discount_value"
                        type="number"
                        value={formData.discount_value || ""}
                        onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  {/* 適用範圍選擇 */}
                  <div className="space-y-2">
                    <Label>適用範圍</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectorType('products');
                          setShowSelector(true);
                        }}
                      >
                        選擇商品 ({formData.products?.length || 0})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectorType('categories');
                          setShowSelector(true);
                        }}
                      >
                        選擇分類 ({formData.categories?.length || 0})
                      </Button>
                    </div>
                  </div>

                  {/* 使用條件 */}
                  <div className="space-y-2">
                    <Label htmlFor="min_purchase">最低消費金額 (NT$)</Label>
                    <Input
                      id="min_purchase"
                      type="number"
                      value={formData.min_purchase || ""}
                      onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage_limit">使用次數限制</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit || ""}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    />
                  </div>

                  {/* 在優惠券表單中添加會員選擇 */}
                  <div className="space-y-2">
                    <Label>指定會員</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUserSelector(true)}
                      >
                        選擇會員 ({formData.users?.length || 0})
                      </Button>
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
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                        <Input
                          id="discount_value"
                          type="number"
                          value={formData.discount_value || ""}
                          onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                          required
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

                  {formData.type === 'flash_sale' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="flash_sale_start_time">開始時間</Label>
                          <Input
                            id="flash_sale_start_time"
                            type="time"
                            value={formData.flash_sale_start_time || ""}
                            onChange={(e) => setFormData({...formData, flash_sale_start_time: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flash_sale_end_time">結束時間</Label>
                          <Input
                            id="flash_sale_end_time"
                            type="time"
                            value={formData.flash_sale_end_time || ""}
                            onChange={(e) => setFormData({...formData, flash_sale_end_time: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flash_sale_discount">折扣比例 (%)</Label>
                        <Input
                          id="flash_sale_discount"
                          type="number"
                          value={formData.flash_sale_discount || ""}
                          onChange={(e) => setFormData({...formData, flash_sale_discount: e.target.value})}
                          min="1"
                          max="99"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* 適用商品選擇 */}
                  <div className="space-y-2">
                    <Label>適用商品</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectorType('products');
                          setShowSelector(true);
                        }}
                      >
                        選擇商品 ({formData.applicable_products?.length || 0})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectorType('categories');
                          setShowSelector(true);
                        }}
                      >
                        選擇分類 ({formData.applicable_categories?.length || 0})
                      </Button>
                    </div>
                  </div>

                  {/* 活動限制 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_limit">活動庫存限制</Label>
                      <Input
                        id="stock_limit"
                        type="number"
                        value={formData.stock_limit || ""}
                        onChange={(e) => setFormData({...formData, stock_limit: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, per_user_limit: e.target.value})}
                        min="0"
                        placeholder="0 表示無限制"
                      />
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
                </>
              )}

              {/* 日期選擇區域 */}
              <div className="space-y-4">
                {type === 'coupons' && (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_date_range"
                        checked={!!(formData.start_date || formData.end_date)}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            // 如果取消勾選，清空日期
                            setFormData({...formData, start_date: "", end_date: ""});
                            setDateError("");
                          } else {
                            // 如果勾選但尚未填寫日期，設置默認值為今天和一個月後
                            if (!formData.start_date && !formData.end_date) {
                              const today = new Date();
                              const nextMonth = new Date();
                              nextMonth.setMonth(today.getMonth() + 1);
                              
                              setFormData({
                                ...formData, 
                                start_date: today.toISOString().split('T')[0],
                                end_date: nextMonth.toISOString().split('T')[0]
                              });
                            }
                          }
                        }}
                      />
                      <Label htmlFor="enable_date_range" className="font-medium text-sm">
                        設定優惠券有效期間
                      </Label>
                    </div>
                    
                    {!formData.start_date && !formData.end_date && (
                      <span className="ml-4 text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        不設定則永久有效
                      </span>
                    )}
                  </div>
                )}

                {(type === 'campaigns' || (type === 'coupons' && (formData.start_date || formData.end_date))) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">開始日期{type === 'campaigns' && ' *'}</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date || ""}
                        onChange={(e) => {
                          setFormData({...formData, start_date: e.target.value});
                          validateDates(e.target.value, formData.end_date);
                        }}
                        required={type === 'campaigns'}
                        min={mode === 'add' ? new Date().toISOString().split('T')[0] : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">結束日期{type === 'campaigns' && ' *'}</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date || ""}
                        onChange={(e) => {
                          setFormData({...formData, end_date: e.target.value});
                          validateDates(formData.start_date, e.target.value);
                        }}
                        required={type === 'campaigns'}
                        min={formData.start_date || (mode === 'add' ? new Date().toISOString().split('T')[0] : undefined)}
                      />
                    </div>
                  </div>
                )}
                
                {type === 'coupons' && !formData.start_date && !formData.end_date && (
                  <div className="p-3 bg-gray-50 rounded border text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2 text-blue-500">ℹ️</span>
                      <span>未設定有效期間，此優惠券將永久有效直到手動停用</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isDirty) {
                      setShowCloseConfirmation(true);
                    } else {
                      onClose();
                    }
                  }}
                >
                  取消
                </Button>
                <Button type="submit" variant="default">
                  {mode === 'add' ? '新增' : '儲存'}
                </Button>
              </div>
            </form>
          </div>

          {/* Product/Category Selector Modal */}
          <ProductCategorySelector
            isOpen={showSelector}
            onClose={() => setShowSelector(false)}
            selectedItems={selectorType === 'products' ? formData.products : formData.categories}
            onConfirm={handleSelectorConfirm}
            type={selectorType}
          />

          {/* User Selector Modal */}
          <UserSelector
            isOpen={showUserSelector}
            onClose={() => setShowUserSelector(false)}
            selectedUsers={formData.users || []}
            onConfirm={(selectedUsers) => {
              setFormData({...formData, users: selectedUsers});
            }}
          />
        </div>
      </div>

      {/* 未儲存資料關閉確認 */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-200" onClick={() => setShowCloseConfirmation(false)}>
          <div 
            className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md border animate-in fade-in-50 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">確定要關閉嗎？</h3>
            <p className="text-gray-600 mb-4">您有尚未儲存的變更，關閉視窗將會遺失這些資料。</p>
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
    </>
  );
};

export default MarketingModal; 