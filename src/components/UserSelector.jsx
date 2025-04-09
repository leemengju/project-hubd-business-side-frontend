import { useState, useEffect, useRef } from "react";
import { XIcon, SearchIcon, CalendarIcon, MailIcon, CakeIcon, UserIcon, PhoneIcon, FilterIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const UserSelector = ({ isOpen, onClose, selectedUsers = [], onConfirm }) => {
  const modalRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [birthMonthFilters, setBirthMonthFilters] = useState([]); // 改為陣列以支援多選
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每頁顯示的會員數量
  const mouseDownOutside = useRef(false);
  const [popoverOpen, setPopoverOpen] = useState(false); // 用於控制月份選擇器的開關狀態

  // 處理滑鼠按下事件
  const handleMouseDown = (e) => {
    // 檢查點擊是否發生在月份選擇彈出層上
    const isPopoverElement = e.target.closest('[data-radix-popper-content-wrapper]') ||
                             e.target.closest('[role="dialog"]');
    
    // 如果點擊發生在月份選擇器上，則不視為外部點擊
    if (isPopoverElement) {
      mouseDownOutside.current = false;
      // 阻止事件冒泡
      e.stopPropagation();
      return;
    }
    
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
    // 檢查點擊是否發生在月份選擇彈出層上
    const isPopoverElement = e.target.closest('[data-radix-popper-content-wrapper]') ||
                             e.target.closest('[role="dialog"]');
    
    // 如果點擊發生在月份選擇器上，則不關閉模態窗口
    if (isPopoverElement) {
      // 阻止事件冒泡
      e.stopPropagation();
      return;
    }
    
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
      document.addEventListener('mousedown', handleMouseDown, true);
      document.addEventListener('mouseup', handleMouseUp, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
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
          console.log("獲取的用戶數據:", response.data);
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
    
    // 重置篩選狀態
    setBirthMonthFilters([]);
    setCurrentPage(1);
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

  // 格式化生日顯示
  const formatBirthday = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const month = date.getMonth() + 1; // 月份從0開始，所以+1
      const day = date.getDate();
      
      return `${month}月${day}日`;
    } catch (error) {
      console.error("Error formatting birthday:", error);
      return null;
    }
  };

  // 獲取生日月份
  const getBirthMonth = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.getMonth() + 1; // 月份從0開始，所以+1
    } catch (error) {
      console.error("Error getting birth month:", error);
      return null;
    }
  };

  // 處理多選月份篩選
  const toggleBirthMonthFilter = (month, e) => {
    if (e) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    
    setBirthMonthFilters(prev => {
      if (prev.includes(month)) {
        return prev.filter(m => m !== month);
      } else {
        return [...prev, month];
      }
    });
    setCurrentPage(1); // 切換篩選時重置頁碼
  };

  // 清除所有月份篩選
  const clearBirthMonthFilters = (e) => {
    if (e) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    
    setBirthMonthFilters([]);
    setCurrentPage(1);
  };

  // 過濾用戶
  const filteredUsers = users.filter(user => {
    try {
      // 檢查生日月份條件
      if (birthMonthFilters.length > 0) {
        const birthMonth = getBirthMonth(user.birthday);
        
        // 如果使用者無生日資料，或月份不在選定列表中，則過濾掉
        if (!birthMonth || !birthMonthFilters.includes(birthMonth)) {
          return false;
        }
      }
      
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

  // 分頁功能 - 獲取當前頁的會員
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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

  // 選擇當前頁的所有用戶
  const selectCurrentPage = () => {
    try {
      setSelected(prev => {
        const newSelection = [...prev];
        
        currentItems.forEach(user => {
          if (!prev.some(u => u.id === user.id)) {
            newSelection.push(user);
          }
        });
        
        return newSelection;
      });
    } catch (error) {
      console.error("Error selecting current page:", error);
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
    
    return months[monthNumber - 1] || "未知月份";
  };

  // 格式化註冊日期
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return "未知";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "無效日期";
    
    const year = date.getFullYear();
    const month = getMonthName(date.getMonth() + 1);
    
    return `${year}年${month}`;
  };

  // 防止 Select 內部的點擊事件傳播
  const handleSelectClick = (e) => {
    e.stopPropagation();
  };
  
  // 防止 Popover 內部的點擊事件傳播
  const handlePopoverClick = (e) => {
    e.stopPropagation();
  };

  // 處理月份標籤點擊，阻止事件冒泡
  const handleMonthTagClick = (month, e) => {
    e.stopPropagation();
    toggleBirthMonthFilter(month);
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
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-brandBlue-normal" />
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
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜尋會員..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="w-32" onClick={handleSelectClick}>
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
          
          {/* 生日月份過濾 - 使用Popover實現更整潔的多選介面 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CakeIcon className="h-4 w-4 text-pink-500 mr-2" />
                <span className="text-sm font-medium">生日月份篩選</span>
              </div>
              
              {birthMonthFilters.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => clearBirthMonthFilters(e)}
                  className="h-7 px-2 text-xs"
                >
                  清除篩選
                </Button>
              )}
            </div>
            
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpen(true);
                }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FilterIcon className="h-3.5 w-3.5" />
                    選擇月份
                    {birthMonthFilters.length > 0 && (
                      <Badge className="ml-1 bg-pink-500 hover:bg-pink-600">
                        {birthMonthFilters.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" onClick={handlePopoverClick}>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">選擇生日月份</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                        <Badge 
                          key={month}
                          className={cn(
                            "cursor-pointer h-8 flex items-center justify-center", 
                            birthMonthFilters.includes(month) 
                              ? "bg-pink-500 hover:bg-pink-600 text-white" 
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          )}
                          onClick={(e) => toggleBirthMonthFilter(month, e)}
                        >
                          {month}月
                        </Badge>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="ml-3 flex flex-wrap gap-1.5">
                {birthMonthFilters.length > 0 ? (
                  birthMonthFilters
                    .sort((a, b) => a - b)
                    .map(month => (
                      <Badge 
                        key={month}
                        className="bg-pink-100 text-pink-700 hover:bg-pink-200 cursor-pointer"
                        onClick={(e) => handleMonthTagClick(month, e)}
                      >
                        {month}月 <XIcon className="h-3 w-3 ml-1" />
                      </Badge>
                    ))
                ) : (
                  <span className="text-xs text-gray-500 italic">未選擇月份 (顯示所有會員)</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  selectCurrentPage();
                }}
              >
                選擇當前頁
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  selectAllFiltered();
                }}
              >
                選擇全部
              </Button>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deselectAllFiltered();
              }}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
            >
              取消選擇
            </Button>
          </div>
        </div>

        {/* 用戶列表 */}
        <div className="flex-1 overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
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
            <div>
              {/* 分頁資訊 */}
              <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                <div>
                  共 {filteredUsers.length} 位會員符合條件
                  {birthMonthFilters.length > 0 && (
                    <span className="ml-1 text-pink-500">
                      ({birthMonthFilters.sort((a, b) => a - b).map(m => `${m}月`).join('、')})
                    </span>
                  )}
                </div>
                <div>
                  第 {currentPage} / {totalPages || 1} 頁
                </div>
              </div>
              
              {/* 用戶卡片列表 */}
              <div className="space-y-3">
                {currentItems.length > 0 ? (
                  currentItems.map(user => {
                    const birthday = formatBirthday(user.birthday);
                    const isSelected = selected.some(u => u.id === user.id);
                    
                    return (
                      <div 
                        key={user.id} 
                        className={cn(
                          "flex p-4 rounded-lg transition-all",
                          isSelected 
                            ? "border-2 border-brandBlue-normal bg-brandBlue-ultraLight shadow" 
                            : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="pt-1">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(user)}
                              className={isSelected ? "text-brandBlue-normal" : ""}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          
                          <Label 
                            htmlFor={`user-${user.id}`}
                            className="flex-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-start w-full">
                              {/* 用戶基本資訊 */}
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{user.name || '未命名用戶'}</span>
                                  <span className="text-xs text-gray-500">#{user.id}</span>
                                </div>
                                
                                <div className="flex flex-col space-y-1 mt-2">
                                  <div className="flex items-center text-xs text-gray-600">
                                    <MailIcon className="h-3 w-3 mr-1.5 text-gray-400" />
                                    <span>{user.email || '無郵箱'}</span>
                                  </div>
                                  
                                  {user.phone && (
                                    <div className="flex items-center text-xs text-gray-600">
                                      <PhoneIcon className="h-3 w-3 mr-1.5 text-gray-400" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center text-xs text-gray-600">
                                    <CalendarIcon className="h-3 w-3 mr-1.5 text-gray-400" />
                                    <span>註冊: {formatRegistrationDate(user.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 生日資訊 */}
                              {birthday && (
                                <div className="flex flex-col items-center">
                                  <div className="bg-pink-50 text-pink-600 font-medium text-xs rounded-full px-3 py-1 flex items-center">
                                    <CakeIcon className="h-3 w-3 mr-1" />
                                    {birthday}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Label>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {filter || birthMonthFilters.length > 0 
                      ? `沒有符合條件的會員` 
                      : '沒有可選擇的會員'}
                  </div>
                )}
              </div>
              
              {/* 分頁控制 */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    disabled={currentPage === 1}
                  >
                    上一頁
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // 顯示當前頁附近的頁碼
                      const pageToShow = Math.min(
                        Math.max(currentPage - 2 + i, 1),
                        totalPages
                      );
                      
                      // 避免重複顯示頁碼
                      if (i > 0 && pageToShow <= Math.min(
                        Math.max(currentPage - 2 + i - 1, 1),
                        totalPages
                      )) {
                        return null;
                      }
                      
                      return (
                        <Button 
                          key={pageToShow}
                          variant={currentPage === pageToShow ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0",
                            currentPage === pageToShow && "bg-brandBlue-normal hover:bg-brandBlue-dark"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage(pageToShow);
                          }}
                        >
                          {pageToShow}
                        </Button>
                      );
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    disabled={currentPage === totalPages}
                  >
                    下一頁
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 按鈕區域 */}
        <div className="p-4 border-t flex justify-between items-center gap-4 bg-gray-50">
          <div className="text-sm text-gray-500">
            已選擇 <span className="font-medium text-brandBlue-normal">{selected.length}</span> 位會員
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              取消
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm();
              }}
              className="bg-brandBlue-normal hover:bg-brandBlue-dark"
            >
              確認選擇
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector; 