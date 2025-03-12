import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";




const ProductImageUpload = () => {
    

    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null); // 參考 input，手動觸發上傳

    // 手動點擊 input 來打開選擇檔案視窗
    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 上傳圖片
    const handleUpload = (event) => {
        const files = Array.from(event.target.files);
        if (images.length + files.length > 4) {
            alert("最多只能上傳 4 張圖片");
            return;
        }

        const newImages = files.map((file) => ({
            id: Date.now() + Math.random(), // 唯一 ID
            url: URL.createObjectURL(file),
            file,
        }));

        setImages([...images, ...newImages]);
    };

    // 刪除圖片
    const removeImage = (id) => {

        setImages((prevImages) => prevImages.filter((image) => image.id !== id));
    };

    // 拖曳排序
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);
            setImages(arrayMove(images, oldIndex, newIndex));
        }
    };

    return (
        <div className="space-y-4">
            {/* 虛線區隔 */}
            <div className="border-t border-dashed border-gray-300 pt-6"></div>

            {/* 標題與上傳按鈕 */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">商品圖片 *</h2>
                    <p className="text-sm text-gray-500">
                        請上傳 1 到 4 張圖片，第一張為封面照（建議尺寸 600×720 像素）
                    </p>
                </div>
                <Button variant="outline" onClick={triggerFileSelect}>上傳照片</Button>
                <Input
                    type="file"
                    ref={fileInputRef} // 綁定 ref
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                />
            </div>

            {/* 圖片區塊（可拖曳排序） */}
            {images.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={images} strategy={horizontalListSortingStrategy}>
                        <div className="flex gap-2">
                            {images.map((image, index) => (
                                <SortableImage key={image.id} image={image} index={index} removeImage={removeImage} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

// **單個可拖曳圖片的組件**
const SortableImage = ({ image, index, removeImage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="flex flex-col items-end" >
            <button
                
                onClick={() => {
                    
                    removeImage(image.id);
                }}
            >
                ✕
            </button>
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative w-[110px] h-[110px] bg-gray-100 border rounded-md overflow-hidden cursor-grab"
        >
            
            
            <img src={image.url} alt={`uploaded-${index}`} className="w-full h-full object-cover" />
            
        </div>
        </div>
    );
};

export default ProductImageUpload;