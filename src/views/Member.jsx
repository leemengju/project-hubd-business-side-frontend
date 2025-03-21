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
import { CSVLink } from "react-csv";

const headers = [
  { label: "會員編號", key: "id" },
  { label: "姓名", key: "name" },
  { label: "Email", key: "email" },
  { label: "手機", key: "phone" },
  { label: "生日", key: "birthday" },
  { label: "建立時間", key: "created_at" },
];

const Member = () => {
  const [members, setMembers] = useState([]); // 存放會員資料
  const [selectedMember, setSelectedMember] = useState(null); // 用來存放點擊的會員資料
  const [showModal, setShowModal] = useState(false); // 控制 Modal 開關
  const [orderData, setOrderData] = useState({ totalOrders: 0, totalSpent: 0 }); //訂單數＆消費總金額
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 新增這行
  const membersPerPage = 30; //每頁最多30筆

  useEffect(() => {
    axios 
      .get(`http://127.0.0.1:8000/api/users?page=${currentPage}`) // 這裡換成你的 API 路徑  前端使用 Lazy Loading
      .then((response) => {
        setMembers(response.data.data); // 把資料存入 members
        setTotalPages(response.data.last_page); // 更新總頁數
      }) 
      .catch((error) => console.error("Error fetching members:", error));
  }, [currentPage]);// 只有當 currentPage 改變時，才重新載入資料

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

 
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-5">
        <div className="box-border  flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              viewBox="0 0 512 512"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="30"
                d="M402 168c-2.93 40.67-33.1 72-66 72s-63.12-31.32-66-72c-3-42.31 26.37-72 66-72s69 30.46 66 72"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeMiterlimit="10"
                strokeWidth="30"
                d="M336 304c-65.17 0-127.84 32.37-143.54 95.41c-2.08 8.34 3.15 16.59 11.72 16.59h263.65c8.57 0 13.77-8.25 11.72-16.59C463.85 335.36 401.18 304 336 304Z"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="30"
                d="M200 185.94c-2.34 32.48-26.72 58.06-53 58.06s-50.7-25.57-53-58.06C91.61 152.15 115.34 128 147 128s55.39 24.77 53 57.94"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="30"
                d="M206 306c-18.05-8.27-37.93-11.45-59-11.45c-52 0-102.1 25.85-114.65 76.2c-1.65 6.66 2.53 13.25 9.37 13.25H154"
              />
            </svg>
          </div>
          <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
            會員資料列表
          </h1>
        </div>
        <CSVLink data={members} headers={headers} filename={"會員資料.csv"}>
          <Button
            variant="outline"
            className="  bg-brandBlue-normal text-white"
          >
            匯出
          </Button>
        </CSVLink>
      </div>

      <Table className="w-full border rounded-lg overflow-hidden">
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
          {currentMembers.length > 0 ? (
            currentMembers.map((member) => (
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
                    className="mr-2 bg-brandBlue-normal text-white"
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

      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2 bg-brandBlue-normal text-white"
        >
          上一頁
        </Button>
        <span className="px-4 py-2 border rounded-lg">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-2 bg-brandBlue-normal text-white"
        >
          下一頁
        </Button>
      </div>
      {/* 會員詳細資料 Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[700px] h-[700px] justify-center items-center relative shadow-lg rounded-lg"></div>
          <div className="bg-white p-6 rounded-lg  w-[600px] h-[600px] space-y-4 border border-gray-300 absolute">
            <h2 className="text-xl font-bold mb-6 text-center">會員詳細資料</h2>
            <hr />
            <p className="grid grid-cols-2">
              <strong>會員編號:</strong> <span>{selectedMember.id}</span>
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
              <span>
                {new Date(selectedMember.created_at).toLocaleDateString()}
              </span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>完成訂單數:</strong>
              <span>{orderData.totalOrders}</span>
            </p>
            <hr />
            <p className="grid grid-cols-2">
              <strong>消費總金額:</strong>
              <span>${orderData.totalSpent.toFixed(2)}</span>
            </p>
            <hr />
            <div className="mt-auto flex justify-center">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="bg-brandBlue-normal text-white"
              >
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
