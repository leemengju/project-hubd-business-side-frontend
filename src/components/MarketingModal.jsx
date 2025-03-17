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
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  // 防止點擊modal內部時關閉
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // 處理外部點擊
  const handleOutsideClick = () => {
    if (isDirty) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  // 處理確認關閉
  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
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

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        onClick={handleOutsideClick}
      >
        <div 
          ref={modalRef}
          className={cn(
            "bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col",
            "border border-border"
          )}
          onClick={handleModalClick}
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
                    <Input
                      id="code"
                      type="text"
                      value={formData.code || ""}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
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
      <AlertDialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要關閉嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              您有尚未儲存的變更，關閉視窗將會遺失這些資料。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>確定關閉</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MarketingModal; 