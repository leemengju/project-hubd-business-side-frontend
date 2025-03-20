import { useState, useEffect } from "react";
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
import banner1 from "../assets/images/store/banner1.JPG";
import banner2 from "../assets/images/store/banner2.JPG";
import banner3 from "../assets/images/store/banner3.JPG";

const Products = () => {
  const [editProduct, setEditProduct] = useState(null); // 追蹤當前要編輯的商品
  const [products, setProducts] = useState([]); // ✅ 用於存儲 API 回傳的商品列表
  const [filteredProducts, setFilteredProducts] = useState([]); // 篩選後的商品列表
  const [loading, setLoading] = useState(true); // 控制載入狀態
  const [error, setError] = useState(null); // 錯誤訊息
  const [currentPage, setCurrentPage] = useState(1); // 當前頁數
  const [itemsPerPage, setItemsPerPage] = useState(10); // 每頁顯示數量
  const [searchTerm, setSearchTerm] = useState(""); // 搜尋關鍵字
  const [selectedCategory, setSelectedCategory] = useState("all"); // 選擇的分類
  const [categories, setCategories] = useState([]); // 分類列表

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/products", {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("無法獲取商品資料");
      }

      let data = await response.json();

      // ✅ 計算每個商品的總庫存數量
      data = data.map(product => {
        const totalStock = product.specifications
          ? product.specifications.reduce((sum, spec) => sum + (parseInt(spec.product_stock) || 0), 0)
          : 0;
          console.log(product)
        return {
          ...product,
          product_stock: totalStock, // ✅ 加總庫存
          product_img: product.product_img
            ? `http://localhost:8000/storage/${product.product_img}`
            : "https://via.placeholder.com/150",

          product_img_url: product.product_img_url
            ? `http://localhost:8000/storage/${product.product_img_url}`
            : "https://via.placeholder.com/150"
        };
        
      });

      console.log("獲取的商品列表:", data);
      
      setProducts(data);
      setFilteredProducts(data);

      // 提取所有分類，用於分類選擇器
      const uniqueCategories = [];
      data.forEach(product => {
        if (product.classifiction && product.classifiction.length > 0) {
          const categoryName = product.classifiction[0].parent_category;
          if (categoryName && !uniqueCategories.includes(categoryName)) {
            uniqueCategories.push(categoryName);
          }
        }
      });
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("獲取商品失敗:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📌 在頁面載入時獲取商品資料
  useEffect(() => {
    fetchProducts();
  }, []);

  // 當搜尋條件或分類條件改變時，重新篩選商品
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  // 篩選產品的邏輯
  const filterProducts = () => {
    let results = [...products];

    // 依分類篩選
    if (selectedCategory !== "all") {
      results = results.filter(product => {
        return product.classifiction && 
               product.classifiction.some(c => c.parent_category === selectedCategory);
      });
    }

    // 依關鍵字搜尋
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase().trim();
      results = results.filter(product => {
        return (
          (product.product_name && product.product_name.toLowerCase().includes(keyword)) ||
          (product.product_id && product.product_id.toLowerCase().includes(keyword)) ||
          (product.product_description && product.product_description.toLowerCase().includes(keyword))
        );
      });
    }

    setFilteredProducts(results);
    setCurrentPage(1); // 重置到第一頁
  };

  // 處理搜尋按鈕點擊
  const handleSearch = () => {
    filterProducts();
  };

  // 處理按下 Enter 鍵
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      filterProducts();
    }
  };

  // 處理分類選擇變更
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // 計算分頁資料
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // 切換頁數
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 處理每頁顯示數量變更
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // 重置到第一頁
  };

  //編輯商品部分
  const handleEditProduct = (product) => {
    console.log("編輯商品:", product);
    // 確保所有必要欄位存在
    if (!product.product_name || !product.product_price || !product.product_status) {
      console.error("商品資料不完整:", {
        name: product.product_name ? "有值" : "無值",
        price: product.product_price ? "有值" : "無值",
        status: product.product_status ? "有值" : "無值"
      });
    }
    setEditProduct(product); // 設定當前編輯的商品
  };

  // 賣場輪播圖部分
  const [blocks, setBlocks] = useState([
    {
      id: 1,
      image: banner1,
      title: "【 New 】＋寶石吊墜課程＋",
      description:
        "比百變怪還百變的課程來了，快快呼朋引伴手牽手一起來 364 把屬於自己的吊墜帶回家吧！",
      link: "https://www.figma.com/design/5iQ3ObMVlGgy7vlcAc3im5/",
      isEditing: false,
    },
    {
      id: 2,
      image: banner2,
      title: "【 Special 】＋手作花藝課程＋",
      description: "手作花藝課程，讓你的生活增添一份優雅與浪漫。",
      link: "https://www.figma.com/design/xxxxxx/",
      isEditing: false,
    },
    {
      id: 3,
      image: banner3,
      title: "【 Hot 】＋手工皮革工作坊＋",
      description: "探索皮革的魅力，手工製作屬於自己的專屬配件。",
      link: "https://www.figma.com/design/yyyyyy/",
      isEditing: false,
    },
  ]);

  const [errors, setErrors] = useState({});

  // 更新欄位內容
  const handleChange = (id, field, value) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
    validateField(id, field, value);
  };

  // 驗證標題與描述
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
            : value.length > 30
              ? "最多30字元"
              : "",
      };
    } else if (field === "link") {
      newErrors[id] = {
        ...newErrors[id],
        link: value.trim() === "" ? "請輸入連結" : "",
      };
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
      prevBlocks.map((block) =>
        block.id === id ? { ...block, isEditing: false } : block
      )
    );
  };

  // 確定編輯
  const handleSave = (id) => {
    if (errors[id]?.title || errors[id]?.description || errors[id]?.link) {
      return;
    }
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, isEditing: false } : block
      )
    );
  };

  // 處理圖片上傳
  const handleImageUpload = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === id ? { ...block, image: imageUrl } : block
        )
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <svg className="inline" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#252B42" d="M20.6 5.26a2.51 2.51 0 0 0-2.48-2.2H5.885a2.51 2.51 0 0 0-2.48 2.19l-.3 2.47a3.4 3.4 0 0 0 1.16 2.56v8.16a2.5 2.5 0 0 0 2.5 2.5h10.47a2.5 2.5 0 0 0 2.5-2.5v-8.16A3.4 3.4 0 0 0 20.9 7.72Zm-6.59 14.68h-4v-4.08a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5Zm4.73-1.5a1.5 1.5 0 0 1-1.5 1.5h-2.23v-4.08a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5v4.08H6.765a1.5 1.5 0 0 1-1.5-1.5v-7.57a3.2 3.2 0 0 0 1.24.24a3.36 3.36 0 0 0 2.58-1.19a.24.24 0 0 1 .34 0a3.36 3.36 0 0 0 2.58 1.19A3.4 3.4 0 0 0 14.6 9.92a.22.22 0 0 1 .16-.07a.24.24 0 0 1 .17.07a3.36 3.36 0 0 0 2.58 1.19a3.2 3.2 0 0 0 1.23-.24Zm-1.23-8.33a2.39 2.39 0 0 1-1.82-.83a1.2 1.2 0 0 0-.92-.43h-.01a1.2 1.2 0 0 0-.92.42a2.476 2.476 0 0 1-3.65 0a1.24 1.24 0 0 0-1.86 0A2.405 2.405 0 0 1 4.1 7.78l.3-2.4a1.52 1.52 0 0 1 1.49-1.32h12.23a1.5 1.5 0 0 1 1.49 1.32l.29 2.36a2.39 2.39 0 0 1-2.395 2.37Z" />
          </svg>
          <span className="ml-2 text-brandBlue-darker  text-[20px] font-['Lexend']">商品＆賣場管理</span>
        </div>
      </div>
      {/* 加載狀態 */}
      {loading && <p>載入中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Tabs 切換選單 */}
      <Tabs defaultValue="products">
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="carousel">賣場輪播圖</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            {/* 新增商品按鈕 & Drawer */}
            <AddProductDialog editProduct={editProduct} setEditProduct={setEditProduct} onProductAdded={fetchProducts} />
          </TabsContent>
        </div>
        <TabsContent value="products">
          {/* 篩選與搜尋區塊 */}
          <div className="flex gap-2 mb-4">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input 
              placeholder="搜尋商品名稱、編號或描述..." 
              className="flex-grow" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              className="bg-[#626981] text-white" 
              onClick={handleSearch}
            >
              搜尋
            </Button>
          </div>

          {/* 顯示篩選結果 */}
          <div className="text-sm text-gray-500 mb-2">
            {filteredProducts.length > 0 
              ? `找到 ${filteredProducts.length} 個符合條件的商品` 
              : "沒有符合條件的商品"}
          </div>

          {/* ✅ 整合商品 API，顯示商品列表 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="w-[15%]">產品編號</TableHead>
                  <TableHead className="w-[10%]">產品圖片</TableHead>
                  <TableHead className="w-[30%]">商品名稱</TableHead>
                  <TableHead className="w-[10%]">價格</TableHead>
                  <TableHead className="w-[10%]">庫存</TableHead>
                  <TableHead className="w-[15%]">狀態</TableHead>
                  <TableHead className="w-[10%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="w-[15%]">{product.product_id}</TableCell>
                      <TableCell className="w-[10%]">
                        <img
                          src={product.product_img || product.product_img_url || "https://via.placeholder.com/150"}
                          alt={product.product_name}
                          className="w-10 h-10"
                        />
                      </TableCell>
                      <TableCell className="w-[30%] truncate" title={product.product_name}>{product.product_name}</TableCell>
                      <TableCell className="w-[10%]">${product.product_price}</TableCell>
                      <TableCell className="w-[10%]">{product.product_stock || "N/A"}</TableCell>
                      <TableCell className="w-[15%]">
                        <Select defaultValue={product.product_status}>
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="選擇狀態" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">上架中</SelectItem>
                            <SelectItem value="inactive">下架中</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center p-4">
                      尚無商品
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* 分頁控制區塊 */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-slate-50 border-t">
                <div className="flex items-center">
                  <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="每頁顯示" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">顯示 5 筆</SelectItem>
                      <SelectItem value="10">顯示 10 筆</SelectItem>
                      <SelectItem value="20">顯示 20 筆</SelectItem>
                      <SelectItem value="50">顯示 50 筆</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path d="M15.09 18.4L16.5 17L11.92 12.4L16.5 7.8L15.09 6.4L9.09 12.4L15.09 18.4Z" fill="currentColor" />
                    </svg>
                  </Button>
                  
                  <span className="text-sm">
                    {currentPage} / {totalPages > 0 ? totalPages : 1}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path d="M10.41 6.4L9 7.8L13.58 12.4L9 17L10.41 18.4L16.41 12.4L10.41 6.4Z" fill="currentColor" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
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
                        確定
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