import React, { useState, useEffect, useRef } from "react";
import DocumentIcon from "../component/icon";
import axios from 'axios';
import { utils, writeFile } from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
 






const Order = () => {
  // <---------------------------設定區域----------------------->
  const [orderList, setOrderList] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    orderId: "",
    tradeStatus: "",
    startDate: "",
    endDate: ""
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const popupRef = useRef(null);
  
  // 新增分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // <---------------------------調資料呈現在畫面----------------------->
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get("http://localhost:8000/api/order");
        setOrderList(result.data);
        setFilteredOrders(result.data);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [itemsPerPage]);

  // <---------------------------調資料呈現在popup----------------------->
  useEffect(() => {
    if (selectedOrder && selectedOrder.order_id) {
      console.log("OK");

      const fetchOrderDetails = async () => {
        try {
          const result = await axios.get(`http://localhost:8000/api/order/${selectedOrder.order_id}`);
          console.log(selectedOrder.order_id);
          console.log(result);

          setOrderDetails(Array.isArray(result.data.order_details) ? result.data.order_details : [result.data.order_details]);
        } catch (error) {
          console.error("Error fetching order details:", error);
          setOrderDetails([]);
        }
      };
      fetchOrderDetails();
    }
  }, [selectedOrder]);

  // <---------------------------篩選欄位__抓資料、輸入資料、搜尋資料----------------------->
  const handleInputChange = (field, value) => {
    console.log(`Changing ${field} to ${value}`);
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [field]: value
      };
      console.log("New filters:", newFilters);
      return newFilters;
    });
  };

  const handleSearch = () => {
    console.log("Search button clicked");
    console.log("Current filters:", filters);
    console.log("Original orderList length:", orderList.length);

    const filtered = orderList.filter(order => {
      // Add this to debug individual records
      console.log("Checking order:", order.order_id, order.trade_status, order.trade_Date);

      // Convert dates to timestamp for easier comparison
      const orderDate = order.trade_Date ? new Date(order.trade_Date).getTime() : 0;
      const startDate = filters.startDate ? new Date(filters.startDate).getTime() : null;
      const endDate = filters.endDate ? new Date(filters.endDate).getTime() : null;

      const matchesId = !filters.orderId || order.order_id.includes(filters.orderId);
      const matchesStatus = !filters.tradeStatus || filters.tradeStatus === '全部' || order.trade_status === filters.tradeStatus;
      const matchesStartDate = !startDate || orderDate >= startDate;
      const matchesEndDate = !endDate || orderDate <= endDate;

      return matchesId && matchesStatus && matchesStartDate && matchesEndDate;
    });

    console.log("Filtered results length:", filtered.length);
    console.log("Filtered results:", filtered);

    // Force a state update with a new array reference
    setFilteredOrders([...filtered]);
    console.log(filteredOrders);

    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // 重置到第一頁
  };

  // 計算當前頁的訂單
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // <-----------------------------------function，open&closepopup------------------------------------------>
  const openPopup = (order) => {
    if (!order) return;
    setSelectedOrder(order);
    setIsPopupOpen(true);
    console.log(order);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };
  // <-----------------------------------匯出csv和excel------------------------------------------>
  const handleExport = (format) => {
    if (filteredOrders.length === 0) {
      console.error("No data available to export");
      return;
    }

    const worksheet = utils.json_to_sheet(filteredOrders);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Orders");

    if (format === "csv") {
      writeFile(workbook, "orders.csv");
    } else if (format === "excel") {
      writeFile(workbook, "orders.xlsx");
    }
  };
