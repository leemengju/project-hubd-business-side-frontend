import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ProductImageUpload from "./ProductImageUpload";

const ProductDescription = ({ productInfo, setProductInfo, demoImages, setDemoImages }) => {
  // 更新輸入內容
  const handleInputChange = (field, value) => {
    if (value.length <= 25) {
      setProductInfo({ ...productInfo, [field]: value });
    }
  };

  return (
    <div className="space-y-6 px-1">
      {/* 虛線區隔 */}
      <div className="border-t border-dashed border-gray-300 pt-6"></div>

      {/* 產品描述 */}
      <h2 className="text-2xl font-bold">產品描述 *</h2>
      <Textarea
        value={productInfo.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="請輸入產品描述，上限為25字元。"
        className="resize-none"
      />

      {/* 虛線區隔 */}
      <div className="border-t border-dashed border-gray-300 pt-6"></div>

      {/* 產品須知 */}
      <h2 className="text-2xl font-bold">產品須知 *</h2>

      {/* 材質 */}
      <div className="space-y-2">
        <Label htmlFor="material">材質 *</Label>
        <Textarea
          id="material"
          value={productInfo.material}
          onChange={(e) => handleInputChange("material", e.target.value)}
          placeholder="請輸入產品材質。如:純銀92.5%（925 silver）、天然綠松石(natural turquoise)。上限為25字元。"
          className="resize-none"
        />
      </div>

      {/* 規格 */}
      <div className="space-y-2">
        <Label htmlFor="specification">規格 *</Label>
        <Textarea
          id="specification"
          value={productInfo.specification}
          onChange={(e) => handleInputChange("specification", e.target.value)}
          placeholder="請輸入產品規格。如:公制圓10號 (Metric circumference No.10)。上限為25字元。"
          className="resize-none"
        />
      </div>

      {/* 出貨說明 */}
      <div className="space-y-2">
        <Label htmlFor="shipping">出貨說明 *</Label>
        <Textarea
          id="shipping"
          value={productInfo.shipping}
          onChange={(e) => handleInputChange("shipping", e.target.value)}
          placeholder="請輸入出貨說明。如:預購商品出貨約21工作天(不含假日)，建議與現貨商品分開下單。上限為25字元。"
          className="resize-none"
        />
      </div>

      {/* 其他補充 */}
      <div className="space-y-2">
        <Label htmlFor="additional">其他補充 *</Label>
        <Textarea
          id="additional"
          value={productInfo.additional}
          onChange={(e) => handleInputChange("additional", e.target.value)}
          placeholder="請輸入其他補充。如:飾品皆手工製作，誤差值 ±0.5 公分皆為正常範圍。上限為25字元。"
          className="resize-none"
        />
      </div>

      {/* 產品展示 */}
      <ProductImageUpload
        title="產品展示"
        description="請上傳 1 到 4 張圖片（建議尺寸 1320*880 像素）"
        images={demoImages}
        setImages={setDemoImages}
      />
    </div>
  );
};

export default ProductDescription;