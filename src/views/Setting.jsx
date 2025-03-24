import React, { useState, useEffect, useRef } from "react";
import SettingIcon from "../component/icon";
import axios from 'axios';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"





const Setting = () => {
  // <---------------------------設定區域----------------------->
  
  const [filters, setFilters] = useState({
    orderId: "",
    tradeStatus: "",
    startDate: "",
    endDate: "",
    isEnabled: false,
    description: ""
  });

  // <-----------------------------------return------------------------------------------>
  return (
    <React.Fragment>
      <header className="toolBar flex justify-start items-center py-0">
        <div className="box-border flex relative flex-row shrink-0 gap-2 my-auto">
          <div className="my-auto w-6 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 16 16"
            >
              <g fill="none" stroke="#626981" strokeWidth="1">
                <path d="m13.258 8.354l.904.805a.91.91 0 0 1 .196 1.169l-1.09 1.862a.94.94 0 0 1-.35.341a1 1 0 0 1-.478.125a1 1 0 0 1-.306-.046l-1.157-.382q-.304.195-.632.349l-.243 1.173a.93.93 0 0 1-.339.544a.97.97 0 0 1-.618.206H6.888a.97.97 0 0 1-.618-.206a.93.93 0 0 1-.338-.544l-.244-1.173a6 6 0 0 1-.627-.35L3.9 12.61a1 1 0 0 1-.306.046a1 1 0 0 1-.477-.125a.94.94 0 0 1-.35-.34l-1.129-1.863a.91.91 0 0 1 .196-1.187L2.737 8v-.354l-.904-.805a.91.91 0 0 1-.196-1.169L2.766 3.81a.94.94 0 0 1 .35-.341a1 1 0 0 1 .477-.125a1 1 0 0 1 .306.028l1.138.4q.305-.195.632-.349l.244-1.173a.93.93 0 0 1 .338-.544a.97.97 0 0 1 .618-.206h2.238a.97.97 0 0 1 .618.206c.175.137.295.33.338.544l.244 1.173q.325.155.627.35l1.162-.382a.98.98 0 0 1 .784.078c.145.082.265.2.35.34l1.128 1.863a.91.91 0 0 1-.182 1.187l-.918.782z" />
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" />
              </g>
            </svg>
          </div>
          <h1 className="text-xl font-lexend font-semibold text-brandBlue-normal">
            系統設定
          </h1>

        </div>

      </header>

      <section className="settingColumn w-full mt-5 searchFilter flex flex-col gap-8 py-5 bg-white">
        <div className="flex items-center space-x-2">
          <Label htmlFor="setting_switch">網站維護開關</Label>
          <Switch
            className="data-[state=checked]:bg-brandBlue-normal"
            id="setting_switch"
            checked={filters.isEnabled}
            onCheckedChange={(checked) => {
              setFilters(prev => ({ ...prev, isEnabled: checked }));
              if(checked) {
                axios.get("http://localhost:8000/api/maintenance")
                  .then(res => {
                    if(res.data) {
                      setFilters(prev => ({
                        ...prev,
                        startDate: res.data.start_date || "",
                        endDate: res.data.end_date || "",
                        description: res.data.maintain_description || ""
                      }));
                    }
                  })
                  .catch(err => {
                    console.log("獲取維護資料失敗:", err);
                  });
              }
            }}
          />
        </div>

        {filters.isEnabled && (

          <div className="flex flex-col gap-8">
            <div className="DateRange flex flex-row gap-[12px]">
              <div className="StartDate grid w-[284px] max-w-sm items-center gap-1.5">
                <Label className="" htmlFor="startDate">起始日期</Label>
                <Popover id="startDate">
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-between text-left font-normal h-[46px] rounded-md",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      {filters.startDate ? format(new Date(filters.startDate), "PPP") : <span>起始日期</span>}
                      <CalendarIcon className="mr-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate ? new Date(filters.startDate) : null}
                      onSelect={(newDate) => {
                        if(newDate) {
                          const formattedDate = format(newDate, 'yyyy-MM-dd');
                          setFilters(prev => ({...prev, startDate: formattedDate}));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="EndDate grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="endDate">終止日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-between text-left font-normal h-[46px] rounded-md",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      {filters.endDate ? format(new Date(filters.endDate), "PPP") : <span>終止日期</span>}
                      <CalendarIcon className="mr-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate ? new Date(filters.endDate) : null}
                      onSelect={(newDate) => {
                        if(newDate) {
                          const formattedDate = format(newDate, 'yyyy-MM-dd');
                          setFilters(prev => ({...prev, endDate: formattedDate}));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>


            <div className="grid w-full max-w-sm gap-1.5">
              <Label htmlFor="setting_description">維護說明</Label>
              <Textarea type="text"
                id="setting_description"
                placeholder="在維護頁面顯示的內容"
                className="flex-grow gap-2.5 justify-start items-start px-6 pt-4 border border-solid border-neutral-200 w-[800px] h-[240px] rounded-md "
                value={filters.description}
                onChange={e => {
                  if (e.target.value.length <= 100) {
                    setFilters(prev => ({...prev, description: e.target.value}))
                  }
                }} 
                maxLength={100}
              />
              <p className="hint text-sm text-muted-foreground">
                最多輸入100字 ({filters.description ? filters.description.length : 0}/100)
              </p>
            </div>
          </div>

        )}
        <div className="flex flex-row gap-[12px]">
        <Button
          type="button"
          onClick={() => {
            setFilters(prev => ({
              ...prev,
              isEnabled: false,
              startDate: "",
              endDate: "",
              description: ""
            }));
            if (filters.isEnabled) {
              axios.delete("http://localhost:8000/api/maintenance")
                .then(res => {
                  console.log("維護資料已清空");
                })
                .catch(err => {
                  console.error("清空資料失敗:", err);
                });
            }
          }}
          variant="outline"
          className="border-brandBlue-normal py-2 px-2 font-lexend font-normal text-brandBlue-normal h-[46px] rounded-md w-[160px]"
        >
          取消
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (filters.isEnabled) {
              if(!filters.startDate || !filters.endDate || !filters.description) {
                alert("請填寫完整的維護資訊");
                return;
              }
              
              axios.post("http://localhost:8000/api/maintenance", {
                maintain_status:"1",
                start_date: filters.startDate,
                end_date: filters.endDate,
                maintain_description: filters.description
              })
                .then(res => {
                  console.log("維護資料已儲存");
                })
                .catch(err => {
                  console.error("儲存資料失敗:", err);
                });
            } else {
              axios.delete("http://localhost:8000/api/maintenance")
                .then(res => {
                  console.log("維護資料已清空");
                })
                .catch(err => {
                  console.error("清空資料失敗:", err);
                });
            }
          }}
          className="bg-brandBlue-normal hover:bg-brandBlue-dark text-white py-2 px-2 h-[46px] rounded-md w-[160px]"
        >
          確定
        </Button>
        </div>
        
      </section>





    </React.Fragment>
  );
};

export default Setting;