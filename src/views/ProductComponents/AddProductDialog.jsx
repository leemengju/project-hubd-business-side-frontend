import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";

const AddProductDialog = ({ editProduct, setEditProduct }) => {
  const [isOpen, setIsOpen] = useState(false); // 控制 Dialog 開關
  const [showConfirm, setShowConfirm] = useState(false); // 控制「關閉前警告框」
  const [step, setStep] = useState(1);
  const [productInfo, setProductInfo] = useState(editProduct ||{
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

  useEffect(() => {
    if (editProduct) {
      setProductInfo(editProduct);
    } else {
      setProductInfo({
        name: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        status: "active",
        specifications: [],
      });
    }
  }, [editProduct]);

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
    setEditProduct(null); // 清除編輯商品
    setShowConfirm(false); // 關閉警告框
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("product_name", productInfo.name);
      formData.append("category_id", productInfo.category);
      formData.append("product_price", productInfo.price);
      formData.append("product_description", productInfo.description);
      formData.append("product_status", productInfo.status);

      // 上傳規格
      productInfo.specifications.forEach((spec, index) => {
        formData.append(`specifications[${index}][product_size]`, spec.product_size);
        formData.append(`specifications[${index}][product_color]`, spec.product_color);
        formData.append(`specifications[${index}][product_stock]`, spec.product_stock);
      });

      // 上傳商品須知
      formData.append("material", productInfo.material);
      formData.append("specification", productInfo.specification);
      formData.append("shipping", productInfo.shipping);
      formData.append("additional", productInfo.additional);

      // 上傳商品圖片
      productImages.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      // 上傳展示圖
      demoImages.forEach((file, index) => {
        formData.append(`display_images[${index}]`, file);
      });

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("商品上傳失敗");
      }

      alert("商品上傳成功！");
      setIsOpen(false);
      setEditProduct(null);
    } catch (error) {
      console.error("上傳失敗:", error);
      alert("上傳失敗，請稍後再試");
    }
  };

  return (
    <>
      {/* 開啟 Dialog 按鈕 */}
      <Dialog open={!!editProduct || isOpen} onOpenChange={(open) => {
        if (!open) {
          setShowConfirm(true); // 顯示確認關閉對話框
        } else {
          setIsOpen(true);
        }
      }}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setIsOpen(true);
            setEditProduct(null);
          }} className="bg-blue-500 text-white">+ 新增商品</Button>
        </DialogTrigger>
        <DialogContent className=" [&>button]:hidden fixed left-100 right-0 translate-x-0 h-full w-[596px] overflow-y-auto px-6 bg-white shadow-lg">

          {/* 新增商品標題 */}
          <div className="absolute top-0 w-full p-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-3xl font-bold">{editProduct ? "編輯商品" : "新增商品"}</h2>
              <DialogClose asChild>
                <button className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
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
                {step < steps.length ? (
                  <Button className="bg-black text-white" onClick={() => setStep((prev) => Math.min(prev + 1, steps.length))}>
                    下一步
                  </Button>
                ) : (
                  <Button className="bg-green-500 text-white" onClick={handleSubmit}>
                    上傳商品
                  </Button>
                )}
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