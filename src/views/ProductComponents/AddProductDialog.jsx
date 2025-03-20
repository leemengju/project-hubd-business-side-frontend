import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";
import PropTypes from "prop-types";

const AddProductDialog = ({ editProduct, setEditProduct }) => {
  const [isOpen, setIsOpen] = useState(false); // 控制 Dialog 開關
  const [showConfirm, setShowConfirm] = useState(false); // 控制「關閉前警告框」
  const [step, setStep] = useState(1);
  const [productImages, setProductImages] = useState([]); // 商品圖片
  const [demoImages, setDemoImages] = useState([]); // 產品展示圖
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
  
  useEffect(() => {
    if (editProduct) {
      console.log("編輯商品:", editProduct);
      // 映射商品規格數據
      const specificationData = editProduct.specifications.map(spec => ({
        id: spec.id,
        color: spec.product_color,
        size: spec.product_size,
        stock: parseInt(spec.product_stock),
        expanded: true
      }));
      console.log("映射後的規格數據:", specificationData);
      console.log("原始編輯產品數據:", editProduct);

      // 設置基本商品信息
      setProductInfo({
        name: editProduct.product_name || "",
        description: editProduct.product_description || "",
        price: editProduct.product_price ? editProduct.product_price.toString() : "",
        category: editProduct.classifiction?.[0]?.parent_category || "",
        subcategory: editProduct.classifiction?.[0]?.child_category || "",
        status: editProduct.product_status || "active",
        specifications: specificationData,
        material: "",
        specification: "",
        shipping: "",
        additional: "",
      });

      // 使用product_id獲取商品的所有圖片
      const fetchProductImages = async () => {
        try {
          console.log("開始獲取商品圖片，商品ID:", editProduct.product_id);
          const url = `http://localhost:8000/api/products/${editProduct.product_id}/images`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`獲取圖片失敗: ${response.status}`);
          }
          
          const imageData = await response.json();
          console.log('從API獲取的圖片數據:', imageData);
          
          if (imageData && (Array.isArray(imageData) || Array.isArray(imageData.data))) {
            // 處理API返回的圖片數據
            const imagesArray = Array.isArray(imageData) ? imageData : imageData.data;
            const processedImages = imagesArray.map(img => {
              // 構建完整URL
              const imgPath = img.product_img_URL || img.product_img_url;
              const fullUrl = imgPath 
                ? (imgPath.startsWith('http') ? imgPath : `http://localhost:8000/storage/${imgPath}`)
                : "";
              
              console.log(`處理圖片 ID: ${img.id}, URL: ${fullUrl}, 顯示順序: ${img.product_display_order}`);
              
              return {
                id: img.id, // 保存圖片ID
                product_img_URL: imgPath, // 保存原始URL路徑
                url: fullUrl,
                file: null, // 初始時file為null
                product_display_order: parseInt(img.product_display_order) || 0
              };
            });
            
            // 根據顯示順序排序圖片
            processedImages.sort((a, b) => a.product_display_order - b.product_display_order);
            console.log('處理後的圖片陣列:', processedImages);
            setProductImages(processedImages);
            console.log('載入的圖片數量:', processedImages.length);
          } else {
            console.warn('API返回的圖片數據格式不正確:', imageData);
            setProductImages([]);
          }
        } catch (error) {
          console.error('獲取商品圖片時出錯:', error);
          setProductImages([]);
        }
      };
      
      // 調用獲取圖片函數
      fetchProductImages();

      // 設置展示圖片的 src
      const demoImagesData = editProduct.display_images?.map(img => {
        const imgPath = img.product_img_url || img.product_img_URL;
        return {
          id: img.id,
          product_img_URL: imgPath,
          url: imgPath ? `http://localhost:8000/storage/${imgPath}` : "",
          file: null,
        };
      }) || [];
      
      setDemoImages(demoImagesData);
      console.log('載入的展示圖片數量:', demoImagesData.length);
    } else {
      // 初始化空白商品資料
      setProductInfo({
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
      setProductImages([]);
      setDemoImages([]);
    }
  }, [editProduct]);

  
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
      // 詳細調試日誌，確認表單數據
      console.log("===== 提交商品表單 =====");
      console.log("編輯模式:", !!editProduct, "商品ID:", editProduct?.product_id);
      console.log("表單完整數據:", productInfo);
      console.log("必填欄位檢查:", {
        name: Boolean(productInfo.name), 
        price: Boolean(productInfo.price), 
        status: Boolean(productInfo.status),
        category: Boolean(productInfo.category),
        subcategory: Boolean(productInfo.subcategory)
      });
      
      // 確保基本必填欄位有值
      if (!productInfo.name || !productInfo.price || !productInfo.status) {
        console.error("表單數據缺少必填欄位:", {
          name: productInfo.name ? "有值" : "無值",
          price: productInfo.price ? "有值" : "無值",
          status: productInfo.status ? "有值" : "無值"
        });
        alert("請填寫商品名稱、價格和狀態，這些是必填項目");
        return;
      }
      
      console.log("開始準備FormData");
      const formData = new FormData();
      
      // 無條件添加所有必要欄位，不進行條件檢查
      // 後端需要這些欄位，即使是空字符串也比沒有好
      formData.append("product_name", productInfo.name || "");
      formData.append("parent_category", productInfo.category || "");
      formData.append("child_category", productInfo.subcategory || "");
      formData.append("product_price", productInfo.price || "");
      formData.append("product_description", productInfo.description || "");
      formData.append("product_status", productInfo.status || "active");

      // 上傳規格
      if (productInfo.specifications && productInfo.specifications.length > 0) {
        console.log("處理商品規格:", productInfo.specifications);
        productInfo.specifications.forEach((spec, index) => {
          // 如果有規格ID，則傳遞給後端
          if (spec.id) {
            formData.append(`specifications[${index}][spec_id]`, spec.id);
          }
          
          formData.append(`specifications[${index}][product_size]`, spec.size || "");
          formData.append(`specifications[${index}][product_color]`, spec.color || "");
          formData.append(`specifications[${index}][product_stock]`, spec.stock || 0);
          console.log(`添加規格 ${index}:`, {
            id: spec.id || "無ID",
            size: spec.size || "",
            color: spec.color || "",
            stock: spec.stock || 0
          });
        });
      }

      // 上傳商品須知
      formData.append("material", productInfo.material || "");
      formData.append("specification", productInfo.specification || "");
      formData.append("shipping", productInfo.shipping || "");
      formData.append("additional", productInfo.additional || "");

      // 處理商品圖片
      if (productImages.length > 0) {
        if (editProduct) {
          console.log("編輯模式下的圖片處理，圖片數據:", productImages);
          
          // 確保圖片順序按product_display_order值排序
          productImages.sort((a, b) => a.product_display_order - b.product_display_order);
          
          // 為圖片數據創建JSON結構
          const imagesData = productImages.map((image, index) => {
            // 檢查是否有新上傳的文件
            const hasNewFile = image.file !== null;
            
            // 為每個圖片創建數據對象
            const imageData = {
              product_display_order: image.product_display_order || (index + 1), // 優先使用已設置的顯示順序
              has_new_file: hasNewFile // 標記是否有新文件
            };
            
            // 如果圖片有ID，表示是現有圖片，加入ID
            if (image.id) {
              imageData.id = image.id;
            }
            
            console.log(`準備圖片 ${index}:`, {
              id: image.id || '新圖片', 
              hasFile: hasNewFile,
              display_order: image.product_display_order || (index + 1),
              url: image.url ? image.url.substring(0, 30) + '...' : '無URL'
            });
            
            return imageData;
          });
          
          // 將圖片排序和ID信息轉為JSON添加到表單
          formData.append('images', JSON.stringify(imagesData));
          console.log('圖片元數據JSON:', JSON.stringify(imagesData));
          
          // 添加產品ID，確保可以用product_id查詢圖片
          formData.append('product_id', editProduct.product_id);
          
          // 單獨處理新上傳的圖片文件
          let fileCount = 0;
          productImages.forEach((image, index) => {
            if (image.file) {
              console.log(`添加文件 ${index}, 檔名:`, image.file.name);
              // 使用特殊格式的字段名稱，以便後端識別
              formData.append(`images.${index}.file`, image.file);
              fileCount++;
            }
          });
          console.log(`共添加 ${fileCount} 個新圖片文件`);
        } else {
          // 新增商品時的圖片處理
          productImages.forEach((image, index) => {
            if (image.file) {
              formData.append(`images[${index}]`, image.file);
              formData.append(`images_order[${index}]`, index + 1);
            }
          });
        }
      }

      // 上傳產品展示圖，確保只有有檔案的展示圖被上傳
      if (demoImages.length > 0) {
        demoImages.forEach((image, index) => {
          if (image.file) {
            formData.append(`display_images[${index}]`, image.file);
          }
        });
      }

      const method = editProduct ? "PUT" : "POST";
      const url = editProduct
        ? `http://localhost:8000/api/products/${editProduct.product_id}`
        : "http://localhost:8000/api/products";

      console.log("請求方法:", method);
      console.log("目標URL:", url);
      
      // 如果是編輯模式，添加_method參數來支持PUT請求
      if (editProduct) {
        formData.append("_method", "PUT");
        console.log("添加_method=PUT用於模擬PUT請求");
      }

      // 輸出表單內容到控制台，用於調試
      const formEntries = {};
      for (let [key, value] of formData.entries()) {
        formEntries[key] = value;
      }
      console.log("提交的表單數據:", formEntries);
      
      if (editProduct) {
        console.log("編輯商品ID:", editProduct.product_id);
      }

      try {
        const response = await fetch(url, {
          // 使用POST方法，由_method參數來模擬PUT請求
          method: editProduct ? "POST" : method,
          body: formData,
          headers: {
            "Accept": "application/json",
          },
          credentials: "include",
        });
  
        console.log("伺服器回應狀態碼:", response.status);
        
        try {
          const data = await response.json();
          console.log("伺服器回應:", data);
  
          if (response.ok) {
            alert("商品上傳成功！");
            // ✅ 清空所有表單數據
            setProductInfo({
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
            
            // 重新加載商品列表
            try {
              console.log("正在重新加載商品列表...");
              const refreshResponse = await fetch("http://localhost:8000/api/products", {
                method: "GET",
                headers: {
                  "Accept": "application/json",
                },
                credentials: "include",
              });
              
              if (refreshResponse.ok) {
                console.log("商品列表重新加載成功");
                // 觸發頁面的刷新函數，如果存在的話
                if (typeof window.refreshProductList === 'function') {
                  window.refreshProductList();
                } else {
                  // 如果沒有全局刷新函數，則重新加載頁面
                  window.location.reload();
                }
              } else {
                console.error("重新加載商品列表失敗");
              }
            } catch (refreshError) {
              console.error("刷新商品列表時出錯:", refreshError);
            }
          } else {
            console.error("非成功狀態碼:", response.status);
            alert(`上傳失敗: ${data.message || "請檢查輸入內容"}`);
            if (data.errors) {
              const errorMessages = Object.values(data.errors).flat().join('\n');
              console.error("上傳失敗詳情:", errorMessages);
              alert(`錯誤詳情:\n${errorMessages}`);
            }
          }
        } catch (jsonError) {
          console.error("解析回應JSON失敗:", jsonError);
          alert(`解析伺服器回應失敗: ${jsonError.message}`);
        }
      } catch (fetchError) {
        console.error("網路請求失敗:", fetchError);
        alert(`網路請求失敗: ${fetchError.message}`);
      }
    } catch (error) {
      console.error("表單提交過程中發生錯誤:", error);
      alert(`處理表單時出錯: ${error.message}`);
    }
  };

  return (
    <>
      {/* 開啟 Dialog 按鈕 */}
      <Dialog open={!!editProduct || isOpen} onOpenChange={(open) => {
        if (!open) {
          // 當Dialog要關閉時，顯示確認對話框，不要直接關閉
          setShowConfirm(true);
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
              <button 
                className="text-gray-500 hover:text-gray-700 text-lg"
                onClick={() => setShowConfirm(true)} // 點擊關閉按鈕時顯示確認對話框
              >
                ✕
              </button>
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

AddProductDialog.propTypes = {
  editProduct: PropTypes.object,
  setEditProduct: PropTypes.func.isRequired
};

export default AddProductDialog;