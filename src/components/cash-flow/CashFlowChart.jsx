import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { format, parseISO, subDays } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Loader2Icon, 
  BarChart3Icon, 
  LineChartIcon, 
  PieChartIcon, 
  DownloadIcon,
  RefreshCwIcon 
} from "lucide-react";
import apiService from "../../services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 註冊所有 Chart.js 元件
Chart.register(...registerables);

// 顏色方案
const colorSchemes = {
  blue: {
    primary: {
      backgroundColor: "rgba(56, 106, 224, 0.6)",
      borderColor: "rgba(56, 106, 224, 1)",
    },
    secondary: {
      backgroundColor: "rgba(99, 179, 237, 0.4)",
      borderColor: "rgba(99, 179, 237, 1)",
    },
    tertiary: {
      backgroundColor: "rgba(159, 122, 234, 0.4)",
      borderColor: "rgba(159, 122, 234, 1)",
    }
  },
  green: {
    primary: {
      backgroundColor: "rgba(72, 187, 120, 0.6)",
      borderColor: "rgba(72, 187, 120, 1)",
    },
    secondary: {
      backgroundColor: "rgba(56, 178, 172, 0.4)",
      borderColor: "rgba(56, 178, 172, 1)",
    },
    tertiary: {
      backgroundColor: "rgba(104, 211, 145, 0.4)",
      borderColor: "rgba(104, 211, 145, 1)",
    }
  },
  warm: {
    primary: {
      backgroundColor: "rgba(246, 173, 85, 0.6)",
      borderColor: "rgba(246, 173, 85, 1)",
    },
    secondary: {
      backgroundColor: "rgba(237, 100, 166, 0.4)",
      borderColor: "rgba(237, 100, 166, 1)",
    },
    tertiary: {
      backgroundColor: "rgba(245, 101, 101, 0.4)",
      borderColor: "rgba(245, 101, 101, 1)",
    }
  }
};

