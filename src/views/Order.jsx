// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />

import React, { useState, useEffect, useRef } from "react";
import DocumentIcon from "../component/icon";
import SearchButton, { ExportButton } from "../component/button";
import axios from 'axios';



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

  // <---------------------------調資料呈現在住畫面----------------------->
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get("http://localhost:8000/api/order");
        setOrderList(result.data);


      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);
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
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get("http://localhost:8000/api/order");
        setOrderList(result.data);
        setFilteredOrders(result.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleInputChange = (field, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const filtered = orderList.filter(order => {
      return (
        (!filters.orderId || order.order_id.includes(filters.orderId)) &&
        (!filters.tradeStatus || order.trade_status === filters.tradeStatus) &&
        (!filters.startDate || new Date(order.trade_Date) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(order.trade_Date) <= new Date(filters.endDate))
      );
    });
    setFilteredOrders(filtered);
  };



  // // <-----------------------------------function，open&closepopup__v2------------------------------------------>
  // // <-----------------------------------才能把order的detail傳進去------------------------------------------>
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


  return (
    <React.Fragment>
      <header className="toolBar  flex justify-between items-center  py-0 
        ">
        <div className="box-border  flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto w-6">
            <DocumentIcon />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">
            訂單管理
          </h1>
        </div>
        <div className="flex gap-2.5 max-sm:flex-col max-sm:w-full">
          <ExportButton>匯出csv</ExportButton>
          <ExportButton>匯出excel</ExportButton>
        </div>
      </header>


      {/* {v1} */}
      {/* <section className="searchRow w-full mt-5 searchFilter flex py-5 bg-white max-md:flex-wrap max-sm:flex-col">
                <input
                    label="訂單編號"
                    value={filters.orderId}
                    type="text"
                    className="w-[366px] max-sm:w-full"
                    onChange={e => handleInputChange("orderId", e.target.value)}
                />

                <select
                    label="交易狀態"
                    value={filters.tradeStatus}
                    type="dropdown"
                    className="w-[365px] max-sm:w-full"
                    onChange={e => handleInputChange("tradeStatus", e.target.value)}
                    options={["全部", "交易成功", "交易失敗",]} 
                />

                <input
                    label="起始日期"
                    value={filters.startDate}
                    type="date"
                    className="w-[365px] max-sm:w-full"
                    onChange={e => handleInputChange("startDate", e.target.value)}
                />

                <input
                    label="結束日期"
                    value={filters.endDate}
                    type="date"
                    className="w-[365px] max-sm:w-full"
                    onChange={e => handleInputChange("endDate", e.target.value)}
                />

                <SearchButton onClick={handleSearch} />
            </section> */}


      {/* v2 */}
      <section className="searchRow w-full mt-5 searchFilter flex py-5 bg-white max-md:flex-wrap max-sm:flex-col">
                <fieldset className=" flex gap-2.5 justify-between items-center px-6  py-[22px] border border-solid border-neutral-200 w-[366px] h-[58px]">
                    <legend className="text-md font-medium text-zinc-700">訂單編號</legend>
                    <input placehtype="text" value={filters.orderId} onChange={e => handleInputChange("orderId", e.target.value)} />
                </fieldset>
                
                <fieldset className="flex gap-2.5 justify-between items-center px-6 py-[22px] border border-solid border-neutral-200 w-[366px] h-[58px]">
                    <legend className="text-md font-medium text-zinc-700">交易狀態</legend>
                    <select className="w-[300px]" value={filters.tradeStatus} onChange={e => handleInputChange("tradeStatus", e.target.value)}>
                        <option className="py-2" value="全部">全部</option>
                        <option className="py-2" value="交易成功">交易成功</option>
                        <option className="py-2" value="交易失敗">交易失敗</option>
                    </select>
                </fieldset>
                
                <fieldset className="flex gap-2.5 justify-between items-center px-6 py-[22px] border border-solid border-neutral-200 w-[366px] h-[58px]">
                    <legend className="text-md font-medium text-zinc-700">起始日期</legend>
                    <input className="w-[300px] h-[40px]" type="date" value={filters.startDate} onChange={e => handleInputChange("startDate", e.target.value)} />
                </fieldset>
                
                <fieldset className="flex gap-2.5 justify-between items-center px-6 py-[22px] border border-solid border-neutral-200 w-[366px] h-[58px]">
                    <legend className="text-md font-medium text-zinc-700">終止日期</legend>
                    <input className="w-[300px] h-[40px]" type="date" value={filters.endDate} onChange={e => handleInputChange("endDate", e.target.value)} />
                </fieldset>
                
                <SearchButton onClick={handleSearch} />
            </section>
     


      <section
        className="w-full mt-5 bg-white rounded-lg border border-solid border-[#D9D9D9]"
      >
        {/* <!-- Table Header --> */}
        <header
          className="w-[1200] grid p-4 border-b border-solid bg-zinc-50 border-b-[#E4E4E4] grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr] max-md:gap-2.5 max-md:grid-cols-[1fr_1fr] max-sm:grid-cols-[1fr]"
        >
          <h3
            className="w-[254] text-base font-medium text-neutral-700  max-md:py-2.5"
          >
            訂單編號
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            交易編號
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            交易時間
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            買家ID
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            訂單金額
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            付款方式
          </h3>
          <h3
            className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
          >
            狀態
          </h3>
          <h3
            className="text-base flex  justify-center font-medium text-neutral-700 max-md:px-5 max-md:py-2.5"
          >
            操作
          </h3>
        </header>

        {/* <!-- Table Row --> */}
        {filteredOrders.map((orderData) => (
          <article
            key={orderData.order_id}
            className="grid p-4 border-b border-solid border-b-[#E4E4E4] grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr] max-md:gap-2.5 max-md:grid-cols-[1fr_1fr] max-sm:grid-cols-[1fr]"
          >
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.order_id}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_No}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_Date}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.id}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.total_price_with_discount}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.payment_type}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_status}
            </p>
            <div className="flex gap-2 text-base font-medium flex justify-center text-neutral-700 max-md:px-0 max-md:py-2.5 max-sm:justify-start">
              <button onClick={() => openPopup(orderData)} className="point-cursor" aria-label="View order details">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="action-icon">
                  <path d="M21.1303 10.253C22.2899 11.4731 22.2899 13.3267 21.1303 14.5468C19.1745 16.6046 15.8155 19.3999 12 19.3999C8.18448 19.3999 4.82549 16.6046 2.86971 14.5468C1.7101 13.3267 1.7101 11.4731 2.86971 10.253C4.82549 8.19524 8.18448 5.3999 12 5.3999C15.8155 5.3999 19.1745 8.19523 21.1303 10.253Z" stroke="#484848" strokeWidth="1.5"></path>
                  <path d="M15 12.3999C15 14.0568 13.6569 15.3999 12 15.3999C10.3431 15.3999 9 14.0568 9 12.3999C9 10.743 10.3431 9.3999 12 9.3999C13.6569 9.3999 15 10.743 15 12.3999Z" stroke="#484848" strokeWidth="1.5"></path>
                </svg>
              </button>
            </div>
          </article>
        ))}
        {/* {orderList.map((orderData) => (
          <article
            key={orderData.order_id}
            className="grid p-4 border-b border-solid border-b-[#E4E4E4] grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr] max-md:gap-2.5 max-md:grid-cols-[1fr_1fr] max-sm:grid-cols-[1fr]"
          >
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.order_id}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_No}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_Date}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.member_id}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.total_price_with_discount}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.payment_type}
            </p>
            <p className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5">
              {orderData.trade_status}
            </p>
            <div className="flex gap-2 text-base font-medium flex justify-center text-neutral-700 max-md:px-0 max-md:py-2.5 max-sm:justify-start">
              <button onClick={() => openPopup(orderData)} className="point-cursor" aria-label="View order details">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="action-icon">
                  <path d="M21.1303 10.253C22.2899 11.4731 22.2899 13.3267 21.1303 14.5468C19.1745 16.6046 15.8155 19.3999 12 19.3999C8.18448 19.3999 4.82549 16.6046 2.86971 14.5468C1.7101 13.3267 1.7101 11.4731 2.86971 10.253C4.82549 8.19524 8.18448 5.3999 12 5.3999C15.8155 5.3999 19.1745 8.19523 21.1303 10.253Z" stroke="#484848" strokeWidth="1.5"></path>
                  <path d="M15 12.3999C15 14.0568 13.6569 15.3999 12 15.3999C10.3431 15.3999 9 14.0568 9 12.3999C9 10.743 10.3431 9.3999 12 9.3999C13.6569 9.3999 15 10.743 15 12.3999Z" stroke="#484848" strokeWidth="1.5"></path>
                </svg>
              </button>
            </div>
          </article>
        ))} */}


        {/* <!-- Table Footer --> */}
        <footer
          className="flex justify-between items-center p-4 bg-slate-50 max-sm:flex-col max-sm:gap-5"
        >

          <select
            className="point-cursor flex gap-2 items-center px-4 py-2 text-sm bg-white rounded-lg border border-solid border-[#D9D9D9] text-neutral-600"
          >
            <option value="">顯示20筆</option>
            <option value="">顯示50筆</option>
            <option value="">顯示100筆</option>



          </select>

          <nav
            className="flex gap-2 items-center max-sm:justify-center max-sm:w-full"
            aria-label="Pagination"
          >
            <button aria-label="Previous page">
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="page-nav"

              >
                <path
                  d="M15.09 18.3999L16.5 16.9899L11.92 12.3999L16.5 7.8099L15.09 6.3999L9.09 12.3999L15.09 18.3999Z"
                  fill="#626981"
                ></path>
              </svg>
            </button>

            <span className="text-sm text-neutral-500">1/10</span>
            <button aria-label="Next page">
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="page-nav"

              >
                <path
                  d="M10.41 6.3999L9 7.8099L13.58 12.3999L9 16.9899L10.41 18.3999L16.41 12.3999L10.41 6.3999Z"
                  fill="#626981"
                ></path>
              </svg>
            </button>
          </nav>
        </footer>
      </section>

      {/* popups */}
      {isPopupOpen && selectedOrder && (
        <div ref={popupRef} className="popup fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="w-[500px] bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <h2 className="pb-3 text-lg font-bold text-center border-b border-gray-300">訂單詳細資料</h2>
            <div className="space-y-2 text-sm">
              {orderDetails.length > 0 ? (
                orderDetails.map((detail, index) => (
                  <React.Fragment>
                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">商品名稱:</span><span>{detail.product_name || "N/A"}</span></div>
                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">顏色:</span><span> {detail.product_color}</span></div>
                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">尺寸:</span><span>{detail.product_size}</span></div>
                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">數量:</span><span>{detail.quantity}</span></div>
                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">單價:</span><span>{detail.product_price}</span></div>
                  </React.Fragment>
                ))
              ) : (
                <p className="text-center text-gray-500">載入中...</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <button onClick={closePopup} className="bg-brandBlue-normal text-white border border-brandblue-normal rounded px-4 py-2 text-sm font-semibold">
                返回
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <---------------------------------orginal_popup-----------------------------------> */}
      {/* {isPopupOpen && (
        <div ref={popupRef} className="popup hidden fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">

          <div className="w-[500px] bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <h2 className="pb-3 text-lg font-bold text-center border-b border-gray-300">訂單詳細資料</h2>
            <div className="space-y-2 text-sm">

              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">訂單編號:</span><span >GodYan1739241379</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">商品名稱:</span><span>女裝百褶拼接寬鬆上衣</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">顏色:</span><span>Black</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">尺寸:</span><span>S</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">數量:</span><span>1</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">折扣價:</span><span>350</span></div>
              <div className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2"><span className="text-brandGrey-normal font-semibold">原價:</span><span>950</span></div>
            </div>
            <div className="mt-4 text-center">
              <button onClick={closePopup} className="bg-brandBlue-normal text-white  border border-brandblue-normal rounded px-4 py-2 text-sm font-semibold-semibold">返回</button>
            </div>
          </div>
        </div>

      )} */}

    </React.Fragment>
  );//edn of return



};//end of className


export default Order