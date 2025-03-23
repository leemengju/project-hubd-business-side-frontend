// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import { useState, useEffect } from "react";
import apiService from "../services/api";
import { toast } from "react-hot-toast";
import MarketingModal from "../components/MarketingModal";
import MarketingStats from "../components/MarketingStats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  Edit2Icon, 
  CalendarIcon, 
  Users2Icon, 
  TagIcon, 
  PackageIcon, 
  XIcon, 
  CopyIcon, 
  CheckIcon, 
  InfoIcon,
  FileTextIcon as DocumentIcon,
  MailIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Marketing = () => {
  const [activeTab, setActiveTab] = useState("coupons"); // coupons or campaigns
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showApplicableModal, setShowApplicableModal] = useState(false);
  const [applicableType, setApplicableType] = useState(""); // "products", "categories", "users"
  
  // 新增優惠券的表單資料
  const [couponForm, setCouponForm] = useState({
    title: "",
    code: "",
    discount_type: "percentage", // percentage or fixed
    discount_value: "",
    min_purchase: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    description: "",
    products: [],
    categories: [],
    users: [],
    buy_quantity: "",
    free_quantity: "",
    applicable_products: [],
    applicable_categories: []
  });

  // 新增活動的表單資料
  const [campaignForm, setCampaignForm] = useState({
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
    description: ""
  });

  // 獲取優惠券列表
  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        console.log("正在獲取優惠券列表...");
        const response = await apiService.get("/coupons");
        console.log("優惠券列表 API 響應:", response);
        setCoupons(response.data || []);
      } catch (error) {
        console.error("獲取優惠券列表失敗:", error);
        // 如果是網路錯誤，顯示更具體的信息
        if (error.code === 'ERR_NETWORK') {
          toast.error("無法連接到伺服器，請確認後端 API 是否啟動");
        } else {
          toast.error("無法獲取優惠券列表，請稍後再試");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // 獲取活動列表
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.get("/campaigns");
        setCampaigns(response.data || []);
      } catch (error) {
        console.error("獲取行銷活動列表失敗:", error);
        toast.error("無法獲取行銷活動列表，請稍後再試");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // 處理新增/編輯表單提交
  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === "coupons") {
        // 處理優惠券數據格式
        const couponData = { ...formData };
        
        // 確保 users 欄位為陣列
        couponData.users = Array.isArray(couponData.users) ? couponData.users : [];
        
        // 確保適用商品和適用分類欄位為陣列
        couponData.applicable_products = Array.isArray(couponData.applicable_products) ? couponData.applicable_products : [];
        couponData.applicable_categories = Array.isArray(couponData.applicable_categories) ? couponData.applicable_categories : [];
        
        // 確保日期格式正確
        if (couponData.start_date) couponData.start_date = new Date(couponData.start_date).toISOString().split('T')[0];
        if (couponData.end_date) couponData.end_date = new Date(couponData.end_date).toISOString().split('T')[0];
        
        // 調試日誌
        console.log('提交優惠券數據:', couponData);
        
        if (modalMode === "add") {
          const response = await apiService.post("/coupons", couponData);
          setCoupons([...coupons, response.data]);
          toast.success("優惠券新增成功！");
        } else {
          const response = await apiService.put(`/coupons/${selectedItem.id}`, couponData);
          setCoupons(coupons.map(coupon => 
            coupon.id === selectedItem.id ? response.data : coupon
          ));
          toast.success("優惠券更新成功！");
        }
      } else {
        // 處理行銷活動數據格式
        const campaignData = { ...formData };
        
        // 確保 users 欄位為陣列 (如果存在)
        if (campaignData.hasOwnProperty('users')) {
          campaignData.users = Array.isArray(campaignData.users) ? campaignData.users : [];
        }
        
        // 確保日期格式正確
        if (campaignData.start_date) campaignData.start_date = new Date(campaignData.start_date).toISOString().split('T')[0];
        if (campaignData.end_date) campaignData.end_date = new Date(campaignData.end_date).toISOString().split('T')[0];
        if (campaignData.flash_sale_start_time) campaignData.flash_sale_start_time = new Date(campaignData.flash_sale_start_time).toISOString();
        if (campaignData.flash_sale_end_time) campaignData.flash_sale_end_time = new Date(campaignData.flash_sale_end_time).toISOString();
        
        if (modalMode === "add") {
          const response = await apiService.post("/campaigns", campaignData);
          setCampaigns([...campaigns, response.data]);
          toast.success("行銷活動新增成功！");
        } else {
          const response = await apiService.put(`/campaigns/${selectedItem.id}`, campaignData);
          setCampaigns(campaigns.map(campaign => 
            campaign.id === selectedItem.id ? response.data : campaign
          ));
          toast.success("行銷活動更新成功！");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("提交表單失敗:", error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // 顯示具體的驗證錯誤訊息
        const errorMessages = Object.values(error.response.data.errors).flat().join("\n");
        toast.error(`提交失敗: ${errorMessages}`);
      } else {
        toast.error("提交失敗，請稍後再試");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 處理編輯按鈕點擊
  const handleEdit = (item, e) => {
    if (e) e.stopPropagation(); // 阻止事件冒泡，避免觸發行點擊
    
    // 設置編輯模式和所選項目
    setModalMode("edit");
    setSelectedItem(item);
    
    // 設置表單數據
    if (activeTab === "coupons") {
      setCouponForm(item);
    } else {
      setCampaignForm(item);
    }
    
    // 優化視窗轉換順序
    // 立即設置背景疊加層
    document.body.style.backgroundColor = 'transparent';
    
    // 先關閉適用範圍視窗，確保層級關係
    setShowApplicableModal(false);
    
    // 立即開啟編輯視窗 (不等待)
    setIsModalOpen(true);
    
    // 稍後關閉詳細視窗 (延遲最短時間)
    requestAnimationFrame(() => {
      setShowDetail(false);
    });
  };

  // 處理新增按鈕點擊
  const handleAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // 處理行點擊，顯示詳細信息
  const handleRowClick = (item) => {
    setDetailItem(item);
    setShowDetail(true);
  };

  // 關閉詳細信息
  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailItem(null);
  };

  // 取得狀態標籤的樣式
  const getStatusStyles = (endDate) => {
    // 如果沒有結束日期，視為永久有效
    if (!endDate) {
      return "bg-blue-100 text-blue-800 border border-blue-200";
    }
    
    const isActive = new Date(endDate) > new Date();
    return isActive 
      ? "bg-green-100 text-green-800 border border-green-200" 
      : "bg-red-100 text-red-800 border border-red-200";
  };

  // 格式化日期顯示
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 獲取有效期間顯示
  const getValidPeriodDisplay = (startDate, endDate) => {
    if (!startDate && !endDate) {
      return "永久有效";
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // 處理複製優惠碼
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setIsCopied(true);
        toast.success("優惠碼已複製！");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('複製失敗:', err);
        toast.error("複製失敗，請手動複製");
      });
  };
  
  // 顯示適用範圍詳細資訊
  const handleShowApplicable = (type, e) => {
    e.stopPropagation();
    setApplicableType(type);
    
    // 優化過渡效果，確保滑順顯示
    // 先設置類型，稍後再顯示視窗
    setTimeout(() => {
      setShowApplicableModal(true);
      
      // 重新聚焦到適用範圍視窗，提高 Z-index
      setTimeout(() => {
        document.querySelector('.sm\\:max-w-\\[600px\\]')?.focus();
      }, 50);
    }, 70);
    
    // 檢查 detailItem 是否已設定
    if (!detailItem) {
      console.error('detailItem is not set');
    } else {
      console.log('適用範圍詳細資訊 detailItem:', detailItem);
      
      // 檢查對應的適用範圍屬性是否是陣列
      const checkItems = 
        type === 'products' ? detailItem.products :
        type === 'categories' ? detailItem.categories :
        type === 'users' ? detailItem.users :
        type === 'applicable_products' ? detailItem.applicable_products :
        type === 'applicable_categories' ? detailItem.applicable_categories : null;
                         
      console.log(`檢查 ${type} 屬性:`, checkItems, Array.isArray(checkItems) ? '是陣列' : '不是陣列');
      
      // 確保相關屬性是陣列
      if (checkItems === null || !Array.isArray(checkItems)) {
        console.warn(`${type} 屬性不是陣列或不存在，將使用空陣列`);
      }
    }
  };
  
  // 渲染適用範圍模態窗口
  const renderApplicableModal = () => {
    if (!showApplicableModal || !detailItem) return null;
    
    let title = "";
    let items = [];
    
    if (applicableType === "products") {
      title = "適用商品列表";
      items = Array.isArray(detailItem.products) ? detailItem.products : [];
    } else if (applicableType === "categories") {
      title = "適用分類列表";
      items = Array.isArray(detailItem.categories) ? detailItem.categories : [];
    } else if (applicableType === "users") {
      title = "適用會員列表";
      items = Array.isArray(detailItem.users) ? detailItem.users : [];
    } else if (applicableType === "applicable_products") {
      title = "適用商品列表";
      items = Array.isArray(detailItem.applicable_products) ? detailItem.applicable_products : [];
    } else if (applicableType === "applicable_categories") {
      title = "適用分類列表";
      items = Array.isArray(detailItem.applicable_categories) ? detailItem.applicable_categories : [];
    }
    
    console.log('適用範圍類型:', applicableType);
    console.log('項目數量:', items.length);
    console.log('項目數據:', items);
    
    // 依據主商品 ID 分組規格
    const groupedProducts = {};
    
    // 檢查資料結構是否適合分組
    const hasComplexStructure = items.some(item => 
      item.product_main_id || 
      item.spec_id ||
      (item.variants && item.variants.length > 0) || 
      (item.color && item.color !== 'null') || 
      (item.size && item.size !== 'null')
    );
    
    console.log('檢查分組資料:', items);
    
    // 按照product_id分組（商品編號，如"pa001"）
    items.forEach(item => {
      // 獲取product_id作為主鍵（商品編號）
      const productId = item.product_id || ''; 
      if (!productId) {
        console.warn('找到沒有product_id的項目:', item);
        return;
      }
      
      console.log(`處理項目 - ID: ${item.id}, product_id: ${productId}, spec_id: ${item.spec_id}`);
      
      // 如果這是一個規格（有spec_id，規格流水號）
      if (item.spec_id) {
        if (!groupedProducts[productId]) {
          groupedProducts[productId] = {
            mainProduct: null,
            variants: []
          };
        }
        
        // 將規格添加到對應商品的變體列表中
        groupedProducts[productId].variants.push({
          ...item,
          // 確保有完整的資訊
          product_id: productId,
          spec_id: item.spec_id,
          size: item.size,
          color: item.color,
          price: item.price || 0,
          stock: item.stock || 0
        });
      } 
      // 否則，這是主商品
      else {
        if (!groupedProducts[productId]) {
          groupedProducts[productId] = {
            mainProduct: item,
            variants: []
          };
        } else {
          // 只有當目前沒有主商品時才設置
          if (!groupedProducts[productId].mainProduct) {
            groupedProducts[productId].mainProduct = item;
          }
        }
      }
    });
    
    // 處理可能缺少主商品的情況
    Object.keys(groupedProducts).forEach(productId => {
      const group = groupedProducts[productId];
      // 如果沒有主商品但有變體，使用第一個變體作為主商品
      if (!group.mainProduct && group.variants.length > 0) {
        group.mainProduct = {...group.variants[0]};
        // 移除主商品的spec_id，避免它被視為變體
        delete group.mainProduct.spec_id;
      }
    });
    
    // 檢查分組結果
    console.log('分組結果:', groupedProducts);
    const isGroupable = Object.keys(groupedProducts).length > 0;
    console.log('是否可分組:', isGroupable);
    
    // 使用Dialog組件包裝模態窗口內容
    return (
      <Dialog open={showApplicableModal} onOpenChange={setShowApplicableModal}>
        <DialogContent className="sm:max-w-[600px] transition-all duration-300 ease-out will-change-transform will-change-opacity">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </DialogHeader>
          
          {/* 如果無法分組，顯示原始列表 */}
          {!isGroupable ? (
            <div className="max-h-[60vh] overflow-y-auto p-1">
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id || `item-${index}`} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <div className="flex items-start p-4">
                        {item.image ? (
                          <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 mr-4 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=無圖片" }}
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 mr-4 flex-shrink-0">
                            <PackageIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name || "未命名商品"}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                            {item.product_id && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs whitespace-nowrap">
                                商品編號: {item.product_id}
                              </span>
                            )}
                            {item.sku && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs whitespace-nowrap">
                                SKU: {item.sku}
                              </span>
                            )}
                            {item.stock !== undefined && (
                              <span className="px-2 py-0.5 bg-blue-50 rounded-full text-blue-700 text-xs whitespace-nowrap">
                                庫存: {item.stock}
                              </span>
                            )}
                            {(item.color || item.size) && (
                              <span className="px-2 py-1 bg-brandBlue-ultraLight text-xs rounded-full border border-brandBlue-light text-brandBlue-dark">
                                {item.color && item.color !== 'null' ? item.color : ''}
                                {item.color && item.size && item.color !== 'null' && item.size !== 'null' ? ' / ' : ''}
                                {item.size && item.size !== 'null' ? item.size : ''}
                              </span>
                            )}
                          </div>
                          {item.price && (
                            <div className="mt-1">
                              <span className="font-medium text-brandBlue-dark">
                                NT$ {item.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <InfoIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p>無適用商品</p>
                </div>
              )}
            </div>
          ) : (
            // 分組顯示商品和規格
            <div className="max-h-[60vh] overflow-y-auto p-1">
              {Object.keys(groupedProducts).length > 0 ? (
                <div className="space-y-4">
                  {Object.values(groupedProducts).map((group, groupIndex) => {
                    const mainProduct = group.mainProduct || (group.variants.length > 0 ? group.variants[0] : null);
                    if (!mainProduct) return null;
                    
                    return (
                      <div key={`group-${groupIndex}`} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* 主商品資訊 */}
                        <div className="flex items-start p-4 border-b border-gray-100">
                          {mainProduct.image ? (
                            <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 mr-4 flex-shrink-0">
                              <img 
                                src={mainProduct.image} 
                                alt={mainProduct.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=無圖片" }}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 mr-4 flex-shrink-0">
                              <PackageIcon className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {mainProduct.name || "未命名商品"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                              {mainProduct.product_id && (
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs whitespace-nowrap">
                                  商品編號: {mainProduct.product_id}
                                </span>
                              )}
                              {group.variants.length > 0 && (
                                <span className="px-2 py-0.5 bg-orange-50 rounded-full text-orange-700 text-xs whitespace-nowrap">
                                  {group.variants.length} 件規格商品
                                </span>
                              )}
                              {group.variants.length > 0 && (
                                <span className="px-2 py-0.5 bg-amber-50 rounded-full text-amber-700 text-xs whitespace-nowrap">
                                  總庫存: {group.variants.reduce((total, v) => total + (parseInt(v.stock) || 0), 0)}
                                </span>
                              )}
                              {mainProduct.category_name && (
                                <span className="px-2 py-0.5 bg-green-50 rounded-full text-green-700 text-xs whitespace-nowrap">
                                  分類: {mainProduct.category_name}
                                </span>
                              )}
                            </div>
                            {mainProduct.price && (
                              <div className="mt-1">
                                <span className="font-medium text-brandBlue-dark">
                                  NT$ {mainProduct.price}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 規格列表 */}
                        {group.variants.length > 0 && (
                          <div className="p-3 bg-gray-50">
                            <p className="text-sm font-medium text-gray-500 mb-2">已選擇的規格 ({group.variants.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {group.variants.map((variant, vIndex) => {
                                const hasSize = variant.size && variant.size !== 'null';
                                const hasColor = variant.color && variant.color !== 'null';
                                
                                return (
                                  <span 
                                    key={`variant-${vIndex}`} 
                                    className="px-2 py-1 bg-brandBlue-ultraLight text-xs rounded-full border border-brandBlue-light text-brandBlue-dark"
                                    title={variant.spec_id ? `規格ID: ${variant.spec_id}` : ''}
                                  >
                                    {!hasSize && !hasColor && "標準規格"}
                                    {hasSize && `${variant.size}`}
                                    {hasSize && hasColor ? ' / ' : ''}
                                    {hasColor && variant.color}
                                    {variant.price && ` - NT$ ${variant.price}`}
                                    {variant.stock && ` (庫存: ${variant.stock})`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <InfoIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p>無適用商品</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  // 狀態標籤
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: {
        label: '啟用中',
        className: 'bg-green-100 text-green-800'
      },
      disabled: {
        label: '已停用',
        className: 'bg-gray-100 text-gray-800'
      },
      expired: {
        label: '已過期',
        className: 'bg-red-100 text-red-800'
      },
      scheduled: {
        label: '排程中',
        className: 'bg-blue-100 text-blue-800'
      }
    };

    const config = statusConfig[status] || {
      label: '未知',
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // 渲染詳細信息模態窗口
  const renderDetailModal = () => {
    if (!showDetail || !detailItem) return null;

    const isCoupon = detailItem.code !== undefined;
    const title = isCoupon ? "優惠券詳細資訊" : "行銷活動詳細資訊";
    
    return (
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[600px] transition-all duration-300 ease-out will-change-transform will-change-opacity">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isCoupon ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">優惠券名稱</h4>
                  <p className="text-base">{detailItem.title}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">優惠碼</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded flex-grow">{detailItem.code}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopyCode(detailItem.code)}
                    >
                      {isCopied ? 
                        <CheckIcon className="h-4 w-4 text-green-500" /> : 
                        <CopyIcon className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">折扣類型</h4>
                  <p className="text-base">
                    {detailItem.discount_type === 'percentage' ? '百分比折扣' : 
                     detailItem.discount_type === 'fixed' ? '固定金額折扣' : 
                     detailItem.discount_type === 'shipping' ? '免運費' :
                     detailItem.discount_type === 'buy_x_get_y' ? '買X送Y' : '未知'}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">折扣值</h4>
                  <p className="text-base">
                    {detailItem.discount_type === 'percentage' ? `${detailItem.discount_value}%` : 
                     detailItem.discount_type === 'fixed' ? `NT$ ${detailItem.discount_value}` : 
                     detailItem.discount_type === 'buy_x_get_y' ? `買${detailItem.buy_quantity}送${detailItem.free_quantity}` : ''}
                  </p>
                </div>
                {detailItem.start_date && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">開始日期</h4>
                    <p className="text-base">{new Date(detailItem.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {detailItem.end_date && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">結束日期</h4>
                    <p className="text-base">{new Date(detailItem.end_date).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">使用次數限制</h4>
                  <p className="text-base">{detailItem.usage_limit || '無限制'}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">最低消費</h4>
                  <p className="text-base">{detailItem.min_purchase ? `NT$ ${detailItem.min_purchase}` : '無'}</p>
                </div>
                {detailItem.description && (
                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">描述</h4>
                    <p className="text-base p-2 bg-gray-50 rounded">{detailItem.description}</p>
                  </div>
                )}
                {(detailItem.products?.length > 0 || detailItem.categories?.length > 0 || detailItem.users?.length > 0) && (
                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">適用範圍</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailItem.products?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前優惠券作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了優惠券產品適用範圍按鈕", detailItem);
                          handleShowApplicable("products", e);
                        }}>
                          <PackageIcon className="h-3 w-3 mr-1" />
                          {detailItem.products.length} 件商品
                        </span>
                      )}
                      {detailItem.applicable_products?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前優惠券作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了優惠券適用商品按鈕", detailItem);
                          handleShowApplicable("applicable_products", e);
                        }}>
                          <PackageIcon className="h-3 w-3 mr-1" />
                          {detailItem.applicable_products.length} 件商品
                        </span>
                      )}
                      {detailItem.categories?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前優惠券作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了優惠券分類適用範圍按鈕", detailItem);
                          handleShowApplicable("categories", e);
                        }}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {detailItem.categories.length} 個分類
                        </span>
                      )}
                      {detailItem.applicable_categories?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前優惠券作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了優惠券適用分類按鈕", detailItem);
                          handleShowApplicable("applicable_categories", e);
                        }}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {detailItem.applicable_categories.length} 個分類
                        </span>
                      )}
                      {detailItem.users?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前優惠券作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了優惠券會員適用範圍按鈕", detailItem);
                          handleShowApplicable("users", e);
                        }}>
                          <Users2Icon className="h-3 w-3 mr-1" />
                          {detailItem.users.length} 位會員
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">狀態：</span>
                    <StatusBadge status={detailItem.calculated_status} />
                  </div>
                  {detailItem.calculated_status === 'expired' && (
                    <p className="text-sm text-red-600">
                      此{isCoupon ? '優惠券' : '活動'}已過期，無法修改
                    </p>
                  )}
                  {detailItem.calculated_status === 'scheduled' && (
                    <p className="text-sm text-blue-600">
                      此{isCoupon ? '優惠券' : '活動'}尚未開始，將在開始日期後自動啟用
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">活動名稱</h4>
                  <p className="text-base">{detailItem.name}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">活動類型</h4>
                  <p className="text-base">
                    {detailItem.type === "discount" ? "折扣優惠" : 
                     detailItem.type === "buy_x_get_y" ? "買X送Y" :
                     detailItem.type === "bundle" ? "組合優惠" :
                     detailItem.type === "flash_sale" ? "限時特賣" : "免運活動"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">狀態</h4>
                  <p className="text-base">
                    <StatusBadge status={detailItem.calculated_status} />
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">開始日期</h4>
                  <p className="text-base">{new Date(detailItem.start_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">結束日期</h4>
                  <p className="text-base">{new Date(detailItem.end_date).toLocaleDateString()}</p>
                </div>
                {detailItem.description && (
                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">描述</h4>
                    <p className="text-base p-2 bg-gray-50 rounded">{detailItem.description}</p>
                  </div>
                )}
                {(detailItem.applicable_products?.length > 0 || detailItem.applicable_categories?.length > 0) && (
                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">適用範圍</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailItem.applicable_products?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前活動作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了促銷活動適用商品按鈕", detailItem);
                          // 延遲顯示適用範圍模態窗口
                          handleShowApplicable("applicable_products", e);
                        }}>
                          <PackageIcon className="h-3 w-3 mr-1" />
                          {detailItem.applicable_products.length} 件商品
                        </span>
                      )}
                      {detailItem.applicable_categories?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                          e.stopPropagation(); 
                          // 設置當前活動作為詳細項目
                          setDetailItem(detailItem);
                          // 確保 detailItem 已正確設置
                          console.log("點擊了促銷活動適用分類按鈕", detailItem);
                          // 延遲顯示適用範圍模態窗口
                          handleShowApplicable("applicable_categories", e);
                        }}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {detailItem.applicable_categories.length} 個分類
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="pt-4 border-t flex justify-end">
              <Button 
                variant="default"
                onClick={() => handleEdit(detailItem)}
              >
                <Edit2Icon className="h-4 w-4 mr-2" />
                編輯{isCoupon ? '優惠券' : '活動'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <section className="w-full h-full bg-white p-6 rounded-lg shadow-sm overflow-y-auto">
      {/* 頁面標題 */}
      <div className="mb-6">
        <div className="box-border flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 16 16"
              className="text-brandBlue-normal"
            >
              <path
                fill="currentColor"
                d="M15 15.001L13 15V1l2 .001zm.041-15L12.963 0C12.431-.001 12 .448 12 1.002v13.995c0 .554.431 1.002.963 1.003l2.074.001c.532 0 .963-.449.963-1.002V1.001c0-.552-.429-1-.959-1M3 15H1V8h2zm6 0H7V5h2zM.957 16h2.086c.529 0 .957-.446.957-.997V7.997C4 7.446 3.572 7 3.043 7H.957C.428 7 0 7.446 0 7.997v7.006c0 .551.428.997.957.997m6.001 0h2.084a.96.96 0 0 0 .958-.958V4.958A.96.96 0 0 0 9.042 4H6.958A.96.96 0 0 0 6 4.958v10.084c0 .53.429.958.958.958"
              />
            </svg>
          </div>
          <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
            行銷管理
          </h1>
        </div>
        <p className="text-gray-500 mt-2">管理優惠券和行銷活動，提高銷售業績</p>
      </div>

      {/* 統計摘要 */}
      <MarketingStats coupons={coupons} campaigns={campaigns} />

      {/* 使用 Shadcn UI 的 Tabs 元件 */}
      <Tabs 
        defaultValue="coupons" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger 
              value="coupons" 
              className="flex items-center gap-2 data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white"
            >
              <TagIcon className="h-4 w-4" />
              優惠券管理
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns" 
              className="flex items-center gap-2 data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white"
            >
              <CalendarIcon className="h-4 w-4" />
              活動管理
            </TabsTrigger>
          </TabsList>

          {/* 新增按鈕 */}
          <Button 
            variant="brand" 
            onClick={handleAdd}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <PlusIcon className="h-5 w-5" />
            {activeTab === "coupons" ? "新增優惠券" : "新增活動"}
          </Button>
        </div>

        <TabsContent value="coupons" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {isLoading && activeTab === "coupons" ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-normal"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優惠券名稱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優惠碼</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">折扣內容</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用期限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">範圍</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.length > 0 ? (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(coupon)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                              <TagIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-700">{coupon.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <div className="w-7 h-7 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold">{coupon.code.substring(0, 2)}</span>
                            </div>
                            <span className="font-medium text-gray-700">{coupon.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% OFF`
                            : coupon.discount_type === "shipping"
                            ? "免運費"
                            : coupon.discount_type === "buy_x_get_y"
                            ? `買${coupon.buy_quantity}送${coupon.free_quantity}`
                            : `NT$ ${coupon.discount_value} OFF`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{getValidPeriodDisplay(coupon.start_date, coupon.end_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1">
                            {coupon.products?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前優惠券作為詳細項目
                                setDetailItem(coupon);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了優惠券產品適用範圍按鈕", coupon);
                                handleShowApplicable("products", e);
                              }}>
                                <PackageIcon className="h-3 w-3 mr-1" />
                                {coupon.products.length} 件商品
                              </span>
                            )}
                            {coupon.applicable_products?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前優惠券作為詳細項目
                                setDetailItem(coupon);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了優惠券適用商品按鈕", coupon);
                                handleShowApplicable("applicable_products", e);
                              }}>
                                <PackageIcon className="h-3 w-3 mr-1" />
                                {coupon.applicable_products.length} 件商品
                              </span>
                            )}
                            {coupon.categories?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前優惠券作為詳細項目
                                setDetailItem(coupon);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了優惠券分類適用範圍按鈕", coupon);
                                handleShowApplicable("categories", e);
                              }}>
                                <TagIcon className="h-3 w-3 mr-1" />
                                {coupon.categories.length} 個分類
                              </span>
                            )}
                            {coupon.applicable_categories?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前優惠券作為詳細項目
                                setDetailItem(coupon);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了優惠券適用分類按鈕", coupon);
                                handleShowApplicable("applicable_categories", e);
                              }}>
                                <TagIcon className="h-3 w-3 mr-1" />
                                {coupon.applicable_categories.length} 個分類
                              </span>
                            )}
                            {coupon.users?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前優惠券作為詳細項目
                                setDetailItem(coupon);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了優惠券會員適用範圍按鈕", coupon);
                                handleShowApplicable("users", e);
                              }}>
                                <Users2Icon className="h-3 w-3 mr-1" />
                                {coupon.users.length} 位會員
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={coupon.calculated_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            onClick={(e) => handleEdit(coupon, e)}
                            className="flex items-center gap-1 text-brandBlue-normal hover:text-brandBlue-normalHover h-8 px-2"
                            disabled={isLoading}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            編輯
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        目前沒有優惠券，點擊「新增優惠券」來建立
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {isLoading && activeTab === "campaigns" ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-normal"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動名稱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動類型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動期限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">範圍</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(campaign)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                              <CalendarIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-700">{campaign.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.type === "discount" ? "折扣優惠" : 
                           campaign.type === "buy_x_get_y" ? "買X送Y" :
                           campaign.type === "bundle" ? "組合優惠" :
                           campaign.type === "flash_sale" ? "限時特賣" : "免運活動"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1">
                            {campaign.applicable_products?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前活動作為詳細項目
                                setDetailItem(campaign);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了促銷活動適用商品按鈕", campaign);
                                // 延遲顯示適用範圍模態窗口
                                handleShowApplicable("applicable_products", e);
                              }}>
                                <PackageIcon className="h-3 w-3 mr-1" />
                                {campaign.applicable_products.length} 件商品
                              </span>
                            )}
                            {campaign.applicable_categories?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition" onClick={(e) => {
                                e.stopPropagation(); 
                                // 設置當前活動作為詳細項目
                                setDetailItem(campaign);
                                // 確保 detailItem 已正確設置
                                console.log("點擊了促銷活動適用分類按鈕", campaign);
                                // 延遲顯示適用範圍模態窗口
                                handleShowApplicable("applicable_categories", e);
                              }}>
                                <TagIcon className="h-3 w-3 mr-1" />
                                {campaign.applicable_categories.length} 個分類
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={campaign.calculated_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            onClick={(e) => handleEdit(campaign, e)}
                            className="flex items-center gap-1 text-brandBlue-normal hover:text-brandBlue-normalHover h-8 px-2"
                            disabled={isLoading}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            編輯
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        目前沒有行銷活動，點擊「新增活動」來建立
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Component */}
      <MarketingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={activeTab}
        mode={modalMode}
        formData={activeTab === 'coupons' ? couponForm : campaignForm}
        setFormData={activeTab === 'coupons' ? setCouponForm : setCampaignForm}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* 詳細信息模態窗口 */}
      {renderDetailModal()}

      {/* 適用範圍模態窗口 */}
      {renderApplicableModal()}
    </section>
  );
};

export default Marketing;