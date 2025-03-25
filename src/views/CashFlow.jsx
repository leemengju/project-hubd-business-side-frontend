// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import { useState, useEffect } from "react";
import apiService from "../services/api";
import { toast } from "react-hot-toast";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { zhTW } from "date-fns/locale";
import { 
  CalendarIcon, 
  SearchIcon, 
  FileTextIcon, 
  DownloadIcon, 
  UploadIcon, 
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  RefreshCwIcon,
  CreditCardIcon,
  ReceiptIcon,
  CoinsIcon,
  FilterIcon,
  ChevronRightIcon,
  Loader2Icon,
  Settings2Icon,
  ClockIcon
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

  // 日期篩選
  const today = new Date();
  const [dateRange, setDateRange] = useState({
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
  }, []);

  const fetchDailyTransactions = async () => {
    setIsLoading(true);
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/transactions/daily-summary", { params });
      setDailyTransactions(response.data || []);
    } catch (error) {
      console.error("獲取每日交易列表失敗:", error);
      if (error.code === 'ERR_NETWORK') {
        toast.error("無法連接到伺服器，請確認後端 API 是否啟動");
      } else {
        toast.error("無法獲取交易列表，請稍後再試");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReconciliations = async () => {
    setIsLoading(true);
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/reconciliations", { params });
      setReconciliations(response.data || []);
    } catch (error) {
      console.error("獲取對帳列表失敗:", error);
      toast.error("無法獲取對帳列表，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get("/payments/dashboard");
      setStats({
        totalSales: response.data.stats.total_sales || 0,
        transactionCount: response.data.stats.transaction_count || 0,
        totalFees: response.data.stats.total_fees || 0,
        netIncome: response.data.stats.net_income || 0,
        pendingReconciliation: response.data.stats.pending_reconciliation || 0,
        completedReconciliation: response.data.stats.completed_reconciliation || 0
      });
    } catch (error) {
      console.error("獲取金流統計失敗:", error);
    }
  };

  // 處理日期點擊，顯示該日詳細交易
  const handleDateClick = async (date) => {
    setIsLoading(true);
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      const response = await apiService.get(`/transactions/daily/${formattedDate}`);
      
      setDetailDate(date);
      setDayTransactions(response.data.transactions || []);
      setDailyData(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error("獲取日交易詳情失敗:", error);
      toast.error("無法獲取交易詳情，請稍後再試");
    } finally {
      setIsDatePickerOpen(false);
      setIsLoading(false);
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
  const handleExportData = async () => {
    try {
      const params = {
        start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange.endDate, 'yyyy-MM-dd')
      };
      
      const response = await apiService.get("/payments/export-excel", { params });
      
      // 建立臨時下載連結
      const fileName = response.data.filename || "交易記錄.xlsx";
      const downloadData = response.data.data;
      
      // 使用 xlsx 庫轉換數據為 Excel 並下載
      import('xlsx').then(XLSX => {
        const worksheet = XLSX.utils.json_to_sheet(downloadData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "交易記錄");
        XLSX.writeFile(workbook, fileName);
        toast.success("數據導出成功");
      });
    } catch (error) {
      console.error("數據導出失敗:", error);
      toast.error("數據導出失敗，請稍後再試");
    }
  };

  // 渲染日期範圍選擇器
  const renderDateRangePicker = () => {
    return (
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                  value={format(dateRange.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setDateRange({
                      ...dateRange,
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
                  value={format(dateRange.endDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setDateRange({
                      ...dateRange,
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
                  setDateRange({
                    startDate: startOfMonth(today),
                    endDate: endOfMonth(today)
                  });
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
                  setDateRange({
                    startDate: lastMonthStart,
                    endDate: lastMonthEnd
                  });
                }}
              >
                上個月
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateRange({
                    startDate: subDays(today, 7),
                    endDate: today
                  });
                }}
              >
                最近7天
              </Button>
            </div>
            
            <Button
              onClick={() => {
                setIsDatePickerOpen(false);
                fetchDailyTransactions();
                fetchReconciliations();
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
    setIsLoading(true);
    try {
      // 根據訂單 ID 獲取詳細資訊
      const response = await apiService.get(`/transactions/order/${orderId}`);
      setCurrentOrder(response.data);
      setShowOrderDetail(true);
    } catch (error) {
      console.error("獲取訂單詳情失敗:", error);
      toast.error("無法獲取訂單詳情，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染日交易詳細信息模態窗口
  const renderDailyDetailModal = () => {
    if (!showDetail) return null;

    const isReconciled = dailyData?.reconciliation_status === 'completed' || dailyData?.reconciliation_status === 'normal' || dailyData?.reconciliation_status === 'abnormal';
    const reconciliationNotes = dailyData?.reconciliation_notes || '';

    return (
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {formatDate(detailDate, false)} 交易明細
              <div className="mt-1">
                {renderStatusBadge(dailyData?.reconciliation_status)}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">交易總筆數</h3>
                  <p className="text-2xl font-bold">{dailyData?.stats?.transaction_count || 0} 筆</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">交易總金額</h3>
                  <p className="text-2xl font-bold text-blue-600">{formatAmount(dailyData?.stats?.total_amount || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">手續費總額</h3>
                  <p className="text-2xl font-bold text-red-600">{formatAmount(dailyData?.stats?.total_fee || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">淨收入</h3>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(dailyData?.stats?.total_net_amount || 0)}</p>
                </div>
              </div>

              {reconciliationNotes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">對帳備註</h3>
                  <p className="text-gray-700">{reconciliationNotes}</p>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
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
                    <tbody className="bg-white divide-y divide-gray-200">
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

              {!isReconciled && (
                <div className="pt-4 border-t flex justify-end">
                  <Button onClick={() => openReconciliationDialog(detailDate)}>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    標記為已對帳
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // 渲染金流統計卡片
  const renderStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 總交易金額 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">總交易金額</p>
              <h3 className="text-2xl font-bold mt-1">{formatAmount(stats.totalSales)}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CoinsIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 交易筆數 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">交易筆數</p>
              <h3 className="text-2xl font-bold mt-1">{stats.transactionCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileTextIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* 手續費 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">手續費</p>
              <h3 className="text-2xl font-bold mt-1">{formatAmount(stats.totalFees)}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <ReceiptIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* 淨收入 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">淨收入</p>
              <h3 className="text-2xl font-bold mt-1">{formatAmount(stats.netIncome)}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ArrowUpIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* 待對帳筆數 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待對帳筆數</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pendingReconciliation}</h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* 已對帳筆數 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已對帳筆數</p>
              <h3 className="text-2xl font-bold mt-1">{stats.completedReconciliation}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 打開對帳狀態選擇對話框
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [reconciliationNoteInput, setReconciliationNoteInput] = useState('');
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('normal');
  
  const openReconciliationDialog = (date) => {
    setCurrentDate(date);
    setReconciliationNoteInput('');
    setSelectedStatus('normal');
    setShowStatusDialog(true);
  };

  // 渲染狀態標籤
  const renderStatusBadge = (status) => {
    let className = '';
    let text = '';
    
    switch(status) {
      case 'normal':
        className = 'bg-green-100 text-green-800 border-green-300';
        text = '正常';
        break;
      case 'abnormal':
        className = 'bg-red-100 text-red-800 border-red-300';
        text = '異常';
        break;
      case 'pending':
        className = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        text = '待處理';
        break;
      case 'completed': // 兼容舊數據
        className = 'bg-green-100 text-green-800 border-green-300';
        text = '正常';
        break;
      default:
        className = 'bg-gray-100 text-gray-800 border-gray-300';
        text = '未對帳';
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${className}`}>
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
            <DialogTitle className="text-xl">
              訂單詳情 #{currentOrder.order_id}
            </DialogTitle>
            <DialogDescription>
              交易時間: {formatDate(currentOrder.trade_Date)}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">訂單金額</h3>
                  <p className="text-2xl font-bold text-blue-600">{formatAmount(currentOrder.total_price_with_discount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">支付方式</h3>
                  <p className="text-xl font-semibold flex items-center">
                    {getPaymentMethodIcon(currentOrder.payment_type)}
                    <span className="ml-2">{currentOrder.payment_type}</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">交易狀態</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(currentOrder.trade_status)}`}>
                    {currentOrder.trade_status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">交易編號</h3>
                  <p className="font-mono text-gray-700">{currentOrder.trade_No}</p>
                </div>
              </div>

              {currentOrder.notes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">交易備註</h3>
                  <p className="text-gray-700">{currentOrder.notes}</p>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden mb-6">
                <h3 className="px-6 py-3 bg-gray-50 font-medium">訂單項目</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
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
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                        currentOrder.order_items.map((item, index) => (
                          <tr key={`item-${index}`}>
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

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">訂單成立時間: {formatDate(currentOrder.created_at)}</p>
                <div className="text-right">
                  <p className="text-lg font-semibold">總金額: <span className="text-blue-600">{formatAmount(currentOrder.total_price_with_discount)}</span></p>
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
    <section className="w-full h-full bg-white p-6 rounded-lg shadow-sm overflow-y-auto">
      {/* 頁面標題和右側添加設定按鈕 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="box-border flex relative flex-row shrink-0 gap-2 my-auto">
            <div className="my-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 20 20"
                className="text-brandBlue-normal"
              >
                <path
                  fill="currentColor"
                  d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16m-1-7.59V4h2v5.59l3.95 3.95l-1.41 1.41L9 10.41l-3.54 3.54l-1.41-1.41L8 8.59"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
                金流管理
              </h1>
              <p className="text-gray-500 mt-2">管理交易記錄和對帳流程，掌握資金動向</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleTabChange("settings")}
          >
            <Settings2Icon className="h-4 w-4" />
            金流設定
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {renderStatsCards()}

      {/* 操作按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {renderDateRangePicker()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDailyTransactions}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className="h-4 w-4" />
            刷新數據
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExportData}
          className="flex items-center gap-1"
        >
          <DownloadIcon className="h-4 w-4" />
          導出數據
        </Button>
      </div>

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
          <div className="rounded-md border overflow-x-auto">
            {isLoading && activeTab === "reconciliations" ? (
              <div className="flex justify-center items-center h-64">
                <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
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
                            className="h-8 text-blue-600 hover:text-blue-800"
                          >
                            <SearchIcon className="h-4 w-4 mr-1" />
                            查看
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
          <CashFlowSettings />
        </TabsContent>
      </Tabs>

      {/* 日交易詳細信息模態窗口 */}
      {renderDailyDetailModal()}

      {/* 添加對帳狀態選擇對話框 */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>選擇對帳狀態</DialogTitle>
            <DialogDescription>
              請選擇該日期交易的對帳狀態並添加備註
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <RadioGroup defaultValue="normal" value={selectedStatus} onValueChange={setSelectedStatus} className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="cursor-pointer">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">正常</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abnormal" id="abnormal" />
                <Label htmlFor="abnormal" className="cursor-pointer">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">異常</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">待處理</span>
                </Label>
              </div>
            </RadioGroup>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">對帳備註</Label>
              <Textarea 
                id="notes" 
                placeholder="請輸入對帳備註..."
                value={reconciliationNoteInput}
                onChange={(e) => setReconciliationNoteInput(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>取消</Button>
            <Button onClick={() => {
              handleDailyReconciliation(currentDate, selectedStatus, reconciliationNoteInput);
              setShowStatusDialog(false);
            }}>確認對帳</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加訂單詳情模態窗口 */}
      {renderOrderDetailModal()}
    </section>
  );
};

export default CashFlow;