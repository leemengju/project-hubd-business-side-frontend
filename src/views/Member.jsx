import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Member = () => {
  const [members, setMembers] = useState([]); // 存放會員資料
  const [selectedMember, setSelectedMember] = useState(null); // 用來存放點擊的會員資料
  const [showModal, setShowModal] = useState(false); // 控制 Modal 開關
  const [orderData, setOrderData] = useState({ totalOrders: 0, totalSpent: 0 }); //訂單數＆消費總金額

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/users/") // 這裡換成你的 API 路徑
      .then((response) => setMembers(response.data)) // 把資料存入 members
      .catch((error) => console.error("Error fetching members:", error));
  }, []);

  // 點擊檢視按鈕時，設定選中的會員並顯示 Modal
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowModal(true);

    // 請求 API 取得該會員的訂單資訊
    axios
      .get(`http://127.0.0.1:8000/api/users/${member.id}/orders`) // 向後端請求會員的訂單數和消費金額
      .then((response) => {
        setOrderData({
          totalOrders: response.data.totalOrders || 0, // 訂單數
          totalSpent: Number(response.data.totalSpent) || 0, // 總消費金額
        });
      })
      .catch((error) => {
        console.error("Error fetching order data:", error);
        setOrderData({ totalOrders: 0, totalSpent: 0 }); // 如果出錯，預設為 0
      });
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    setOrderData({ totalOrders: 0, totalSpent: 0 }); // 清空訂單資訊
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">會員資料列表</h1>
      <Button variant="outline" className="mb-4">
        匯出
      </Button>

      <Table className="w-full border">
        <TableCaption>會員資訊列表</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead className="w-[100px] text-center">會員編號</TableHead>
            <TableHead className="text-center">姓名</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">手機</TableHead>
            <TableHead className="text-center">生日</TableHead>
            <TableHead className="text-center">建立時間</TableHead>
            <TableHead className="text-center">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* 動態生成會員內容 */}
          {members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id} className="border-b hover:bg-gray-100">
                <TableCell className="text-center font-medium">
                  {member.id}
                </TableCell>
                <TableCell className="text-center">{member.name}</TableCell>
                <TableCell className="text-center">{member.email}</TableCell>
                <TableCell className="text-center">{member.phone}</TableCell>
                <TableCell className="text-center">{member.birthday}</TableCell>
                <TableCell className="text-center">
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleViewMember(member)} // 點擊檢視按鈕
                  >
                    檢視
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="7" className="text-center py-4">
                無會員資料
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 會員詳細資料 Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[700px] h-[700px] justify-center items-center relative shadow-lg rounded-lg"></div>
          <div className="bg-white p-6 rounded-lg  w-[600px] h-[600px] space-y-4 border border-gray-300 absolute">
            <h2 className="text-xl font-bold mb-6 text-center">會員詳細資料</h2>
            <hr />
            <p className="grid grid-cols-2">
              <strong>會員編號:</strong> <span>#{selectedMember.id}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>姓名:</strong> <span>{selectedMember.name}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>Email:</strong> <span>{selectedMember.email}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>手機:</strong> <span>{selectedMember.phone}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>生日:</strong> <span>{selectedMember.birthday}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>建立時間:</strong>
              <span>{new Date(selectedMember.created_at).toLocaleDateString()}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>完成訂單數:</strong>
              <span>{orderData.totalOrders}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>消費總金額:</strong><span>${orderData.totalSpent.toFixed(2)}</span>
            </p>
            <hr />
            <div className="mt-auto flex justify-center">
              <Button variant="outline" onClick={handleCloseModal}>
                關閉
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Member;
