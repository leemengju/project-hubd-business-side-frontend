import { useState, useEffect, useRef } from "react";
import api from "../services/api";

const UserSelector = ({ 
  isOpen, 
  onClose, 
  selectedUsers,
  onConfirm
}) => {
  const modalRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(selectedUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    birthMonth: "",
    lastPurchase: "all", // all, week, month, 3months, 6months
    purchaseAmount: "all", // all, 1000+, 5000+, 10000+
    registrationDate: "all" // all, last week, last month, last 3 months
  });

  // Handle click outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const getFilteredUsers = () => {
    return users.filter(user => {
      // Search term filter (name or email)
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Birth month filter
      if (filters.birthMonth) {
        const birthMonth = new Date(user.birthday).getMonth() + 1;
        if (birthMonth !== parseInt(filters.birthMonth)) {
          return false;
        }
      }

      // Last purchase time filter
      if (filters.lastPurchase !== 'all') {
        const lastPurchaseDate = new Date(user.last_purchase_date);
        const now = new Date();
        const diffTime = now - lastPurchaseDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (filters.lastPurchase) {
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
          case '3months':
            if (diffDays > 90) return false;
            break;
          case '6months':
            if (diffDays > 180) return false;
            break;
        }
      }

      // Registration date filter
      if (filters.registrationDate !== 'all') {
        const registrationDate = new Date(user.registration_date);
        const now = new Date();
        const diffTime = now - registrationDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (filters.registrationDate) {
          case 'lastWeek':
            if (diffDays > 7) return false;
            break;
          case 'lastMonth':
            if (diffDays > 30) return false;
            break;
          case 'last3Months':
            if (diffDays > 90) return false;
            break;
        }
      }

      // Purchase amount filter
      if (filters.purchaseAmount !== 'all') {
        const amount = Number(user.total_purchase_amount);
        switch (filters.purchaseAmount) {
          case '1000+':
            if (amount < 1000) return false;
            break;
          case '5000+':
            if (amount < 5000) return false;
            break;
          case '10000+':
            if (amount < 10000) return false;
            break;
        }
      }

      return true;
    });
  };

  const filteredUsers = getFilteredUsers();

  const handleToggleSelect = (user) => {
    const isSelected = selected.find(u => u.id === user.id);
    if (isSelected) {
      setSelected(selected.filter(u => u.id !== user.id));
    } else {
      setSelected([...selected, user]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === filteredUsers.length) {
      setSelected([]);
    } else {
      setSelected(filteredUsers);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div 
        ref={modalRef}
        className="relative top-20 mx-auto p-5 border w-[1000px] shadow-lg rounded-lg bg-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">選擇會員</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜尋和篩選區 */}
        <div className="mb-4 space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="搜尋會員姓名或電子郵件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filters.birthMonth}
              onChange={(e) => setFilters({...filters, birthMonth: e.target.value})}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">所有生日月份</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}月生日
                </option>
              ))}
            </select>

            <select
              value={filters.lastPurchase}
              onChange={(e) => setFilters({...filters, lastPurchase: e.target.value})}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">不限最後購買時間</option>
              <option value="week">最近一週</option>
              <option value="month">最近一個月</option>
              <option value="3months">最近三個月</option>
              <option value="6months">最近半年</option>
            </select>

            <select
              value={filters.registrationDate}
              onChange={(e) => setFilters({...filters, registrationDate: e.target.value})}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">不限註冊時間</option>
              <option value="lastWeek">最近一週註冊</option>
              <option value="lastMonth">最近一個月註冊</option>
              <option value="last3Months">最近三個月註冊</option>
            </select>

            <select
              value={filters.purchaseAmount}
              onChange={(e) => setFilters({...filters, purchaseAmount: e.target.value})}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">不限消費金額</option>
              <option value="1000+">消費滿1,000</option>
              <option value="5000+">消費滿5,000</option>
              <option value="10000+">消費滿10,000</option>
            </select>
          </div>
        </div>

        {/* 選擇項目統計 */}
        <div className="mb-4 text-sm text-gray-600">
          已選擇 {selected.length} 位會員 / 共 {filteredUsers.length} 位會員
        </div>

        {/* Select All / Deselect All Button */}
        <div className="mb-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-brandBlue-normal hover:bg-brandBlue-normalHover text-white rounded-lg"
          >
            {selected.length === filteredUsers.length ? "取消全選" : "全選"}
          </button>
        </div>

        {/* 會員列表 */}
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto mb-4">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => handleToggleSelect(user)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selected.find(u => u.id === user.id)
                  ? 'border-brandBlue-normal bg-brandBlue-light'
                  : 'hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user.avatar && (
                    <img 
                      src={user.avatar} 
                      alt="" 
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>生日：{new Date(user.birthday).toLocaleDateString()}</p>
                  <p>總消費：NT$ {user.total_purchase_amount}</p>
                </div>
                <input 
                  type="checkbox"
                  checked={!!selected.find(u => u.id === user.id)}
                  onChange={() => {}}
                  className="h-4 w-4 text-brandBlue-normal"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelected([])}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            清除所有選擇
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => {
                onConfirm(selected);
                onClose();
              }}
              className="px-4 py-2 bg-brandBlue-normal hover:bg-brandBlue-normalHover text-white rounded-lg"
            >
              確認選擇 ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector; 