// <-----------------------------------return------------------------------------------>
  return (
    <React.Fragment >
      <div className="p-6">
      <header className="toolBar flex justify-between items-center py-0">
        <div className="box-border flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto w-6 pb-2">
            <DocumentIcon />
          </div>
          <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
            訂單管理
          </h1>
          {/* <---------------------------------------測試日誌---------------------------------------> */}
          {/* <button
            type="button"
            onClick={() => {
              console.log("測試按鈕被點擊");
              console.log("當前filteredOrders:", filteredOrders);
              console.log("當前orderList:", orderList);
            }}
            className="testingBtn bg-red-500 text-white p-2 m-2"
          >
            測試日誌
          </button> */}
        </div>
        <div className="flex gap-2.5 max-sm:flex-col max-sm:w-full">
          <button onClick={() => handleExport("csv")} className="px-5 py-2.5 text-sm font-bold text-gray-500 rounded-md border border-solid cursor-pointer border-brandBlue-normal max-sm:w-full">匯出 CSV</button>
          <button onClick={() => handleExport("excel")} className="px-5 py-2.5 text-sm font-bold text-gray-500 rounded-md border border-solid cursor-pointer border-brandBlue-normal max-sm:w-full">匯出 Excel</button>
        </div>
      </header>

      {/* 搜尋區域 */}
      {/* 篩選與搜尋區塊 */}
      
      <section className="searchRow w-full mt-5 searchFilter flex flex-wrap gap-2 py-5 bg-white max-md:flex-wrap max-sm:flex-col">
        <Input
          type="text"
          placeholder="訂單編號"
          className="flex-grow gap-2.5 justify-between items-center px-6 py-3 border border-solid border-neutral-200 w-[366px] h-[46px] rounded-md"
          value={filters.orderId}
          onChange={e => handleInputChange("orderId", e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        />

        <Select
          value={filters.tradeStatus}
          onValueChange={(value) => handleInputChange("tradeStatus", value)}
        >
          <SelectTrigger className="flex gap-2 justify-between items-center px-6 py-3 
              border border-solid border-neutral-200 w-[420px] h-[46px] rounded-md">
            <SelectValue placeholder="交易狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="交易成功">交易成功</SelectItem>
            <SelectItem value="交易失敗">交易失敗</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-between text-left font-normal h-[46px] rounded-md",
                !filters.startDate && "text-muted-foreground"
              )}
            >
               {filters.startDate ? format(new Date(filters.startDate), "PPP") : <span>起始日期</span>}
              <CalendarIcon className="mr-2 h-4 w-4" />
             
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onSelect={(newDate) => {
                handleInputChange("startDate", newDate);
                handleSearch();
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-between text-left font-normal h-[46px] rounded-md",
                !filters.endDate && "text-muted-foreground"
              )}
            >
              {filters.endDate ? format(new Date(filters.endDate), "PPP") : <span>終止日期</span>}
              <CalendarIcon className="mr-2 h-4 w-4" />
              
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single" 
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onSelect={(newDate) => {
                handleInputChange("endDate", newDate);
                handleSearch();
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

       
        

        {/* <SearchButton onClick={handleSearch} /> */}
        {/* 移除SearchButton組件，直接使用HTML按鈕 */}
        <Button
          type="button"
          onClick={handleSearch}  // 直接調用handleSearch，不通過任何中間組件
          className=" bg-brandBlue-normal hover:bg-brandBlue-dark text-white py-2 px-5 h-[46px] rounded-md"
        >
          搜尋
        </Button>
      </section>
      {/* <!-- Table Header --> */}

      <div className=" w-full mt-5 bg-white rounded-lg border border-solid border-[#D9D9D9]">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead className="w-[150px]">訂單編號</TableHead>
              <TableHead className="w-[150px]">交易編號</TableHead>
              <TableHead className="w-[150px]">交易時間</TableHead>
              <TableHead className="w-[100px]">買家ID</TableHead>
              <TableHead className="w-[100px]">訂單金額</TableHead>
              <TableHead className="w-[100px]">付款方式</TableHead>
              <TableHead className="w-[100px]">狀態</TableHead>
              <TableHead className="w-[100px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders && currentOrders.length > 0 ? (
              currentOrders.map((orderData) => (
                <TableRow key={orderData.order_id || `row-${orderData.id}`}>
                  <TableCell className="truncate">{orderData.order_id}</TableCell>
                  <TableCell className="truncate">{orderData.trade_No}</TableCell>
                  <TableCell>{orderData.trade_Date}</TableCell>
                  <TableCell>{orderData.id}</TableCell>
                  <TableCell>{orderData.total_price_with_discount}</TableCell>
                  <TableCell>{orderData.payment_type}</TableCell>
                  <TableCell>{orderData.trade_status}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPopup(orderData)}
                      aria-label="View order details"
                    >
                      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.1303 10.253C22.2899 11.4731 22.2899 13.3267 21.1303 14.5468C19.1745 16.6046 15.8155 19.3999 12 19.3999C8.18448 19.3999 4.82549 16.6046 2.86971 14.5468C1.7101 13.3267 1.7101 11.4731 2.86971 10.253C4.82549 8.19524 8.18448 5.3999 12 5.3999C15.8155 5.3999 19.1745 8.19523 21.1303 10.253Z" stroke="#484848" strokeWidth="1.5"></path>
                        <path d="M15 12.3999C15 14.0568 13.6569 15.3999 12 15.3999C10.3431 15.3999 9 14.0568 9 12.3999C9 10.743 10.3431 9.3999 12 9.3999C13.6569 9.3999 15 10.743 15 12.3999Z" stroke="#484848" strokeWidth="1.5"></path>
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">暫無訂單數據</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        
      </div>
      {/* 分頁控制 */}
      <div className="flex justify-center items-center gap-4 mt-4">
          
          <div className="flex justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <span>每頁顯示：</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="選擇數量" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5筆</SelectItem>
                  <SelectItem value="10">10筆</SelectItem>
                  <SelectItem value="20">20筆</SelectItem>
                  <SelectItem value="50">50筆</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
            </div>
          </div>
        </div>

      {/* Popup */}
      {isPopupOpen && selectedOrder && (
        <div ref={popupRef} className="popup fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="w-[500px] bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <h2 className="pb-3 text-lg font-bold text-center border-b border-gray-300">訂單詳細資料</h2>
            <div className="space-y-2 text-sm">
              {orderDetails.length > 0 ? (
                orderDetails.map((detail, index) => (
                  <React.Fragment key={index}>
                    <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">商品名稱:</span><span>{detail.product_name || "N/A"}</span></div>
                    <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">顏色:</span><span> {detail.product_color}</span></div>
                    <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">尺寸:</span><span>{detail.product_size}</span></div>
                    <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">數量:</span><span>{detail.quantity}</span></div>
                    <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">單價:</span><span>{detail.product_price}</span></div>
                  </React.Fragment>
                ))
              ) : (
                <p className="text-center text-gray-500">載入中...</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <button onClick={closePopup} className="bg-brandBlue-normal text-white border border-brandblue-normal rounded px-4 py-2 text-sm font-semibold cursor-pointer">
                返回
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </React.Fragment>
  );
};

export default Order;