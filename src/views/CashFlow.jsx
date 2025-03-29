// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import { useState, useEffect, useRef } from "react";
import apiService from "../services/api";
import { toast } from "react-hot-toast";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CSVLink } from "react-csv";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ReceiptIcon,
  DollarSignIcon,
  CalendarIcon,
  SearchIcon,
  Loader2Icon,
  PlusIcon,
  EyeIcon,
  SettingsIcon,
  RefreshCwIcon,
  DownloadIcon,
  CoinsIcon,
  SlidersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
  PercentIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  CheckIcon,
  HashIcon,
  ExternalLinkIcon,
  ClipboardListIcon,
  CircleIcon,
  Settings2Icon,
  ShoppingCartIcon,
  FilterIcon,
  ClipboardCheckIcon,
  SaveIcon
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CashFlowChart from "../components/cash-flow/CashFlowChart";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CashFlowSettings from "../components/cash-flow/CashFlowSettings";

const CashFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  
  // 從 URL 查詢參數獲取 tab
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "transactions"); // transactions, reconciliations, settings
  const [isLoading, setIsLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailDate, setDetailDate] = useState(null);
  const [dayTransactions, setDayTransactions] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const dailyDataCache = useRef({});
  const [stats, setStats] = useState({
    totalSales: 0,
    transactionCount: 0,
    totalFees: 0,
    netIncome: 0,
    pendingReconciliation: 0,
    completedReconciliation: 0
  });
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const csvLinkRef = useRef(null);

  // 日期篩選
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(today),
    endDate: endOfMonth(today)
  });
  const [tempDateRange, setTempDateRange] = useState({
    startDate: startOfMonth(today),
    endDate: endOfMonth(today)
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 获取交易列表
  useEffect(() => {
    fetchDailyTransactions();
  }, [dateRange]);

  // 获取对账列表
  useEffect(() => {
    fetchReconciliations();
  }, [dateRange]);

  // 获取金流统计数据
  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchDailyTransactions = async () => {
    // 使用局部加載狀態來避免整個頁面重新渲染
    const wasLoading = isLoading;
    if (!wasLoading) setIsLoading(true);
    
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/transactions/daily-summary", { params });
      
      // 確認數據是否在選定的日期範圍內
      const startDateObj = new Date(dateRange.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      
      const endDateObj = new Date(dateRange.endDate);
      endDateObj.setHours(23, 59, 59, 999);
      
      // 過濾響應數據，確保日期在範圍內
      const filteredTransactions = (response.data || []).filter(day => {
        if (!day.date) return false;
        const dayDate = new Date(day.date);
        return dayDate >= startDateObj && dayDate <= endDateObj;
      });
      
      setDailyTransactions(filteredTransactions || []);
    } catch (error) {
      console.error("獲取每日交易列表失敗:", error);
      if (error.code === 'ERR_NETWORK') {
        toast.error("無法連接到伺服器，請確認後端 API 是否啟動");
      } else {
        toast.error("無法獲取交易列表，請稍後再試");
      }
      setDailyTransactions([]); // 設置為空陣列避免頁面錯誤
    } finally {
      if (!wasLoading) setIsLoading(false);
    }
  };

  const fetchReconciliations = async () => {
    // 使用局部加載狀態來避免整個頁面重新渲染
    const wasLoading = isLoading;
    if (!wasLoading) setIsLoading(true);
    
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/reconciliations", { params });
      
      // 確認數據是否在選定的日期範圍內
      const startDateObj = new Date(dateRange.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      
      const endDateObj = new Date(dateRange.endDate);
      endDateObj.setHours(23, 59, 59, 999);
      
      // 過濾響應數據，確保日期在範圍內
      const filteredReconciliations = (response.data || []).filter(record => {
        if (!record.reconciliation_date) return false;
        const recordDate = new Date(record.reconciliation_date);
        return recordDate >= startDateObj && recordDate <= endDateObj;
      });
      
      setReconciliations(filteredReconciliations || []);
    } catch (error) {
      console.error("獲取對帳列表失敗:", error);
      toast.error("無法獲取對帳列表，請稍後再試");
      setReconciliations([]); // 設置為空陣列避免頁面錯誤
    } finally {
      if (!wasLoading) setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/payments/dashboard", { params });
      
      // 確保有有效的回應數據
      if (response && response.data && response.data.stats) {
        setStats({
          totalSales: response.data.stats.total_sales || 0,
          transactionCount: response.data.stats.transaction_count || 0,
          totalFees: response.data.stats.total_fees || 0,
          netIncome: response.data.stats.net_income || 0,
          pendingReconciliation: response.data.stats.pending_reconciliation || 0,
          completedReconciliation: response.data.stats.completed_reconciliation || 0
        });
      } else {
        console.warn("獲取金流統計返回無效數據");
      }
    } catch (error) {
      console.error("獲取金流統計失敗:", error);
      // 不要顯示錯誤給用戶，只在控制台記錄，保持用戶體驗
    }
  };

  // 處理日期點擊，顯示該日詳細交易
  const handleDateClick = async (date) => {
    // 先設置彈窗狀態，避免設置loading狀態導致頁面閃爍
    setDetailDate(date);
    setShowDetail(true);
    
    // 檢查是否已經有緩存的數據
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const cachedData = dailyDataCache.current[formattedDate];
    
    if (cachedData) {
      // 如果有緩存數據，直接使用
      setDayTransactions(cachedData.transactions || []);
      setDailyData(cachedData);
      return;
    }
    
    // 沒有緩存數據時才顯示加載狀態
    setIsLoadingDetail(true);
    try {
      const response = await apiService.get(`/transactions/daily/${formattedDate}`);
      
      // 確保有效數據格式
      const transactions = response.data.transactions || [];
      
      // 設置對帳狀態
      const data = {
        ...response.data,
        reconciliation_status: response.data.stats?.reconciliation_status || ''
      };
      
      // 保存到緩存
      dailyDataCache.current[formattedDate] = data;
      
      setDayTransactions(transactions);
      setDailyData(data);
    } catch (error) {
      console.error("獲取日交易詳情失敗:", error);
      toast.error("無法獲取交易詳情，請稍後再試");
    } finally {
      setIsDatePickerOpen(false);
      setIsLoadingDetail(false);
    }
  };

  // 處理對帳操作
  const handleDailyReconciliation = async (date, status = 'normal', customNotes = '') => {
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      let notes = customNotes;
      
      if (!notes) {
        const statusText = status === 'normal' ? '正常' : status === 'abnormal' ? '異常' : '待處理';
        notes = `系統對帳(${statusText}) - ${new Date().toLocaleString()}`;
      }
      
      await apiService.post(`/reconciliations/daily/${formattedDate}`, {
        status,
        notes
      });
      
      toast.success(`對帳成功 - 已標記為${status === 'normal' ? '正常' : status === 'abnormal' ? '異常' : '待處理'}`);
      fetchDailyTransactions();
      fetchReconciliations();
      fetchStats();
      setShowDetail(false);
    } catch (error) {
      console.error("對帳失敗:", error);
      toast.error("對帳失敗，請稍後再試");
    }
  };

  // 處理對單筆交易的備註
  const handleTransactionNote = async (transactionId, note) => {
    try {
      await apiService.post(`/transactions/${transactionId}/note`, { note });
      toast.success("備註已儲存");
      
      // 更新當前詳情中的交易備註
      setDayTransactions(dayTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, notes: note }
          : transaction
      ));
    } catch (error) {
      console.error("儲存備註失敗:", error);
      toast.error("儲存備註失敗，請稍後再試");
    }
  };

  // 格式化金額顯示
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 格式化日期顯示
  const formatDate = (dateStr, includeTime = true) => {
    if (!dateStr) return "";
    
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      return format(date, includeTime ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd', { locale: zhTW });
    } catch (error) {
      console.error("日期格式化錯誤:", error);
      return dateStr;
    }
  };

  // 獲取交易方式圖標
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4 text-blue-500" />;
      case 'bank_transfer':
        return <CoinsIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ReceiptIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // 獲取交易狀態標籤的樣式
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800 border border-green-200";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case 'failed':
        return "bg-red-100 text-red-800 border border-red-200";
      case 'refunded':
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // 處理數據導出
  const prepareCSVData = async () => {
    try {
      setIsExporting(true);
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      // 根據當前活動的選項卡選擇導出的數據
      let endpoint = activeTab === "transactions" 
        ? "/payments/transactions/export" 
        : "/payments/reconciliations/export";
        
      console.log("正在請求 CSV 數據，端點:", endpoint, "參數:", params);
      
      // 发送请求前检查本地存储是否有 authToken
      const hasToken = localStorage.getItem("authToken");
      if (!hasToken) {
        console.warn("缺少認證令牌，CSV 導出可能會失敗");
      }
      
      try {
        const response = await apiService.get(endpoint, { params });
        
        if (!response || !response.data) {
          throw new Error("沒有收到任何數據");
        }
        
        if (!Array.isArray(response.data)) {
          console.error("返回的數據格式不正確:", response.data);
          throw new Error("返回的數據格式不正確");
        }
        
        // 設置 CSV 數據
        console.log(`成功獲取 ${response.data.length} 條記錄用於 CSV 導出`);
        setCsvData(response.data);
        
        // 延遲一下，確保 csvData 已經更新，然後模擬點擊 CSVLink
        setTimeout(() => {
          if (csvLinkRef.current) {
            console.log("CSV 數據準備完成，觸發下載...");
            csvLinkRef.current.link.click();
          } else {
            console.error("CSV 下載鏈接未找到");
            toast.error("CSV 導出失敗，請稍後再試");
          }
          setIsExporting(false);
        }, 100);
      } catch (apiError) {
        console.error("API 請求失敗:", apiError);
        if (apiError.response && apiError.response.status === 401) {
          toast.error("認證失敗，請重新登入");
        } else {
          toast.error("無法獲取 CSV 數據，請稍後再試");
        }
        setIsExporting(false);
      }
    } catch (error) {
      console.error("準備導出數據失敗:", error);
      toast.error("準備導出數據失敗，請稍後再試");
      setIsExporting(false);
    }
  };

  // 獲取 CSV 標題
  const getCSVHeaders = () => {
    if (activeTab === "transactions") {
      return [
        { label: "日期", key: "date" },
        { label: "交易筆數", key: "transaction_count" },
        { label: "總金額", key: "total_amount" },
        { label: "手續費", key: "total_fee" },
        { label: "淨收入", key: "total_net_amount" },
        { label: "對帳狀態", key: "reconciliation_status" },
        { label: "備註", key: "reconciliation_notes" }
      ];
    } else {
      return [
        { label: "日期", key: "reconciliation_date" },
        { label: "對帳編號", key: "reconciliation_number" },
        { label: "交易筆數", key: "transaction_count" },
        { label: "交易總額", key: "total_amount" },
        { label: "對帳時間", key: "created_at" },
        { label: "操作人員", key: "staff_name" },
        { label: "狀態", key: "status" },
        { label: "備註", key: "notes" }
      ];
    }
  };

  // 獲取導出文件名
  const getCSVFileName = () => {
    const dateStr = format(new Date(), 'yyyyMMdd_HHmmss');
    return activeTab === "transactions" 
      ? `交易記錄_${dateStr}.csv` 
      : `對帳記錄_${dateStr}.csv`;
  };

  // 渲染日期範圍選擇器
  const renderDateRangePicker = () => {
    return (
      <Popover open={isDatePickerOpen} onOpenChange={(open) => {
        // 打開時，將當前dateRange複製到tempDateRange
        if (open) {
          setTempDateRange({...dateRange});
        }
        setIsDatePickerOpen(open);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-72 px-3 py-2"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {formatDate(dateRange.startDate, false)} - {formatDate(dateRange.endDate, false)}
              </span>
            </div>
            <FilterIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col p-3 space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center">
                <div className="text-sm font-medium mr-2">開始日期</div>
                <Input
                  type="date"
                  value={format(tempDateRange.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setTempDateRange({
                      ...tempDateRange,
                      startDate: new Date(e.target.value)
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="flex items-center">
                <div className="text-sm font-medium mr-2">結束日期</div>
                <Input
                  type="date"
                  value={format(tempDateRange.endDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setTempDateRange({
                      ...tempDateRange,
                      endDate: new Date(e.target.value)
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDateRange = {
                    startDate: startOfMonth(today),
                    endDate: endOfMonth(today)
                  };
                  setTempDateRange(newDateRange);
                }}
              >
                本月
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastMonthStart = startOfMonth(subDays(today, 30));
                  const lastMonthEnd = endOfMonth(lastMonthStart);
                  const newDateRange = {
                    startDate: lastMonthStart,
                    endDate: lastMonthEnd
                  };
                  setTempDateRange(newDateRange);
                }}
              >
                上個月
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDateRange = {
                    startDate: subDays(today, 7),
                    endDate: today
                  };
                  setTempDateRange(newDateRange);
                }}
              >
                最近7天
              </Button>
            </div>
            
            <Button
              onClick={() => {
                // 應用選擇的日期範圍
                setDateRange(tempDateRange);
                setIsDatePickerOpen(false);
              }}
            >
              套用篩選
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // 處理點擊交易項目，顯示訂單詳情
  const handleOrderClick = async (orderId) => {
    // 先打開窗口再加載數據
    setShowOrderDetail(true);
    setIsLoadingOrder(true);
    
    try {
      // 根據訂單 ID 獲取詳細資訊
      const response = await apiService.get(`/transactions/order/${orderId}`);
      setCurrentOrder(response.data);
    } catch (error) {
      console.error("獲取訂單詳情失敗:", error);
      toast.error("無法獲取訂單詳情，請稍後再試");
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // 渲染日交易詳細信息模態窗口
  const renderDailyDetailModal = () => {
    if (!showDetail) return null;

    // 使用top-level和stats都可能存在的對帳狀態
    const reconciliationStatus = dailyData?.reconciliation_status || '';
    
    const isReconciled = reconciliationStatus === 'completed' || reconciliationStatus === 'normal' || reconciliationStatus === 'abnormal';
    const reconciliationNotes = dailyData?.stats?.reconciliation_notes || '';

    return (
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-brandBlue-normal" />
              {formatDate(detailDate, false)} 交易明細
              <div className="ml-2">
                {renderStatusBadge(reconciliationStatus)}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-normal"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">交易筆數</p>
                      <h4 className="text-2xl font-semibold mt-1">{dailyData?.stats?.transaction_count || 0} 筆</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <ClipboardListIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">交易總額</p>
                      <h4 className="text-2xl font-semibold mt-1">{formatAmount(dailyData?.stats?.total_amount || 0)}</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <DollarSignIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">手續費總額</p>
                      <h4 className="text-2xl font-semibold mt-1">{formatAmount(dailyData?.stats?.total_fee || 0)}</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <PercentIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">淨收入</p>
                      <h4 className="text-2xl font-semibold mt-1">{formatAmount(dailyData?.stats?.total_net_amount || 0)}</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <TrendingUpIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
              </div>

              {reconciliationNotes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <FileTextIcon className="h-4 w-4" />
                    <h3 className="text-sm font-medium">對帳備註</h3>
                  </div>
                  <p className="text-gray-700">{reconciliationNotes}</p>
                </div>
              )}

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          交易時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          訂單編號
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          支付方式
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          備註
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          查看
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyData?.transactions && dailyData.transactions.length > 0 ? 
                        dailyData.transactions.map((transaction) => (
                          <tr key={`trans-${transaction.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{formatDate(transaction.payment_date)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{transaction.order_id}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(transaction.payment_method)}
                                <span className="ml-2 text-sm text-gray-900">{transaction.payment_method}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">{formatAmount(transaction.amount)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.notes || '無'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderClick(transaction.order_id);
                                }}
                                className="flex items-center gap-1"
                              >
                                <EyeIcon className="h-4 w-4" />
                                查看
                              </Button>
                            </td>
                          </tr>
                        )) : 
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            該日無交易記錄
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t flex justify-end">
                <Button 
                  onClick={() => openReconciliationDialog(detailDate)} 
                  variant="default"
                  className="flex items-center gap-2"
                >
                  {isReconciled ? (
                    <>
                      <FileTextIcon className="h-4 w-4" />
                      修改對帳狀態
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      設定對帳狀態
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // 渲染統計卡片
  const renderStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* 總交易額 */}
        <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">總交易額</p>
              <h4 className="text-2xl font-semibold mt-1">
                {isLoading ? (
                  <div className="w-20 h-7 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <span>{formatAmount(stats.totalSales || 0)}</span>
                )}
              </h4>
            </div>
            <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-brandBlue-normal" />
            </div>
          </div>
        </div>

        {/* 交易筆數 */}
        <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">交易筆數</p>
              <h4 className="text-2xl font-semibold mt-1">
                {isLoading ? (
                  <div className="w-16 h-7 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <span>{stats.transactionCount || 0} 筆</span>
                )}
              </h4>
            </div>
            <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
              <ClipboardListIcon className="h-6 w-6 text-brandBlue-normal" />
            </div>
          </div>
        </div>

        {/* 手續費支出 */}
        <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">手續費支出</p>
              <h4 className="text-2xl font-semibold mt-1">
                {isLoading ? (
                  <div className="w-20 h-7 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <span>{formatAmount(stats.totalFees || 0)}</span>
                )}
              </h4>
            </div>
            <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
              <PercentIcon className="h-6 w-6 text-brandBlue-normal" />
            </div>
          </div>
        </div>

        {/* 待對帳天數 */}
        <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">待對帳天數</p>
              <h4 className="text-2xl font-semibold mt-1">
                {isLoading ? (
                  <div className="w-16 h-7 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <span>{stats.pendingReconciliation || 0} 天</span>
                )}
              </h4>
            </div>
            <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
              <ClipboardCheckIcon className="h-6 w-6 text-brandBlue-normal" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 打開對帳狀態選擇對話框
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [reconciliationNotes, setReconciliationNotes] = useState('');
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('normal');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const openReconciliationDialog = async (date) => {
    try {
      setCurrentDate(date);
      
      // 狀態值初始化
      let status = '';
      let notes = '';
      
      // 優先使用當前詳情頁面的數據（如果已打開）
      if (showDetail && detailDate && format(detailDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
        status = dailyData?.reconciliation_status;
        notes = dailyData?.stats?.reconciliation_notes || '';
      } else {
        // 否則從交易列表中查找
        const dayData = dailyTransactions.find(day => {
          if (!day.date) return false;
          return format(new Date(day.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        
        if (dayData) {
          status = dayData.reconciliation_status;
          notes = dayData.reconciliation_notes || '';
        } else {
          // 如果在本地數據中找不到，則從API獲取
          const formattedDate = format(new Date(date), 'yyyy-MM-dd');
          const response = await apiService.get(`/transactions/daily/${formattedDate}`);
          
          if (response.data && response.data.stats) {
            status = response.data.stats.reconciliation_status || '';
            notes = response.data.stats.reconciliation_notes || '';
          }
        }
      }
      
      // 格式化狀態值以進行比較
      const formatStatusValue = (status) => {
        if (!status) return ''; // 如果狀態為空，返回空字串，保持提示訊息
        
        const normalizedStatus = String(status).toLowerCase().trim();
        if (normalizedStatus === '1' || normalizedStatus === 'completed' || normalizedStatus === 'normal') 
          return 'normal';
        if (normalizedStatus === 'abnormal') 
          return 'abnormal';
        if (normalizedStatus === 'pending') 
          return 'pending';
        
        return ''; // 默認情況下返回空字串
      };
      
      // 設置當前狀態
      const formattedStatus = formatStatusValue(status);
      console.log("設置對帳狀態:", formattedStatus, "原始狀態:", status);
      setSelectedStatus(formattedStatus);
      setReconciliationNotes(notes);
      
      // 打開對話框
      setShowStatusDialog(true);
    } catch (error) {
      console.error("獲取對帳狀態失敗:", error);
      toast.error("無法獲取對帳狀態，請稍後再試");
      
      // 即使出錯，仍然打開對話框，不預設選擇狀態
      setSelectedStatus('');
      setReconciliationNotes('');
      setShowStatusDialog(true);
    }
  };

  // 處理對帳狀態提交
  const handleSubmitReconciliation = async () => {
    try {
      if (!selectedStatus) {
        toast.error("請至少選擇一個對帳狀態才能進行提交");
        return;
      }

      setIsUpdatingStatus(true);
      
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      // 呼叫API更新對帳狀態
      const response = await apiService.post(`/reconciliations/daily/${formattedDate}`, {
        status: selectedStatus,
        notes: reconciliationNotes
      });
      
      // 關閉對話框
      setShowStatusDialog(false);
      
      // 顯示成功提示
      toast.success("對帳狀態已成功更新");
      
      // 更新本地狀態
      // 1. 如果詳細頁面開啟，更新當前dailyData的狀態
      if (showDetail && detailDate && format(detailDate, 'yyyy-MM-dd') === formattedDate) {
        const updatedData = {
          ...dailyData,
          reconciliation_status: selectedStatus,
          stats: {
            ...dailyData.stats,
            reconciliation_status: selectedStatus,
            reconciliation_notes: reconciliationNotes
          }
        };
        
        setDailyData(updatedData);
        // 同時更新緩存
        dailyDataCache.current[formattedDate] = updatedData;
      }
      
      // 2. 更新每日交易列表中的狀態
      setDailyTransactions(dailyTransactions.map(day => {
        if (day.date && format(new Date(day.date), 'yyyy-MM-dd') === formattedDate) {
          return {
            ...day,
            reconciliation_status: selectedStatus,
            reconciliation_notes: reconciliationNotes
          };
        }
        return day;
      }));
      
      // 重新載入交易數據和對帳記錄
      fetchDailyTransactions();
      fetchReconciliations();
      fetchStats();
    } catch (error) {
      console.error('Error updating reconciliation status:', error);
      toast.error("無法更新對帳狀態，請稍後再試");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 渲染狀態標籤
  const renderStatusBadge = (status) => {
    let className = '';
    let text = '';
    let icon = null;
    
    // 格式化狀態值以確保一致性
    const normalizedStatus = status ? String(status).toLowerCase().trim() : '';
    
    switch(normalizedStatus) {
      case 'normal':
      case '正常':
        className = 'bg-green-100 text-green-800 border-green-300';
        text = '正常';
        icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
        break;
      case 'abnormal':
      case '異常':
        className = 'bg-red-100 text-red-800 border-red-300';
        text = '異常';
        icon = <AlertTriangleIcon className="h-3 w-3 mr-1" />;
        break;
      case 'pending':
      case '待處理':
        className = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        text = '待處理';
        icon = <ClockIcon className="h-3 w-3 mr-1" />;
        break;
      case 'completed':
      case '已對帳':
      case '1': 
        className = 'bg-green-100 text-green-800 border-green-300';
        text = '已對帳';
        icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
        break;
      case '':
      case 'null':
      case 'undefined':
      case '0': 
      case 'false':
        className = 'bg-gray-100 text-gray-800 border-gray-300';
        text = '未對帳';
        icon = <CircleIcon className="h-3 w-3 mr-1" />;
        break;
      default:
        // 如果是數字，嘗試將其轉換為對應的狀態
        if (!isNaN(Number(status))) {
          const numStatus = Number(status);
          if (numStatus === 1) {
            className = 'bg-green-100 text-green-800 border-green-300';
            text = '已對帳';
            icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
          } else if (numStatus === 0) {
            className = 'bg-gray-100 text-gray-800 border-gray-300';
            text = '未對帳';
            icon = <CircleIcon className="h-3 w-3 mr-1" />;
          } else {
            className = 'bg-gray-100 text-gray-800 border-gray-300';
            text = `狀態(${status})`;
            icon = <CircleIcon className="h-3 w-3 mr-1" />;
          }
        } else {
          // 其他任何未知狀態
          className = 'bg-gray-100 text-gray-800 border-gray-300';
          text = status ? `${status}` : '未對帳';
          icon = <CircleIcon className="h-3 w-3 mr-1" />;
        }
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${className}`}>
        {icon}
        {text}
      </span>
    );
  };

  // 添加訂單詳情對話框
  const renderOrderDetailModal = () => {
    if (!showOrderDetail || !currentOrder) return null;

    return (
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-brandBlue-normal" />
              訂單詳情 #{currentOrder.order_id}
            </DialogTitle>
            <DialogDescription>
              交易時間: {formatDate(currentOrder.trade_Date)}
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrder ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-normal"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">訂單金額</p>
                      <h4 className="text-2xl font-semibold mt-1">{formatAmount(currentOrder.total_price_with_discount)}</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <DollarSignIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">支付方式</p>
                      <h4 className="text-xl font-semibold mt-1 flex items-center">
                        {getPaymentMethodIcon(currentOrder.payment_type)}
                        <span className="ml-2">{currentOrder.payment_type}</span>
                      </h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">交易狀態</p>
                      <h4 className="text-xl font-semibold mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(currentOrder.trade_status)}`}>
                          {currentOrder.trade_status}
                        </span>
                      </h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <ActivityIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4 hover:border-brandBlue-light transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">交易編號</p>
                      <h4 className="text-sm font-mono font-semibold mt-1 truncate">{currentOrder.trade_No}</h4>
                    </div>
                    <div className="w-12 h-12 bg-brandBlue-ultraLight rounded-full flex items-center justify-center">
                      <HashIcon className="h-6 w-6 text-brandBlue-normal" />
                    </div>
                  </div>
                </div>
              </div>

              {currentOrder.notes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <FileTextIcon className="h-4 w-4" />
                    <h3 className="text-sm font-medium">交易備註</h3>
                  </div>
                  <p className="text-gray-700">{currentOrder.notes}</p>
                </div>
              )}

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-3 bg-gray-50 font-medium flex items-center">
                  <ShoppingCartIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <h3>訂單項目</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名稱</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">尺寸</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顏色</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">單價</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                        currentOrder.order_items.map((item, index) => (
                          <tr key={`item-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_size}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_color}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAmount(item.product_price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatAmount(item.product_price * item.quantity)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">無訂單項目資料</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                  訂單成立時間: {formatDate(currentOrder.created_at)}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">總金額: <span className="text-brandBlue-normal">{formatAmount(currentOrder.total_price_with_discount)}</span></p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // 處理 Tab 變更
  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // 更新 URL 中的查詢參數
    const newSearchParams = new URLSearchParams(location.search);
    if (value === "transactions") {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', value);
    }
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  return (
    <section className="w-full h-full bg-white p-6 overflow-y-auto">
      {/* 頁面標題 */}
      <div className="mb-6">
        <div className="box-border flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              className="text-brandBlue-normal"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                color="currentColor"
              >
                <path d="M20.943 16.835a15.76 15.76 0 0 0-4.476-8.616c-.517-.503-.775-.754-1.346-.986C14.55 7 14.059 7 13.078 7h-2.156c-.981 0-1.472 0-2.043.233c-.57.232-.83.483-1.346.986a15.76 15.76 0 0 0-4.476 8.616C2.57 19.773 5.28 22 8.308 22h7.384c3.029 0 5.74-2.227 5.25-5.165" />
                <path d="M7.257 4.443c-.207-.3-.506-.708.112-.8c.635-.096 1.294.338 1.94.33c.583-.009.88-.268 1.2-.638C10.845 2.946 11.365 2 12 2s1.155.946 1.491 1.335c.32.37.617.63 1.2.637c.646.01 1.305-.425 1.94-.33c.618.093.319.5.112.8l-.932 1.359c-.4.58-.599.87-1.017 1.035S13.837 7 12.758 7h-1.516c-1.08 0-1.619 0-2.036-.164S8.589 6.38 8.189 5.8zm6.37 8.476c-.216-.799-1.317-1.519-2.638-.98s-1.53 2.272.467 2.457c.904.083 1.492-.097 2.031.412c.54.508.64 1.923-.739 2.304c-1.377.381-2.742-.214-2.89-1.06m1.984-5.06v.761m0 5.476v.764" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
              金流管理
            </h1>
          </div>
        </div>
      </div>
      
      {/* 操作按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {renderDateRangePicker()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDailyTransactions();
              fetchReconciliations();
              fetchStats();
            }}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className="h-4 w-4" />
            更新資料
          </Button>
        </div>
        
        {activeTab !== "settings" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={prepareCSVData}
            className="flex items-center gap-1"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            {activeTab === "transactions" ? "匯出每日交易" : "匯出對帳紀錄"}
          </Button>
        )}
        
        {/* 隱藏的 CSVLink 組件 */}
        <CSVLink
          data={csvData}
          headers={getCSVHeaders()}
          filename={getCSVFileName()}
          className="hidden"
          ref={csvLinkRef}
          target="_blank"
        />
      </div>

      {/* 统计卡片 */}
      {renderStatsCards()}

      {/* 使用 Shadcn UI 的 Tabs 元件 */}
      <Tabs 
        defaultValue="transactions" 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="bg-gray-100 mb-6">
          <TabsTrigger 
            value="transactions" 
            className="flex items-center gap-2 data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white"
          >
            <CreditCardIcon className="h-4 w-4" />
            每日交易
          </TabsTrigger>
          <TabsTrigger 
            value="reconciliations" 
            className="flex items-center gap-2 data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white"
          >
            <FileTextIcon className="h-4 w-4" />
            對帳記錄
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white"
          >
            <Settings2Icon className="h-4 w-4" />
            系統設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {isLoading && activeTab === "transactions" ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-normal"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易筆數</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手續費</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">淨收入</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">對帳狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備註</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">查看</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyTransactions.length > 0 ? (
                    dailyTransactions.map((day) => (
                      <tr 
                        key={`day-${day.date}`} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => handleDateClick(day.date)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatDate(day.date, false)}</span>
                        </td>
                        <td className="py-3 px-4">{day.transaction_count} 筆</td>
                        <td className="py-3 px-4">{formatAmount(day.total_amount)}</td>
                        <td className="py-3 px-4">{formatAmount(day.total_fee)}</td>
                        <td className="py-3 px-4">{formatAmount(day.total_net_amount)}</td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(day.reconciliation_status)}
                        </td>
                        <td className="py-3 px-4">
                          {day.has_note ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">有備註</span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            handleDateClick(day.date);
                          }}>
                            <ChevronRightIcon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        所選日期範圍內沒有交易記錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reconciliations" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {isLoading && activeTab === "reconciliations" ? (
              <div className="flex justify-center items-center h-64">
                <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">對帳編號</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易筆數</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易總額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">對帳時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人員</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備註</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reconciliations.length > 0 ? (
                    reconciliations.map((reconciliation) => (
                      <tr key={`rec-${reconciliation.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{formatDate(reconciliation.reconciliation_date, false)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{reconciliation.reconciliation_number}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700">{reconciliation.transaction_count} 筆</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatAmount(reconciliation.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span>{formatDate(reconciliation.created_at)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700">{reconciliation.staff_name || '系統'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(reconciliation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700">{reconciliation.notes || '無'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDateClick(reconciliation.reconciliation_date)} 
                            className="h-8 text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <SearchIcon className="h-4 w-4 mr-1" />
                            查看明細
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // 直接打開對帳對話框，無需先打開明細頁面
                              openReconciliationDialog(reconciliation.reconciliation_date);
                            }}
                            className="h-8"
                          >
                            <FileTextIcon className="h-4 w-4 mr-1" />
                            修改狀態
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        尚無對帳記錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">金流服務設定</h2>
            <div className="border-t pt-4">
              <CashFlowSettings />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 日交易詳細信息模態窗口 */}
      {renderDailyDetailModal()}

      {/* 添加對帳狀態選擇對話框 */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader className="flex flex-row items-center gap-2 pb-2 border-b">
            <CalendarIcon className="h-5 w-5 text-brandBlue-normal" />
            <DialogTitle>設定對帳狀態</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">日期：</span>
              <span className="font-medium text-brandBlue-normal">
                {currentDate ? formatDate(currentDate, false) : ''}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <ClipboardCheckIcon className="h-4 w-4 text-gray-500" />
                <span>對帳狀態</span>
                {!selectedStatus && <span className="text-xs text-red-500 ml-1">*必選</span>}
              </Label>
              
              <RadioGroup 
                value={selectedStatus} 
                onValueChange={(value) => {
                  console.log("選擇狀態:", value);
                  setSelectedStatus(value);
                }} 
                className="grid grid-cols-3 gap-4"
              >
                <div className={`flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedStatus === 'normal' ? 'bg-green-50 border-green-300 ring-2 ring-green-200' : 'hover:border-brandBlue-light'}`} onClick={() => setSelectedStatus('normal')}>
                  <RadioGroupItem value="normal" id="normal" className="sr-only" />
                  <Label htmlFor="normal" className="cursor-pointer text-center">
                    <CheckCircleIcon className="h-8 w-8 mb-2 mx-auto text-green-500" />
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">正常</span>
                  </Label>
                </div>
                <div className={`flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedStatus === 'abnormal' ? 'bg-red-50 border-red-300 ring-2 ring-red-200' : 'hover:border-brandBlue-light'}`} onClick={() => setSelectedStatus('abnormal')}>
                  <RadioGroupItem value="abnormal" id="abnormal" className="sr-only" />
                  <Label htmlFor="abnormal" className="cursor-pointer text-center">
                    <AlertTriangleIcon className="h-8 w-8 mb-2 mx-auto text-red-500" />
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">異常</span>
                  </Label>
                </div>
                <div className={`flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedStatus === 'pending' ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200' : 'hover:border-brandBlue-light'}`} onClick={() => setSelectedStatus('pending')}>
                  <RadioGroupItem value="pending" id="pending" className="sr-only" />
                  <Label htmlFor="pending" className="cursor-pointer text-center">
                    <ClockIcon className="h-8 w-8 mb-2 mx-auto text-amber-500" />
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">待處理</span>
                  </Label>
                </div>
              </RadioGroup>
              
              {!selectedStatus && (
                <div className="text-center py-2 px-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center justify-center gap-2 text-yellow-700">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">請選擇一個對帳狀態</span>
                  </div>
                </div>
              )}
              
              <div className="grid gap-2 mt-4">
                <Label htmlFor="statusNote" className="text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <FileTextIcon className="h-4 w-4 text-gray-500" />
                    對帳備註
                  </span>
                </Label>
                <Textarea 
                  id="statusNote" 
                  placeholder="請輸入對帳備註..."
                  value={reconciliationNotes}
                  onChange={(e) => setReconciliationNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSubmitReconciliation} 
              disabled={isUpdatingStatus || !selectedStatus}
              className="flex items-center gap-2"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  儲存變更
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加訂單詳情模態窗口 */}
      {renderOrderDetailModal()}
    </section>
  );
};

export default CashFlow;

