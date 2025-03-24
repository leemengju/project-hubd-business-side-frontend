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
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2Icon } from "lucide-react";

// 註冊所有 Chart.js 元件
Chart.register(...registerables);

const CashFlowChart = ({ dailyStats, isLoading, dateRange }) => {
  const [chartType, setChartType] = useState("amount");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 如果圖表實例已存在，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 如果正在載入或無資料，不渲染圖表
    if (isLoading || !dailyStats || dailyStats.length === 0) return;

    // 準備圖表資料
    const chartData = prepareChartData(dailyStats, chartType);

    // 獲取 Canvas 上下文
    const ctx = chartRef.current.getContext("2d");

    // 創建新的圖表實例
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            type: "bar",
            label: chartType === "amount" ? "交易金額" : "交易筆數",
            data: chartData.values,
            backgroundColor: "rgba(56, 106, 224, 0.6)",
            borderColor: "rgba(56, 106, 224, 1)",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 16,
          },
          {
            type: "line",
            label: chartType === "amount" ? "淨收入" : "手續費金額",
            data: chartData.secondaryValues,
            borderColor: "rgba(220, 38, 38, 0.8)",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 3,
            pointBackgroundColor: "rgba(220, 38, 38, 0.8)",
            fill: false,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: chartType === "amount" ? "金額 (TWD)" : "筆數",
            },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            title: {
              display: true,
              text: chartType === "amount" ? "淨收入 (TWD)" : "手續費金額 (TWD)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
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
                if (chartType === "amount") {
                  label += new Intl.NumberFormat("zh-TW", {
                    style: "currency",
                    currency: "TWD",
                    minimumFractionDigits: 0,
                  }).format(context.parsed.y);
                } else {
                  label += context.parsed.y;
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
      },
    });

    // 清理函數，在組件卸載時銷毀圖表實例
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dailyStats, chartType, isLoading]);

  // 準備圖表資料
  const prepareChartData = (stats, type) => {
    // 對資料進行排序，確保日期順序正確
    const sortedStats = [...stats].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      labels: sortedStats.map((day) => formatChartDate(day.date)),
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
  const formatChartDate = (dateStr) => {
    try {
      const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
      return format(date, "MM/dd", { locale: zhTW });
    } catch (error) {
      console.error("日期格式化錯誤:", error);
      return dateStr;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">交易趨勢</CardTitle>
            <CardDescription>
              {dateRange?.startDate &&
                format(dateRange.startDate, "yyyy/MM/dd", { locale: zhTW })}{" "}
              -{" "}
              {dateRange?.endDate &&
                format(dateRange.endDate, "yyyy/MM/dd", { locale: zhTW })}
            </CardDescription>
          </div>
          <Tabs
            value={chartType}
            onValueChange={setChartType}
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
    </Card>
  );
};

export default CashFlowChart; 