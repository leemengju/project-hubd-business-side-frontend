// lazyloading 圖片懶加載
// <img src="" alt="" loading="lazy" />
import React, { Component } from 'react';
import DocumentIcon from "../component/icon";
import SearchButton,{ ExportButton } from "../component/button";
import FilterGroup from "../component/filterGroup";


const Order = () => {
    return (
        <React.Fragment>
        <header  className="toolBar  flex justify-between items-center  py-0 
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
            <ExportButton>匯出cvs</ExportButton>
            <ExportButton>匯出excel</ExportButton>
          </div>
        </header>
        
        <section className="w-full mt-5 searchFilter flex py-5 bg-white max-md:flex-wrap max-sm:flex-col">
      <FilterGroup
        label="訂單編號"
        value="GodYan1739241379"
        className="w-[366px] max-sm:w-full"
      />

      <FilterGroup
        label="交易狀態"
        value="交易成功"
        type="dropdown"
        className="w-[365px] max-sm:w-full"
      />

      <FilterGroup
        label="起始日期"
        value="2024/02/02"
        type="date"
        className="w-[365px] max-sm:w-full"
      />

      <FilterGroup
        label="結束日期"
        value="2024/08/02"
        type="date"
        className="w-[365px] max-sm:w-full"
      />

      <SearchButton  />
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
            <article
              className="grid p-4 border-b border-solid border-b-[#E4E4E4] grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_1fr_1fr] max-md:gap-2.5 max-md:grid-cols-[1fr_1fr] max-sm:grid-cols-[1fr]"
            >
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                GodYan1739241379
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                2502111036007272
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                2025/02/11 10:36:42
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                3002607
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                2000
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                信用卡
              </p>
              <p
                className="text-base font-medium text-neutral-700 max-md:px-0 max-md:py-2.5"
              >
                交易成功
              </p>
              <div
                className="flex gap-2 text-base font-medium flex justify-center text-neutral-700 max-md:px-0 max-md:py-2.5 max-sm:justify-start"
              >
                <button class="point-cursor" aria-label="View order details">
                  <svg
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
     
                  >
                    <path
                      d="M21.1303 10.253C22.2899 11.4731 22.2899 13.3267 21.1303 14.5468C19.1745 16.6046 15.8155 19.3999 12 19.3999C8.18448 19.3999 4.82549 16.6046 2.86971 14.5468C1.7101 13.3267 1.7101 11.4731 2.86971 10.253C4.82549 8.19524 8.18448 5.3999 12 5.3999C15.8155 5.3999 19.1745 8.19523 21.1303 10.253Z"
                      stroke="#484848"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M15 12.3999C15 14.0568 13.6569 15.3999 12 15.3999C10.3431 15.3999 9 14.0568 9 12.3999C9 10.743 10.3431 9.3999 12 9.3999C13.6569 9.3999 15 10.743 15 12.3999Z"
                      stroke="#484848"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                </button>
                {/* <button aria-label="Edit order">
                  <svg
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
           
                  >
                    <path
                      d="M22 12.3999V18.3999C22 20.609 20.2091 22.3999 18 22.3999H6C3.79086 22.3999 2 20.609 2 18.3999V6.3999C2 4.19076 3.79086 2.3999 6 2.3999H12M15.6864 4.42265C15.6864 4.42265 15.6864 5.85295 17.1167 7.28325C18.547 8.71354 19.9773 8.71354 19.9773 8.71354M9.15467 16.3895L12.1583 15.9604C12.5916 15.8985 12.9931 15.6977 13.3025 15.3883L21.4076 7.28324C22.1975 6.49331 22.1975 5.21258 21.4076 4.42265L19.9773 2.99235C19.1873 2.20242 17.9066 2.20242 17.1167 2.99235L9.01164 11.0974C8.70217 11.4068 8.50142 11.8083 8.43952 12.2416L8.01044 15.2452C7.91508 15.9127 8.4872 16.4848 9.15467 16.3895Z"
                      stroke="#484848"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>
                <button aria-label="Delete order">
                  <svg
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
                    
                  >
                    <path
                      d="M5 8.3999V18.3999C5 20.609 6.79086 22.3999 9 22.3999H15C17.2091 22.3999 19 20.609 19 18.3999V8.3999M14 11.3999V17.3999M10 11.3999L10 17.3999M16 5.3999L14.5937 3.2905C14.2228 2.7341 13.5983 2.3999 12.9296 2.3999H11.0704C10.4017 2.3999 9.7772 2.7341 9.40627 3.2905L8 5.3999M16 5.3999H8M16 5.3999H21M8 5.3999H3"
                      stroke="#D40404"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button> */}
              </div>
            </article>
    
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
                  <button aria-label="Show rows per page options">
                    <svg
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-icon"
                    >
                      <path
                        d="M5.5 8.3999L9.62835 12.987C9.82697 13.2077 10.173 13.2077 10.3716 12.987L14.5 8.3999"
                        stroke="#626981"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>
                    </svg>
                  </button>

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
   
      <div className="flex justify-first items-first p-[12px]">
        訂單編號:
        商品名稱:
        顏色:
        尺寸:
        數量:
        原價:
        折扣價:
      </div>
      </React.Fragment>  
    );


  };
  
  export default Order