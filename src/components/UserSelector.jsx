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
  const mouseDownOutside = useRef(false);

  // 處理滑鼠按下事件
  const handleMouseDown = (e) => {
    // 確保點擊不是發生在 Select 組件內部
    const isSelectElement = e.target.closest('[role="combobox"]') || 
                           e.target.closest('[role="listbox"]');
    
    // 如果點擊是在模態視窗外部且不是Select組件
    if (modalRef.current && !modalRef.current.contains(e.target) && !isSelectElement) {
      mouseDownOutside.current = true;
      // 阻止事件冒泡，避免觸發主視窗的事件
      e.stopPropagation();
    } else {
      mouseDownOutside.current = false;
    }
  };

  // 處理滑鼠放開事件
  const handleMouseUp = (e) => {
    // 確保點擊不是發生在 Select 組件內部
    const isSelectElement = e.target.closest('[role="combobox"]') || 
                           e.target.closest('[role="listbox"]');
    
    // 如果點擊是在模態視窗外部且不是Select組件
    if (modalRef.current && !modalRef.current.contains(e.target) && !isSelectElement && mouseDownOutside.current) {
      // 阻止事件冒泡，避免觸發主視窗的事件
      e.stopPropagation();
      onClose();
    }
    mouseDownOutside.current = false;
  };

  // 設置全域事件監聽
  useEffect(() => {
    if (isOpen) {
      // 使用 mousedown 和 mouseup 事件
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
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

  // 取得月份名稱
  const getMonthName = (monthNumber) => {
    const months = [
      "一月", "二月", "三月", "四月", "五月", "六月",
      "七月", "八月", "九月", "十月", "十一月", "十二月"
    ];
    
    return months[monthNumber] || "未知月份";
  };

  // 格式化註冊日期
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return "未知";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "無效日期";
    
    const year = date.getFullYear();
    const month = getMonthName(date.getMonth());
    
    return `${year}年${month}`;
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
                filteredUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={cn(
                      "flex items-center p-3 rounded-md border mb-2 hover:bg-gray-50 transition-colors",
                      selected.some(u => u.id === user.id) && "border-brandBlue-normal bg-brandBlue-ultraLight"
                    )}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selected.some(u => u.id === user.id)}
                        onCheckedChange={() => toggleSelection(user)}
                      />
                      <Label 
                        htmlFor={`user-${user.id}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || '未命名用戶'}</span>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MailIcon className="h-3 w-3 mr-1" />
                            <span>{user.email || '無郵箱'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>{formatRegistrationDate(user.created_at)}</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {filter ? `沒有符合 "${filter}" 的會員` : '沒有可選擇的會員'}
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