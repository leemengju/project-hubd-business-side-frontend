// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import { useState, useEffect } from "react";
import api from "../services/api";
import MarketingModal from "../components/MarketingModal";

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

  return (
    <section className="w-full h-full bg-white p-6">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">行銷管理</h1>
        <p className="text-gray-600">管理優惠券和行銷活動</p>
      </div>

      {/* 分頁按鈕 */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "coupons"
              ? "bg-brandBlue-normal text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("coupons")}
        >
          優惠券管理
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "campaigns"
              ? "bg-brandBlue-normal text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("campaigns")}
        >
          活動管理
        </button>
      </div>

      {/* 新增按鈕 */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="bg-brandBlue-normal hover:bg-brandBlue-normalHover text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {activeTab === "coupons" ? "新增優惠券" : "新增活動"}
        </button>
      </div>

      {/* 列表顯示區域 */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "coupons" ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優惠碼</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">折扣內容</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用期限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}% OFF`
                      : `NT$ ${coupon.discount_value} OFF`}
                  </td>
                  <td className="px-6 py-4">
                    {`${coupon.start_date} - ${coupon.end_date}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      new Date(coupon.end_date) > new Date()
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {new Date(coupon.end_date) > new Date() ? "使用中" : "已過期"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEdit(coupon)}
                      className="text-brandBlue-normal hover:text-brandBlue-normalHover"
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動期限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4">{campaign.name}</td>
                  <td className="px-6 py-4">
                    {campaign.type === "discount" ? "折扣優惠" : "買X送Y"}
                  </td>
                  <td className="px-6 py-4">
                    {`${campaign.start_date} - ${campaign.end_date}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      new Date(campaign.end_date) > new Date()
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {new Date(campaign.end_date) > new Date() ? "進行中" : "已結束"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEdit(campaign)}
                      className="text-brandBlue-normal hover:text-brandBlue-normalHover"
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add the Modal component */}
      <MarketingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={activeTab}
        mode={modalMode}
        formData={activeTab === "coupons" ? couponForm : campaignForm}
        setFormData={activeTab === "coupons" ? setCouponForm : setCampaignForm}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default Marketing;