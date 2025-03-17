// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import { useState, useEffect } from "react";
import api from "../services/api";
import MarketingModal from "../components/MarketingModal";
import MarketingStats from "../components/MarketingStats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, CalendarIcon, Users2Icon, TagIcon, PackageIcon } from "lucide-react";

const Marketing = () => {
  const [activeTab, setActiveTab] = useState("coupons"); // coupons or campaigns
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedItem, setSelectedItem] = useState(null);
  
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
    free_quantity: ""
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
      try {
        const response = await api.get("/coupons");
        setCoupons(response.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  // 獲取活動列表
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("/campaigns");
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // 處理新增/編輯表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "coupons") {
        if (modalMode === "add") {
          const response = await api.post("/coupons", couponForm);
          setCoupons([...coupons, response.data]);
        } else {
          const response = await api.put(`/coupons/${selectedItem.id}`, couponForm);
          setCoupons(coupons.map(coupon => 
            coupon.id === selectedItem.id ? response.data : coupon
          ));
        }
      } else {
        if (modalMode === "add") {
          const response = await api.post("/campaigns", campaignForm);
          setCampaigns([...campaigns, response.data]);
        } else {
          const response = await api.put(`/campaigns/${selectedItem.id}`, campaignForm);
          setCampaigns(campaigns.map(campaign => 
            campaign.id === selectedItem.id ? response.data : campaign
          ));
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("提交失敗，請稍後再試");
    }
  };

  // 處理編輯按鈕點擊
  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    if (activeTab === "coupons") {
      setCouponForm(item);
    } else {
      setCampaignForm(item);
    }
    setIsModalOpen(true);
  };

  // 處理新增按鈕點擊
  const handleAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
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

  return (
    <section className="w-full h-full bg-white p-6 rounded-lg shadow-sm overflow-y-auto">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">行銷管理</h1>
        <p className="text-gray-500">管理優惠券和行銷活動，提高銷售業績</p>
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
          >
            <PlusIcon className="h-5 w-5" />
            {activeTab === "coupons" ? "新增優惠券" : "新增活動"}
          </Button>
        </div>

        <TabsContent value="coupons" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex-shrink-0 bg-brandBlue-light rounded-full flex items-center justify-center mr-3">
                            <TagIcon className="h-4 w-4 text-brandBlue-normal" />
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
                        <div className="flex items-center gap-1">
                          {coupon.products?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 mr-1">
                              <PackageIcon className="h-3 w-3 mr-1" />
                              {coupon.products.length}
                            </span>
                          )}
                          {coupon.users?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                              <Users2Icon className="h-3 w-3 mr-1" />
                              {coupon.users.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          getStatusStyles(coupon.end_date)
                        }`}>
                          {!coupon.end_date 
                            ? "永久有效" 
                            : new Date(coupon.end_date) > new Date() 
                              ? "使用中" 
                              : "已過期"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleEdit(coupon)}
                          className="flex items-center gap-1 text-brandBlue-normal hover:text-brandBlue-normalHover h-8 px-2"
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
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
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
                    <tr key={campaign.id} className="hover:bg-gray-50">
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
                        {campaign.applicable_products?.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                            <PackageIcon className="h-3 w-3 mr-1" />
                            {campaign.applicable_products.length}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          getStatusStyles(campaign.end_date)
                        }`}>
                          {new Date(campaign.end_date) > new Date() ? "使用中" : "已過期"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleEdit(campaign)}
                          className="flex items-center gap-1 text-brandBlue-normal hover:text-brandBlue-normalHover h-8 px-2"
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
      />
    </section>
  );
};

export default Marketing;