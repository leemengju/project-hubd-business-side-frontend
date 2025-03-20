import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import PropTypes from "prop-types";

const ProductImageUpload = ({ title, description, images, setImages }) => {
    const fileInputRef = useRef(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // 計算還可以上傳的數量
        const remainingSlots = 4 - images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newImages = filesToAdd.map((file) => ({
            url: URL.createObjectURL(file),
            file: file,
            isNew: true // 標記為新上傳的圖片
        }));

        setImages([...images, ...newImages]);
    };

    const handleImageDelete = (index) => {
        const newImages = [...images];
        // 如果要刪除的圖片有 URL，需要釋放資源
        if (newImages[index].url.startsWith("blob:")) {
            URL.revokeObjectURL(newImages[index].url);
        }
        newImages.splice(index, 1);
        setImages(newImages);
    };

    // 開始拖曳
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    // 拖曳進入其他元素區域時
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const element = e.currentTarget;
        element.classList.add('bg-gray-100');
    };

    // 拖曳離開元素區域時
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-100');
    };

    // 拖曳結束時，重置狀態
    const handleDragEnd = () => {
        setDraggedIndex(null);
        document.querySelectorAll('.dragging-over').forEach(el => {
            el.classList.remove('bg-gray-100');
        });
    };

    // 拖曳放置時進行排序
    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-100');
        
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        
        const newImages = [...images];
        const draggedImage = newImages[draggedIndex];
        
        // 從陣列中移除被拖曳的項目
        newImages.splice(draggedIndex, 1);
        
        // 在目標位置插入被拖曳的項目
        newImages.splice(dropIndex, 0, draggedImage);
        
        // 更新每個圖片的顯示順序
        const reorderedImages = newImages.map((img, idx) => ({
            ...img,
            product_display_order: idx + 1
        }));
        
        console.log('拖曳後的新順序:', reorderedImages.map(img => ({
            id: img.id || '無ID',
            順序: img.product_display_order,
            url: img.url ? (img.url.length > 30 ? img.url.substring(0, 30) + '...' : img.url) : '無URL'
        })));
        
        setImages(reorderedImages);
        setDraggedIndex(null);
        
        // 是否需要發送請求到後端更新圖片順序
        // updateImageOrderInBackend(reorderedImages);
    };

    const getImageSrc = (image) => {
        if (image.file) {
            return URL.createObjectURL(image.file);
        } else if (image.url) {
            return image.url;
        } else if (image.product_img_URL) {
            return `http://localhost:8000/storage/${image.product_img_URL}`;
        } else {
            return '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* 圖片上傳區 */}
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => {
                    const image = images[index];
                    return (
                        <div
                            key={index}
                            className={`border-2 border-dashed rounded-lg p-2 h-40 relative ${
                                image ? "border-gray-300" : "border-gray-200"
                            } ${draggedIndex === index ? "opacity-50" : ""}`}
                            draggable={!!image}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {image ? (
                                <>
                                    <img
                                        src={getImageSrc(image)}
                                        alt={`Product image ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            console.error(`圖片載入失敗: ${e.target.src}`);
                                            console.log("完整圖片物件:", JSON.stringify(image, null, 2));
                                            e.target.src = 'https://placehold.co/600x400?text=圖片載入失敗';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageDelete(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        &times;
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br">
                                            封面
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-gray-500 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 9h14M5 15h14"/>
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-gray-400"
                                    >
                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                        <circle cx="9" cy="9" r="2" />
                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                    </svg>
                                    <span className="text-sm text-gray-500 mt-2">點擊上傳</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
            />

            <div className="mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 4}
                >
                    上傳圖片
                </Button>
                <p className="text-sm text-gray-500 mt-1">
                    已上傳 {images.length}/4 張圖片
                </p>
            </div>
        </div>
    );
};

ProductImageUpload.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    images: PropTypes.array.isRequired,
    setImages: PropTypes.func.isRequired
};

export default ProductImageUpload;