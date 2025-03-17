import { useState, useEffect, useRef } from "react";
import { XIcon, SearchIcon, CalendarIcon, MailIcon } from "lucide-react";
import api from "../services/api";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const UserSelector = ({ isOpen, onClose, selectedUsers = [], onConfirm }) => {
  const modalRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 處理點擊外部關閉 - 使用 mousedown 而非 click 以避免與 select 組件衝突
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 確保點擊不是發生在 Select 組件內部
      const isSelectElement = event.target.closest('[role="combobox"]') || 
                             event.target.closest('[role="listbox"]');
      
      if (modalRef.current && !modalRef.current.contains(event.target) && !isSelectElement) {
        onClose();
      }
    };

    if (isOpen) {
      // 使用 mousedown 事件而不是 click 事件
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 載入用戶數據
  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    setError(null);

    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        if (response && response.data) {
          setUsers(response.data);
        } else {
          setUsers([]);
          setError("無會員資料");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("無法載入會員資料");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // 使用 setTimeout 來確保即使 API 呼叫完全失敗，也能在一段時間後恢復介面
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("載入超時，請稍後重試");
      }
    }, 5000); // 5秒超時

    fetchUsers().catch(err => {
      console.error("Unexpected error in fetchUsers:", err);
      setLoading(false);
      setError("載入發生未預期錯誤");
    });

    return () => clearTimeout(timeout);
  }, [isOpen]);

  // 當選擇器打開時，根據已選項目設置初始狀態
  useEffect(() => {
    if (isOpen && selectedUsers && selectedUsers.length > 0) {
      setSelected(selectedUsers);
    } else {
      setSelected([]); // 重置選擇
    }
  }, [isOpen, selectedUsers]);

  // 處理確認選擇
  const handleConfirm = () => {
    try {
      onConfirm(selected);
      onClose();
    } catch (error) {
      console.error("Error in confirm selection:", error);
      alert("確認選擇時發生錯誤");
    }
  };

  // 過濾用戶
  const filteredUsers = users.filter(user => {
    try {
      // 檢查搜尋條件
      const searchField = filterType === "name" ? (user.name || "") : 
                          filterType === "email" ? (user.email || "") : 
                          (user.id || "").toString();
      return searchField.toLowerCase().includes((filter || "").toLowerCase());
    } catch (error) {
      console.error("Error filtering users:", error);
      return true; // 在過濾出錯時顯示所有用戶
    }
  });

  // 切換選中狀態
  const toggleSelection = (user) => {
    try {
      setSelected(prev => {
        const isSelected = prev.some(u => u.id === user.id);
        return isSelected 
          ? prev.filter(u => u.id !== user.id) 
          : [...prev, user];
      });
    } catch (error) {
      console.error("Error toggling selection:", error);
    }
  };

  // 選擇全部過濾出的用戶
  const selectAllFiltered = () => {
    try {
      setSelected(prev => {
        const newSelection = [...prev];
        
        filteredUsers.forEach(user => {
          if (!prev.some(u => u.id === user.id)) {
            newSelection.push(user);
          }
        });
        
        return newSelection;
      });
    } catch (error) {
      console.error("Error selecting all filtered:", error);
    }
  };

  // 取消選擇全部過濾出的用戶
  const deselectAllFiltered = () => {
    try {
      setSelected(prev => 
        prev.filter(user => !filteredUsers.some(u => u.id === user.id))
      );
    } catch (error) {
      console.error("Error deselecting all filtered:", error);
    }
  };

  // 獲取月份名稱
  const getMonthName = (monthNumber) => {
    if (!monthNumber) return "未知";
    
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                   '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[parseInt(monthNumber) - 1] || "未知";
  };

  // 格式化註冊日期
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return { month: "未知", year: "未知" };
    
    try {
      const date = new Date(dateString);
      return {
        month: getMonthName(date.getMonth() + 1),
        year: date.getFullYear()
      };
    } catch (e) {
      return { month: "未知", year: "未知" };
    }
  };

  // 防止 Select 內部的點擊事件傳播
  const handleSelectClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg border-2 border-gray-300 shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題區域 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            選擇會員
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="關閉"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 搜尋與過濾區域 */}
        <div className="p-4 border-b">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜尋會員..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="w-40" onClick={handleSelectClick}>
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="搜尋欄位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">姓名</SelectItem>
                  <SelectItem value="email">電子郵件</SelectItem>
                  <SelectItem value="id">ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={selectAllFiltered}
            >
              全選
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={deselectAllFiltered}
            >
              取消全選
            </Button>
          </div>
        </div>

        {/* 用戶列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] text-brandBlue-normal"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-amber-600 mb-4">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const registrationInfo = formatRegistrationDate(user.created_at);
                  return (
                    <div 
                      key={user.id} 
                      className="flex items-start p-3 rounded-md border hover:bg-gray-50"
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="pt-1">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selected.some(u => u.id === user.id)}
                            onCheckedChange={() => toggleSelection(user)}
                          />
                        </div>
                        <div className="flex-1">
                          <Label 
                            htmlFor={`user-${user.id}`}
                            className="flex items-center cursor-pointer mb-1"
                          >
                            <span className="font-medium text-gray-900">{user.name || "未命名會員"}</span>
                            <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2 text-gray-600">
                              #{user.id}
                            </span>
                          </Label>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <MailIcon className="h-3 w-3 mr-1" />
                              <span className="truncate">{user.email || "無電子郵件"}</span>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>註冊: {registrationInfo.year}年{registrationInfo.month}</span>
                            </div>
                            
                            {user.birth_month && (
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="text-pink-500 mr-1">🎂</span>
                                <span>生日月份: {getMonthName(user.birth_month)}</span>
                              </div>
                            )}
                            
                            {user.phone && (
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="mr-1">📱</span>
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  找不到符合條件的會員
                </div>
              )}
            </div>
          )}
        </div>

        {/* 按鈕區域 */}
        <div className="p-4 border-t flex justify-end gap-4">
          <div className="flex-1 text-sm text-gray-500 self-center">
            已選擇 {selected.length} 位會員
          </div>
          <Button
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
          >
            確認選擇
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSelector; 