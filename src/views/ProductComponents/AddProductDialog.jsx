import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";

const AddProductDialog = ({ editProduct, setEditProduct, onProductUpdated }) => {
  const [isOpen, setIsOpen] = useState(false); // 控制 Dialog 開關
  const [showConfirm, setShowConfirm] = useState(false); // 控制「關閉前警告框」
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({}); // 存儲表單錯誤
  const [productInfo, setProductInfo] = useState(editProduct || {
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
      console.log("編輯商品數據:", editProduct); // 添加調試輸出
      
      // 處理商品主圖
      if (editProduct.product_img) {
        setProductImages([{
          id: "main-image",
          url: `http://localhost:8000/storage/${editProduct.product_img}`,
          preview: `http://localhost:8000/storage/${editProduct.product_img}`,
          file: null
        }]);
      }
      
      // 嘗試不同可能的展示圖屬性名稱
      let displayImgData = null;
      
      if (editProduct.display_images && editProduct.display_images.length > 0) {
        displayImgData = editProduct.display_images;
        console.log("找到 display_images:", displayImgData);
      } else if (editProduct.displayImages && editProduct.displayImages.length > 0) {
        displayImgData = editProduct.displayImages;
        console.log("找到 displayImages:", displayImgData);
      } else if (editProduct.display_img && editProduct.display_img.length > 0) {
        displayImgData = editProduct.display_img;
        console.log("找到 display_img:", displayImgData);
      }
      
      // 處理展示圖數據
      if (displayImgData) {
        // 檢查數據類型，處理對象數組或字符串數組
        const displayImages = displayImgData.map((img, index) => {
          // 如果是一個對象，可能包含 product_img_URL 屬性
          if (typeof img === 'object' && img.product_img_URL) {
            return {
              id: `display-image-${index}`,
              url: `http://localhost:8000/storage/${img.product_img_URL}`,
              preview: `http://localhost:8000/storage/${img.product_img_URL}`,
              file: null
            };
          }
          // 如果是字符串，直接使用
          else if (typeof img === 'string') {
            return {
              id: `display-image-${index}`,
              url: `http://localhost:8000/storage/${img}`,
              preview: `http://localhost:8000/storage/${img}`,
              file: null
            };
          }
          // 如果是其他格式，嘗試其他屬性
          else if (img && typeof img === 'object') {
            const imgPath = img.url || img.path || img.product_img_URL || '';
            return {
              id: `display-image-${index}`,
              url: `http://localhost:8000/storage/${imgPath}`,
              preview: `http://localhost:8000/storage/${imgPath}`,
              file: null
            };
          }
          return null;
        }).filter(Boolean); // 過濾掉空值
        
        console.log("處理後的展示圖:", displayImages);
        
        if (displayImages.length > 0) {
          setDemoImages(displayImages);
        } else {
          setDemoImages([]);
          console.log("展示圖處理後為空");
        }
      } else {
        setDemoImages([]);
        console.log("沒有找到展示圖數據");
      }
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
      setProductImages([]);
      setDemoImages([]);
    }
  }, [editProduct]);

  const [productImages, setProductImages] = useState([]); // 商品圖片
  const [demoImages, setDemoImages] = useState([]); // 產品展示圖
  const steps = [
    { id: 1, label: "基本資訊" },
    { id: 2, label: "商品描述" },
  ];

  // 確認關閉 Dialog
  const confirmClose = () => {
    setIsOpen(false); // 關閉 Dialog
    setEditProduct(null); // 清除編輯商品
    setShowConfirm(false); // 關閉警告框
    setProductInfo({  // 重置表單
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
    setProductImages([]); // 清空商品圖片
    setDemoImages([]); // 清空展示圖片
    setStep(1);
  };

  const handleSubmit = async () => {
    try {
      // 前端驗證邏輯
      const errors = {};
      
      // 檢查必填字段
      if (!productInfo.name || productInfo.name.trim() === "") {
        errors.product_name = ["商品名稱不能為空"];
      } else if (productInfo.name.length > 100) {
        errors.product_name = ["商品名稱不能超過100個字符"];
      }
      
      if (!productInfo.category || productInfo.category.trim() === "") {
        errors.parent_category = ["父分類不能為空"];
      }
      
      if (!productInfo.subcategory || productInfo.subcategory.trim() === "") {
        errors.child_category = ["子分類不能為空"];
      }
      
      if (!productInfo.price) {
        errors.product_price = ["商品價格不能為空"];
      } else if (isNaN(Number(productInfo.price)) || Number(productInfo.price) <= 0) {
        errors.product_price = ["商品價格必須為大於零的數字"];
      } else if (Number(productInfo.price) > 2147483647) {
        errors.product_price = ["商品價格超出允許範圍"];
      }
      
      if (!productInfo.status || productInfo.status.trim() === "") {
        errors.product_status = ["商品狀態不能為空"];
      } else if (productInfo.status.length > 50) {
        errors.product_status = ["商品狀態不能超過50個字符"];
      }
      
      // 檢查描述長度
      if (productInfo.description && productInfo.description.length > 255) {
        errors.product_description = ["商品描述不能超過255個字符"];
      }
      
      // 檢查規格
      if (productInfo.specifications && productInfo.specifications.length > 0) {
        const specErrors = [];
        
        productInfo.specifications.forEach((spec, index) => {
          // 檢查尺寸
          if (spec.size && spec.size.length > 20) {
            specErrors.push(`規格${index + 1}的尺寸不能超過20個字符`);
          }
          
          // 檢查顏色
          if (spec.color && spec.color.length > 20) {
            specErrors.push(`規格${index + 1}的顏色不能超過20個字符`);
          }
          
          // 檢查庫存
          if (spec.stock && (isNaN(Number(spec.stock)) || Number(spec.stock) < 0)) {
            specErrors.push(`規格${index + 1}的庫存必須為大於等於零的數字`);
          } else if (spec.stock && Number(spec.stock) > 2147483647) {
            specErrors.push(`規格${index + 1}的庫存超出允許範圍`);
          }
        });
        
        if (specErrors.length > 0) {
          errors.specifications = specErrors;
        }
      }
      
      // 檢查商品須知欄位
      if (productInfo.material && productInfo.material.length > 255) {
        errors.material = ["材質說明不能超過255個字符"];
      }
      
      if (productInfo.specification && productInfo.specification.length > 255) {
        errors.specification = ["規格說明不能超過255個字符"];
      }
      
      if (productInfo.shipping && productInfo.shipping.length > 255) {
        errors.shipping = ["出貨說明不能超過255個字符"];
      }
      
      if (productInfo.additional && productInfo.additional.length > 255) {
        errors.additional = ["其他補充不能超過255個字符"];
      }
      
      // 如果有錯誤，更新錯誤狀態並顯示錯誤信息，然後中止提交
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        
        // 構建錯誤消息
        let errorMessage = "表單驗證失敗：\n";
        Object.keys(errors).forEach(field => {
          if (Array.isArray(errors[field])) {
            errorMessage += `- ${errors[field].join(', ')}\n`;
          }
        });
        
        alert(errorMessage);
        
        // 如果錯誤與第一步相關，跳回第一步
        if (errors.product_name || errors.parent_category || errors.child_category || 
            errors.product_price || errors.product_status || errors.specifications) {
          setStep(1);
        } else if (errors.product_description || errors.material || errors.specification || 
                  errors.shipping || errors.additional) {
          setStep(2);
        }
        
        return;
      }
      
      // 清除表單錯誤
      setFormErrors({});
      
      const formData = new FormData();
      formData.append("product_name", productInfo.name);
      formData.append("parent_category", productInfo.category);
      formData.append("child_category", productInfo.subcategory);
      formData.append("product_price", productInfo.price);
      formData.append("product_description", productInfo.description);
      formData.append("product_status", productInfo.status);

      // 上傳規格
      productInfo.specifications.forEach((spec, index) => {
        formData.append(`specifications[${index}][product_size]`, spec.size || "");
        formData.append(`specifications[${index}][product_color]`, spec.color || "");
        formData.append(`specifications[${index}][product_stock]`, spec.stock || 0);
      });

      // 上傳商品須知
      formData.append("material", productInfo.material || "");
      formData.append("specification", productInfo.specification || "");
      formData.append("shipping", productInfo.shipping || "");
      formData.append("additional", productInfo.additional || "");

      // 只在新增商品時上傳圖片
      if (!editProduct) {
        productImages.forEach((image, index) => {
          if (image.file) {
            formData.append(`images[${index}]`, image.file);
          }
        });

        demoImages.forEach((image, index) => {
          if (image.file) {
            formData.append(`display_images[${index}]`, image.file);
          }
        });
      }

      // 判斷是新增還是編輯商品
      const isEdit = !!editProduct;
      let url = "http://localhost:8000/api/products";
      let method = "POST";
      
      if (isEdit) {
        // 編輯商品 - 使用PUT請求並附上商品ID
        url = `http://localhost:8000/api/products/${editProduct.product_id}`;
        method = "POST"; // 改回 POST 因為我們使用 _method 來模擬 PUT
        formData.append("_method", "PUT"); // Laravel 接收 PUT 請求的方式
        
        // 確保所有必要欄位都有填入
        console.log("提交表單數據:", {
          product_name: productInfo.name,
          parent_category: productInfo.category,
          child_category: productInfo.subcategory,
          product_price: productInfo.price,
          product_status: productInfo.status
        });
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          "Accept": "application/json",
        },
        credentials: "include",
      });

      // 如果伺服器返回 422（驗證錯誤），顯示具體錯誤信息
      if (response.status === 422) {
        const errorData = await response.json();
        console.error("驗證錯誤:", errorData);
        let errorMessage = "表單驗證失敗：\n";
        
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach(field => {
            errorMessage += `- ${errorData.errors[field].join(', ')}\n`;
          });
        }
        
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("成功:", data);

      if (response.ok) {
        alert(isEdit ? "商品更新成功！" : "商品上傳成功！");
         // ✅ 清空所有表單數據
         setProductInfo({  // 重置表單
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
        setProductImages([]); // 清空商品圖片
        setDemoImages([]); // 清空展示圖片
        setStep(1);
        setIsOpen(false);
        setEditProduct(null);
        
        // 調用回調函數來重新獲取商品列表
        if (typeof onProductUpdated === 'function') {
          onProductUpdated();
        }
        
      } else {
        alert(isEdit ? "更新失敗，請檢查輸入內容" : "上傳失敗，請檢查輸入內容");
      }
    } catch (error) {
      console.error("操作失敗:", error);
      alert("操作失敗，請稍後再試");
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
          }} className="bg-brandBlue-normal text-white">+ 新增商品</Button>
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
                  formErrors={formErrors}
                  isEditMode={!!editProduct}
                />
              </TabsContent>
              <TabsContent value="2">
                <ProductDescription
                  productInfo={productInfo}
                  setProductInfo={setProductInfo}
                  demoImages={demoImages}
                  setDemoImages={setDemoImages}
                  formErrors={formErrors}
                  isEditMode={!!editProduct}
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