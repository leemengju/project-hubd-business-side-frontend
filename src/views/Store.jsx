import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import banner1 from "../assets/images/store/banner1.JPG";
import banner2 from "../assets/images/store/banner2.JPG";
import banner3 from "../assets/images/store/banner3.JPG";

const Store = () => {
  const [activeTab, setActiveTab] = useState("product");

  const [isEditing, setIsEditing] = useState(false);
  git 

  // 可編輯內容
  const [formData, setFormData] = useState({
    title: "【 New 】＋寶石吊墜課程＋",
    description:
      "比百變怪還百變的課程來了，快快呼朋引伴手牽手一起來 364 把屬於自己的吊墜帶回家吧！",
    link: "https://www.figma.com/design/5iQ3ObMVlGgy7vlcAc3im5/",
  });

  // 存儲原始資料 (取消時還原)
  const [originalData, setOriginalData] = useState(formData);

  // 錯誤狀態
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    link: "",
  });

  // 處理輸入變更
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // 檢查字數並更新錯誤訊息
    validateField(e.target.name, e.target.value);
  };

  // 檢查欄位是否符合條件
  const validateField = (fieldName, value) => {
    let newErrors = { ...errors };

    if (fieldName === "title") {
      newErrors.title =
        value.trim() === ""
          ? "標題不可為空"
          : value.length > 15
          ? "標題最多15字元"
          : "";
    } else if (fieldName === "description") {
      newErrors.description =
        value.trim() === ""
          ? "圖片說明不可為空"
          : value.length > 30
          ? "說明最多30字元"
          : "";
    } else if (fieldName === "link") {
      newErrors.link = value.trim() === "" ? "連結不可為空" : "";
    }

    setErrors(newErrors);
  };

  // 進入編輯模式
  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  // 取消編輯，恢復原始數據
  const handleCancel = () => {
    setFormData(originalData);
    setErrors({ title: "", description: "", link: "" });
    setIsEditing(false);
  };

  // 確定儲存
  const handleSave = () => {
    // 逐項檢查欄位
    validateField("title", formData.title);
    validateField("description", formData.description);
    validateField("link", formData.link);

    // 如果有錯誤，阻止儲存
    if (errors.title || errors.description || errors.link) {
      return;
    }

    // 儲存成功
    setIsEditing(false);
  };

  // 處理圖片上傳
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <section className="w-full h-full">
      <section className="w-full h-[132px] flex flex-col justify-center items-center gap-5 mb-[60px]">
        <div className="w-full h-[50px] text-[20px] font-semibold text-brandBlue-darker flex justify-start items-center">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M21.25 9.944a3.08 3.08 0 0 1-2.056 2.899a2.9 2.9 0 0 1-1.027.185a3.08 3.08 0 0 1-2.899-2.056a2.9 2.9 0 0 1-.185-1.028c.003.351-.06.7-.185 1.028A3.08 3.08 0 0 1 12 13.028a3.08 3.08 0 0 1-2.898-2.056a2.9 2.9 0 0 1-.185-1.028c.002.351-.06.7-.185 1.028a3.08 3.08 0 0 1-2.899 2.056c-.35.002-.7-.06-1.027-.185A3.08 3.08 0 0 1 2.75 9.944l.462-1.623l1.11-3.166a2.06 2.06 0 0 1 1.943-1.377h11.47a2.06 2.06 0 0 1 1.942 1.377l1.11 3.166z" />
                <path d="M19.194 12.843v5.324a2.056 2.056 0 0 1-2.055 2.055H6.86a2.055 2.055 0 0 1-2.056-2.055v-5.324m4.113 4.296h6.166" />
              </g>
            </svg>
          </span>
          &nbsp;&nbsp;商品及賣場管理
        </div>
        <div className="w-full h-[62px]">
          <Tabs defaultValue="product" className="w-[400px]">
            <TabsList>
              <TabsTrigger
                value="product"
                onClick={() => setActiveTab("product")}
              >
                商品管理
              </TabsTrigger>
              <TabsTrigger value="store" onClick={() => setActiveTab("store")}>
                賣場輪播圖
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* 分離的內容區域，不受 Tabs 影響 */}
      <section className="w-full h-[715px]">
        {activeTab === "product" && (
          <div>
            <p>Make changes to your product here.</p>
          </div>
        )}
        {activeTab === "store" && (
          <div className="flex justify-start items-center h-full gap-10">
            {/* 區塊1 */}
            <div className="w-[480px] h-full border-2 border-brandBlue-light rounded-lg px-[32px] py-5 flex flex-col justify-start items-center gap-5">
              {/* 標題 */}
              <div className="w-full h-[44px] text-brandGray-normal flex justify-start items-start gap-5">
                <div className="flex flex-col justify-start items-start gap-1">
                  <p>圖片名稱：</p>
                  {errors.title && (
                    <p className="text-[12px] text-brandRed-normal">
                      {errors.title}
                    </p>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="border border-gray-300 px-2 py-1 rounded w-[290px]"
                  />
                ) : (
                  <p className="flex justify-start items-start text-brandBlue-normal">
                    {formData.title}
                  </p>
                )}
              </div>

              {/* 圖片區塊，進入編輯模式時顯示遮罩 */}
              <div className="relative w-full h-[330px]">
                <img
                  src={selectedImage}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white text-sm">
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        點擊變更圖片（尺寸 720*600 px）
                      </label>
                    </div>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* 圖片說明 */}
              <div className="w-[416px] h-[90px] flex justify-center items-start">
                <div className="w-[110px] h-full flex flex-col justify-start items-start gap-1">
                  <p>圖片說明：</p>
                  {errors.description && (
                    <p className="text-[12px] text-brandRed-normal">
                      {errors.description}
                    </p>
                  )}
                </div>
                <div className="w-[290px] h-full flex justify-start items-start text-[14px] text-brandBlue-normal">
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="border border-gray-300 px-2 py-1 rounded w-full h-full"
                    />
                  ) : (
                    <p className="w-full">{formData.description}</p>
                  )}
                </div>
              </div>

              {/* 圖片連結 */}
              <div className="w-[416px] h-[68px] flex justify-center items-start">
                <div className="w-[110px] h-full flex flex-col justify-start items-start gap-3">
                  <p>圖片連結：</p>
                  {errors.link && (
                    <p className="text-[12px] text-brandRed-normal">
                      {errors.link}
                    </p>
                  )}
                </div>
                <div className="w-[290px] h-full flex justify-start items-start break-words text-wrap text-[14px] text-brandBlue-normal">
                  {isEditing ? (
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      className="border border-gray-300 px-2 py-1 rounded w-full"
                    />
                  ) : (
                    <p className="w-full">{formData.link}</p>
                  )}
                </div>
              </div>

              {/* 按鈕 */}
              <div className="w-full h-[42px] flex justify-end items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-[92px] h-[42px] bg-gray-400 p-3 text-white rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="w-[92px] h-[42px] bg-brandBlue-normal p-3 text-white rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                    >
                      確定
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="w-[92px] h-[42px] bg-brandBlue-normal p-3 text-white rounded-lg flex justify-center items-center hover:opacity-80 active:opacity-50"
                  >
                    編輯
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default Store;