const CashFlowChart = ({ dateRange }) => {
  // 圖表類型
  const [chartType, setChartType] = useState("bar");
  // 數據類型
  const [dataType, setDataType] = useState("amount");
  // 圖表顏色方案
  const [colorScheme, setColorScheme] = useState("blue");
  // 載入狀態
  const [isLoading, setIsLoading] = useState(false);
  // 圖表數據
  const [dailyStats, setDailyStats] = useState([]);
  // 圖表參考和實例
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  // 展示月度趨勢
  const [showMonthlyTrend, setShowMonthlyTrend] = useState(false);
  // 月度統計數據
  const [monthlyStats, setMonthlyStats] = useState([]);

  // 獲取圖表數據
  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const params = {
        start_date: dateRange?.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
        end_date: dateRange?.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined
      };
      
      const response = await apiService.get('/transactions/chart-data', { params });
      setDailyStats(response.data || []);
      
      // 計算月度統計
      if (response.data && response.data.length > 0) {
        calculateMonthlyStats(response.data);
      }
    } catch (error) {
      console.error('獲取圖表數據失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 計算月度統計
  const calculateMonthlyStats = (dailyData) => {
    const monthlyData = {};
    
    dailyData.forEach(day => {
      const date = new Date(day.date);
      const monthYear = format(date, 'yyyy-MM');
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          date: monthYear,
          transaction_count: 0,
          total_amount: 0,
          total_fee: 0,
          total_net_amount: 0
        };
      }
      
      monthlyData[monthYear].transaction_count += day.transaction_count;
      monthlyData[monthYear].total_amount += day.total_amount;
      monthlyData[monthYear].total_fee += day.total_fee;
      monthlyData[monthYear].total_net_amount += day.total_net_amount;
    });
    
    setMonthlyStats(Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date)));
  };

  // 繪製圖表
  useEffect(() => {
    // 如果圖表實例已存在，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 如果正在載入或無資料，不渲染圖表
    if (isLoading || !chartRef.current || 
       (!dailyStats || dailyStats.length === 0) && (!monthlyStats || monthlyStats.length === 0)) {
      return;
    }

    // 準備圖表資料
    const data = showMonthlyTrend ? monthlyStats : dailyStats;
    const chartData = prepareChartData(data, dataType);
    const colors = colorSchemes[colorScheme];

    // 獲取 Canvas 上下文
    const ctx = chartRef.current.getContext("2d");

    // 創建圖表配置
    const config = createChartConfig(chartType, chartData, colors);

    // 創建新的圖表實例
    chartInstance.current = new Chart(ctx, config);

    // 清理函數，在組件卸載時銷毀圖表實例
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dailyStats, monthlyStats, chartType, dataType, colorScheme, isLoading, showMonthlyTrend]);

  // 創建圖表配置
  const createChartConfig = (type, chartData, colors) => {
    let config = {
      type: type,
      data: {
        labels: chartData.labels,
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (dataType === "amount" || context.dataset.yAxisID === "y1") {
                  label += new Intl.NumberFormat("zh-TW", {
                    style: "currency",
                    currency: "TWD",
                    minimumFractionDigits: 0,
                  }).format(context.parsed.y || context.parsed);
                } else {
                  label += context.parsed.y || context.parsed;
                }
                return label;
              },
            },
          },
          legend: {
            position: "top",
            align: "end",
          },
        },
      }
    };

    if (type === "pie" || type === "doughnut") {
      // 餅圖/環圖配置
      config.data.datasets = [{
        label: dataType === "amount" ? "交易金額分佈" : "交易筆數分佈",
        data: chartData.values,
        backgroundColor: [
          colors.primary.backgroundColor,
          colors.secondary.backgroundColor,
          colors.tertiary.backgroundColor,
          "rgba(72, 187, 120, 0.6)",
          "rgba(237, 100, 166, 0.6)",
          "rgba(159, 122, 234, 0.6)",
          "rgba(246, 173, 85, 0.6)",
          "rgba(56, 178, 172, 0.6)",
        ],
        borderColor: [
          colors.primary.borderColor,
          colors.secondary.borderColor,
          colors.tertiary.borderColor,
          "rgba(72, 187, 120, 1)",
          "rgba(237, 100, 166, 1)",
          "rgba(159, 122, 234, 1)",
          "rgba(246, 173, 85, 1)",
          "rgba(56, 178, 172, 1)",
        ],
        borderWidth: 1,
      }];

      // 餅圖特殊配置
      config.options.plugins.tooltip = {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      };
    } else {
      // 條形圖/線圖配置
      config.data.datasets = [
        {
          type: type === "line" ? "line" : "bar",
          label: dataType === "amount" ? "交易金額" : "交易筆數",
          data: chartData.values,
          backgroundColor: colors.primary.backgroundColor,
          borderColor: colors.primary.borderColor,
          borderWidth: 1,
          borderRadius: type === "bar" ? 4 : 0,
          tension: type === "line" ? 0.2 : 0,
        }
      ];

      // 添加第二個數據集
      if (dataType === "amount") {
        config.data.datasets.push({
          type: "line",
          label: "淨收入",
          data: chartData.secondaryValues,
          borderColor: colors.secondary.borderColor,
          backgroundColor: colors.secondary.backgroundColor,
          borderWidth: 2,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: colors.secondary.borderColor,
          fill: false,
          yAxisID: "y1",
        });
      } else {
        config.data.datasets.push({
          type: "line",
          label: "手續費金額",
          data: chartData.secondaryValues,
          borderColor: colors.tertiary.borderColor,
          backgroundColor: colors.tertiary.backgroundColor,
          borderWidth: 2,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: colors.tertiary.borderColor,
          fill: false,
          yAxisID: "y1",
        });
      }

      // 設置坐標軸
      config.options.scales = {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: dataType === "amount" ? "金額 (TWD)" : "筆數",
          },
        },
        y1: {
          position: "right",
          beginAtZero: true,
          title: {
            display: true,
            text: dataType === "amount" ? "淨收入 (TWD)" : "手續費金額 (TWD)",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      };
    }

    return config;
  };

  // 準備圖表資料
  const prepareChartData = (stats, type) => {
    // 對資料進行排序，確保日期順序正確
    const sortedStats = [...stats].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      labels: sortedStats.map((day) => formatChartDate(day.date, showMonthlyTrend)),
      values:
        type === "amount"
          ? sortedStats.map((day) => day.total_amount)
          : sortedStats.map((day) => day.transaction_count),
      secondaryValues:
        type === "amount"
          ? sortedStats.map((day) => day.total_net_amount)
          : sortedStats.map((day) => day.total_fee),
    };
  };

  // 格式化圖表日期
  const formatChartDate = (dateStr, isMonthly = false) => {
    try {
      const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
      return format(date, isMonthly ? "yyyy/MM" : "MM/dd", { locale: zhTW });
    } catch (error) {
      console.error("日期格式化錯誤:", error);
      return dateStr;
    }
  };

  // 下載圖表
  const handleDownloadChart = () => {
    if (!chartRef.current) return;
    
    const canvas = chartRef.current;
    const image = canvas.toDataURL("image/png", 1.0);
    
    // 創建下載連結
    const downloadLink = document.createElement("a");
    downloadLink.href = image;
    downloadLink.download = `金流${showMonthlyTrend ? '月度' : '日常'}趨勢圖-${new Date().getTime()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 獲取圖表類型圖標
  const getChartTypeIcon = (type) => {
    switch (type) {
      case "bar":
        return <BarChart3Icon className="h-4 w-4" />;
      case "line":
        return <LineChartIcon className="h-4 w-4" />;
      case "pie":
      case "doughnut":
        return <PieChartIcon className="h-4 w-4" />;
      default:
        return <BarChart3Icon className="h-4 w-4" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">
              {showMonthlyTrend ? "月度交易趨勢" : "日常交易趨勢"}
            </CardTitle>
            <CardDescription>
              {dateRange?.startDate &&
                format(dateRange.startDate, "yyyy/MM/dd", { locale: zhTW })}{" "}
              -{" "}
              {dateRange?.endDate &&
                format(dateRange.endDate, "yyyy/MM/dd", { locale: zhTW })}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 數據類型切換 */}
            <Tabs
              value={dataType}
              onValueChange={setDataType}
              className="w-auto"
            >
              <TabsList className="h-8">
                <TabsTrigger value="amount" className="text-xs px-3 py-1">
                  交易金額
                </TabsTrigger>
                <TabsTrigger value="count" className="text-xs px-3 py-1">
                  交易筆數
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex justify-center items-center">
            <Loader2Icon className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        ) : dailyStats && dailyStats.length > 0 ? (
          <div className="w-full h-[300px]">
            <canvas ref={chartRef}></canvas>
          </div>
        ) : (
          <div className="w-full h-[300px] flex justify-center items-center flex-col text-gray-400">
            <svg
              className="w-14 h-14 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p>所選時間範圍內無交易資料</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center gap-2 border-t pt-4">
        <div className="flex items-center gap-2">
          {/* 顯示日常/月度切換 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMonthlyTrend(!showMonthlyTrend)}
            className="text-xs"
          >
            {showMonthlyTrend ? "顯示日常趨勢" : "顯示月度趨勢"}
          </Button>
          
          {/* 刷新數據 */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChartData}
            className="text-xs px-2"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 圖表類型選擇 */}
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <div className="flex items-center gap-1">
                {getChartTypeIcon(chartType)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar" className="flex items-center gap-1">
                <BarChart3Icon className="h-4 w-4 mr-1" />
                柱狀圖
              </SelectItem>
              <SelectItem value="line" className="flex items-center gap-1">
                <LineChartIcon className="h-4 w-4 mr-1" />
                折線圖
              </SelectItem>
              <SelectItem value="pie" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4 mr-1" />
                圓餅圖
              </SelectItem>
              <SelectItem value="doughnut" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4 mr-1" />
                環形圖
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* 顏色方案選擇 */}
          <Select value={colorScheme} onValueChange={setColorScheme}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">藍色系</SelectItem>
              <SelectItem value="green">綠色系</SelectItem>
              <SelectItem value="warm">暖色系</SelectItem>
            </SelectContent>
          </Select>
          
          {/* 下載圖表 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadChart}
            className="text-xs"
            disabled={!dailyStats || dailyStats.length === 0}
          >
            <DownloadIcon className="h-3.5 w-3.5 mr-1" />
            下載
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CashFlowChart; 