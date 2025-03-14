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
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">會員詳細資料</h2>
            <p><strong>ID:</strong> {selectedMember.id}</p>
            <p><strong>姓名:</strong> {selectedMember.name}</p>
            <p><strong>Email:</strong> {selectedMember.email}</p>
            <p><strong>手機:</strong> {selectedMember.phone}</p>
            <p><strong>生日:</strong> {selectedMember.birthday}</p>
            <p><strong>建立時間:</strong> {new Date(selectedMember.created_at).toLocaleDateString()}</p>

            <div className="mt-4 flex justify-end">
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
