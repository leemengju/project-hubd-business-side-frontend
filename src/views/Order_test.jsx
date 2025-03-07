import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const OrderTest = () => {
    const [orderList, setOrderList] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const popupRef = useRef(null);

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
            {orderList.map((orderData) => (
                <article key={orderData.order_id} className="grid p-4 border-b border-solid border-b-[#E4E4E4] grid-cols-8">
                    <p className="text-base font-medium">{orderData.order_id}</p>
                    <p className="text-base font-medium">{orderData.trade_No}</p>
                    <p className="text-base font-medium">{orderData.trade_Date}</p>
                    <p className="text-base font-medium">{orderData.member_Id}</p>
                    <p className="text-base font-medium">{orderData.total_price_with_discount}</p>
                    <p className="text-base font-medium">{orderData.payment_type}</p>
                    <p className="text-base font-medium">{orderData.trade_status}</p>
                    <div className="flex gap-2 text-base font-medium justify-center">
                        <button onClick={() => openPopup(orderData)} className="point-cursor">
                            查看詳情
                        </button>
                    </div>
                </article>
            ))}

            {isPopupOpen && selectedOrder && (
                <div ref={popupRef} className="popup fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="w-[500px] bg-white p-8 border border-gray-300 rounded-lg shadow-md">
                        <h2 className="pb-3 text-lg font-bold text-center border-b border-gray-300">訂單詳細資料</h2>
                        <div className="space-y-2 text-sm">
                            {orderDetails.length > 0 ? (
                                orderDetails.map((detail, index) => (
                                    <div key={index} className="text-brandGrey-normal flex justify-between border-b pb-1 pt-1 px-2">
                                        <span className="text-brandGrey-normal font-semibold">{detail.product_name || "N/A"}:</span>
                                        <span>
                                            尺寸: {detail.product_size}, 顏色: {detail.product_color}, 數量: {detail.quantity}, 折扣價: {detail.discount_price}, 原價: {detail.original_price}
                                        </span>
                                    </div>
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
        </React.Fragment>
    );
};

export default OrderTest;
