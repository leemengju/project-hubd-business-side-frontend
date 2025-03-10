import { useEffect, useState, useRef } from "react";
import ProductCategorySelector from "./ProductCategorySelector";
import UserSelector from "./UserSelector";

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
    }
  }, [isOpen]);

  // 防止點擊modal內部時關閉
  const handleModalClick = (e) => {
    e.stopPropagation();
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (!startDate || !endDate) {
      setDateError("請設定開始和結束日期");
      return false;
    }

    if (start < now && mode === 'add') {
      setDateError("開始日期不能早於今天");
      return false;
    }

    if (end <= start) {
      setDateError("結束日期必須晚於開始日期");
      return false;
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div 
        ref={modalRef}
        onClick={handleModalClick}
        className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-lg bg-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {mode === 'add' ? '新增' : '編輯'}
            {type === 'coupons' ? '優惠券' : '活動'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'coupons' ? (
            // 優惠券表單
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">優惠券名稱</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">優惠碼</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">折扣類型</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed">固定金額折扣</option>
                  <option value="shipping">免運費</option>
                  <option value="buy_x_get_y">買X送Y</option>
                </select>
              </div>

              {/* 根據折扣類型顯示不同的輸入欄位 */}
              {formData.discount_type === 'buy_x_get_y' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">購買數量</label>
                    <input
                      type="number"
                      value={formData.buy_quantity}
                      onChange={(e) => setFormData({...formData, buy_quantity: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">贈送數量</label>
                    <input
                      type="number"
                      value={formData.free_quantity}
                      onChange={(e) => setFormData({...formData, free_quantity: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                </div>
              ) : formData.discount_type !== 'shipping' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    折扣值{formData.discount_type === 'percentage' ? ' (%)' : ' (NT$)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              )}

              {/* 適用範圍選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">適用範圍</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorType('products');
                      setShowSelector(true);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    選擇商品 ({formData.products?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorType('categories');
                      setShowSelector(true);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    選擇分類 ({formData.categories?.length || 0})
                  </button>
                </div>
              </div>

              {/* 使用條件 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">最低消費金額 (NT$)</label>
                <input
                  type="number"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">使用次數限制</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              {/* 在優惠券表單中添加會員選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指定會員</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUserSelector(true)}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    選擇會員 ({formData.users?.length || 0})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">優惠併用</label>
                <input
                  type="checkbox"
                  checked={formData.canCombine}
                  onChange={(e) => setFormData({...formData, canCombine: e.target.checked})}
                  className="mt-1"
                />
                <span className="ml-2 text-sm text-gray-600">允許與其他優惠併用</span>
              </div>
            </>
          ) : (
            // 活動表單
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">活動名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="例：夏季特賣會"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">活動類型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="discount">折扣優惠</option>
                  <option value="buy_x_get_y">買X送Y</option>
                  <option value="bundle">組合優惠</option>
                  <option value="flash_sale">限時特價</option>
                  <option value="free_shipping">免運活動</option>
                </select>
              </div>

              {/* 根據活動類型顯示不同的設定選項 */}
              {formData.type === 'discount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">折扣類型</label>
                    <select
                      value={formData.discount_method}
                      onChange={(e) => setFormData({...formData, discount_method: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="percentage">百分比折扣</option>
                      <option value="fixed">固定金額折扣</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      折扣值{formData.discount_method === 'percentage' ? ' (%)' : ' (NT$)'}
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === 'buy_x_get_y' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">購買數量</label>
                    <input
                      type="number"
                      value={formData.buy_quantity}
                      onChange={(e) => setFormData({...formData, buy_quantity: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">贈送數量</label>
                    <input
                      type="number"
                      value={formData.free_quantity}
                      onChange={(e) => setFormData({...formData, free_quantity: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === 'bundle' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">組合商品數量</label>
                    <input
                      type="number"
                      value={formData.bundle_quantity}
                      onChange={(e) => setFormData({...formData, bundle_quantity: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">組合折扣 (%)</label>
                    <input
                      type="number"
                      value={formData.bundle_discount}
                      onChange={(e) => setFormData({...formData, bundle_discount: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">開始時間</label>
                      <input
                        type="time"
                        value={formData.flash_sale_start_time}
                        onChange={(e) => setFormData({...formData, flash_sale_start_time: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">結束時間</label>
                      <input
                        type="time"
                        value={formData.flash_sale_end_time}
                        onChange={(e) => setFormData({...formData, flash_sale_end_time: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">折扣比例 (%)</label>
                    <input
                      type="number"
                      value={formData.flash_sale_discount}
                      onChange={(e) => setFormData({...formData, flash_sale_discount: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      max="99"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 適用商品選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">適用商品</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorType('products');
                      setShowSelector(true);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    選擇商品 ({formData.applicable_products?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorType('categories');
                      setShowSelector(true);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    選擇分類 ({formData.applicable_categories?.length || 0})
                  </button>
                </div>
              </div>

              {/* 活動限制 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">活動庫存限制</label>
                  <input
                    type="number"
                    value={formData.stock_limit}
                    onChange={(e) => setFormData({...formData, stock_limit: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    placeholder="0 表示無限制"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">每人限購數量</label>
                  <input
                    type="number"
                    value={formData.per_user_limit}
                    onChange={(e) => setFormData({...formData, per_user_limit: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    placeholder="0 表示無限制"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">優惠併用</label>
                <input
                  type="checkbox"
                  checked={formData.canCombine}
                  onChange={(e) => setFormData({...formData, canCombine: e.target.checked})}
                  className="mt-1"
                />
                <span className="ml-2 text-sm text-gray-600">允許與其他優惠併用</span>
              </div>
            </>
          )}

          {/* 日期選擇區域 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">開始日期</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  setFormData({...formData, start_date: e.target.value});
                  validateDates(e.target.value, formData.end_date);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">結束日期</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => {
                  setFormData({...formData, end_date: e.target.value});
                  validateDates(formData.start_date, e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>
          {dateError && (
            <p className="text-red-500 text-sm mt-1">{dateError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brandBlue-normal hover:bg-brandBlue-normalHover text-white rounded-lg"
            >
              {mode === 'add' ? '新增' : '儲存'}
            </button>
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
  );
};

export default MarketingModal; 