import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProductDialog from "./ProductComponents/AddProductDialog";

const Products = () => {
  const [editProduct, setEditProduct] = useState(null); // 追蹤當前要編輯的商品

  const [products] = useState([
    {
      id: "RDD0001",
      image: "https://via.placeholder.com/50",
      name: "潮流東大門神社紀念版大學長外套",
      price: 2000,
      stock: 120,
      status: "active",
      specifications: [],
      category: "clothing",
      subcategory: "jacket",
      description: "限量發售，經典復刻。",
      material: "棉質",
      specification: "L / XL",
      shipping: "7天內發貨",
      additional: "手洗建議",
    },
  ]);

  // 賣場輪播圖部分
  const [blocks, setBlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const [originalBlocks, setOriginalBlocks] = useState([]);

  // 取得 banners 資料
  const fetchBanners = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/banners");

      // 轉換 API 回傳格式，使其符合 UI 結構
      const formattedData = response.data.map((banner) => ({
        id: banner.banner_id,
        image: `http://localhost:8000/storage/${banner.banner_img}`, // 後端存圖片的路徑
        title: banner.banner_title,
        description: banner.banner_description,
        link: banner.banner_link,
        file: null, // 存放上傳的圖片
        isEditing: false,
      }));

      console.log(formattedData);
      setBlocks(formattedData);
      setOriginalBlocks(formattedData); // 存一份原始資料
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  // 初始化時取得 banners
  useEffect(() => {
    fetchBanners();
  }, []);

  // 處理輸入變更
  const handleChange = (id, field, value) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
    validateField(id, field, value);
  };

  // 驗證標題、描述、連結
  const validateField = (id, field, value) => {
    let newErrors = { ...errors };

    if (field === "title") {
      newErrors[id] = {
        ...newErrors[id],
        title:
          value.trim() === ""
            ? "請輸入標題"
            : value.length > 15
            ? "最多15字元"
            : "",
      };
    } else if (field === "description") {
      newErrors[id] = {
        ...newErrors[id],
        description:
          value.trim() === ""
            ? "請輸入說明"
            : value.length > 65
            ? "最多65字元"
            : "",
      };
    } else if (field === "link") {
      newErrors[id] = {
        ...newErrors[id],
        link: value.trim() === "" ? "請輸入連結" : "",
      };
    } else if (field === "image") {
      if (value && value.size > 5 * 1024 * 1024) {
        // 檢查圖片大小是否超過 5MB
        newErrors[id] = {
          ...newErrors[id],
          image: "圖檔不可大於5MB",
        };
      } else {
        // 如果圖片大小符合規範，則移除錯誤訊息
        if (newErrors[id]) {
          delete newErrors[id].image;
        }
      }
    }

    setErrors(newErrors);
  };

  // 切換編輯模式
  const handleEdit = (id) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, isEditing: true } : block
      )
    );
  };

  // 取消編輯
  const handleCancel = (id) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        // 找到 fetch 時的原始數據
        const originalBanner = originalBlocks.find((b) => b.id === id);

        return block.id === id
          ? {
              ...originalBanner, // 還原原始資料
              isEditing: false,
            }
          : block;
      })
    );
  };

  // 處理圖片上傳
  const handleImageUpload = (id, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 🔹 檢查圖片大小是否超過 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: { ...prevErrors[id], image: "圖檔不可大於 5MB" },
      }));
      return;
    }

    // 🔹 清除錯誤訊息（如果有）
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (newErrors[id]) {
        delete newErrors[id].image;
      }
      return newErrors;
    });

    // 🔹 產生預覽 URL 並更新 blocks
    const imageUrl = URL.createObjectURL(file);
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, image: imageUrl, file } : block
      )
    );
  };

  // 儲存變更（傳送到後端）
  const handleSave = async (id) => {
    const banner = blocks.find((b) => b.id === id);
    const formData = new FormData();

    formData.append("banner_title", banner.title);
    formData.append("banner_description", banner.description);
    formData.append("banner_link", banner.link);

    // 只有當 `file` 存在時才上傳 `banner_img`
    if (banner.file) {
      formData.append("banner_img", banner.file);
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/banners/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("更新成功", response.data);
      fetchBanners(); // 重新載入 banners
    } catch (error) {
      console.error("更新失敗", error.response?.data);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <svg
            className="inline"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="#252B42"
              d="M20.6 5.26a2.51 2.51 0 0 0-2.48-2.2H5.885a2.51 2.51 0 0 0-2.48 2.19l-.3 2.47a3.4 3.4 0 0 0 1.16 2.56v8.16a2.5 2.5 0 0 0 2.5 2.5h10.47a2.5 2.5 0 0 0 2.5-2.5v-8.16A3.4 3.4 0 0 0 20.9 7.72Zm-6.59 14.68h-4v-4.08a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5Zm4.73-1.5a1.5 1.5 0 0 1-1.5 1.5h-2.23v-4.08a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5v4.08H6.765a1.5 1.5 0 0 1-1.5-1.5v-7.57a3.2 3.2 0 0 0 1.24.24a3.36 3.36 0 0 0 2.58-1.19a.24.24 0 0 1 .34 0a3.36 3.36 0 0 0 2.58 1.19A3.4 3.4 0 0 0 14.6 9.92a.22.22 0 0 1 .16-.07a.24.24 0 0 1 .17.07a3.36 3.36 0 0 0 2.58 1.19a3.2 3.2 0 0 0 1.23-.24Zm-1.23-8.33a2.39 2.39 0 0 1-1.82-.83a1.2 1.2 0 0 0-.92-.43h-.01a1.2 1.2 0 0 0-.92.42a2.476 2.476 0 0 1-3.65 0a1.24 1.24 0 0 0-1.86 0A2.405 2.405 0 0 1 4.1 7.78l.3-2.4a1.52 1.52 0 0 1 1.49-1.32h12.23a1.5 1.5 0 0 1 1.49 1.32l.29 2.36a2.39 2.39 0 0 1-2.395 2.37Z"
            />
          </svg>
          <span className="ml-2 text-brandBlue-darker  text-[20px] font-['Lexend']">
            商品＆賣場管理
          </span>
        </div>
      </div>
      {/* Tabs 切換選單 */}
      <Tabs defaultValue="products">
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="carousel">賣場輪播圖</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            {/* 新增商品按鈕 & Drawer */}
            <AddProductDialog
              editProduct={editProduct}
              setEditProduct={setEditProduct}
            />
          </TabsContent>
        </div>
        <TabsContent value="products">
          {/* 篩選與搜尋區塊 */}
          <div className="flex gap-2 mb-4">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="clothing">服飾</SelectItem>
                <SelectItem value="accessories">配件</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="價格區間" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">0 - 1000</SelectItem>
                <SelectItem value="mid">1000 - 5000</SelectItem>
                <SelectItem value="high">5000+</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="搜尋商品..." className="flex-grow" />
            <Button className="bg-gray-700 text-white">搜尋</Button>
          </div>

          {/* 商品列表 Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>產品編號</TableHead>
                  <TableHead>產品圖片</TableHead>
                  <TableHead>商品名稱</TableHead>
                  <TableHead>價格</TableHead>
                  <TableHead>庫存</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <img
                        src={product.image}
                        alt="商品"
                        className="w-10 h-10"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Select defaultValue={product.status}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="選擇狀態" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">上架中</SelectItem>
                          <SelectItem value="unactive">下架中</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {/* 點擊編輯時，設置當前選中的商品到 editProduct */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log("Editing product:", product); // 確認商品數據是否正確
                          setEditProduct(product);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z"
                          />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 賣場管理 */}
        <TabsContent value="carousel">
          <div className="flex justify-start items-center h-full gap-10">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="w-[480px] h-full border-2 border-brandBlue-light rounded-lg px-[32px] py-5 flex flex-col justify-start items-center gap-5"
              >
                {/* 標題 */}
                <div className="w-full h-[44px] text-brandGray-normal flex justify-start items-start gap-5">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <p>圖片名稱：</p>
                    {errors[block.id]?.title && (
                      <p className="text-[12px] text-brandRed-normal">
                        {errors[block.id]?.title}
                      </p>
                    )}
                  </div>
                  {block.isEditing ? (
                    <input
                      type="text"
                      name="title"
                      value={block.title}
                      onChange={(e) =>
                        handleChange(block.id, "title", e.target.value)
                      }
                      className="border border-gray-300 px-2 py-1 rounded w-[290px]"
                    />
                  ) : (
                    <p className="flex justify-start items-start text-brandBlue-normal">
                      {block.title}
                    </p>
                  )}
                </div>

                {/* 圖片區塊，進入編輯模式時顯示遮罩 */}
                <div className="relative w-full h-[330px]">
                  <img
                    src={block.image}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  {block.isEditing && (
                    <>
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white text-sm">
                        <label
                          htmlFor={`imageUpload-${block.id}`}
                          className="cursor-pointer inline-flex flex-col justify-center items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="80"
                            height="80"
                            viewBox="0 0 32 32"
                          >
                            <path
                              fill="currentColor"
                              d="M16 7c-2.648 0-4.95 1.238-6.594 3.063C9.27 10.046 9.148 10 9 10c-2.2 0-4 1.8-4 4c-1.73 1.055-3 2.836-3 5c0 3.3 2.7 6 6 6h5v-2H8c-2.219 0-4-1.781-4-4a4.01 4.01 0 0 1 2.438-3.688l.687-.28l-.094-.75A6 6 0 0 1 7 14a1.984 1.984 0 0 1 2.469-1.938l.625.157l.375-.5A7 7 0 0 1 16 9c3.277 0 6.012 2.254 6.781 5.281l.188.781l.843-.03c.211-.012.258-.032.188-.032c2.219 0 4 1.781 4 4s-1.781 4-4 4h-5v2h5c3.3 0 6-2.7 6-6c0-3.156-2.488-5.684-5.594-5.906C23.184 9.574 19.926 7 16 7m0 8l-4 4h3v8h2v-8h3z"
                            />
                          </svg>
                          <span>點擊變更圖片</span>
                          <span>（建議尺寸 720 * 600 像素）</span>

                          {errors[block.id]?.image && (
                            <span className="text-[14px] text-brandRed-lightActive">
                              {errors[block.id]?.image}
                            </span>
                          )}
                        </label>
                      </div>
                      <input
                        type="file"
                        id={`imageUpload-${block.id}`}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(block.id, e)}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* 圖片說明 */}
                <div className="w-[416px] h-[90px] flex justify-center items-start">
                  <div className="w-[110px] h-full flex flex-col justify-start items-start gap-1">
                    <p>圖片說明：</p>
                    {errors[block.id]?.description && (
                      <p className="text-[12px] text-brandRed-normal">
                        {errors[block.id]?.description}
                      </p>
                    )}
                  </div>
                  <div className="w-[290px] h-full flex justify-start items-start text-[14px] text-brandBlue-normal">
                    {block.isEditing ? (
                      <textarea
                        name="description"
                        value={block.description}
                        onChange={(e) =>
                          handleChange(block.id, "description", e.target.value)
                        }
                        className="border border-gray-300 px-2 py-1 rounded w-full h-full"
                      />
                    ) : (
                      <p className="w-full">{block.description}</p>
                    )}
                  </div>
                </div>

                {/* 圖片連結 */}
                <div className="w-[416px] h-[68px] flex justify-center items-start">
                  <div className="w-[110px] h-full flex flex-col justify-start items-start gap-3">
                    <p>圖片連結：</p>
                    {errors[block.id]?.link && (
                      <p className="text-[12px] text-brandRed-normal">
                        {errors[block.id]?.link}
                      </p>
                    )}
                  </div>
                  <div className="w-[290px] h-full flex justify-start items-start break-words text-wrap text-[14px] text-brandBlue-normal">
                    {block.isEditing ? (
                      <input
                        type="text"
                        name="link"
                        value={block.link}
                        onChange={(e) =>
                          handleChange(block.id, "link", e.target.value)
                        }
                        className="border border-gray-300 px-2 py-1 rounded w-full"
                      />
                    ) : (
                      <p className="w-full">{block.link}</p>
                    )}
                  </div>
                </div>

                {/* 按鈕 */}
                <div className="w-full h-[42px] flex justify-end items-center gap-3">
                  {block.isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCancel(block.id)}
                        className="w-[92px] h-[42px] border-2 border-brandBlue-normal p-3 text-brandBlue-normal rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(block.id)}
                        className="w-[92px] h-[42px] bg-brandBlue-normal p-3 text-brandBlue-lightLight rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                      >
                        儲存
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEdit(block.id)}
                      className="w-[92px] h-[42px] bg-brandBlue-normal p-3 text-white rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                    >
                      編輯
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
