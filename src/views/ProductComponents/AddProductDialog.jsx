import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";


const AddProductDialog = () => {
  const [isOpen, setIsOpen] = useState(false); // 控制 Dialog 開關
  const [showConfirm, setShowConfirm] = useState(false); // 控制「關閉前警告框」
  const [step, setStep] = useState(1);
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    status: "active",
    specifications: [],
    material: "",
    specification: "",
    shipping: "",
    additional: "",
  });
  const [productImages, setProductImages] = useState([]); // 商品圖片
  const [demoImages, setDemoImages] = useState([]); // 產品展示圖
  const steps = [
    { id: 1, label: "基本資訊" },
    { id: 2, label: "商品描述" },
  ];

  // 嘗試關閉時，先顯示確認對話框
  const handleDialogClose = (open) => {
    if (!open) {
      setShowConfirm(true); // 顯示「確認關閉」視窗
    } else {
      setIsOpen(true);
    }
  };

  // 確認關閉 Dialog
  const confirmClose = () => {
    setIsOpen(false); // 關閉 Dialog
    setShowConfirm(false); // 關閉警告框
  };

  return (
    <>
      {/* 開啟 Dialog 按鈕 */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white">+ 新增商品</Button>
        </DialogTrigger>
        <DialogContent className=" [&>button]:hidden fixed left-100 right-0 translate-x-0 h-full w-[596px] overflow-y-auto px-6 bg-white shadow-lg">

          {/* 新增商品標題 */}
          <div className="absolute top-0 w-full p-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-3xl font-bold">新增商品</h2>
              <DialogClose asChild>
                <button onClick={handleDialogClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
              </DialogClose>
            </div>
          </div>

          {/* 步驟條 */}
          <Tabs value={String(step)} className="py-4">
            <ScrollArea className="flex overflow-y-auto max-h-[80vh] mt-[53px]">
              <div className="flex items-center justify-between w-full relative mb-6">
                {steps.map((s, index) => (
                  <div key={s.id} className="flex-1 flex flex-col items-center relative">
                    {/* 連接線（步驟之間） */}
                    {index > 0 && (
                      <div className="absolute left-[-50%] top-[30%] w-full h-[2px] border-b-2 border-dashed border-gray-300"></div>
                    )}
                    {/* 步驟指示器 */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${step === s.id ? "bg-white border-red-500 text-red-500" : "bg-gray-200 border-white text-gray-500"}
                    `}>
                      {s.id}
                    </div>
                    {/* 步驟名稱 */}
                    <p className={`mt-2 text-sm ${step === s.id ? "text-black" : "text-gray-400"}`}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* 內容區塊（可滾動） */}
              <TabsContent value="1">
                <ProductBasicInfo 
                  productInfo={productInfo} 
                  setProductInfo={setProductInfo} 
                  productImages={productImages} 
                  setProductImages={setProductImages} 
                />
              </TabsContent>
              <TabsContent value="2">
                <ProductDescription 
                  productInfo={productInfo} 
                  setProductInfo={setProductInfo} 
                  demoImages={demoImages} 
                  setDemoImages={setDemoImages} 
                />
              </TabsContent>
            </ScrollArea>

            {/* 步驟切換按鈕 */}
            <div className="absolute bottom-0 left-0 w-full border-t bg-white p-4">
              <div className="flex justify-between">
                <Button variant="outline" disabled={step === 1} onClick={() => setStep((prev) => Math.max(prev - 1, 1))}>
                  上一步
                </Button>
                <Button className="bg-black text-white" disabled={step === 2} onClick={() => setStep((prev) => Math.min(prev + 1, 2))}>
                  下一步
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 關閉 Dialog 的確認對話框 */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>確定要關閉嗎？</AlertDialogHeader>
          <p className="text-sm text-gray-500">
            未儲存的資料將會消失，是否確定要關閉新增商品？
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>確定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddProductDialog;