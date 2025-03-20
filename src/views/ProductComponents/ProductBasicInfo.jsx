import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ProductImageUpload from "./ProductImageUpload";
import { validators } from "tailwind-merge";
import { useEffect, useState } from "react";

const COLORS = [
  { name: "黑色", value: "Black", className: "bg-black" },
  { name: "灰色", value: "Grey", className: "bg-gray-400" },
  { name: "白色", value: "White", className: "bg-white border border-gray-300" },
];

const SIZES = [
  { name: "L", value: "L" },
  { name: "M", value: "M" },
  { name: "S", value: "S" }];

const ProductBasicInfo = ({ productInfo, setProductInfo, productImages, setProductImages }) => {


  // 新增規格
  const addSpecification = () => {
    setProductInfo({
      ...productInfo,
      specifications: [
        ...productInfo.specifications,
        { id: Date.now(), color: "", size: "", stock: 0, expanded: true },
      ],
    });
  };

  // 刪除規格
  const removeSpecification = (id) => {
    setProductInfo({
      ...productInfo,
      specifications: productInfo.specifications.filter((spec) => spec.id !== id),
    });
  };

  // 更新規格內容
  const updateSpecification = (id, field, value) => {
    setProductInfo({
      ...productInfo,
      specifications: productInfo.specifications.map((spec) =>
        spec.id === id ? { ...spec, [field]: value } : spec
      ),
    });
  };

  // 判斷是否為飾品類別
  const isAccessory = productInfo.category === "飾品";

  return (
    <div className="space-y-6 px-1">
      {/* 虛線區隔 */}
      <div className="border-t border-dashed border-gray-300 pt-6"></div>

      {/* 商品種類 */}
      <h2 className="text-2xl font-bold">商品種類 *</h2>

      <div className="space-y-2">
        <Label htmlFor="product-name">商品名稱 *</Label>
        <Input
          type="text"
          id="product-name"
          placeholder="輸入商品名稱，最多20字"
          value={productInfo.name}
          onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">商品分類 *</Label>
        <Select
          value={productInfo.category}
          onValueChange={(value) => setProductInfo({ ...productInfo, category: value, subcategory: "" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇分類" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="服飾">服飾</SelectItem>
            <SelectItem value="飾品">飾品</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {productInfo.category && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">子分類 *</Label>
          <Select
            value={productInfo.subcategory}
            onValueChange={(value) => setProductInfo({ ...productInfo, subcategory: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇子分類" />
            </SelectTrigger>
            <SelectContent>
              {productInfo.category === "服飾" ? (
                <>
                  <SelectItem value="短袖">短袖</SelectItem>
                  <SelectItem value="長袖">長袖</SelectItem>
                  <SelectItem value="夾克">夾克</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="isekai2000">異世界2000</SelectItem>
                  <SelectItem value="crystal">水晶晶系列</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="price">價錢 *</Label>
        <Input
          id="price"
          type="number"
          placeholder="輸入價格 (NT$)"
          value={productInfo.price}
          onChange={(e) => setProductInfo({ ...productInfo, price: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>狀態 *</Label>
        <Tabs value={productInfo.status} onValueChange={(value) => setProductInfo({ ...productInfo, status: value })}>
          <TabsList>
            <TabsTrigger value="active">上架中</TabsTrigger>
            <TabsTrigger value="inactive">下架</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 虛線區隔 */}
      <div className="border-t border-dashed border-gray-300 pt-6"></div>

      {/* 商品規格 */}
      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold">商品規格 *</h2>
        <Button variant="outline" onClick={addSpecification} className="mr-3">
          新增規格
        </Button>
      </div>
      {(productInfo?.specifications || []).map((spec, index) => (
        <div key={spec.id} className="border-b border-dashed pb-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">規格 {index + 1}</h3>
            {index > 0 && (
              <button onClick={() => removeSpecification(spec.id)} className="mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path fill="none" stroke="#f40039" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m2 0l2-4h6l2 4m-7 5v6m4-6v6">
                  </path>
                </svg>
              </button>
            )}
          </div>

          {/* 服飾類別才顯示顏色和尺寸選擇 */}
          {!isAccessory && (
            <>
              {/* 顏色選擇 */}
              <div className="flex items-center">
                <p className="text-sm font-medium">顏色</p>
                <div className="flex gap-2 ml-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${color.className} ${spec.color === color.value ? "ring-2 ring-red-500" : ""
                        }`}
                      value={color.value}
                      onClick={() => updateSpecification(spec.id, "color", color.value)}
                    ></button>
                  ))}
                </div>
              </div>

              {/* 尺寸選擇 */}
              <div className="flex items-center">
                <p className="text-sm font-medium">尺寸</p>
                <div className="flex gap-2 ml-2">
                  {SIZES.map((size) => (
                    <button
                      key={size.value}
                      className={`w-10 h-10 px-py border rounded-md ${spec.size === size.value ? "border-red-500 text-red-500" : "border-gray-300"}`}
                      value={size.value}
                      onClick={() => updateSpecification(spec.id, "size", size.value)}  // 只傳遞 value
                    >
                      {size.name} 
                  
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 庫存輸入框 */}
          <div>
            <p className="text-sm font-medium">庫存</p>
            <Input
              type="number"
              min="0"
              value={spec.stock}
              onChange={(e) => updateSpecification(spec.id, "stock", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      ))}


      <ProductImageUpload
        title="商品圖片 *"
        description="請上傳 1 到 4 張圖片，第一張為封面照（建議尺寸 600×720 像素）"
        images={productImages}
        setImages={setProductImages}
      />
    </div>
  );
};

export default ProductBasicInfo;