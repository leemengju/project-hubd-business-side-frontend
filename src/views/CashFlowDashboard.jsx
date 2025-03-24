import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CashFlow from './CashFlow';
import CashFlowSettings from '../components/cash-flow/CashFlowSettings';
import { 
  CreditCardIcon, 
  Settings2Icon,
  CircleDollarSignIcon,
  ChevronRightIcon,
} from "lucide-react";

const CashFlowDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("transactions");

  // 從路徑中提取當前活動的標籤
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("transactions");
    }
  }, [location]);

  // 處理選項卡變更
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "settings") {
      navigate("/cash-flow/settings");
    } else {
      navigate("/cash-flow");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CircleDollarSignIcon className="h-7 w-7 text-blue-600" />
              金流管理
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Link to="/dashboard" className="hover:text-blue-600">
                儀表板
              </Link>
              <ChevronRightIcon className="h-4 w-4 mx-1" />
              <span>金流管理</span>
              {activeTab === "settings" && (
                <>
                  <ChevronRightIcon className="h-4 w-4 mx-1" />
                  <span>系統設定</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-white border-b">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              交易管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings2Icon className="h-4 w-4" />
              系統設定
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "transactions" && <CashFlow />}
        {activeTab === "settings" && <CashFlowSettings />}
      </div>
    </div>
  );
};

export default CashFlowDashboard; 