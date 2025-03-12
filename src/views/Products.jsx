import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProductDialog from "./ProductComponents/AddProductDialog";



const Products = () => {
  
  const [products] = useState([
    {
      id: "RDD0001",
      image: "https://via.placeholder.com/50",
      name: "潮流東大門神社紀念版大學長外套",
      price: 2000,
      stock: 120,
      status: "上架中",
    },
    // 可以加入更多假資料
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <svg className="inline" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#252B42" d="M20.6 5.26a2.51 2.51 0 0 0-2.48-2.2H5.885a2.51 2.51 0 0 0-2.48 2.19l-.3 2.47a3.4 3.4 0 0 0 1.16 2.56v8.16a2.5 2.5 0 0 0 2.5 2.5h10.47a2.5 2.5 0 0 0 2.5-2.5v-8.16A3.4 3.4 0 0 0 20.9 7.72Zm-6.59 14.68h-4v-4.08a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5Zm4.73-1.5a1.5 1.5 0 0 1-1.5 1.5h-2.23v-4.08a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5v4.08H6.765a1.5 1.5 0 0 1-1.5-1.5v-7.57a3.2 3.2 0 0 0 1.24.24a3.36 3.36 0 0 0 2.58-1.19a.24.24 0 0 1 .34 0a3.36 3.36 0 0 0 2.58 1.19A3.4 3.4 0 0 0 14.6 9.92a.22.22 0 0 1 .16-.07a.24.24 0 0 1 .17.07a3.36 3.36 0 0 0 2.58 1.19a3.2 3.2 0 0 0 1.23-.24Zm-1.23-8.33a2.39 2.39 0 0 1-1.82-.83a1.2 1.2 0 0 0-.92-.43h-.01a1.2 1.2 0 0 0-.92.42a2.476 2.476 0 0 1-3.65 0a1.24 1.24 0 0 0-1.86 0A2.405 2.405 0 0 1 4.1 7.78l.3-2.4a1.52 1.52 0 0 1 1.49-1.32h12.23a1.5 1.5 0 0 1 1.49 1.32l.29 2.36a2.39 2.39 0 0 1-2.395 2.37Z" />
          </svg>
          <span className="ml-2 text-brandBlue-darker  text-[20px] font-['Lexend']">商品＆賣場管理</span>
        </div>
        <Tabs defaultValue="products" className="inline">
          <TabsContent value="products">
            <div className="  justify-between mt-4">
              <div className="flex gap-2">
                <Button className="font-['Lexend']" variant="outline">匯出 CSV</Button>
                <Button className="font-['Lexend']" variant="outline">匯出 Excel</Button>
              </div>

            </div></TabsContent>
        </Tabs>
      </div>
      {/* Tabs 切換選單 */}
      <Tabs defaultValue="products">
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="templates">賣場樣板圖</TabsTrigger>
            <TabsTrigger value="carousel">賣場輪播圖</TabsTrigger>
          </TabsList>
          {/* 新增商品按鈕 & Drawer */}
          <AddProductDialog />
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
                      <img src={product.image} alt="商品" className="w-10 h-10" />
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
                          <SelectItem value="上架中">上架中</SelectItem>
                          <SelectItem value="下架中">下架中</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" /></svg>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="none" stroke="#f40039" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m2 0l2-4h6l2 4m-7 5v6m4-6v6"></path></svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>


        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;