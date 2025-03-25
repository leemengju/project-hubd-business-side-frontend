import { useState, useEffect } from "react";
import apiService from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { 
  Settings2Icon, 
  PlusIcon, 
  Trash2Icon, 
  SaveIcon,
  EditIcon,
  CreditCardIcon,
  WalletIcon,
  ShoppingBagIcon,
  ChevronsUpDownIcon,
  AlertCircleIcon,
} from "lucide-react";

const CashFlowSettings = () => {
  const [cashFlowSettings, setCashFlowSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    Hash_Key: "",
    Hash_IV: "",
    merchant_ID: "",
    WEB_enable: false,
    CVS_enable: false,
    ATM_enable: false,
    credit_enable: false,
  });

  // 載入所有金流設定
  useEffect(() => {
    fetchCashFlowSettings();
  }, []);

  const fetchCashFlowSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/cash-flow-settings");
      setCashFlowSettings(response.data || []);
    } catch (error) {
      console.error("獲取金流設定失敗:", error);
      toast.error("無法獲取金流設定，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 處理新增表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 處理開關狀態變更
  const handleSwitchChange = (name, checked) => {
    setFormData({ ...formData, [name]: checked });
  };

  // 新增金流設定
  const handleAddSetting = async () => {
    try {
      await apiService.post("/cash-flow-settings", formData);
      toast.success("金流設定新增成功");
      setShowAddDialog(false);
      setFormData({
        name: "",
        Hash_Key: "",
        Hash_IV: "",
        merchant_ID: "",
        WEB_enable: false,
        CVS_enable: false,
        ATM_enable: false,
        credit_enable: false,
      });
      fetchCashFlowSettings();
    } catch (error) {
      console.error("新增金流設定失敗:", error);
      toast.error(
        error.response?.data?.message || "無法新增金流設定，請稍後再試"
      );
    }
  };

  // 編輯金流設定
  const handleEditSetting = (setting) => {
    setCurrentSetting(setting);
    setFormData({
      name: setting.name,
      Hash_Key: setting.Hash_Key,
      Hash_IV: setting.Hash_IV,
      merchant_ID: setting.merchant_ID,
      WEB_enable: setting.WEB_enable,
      CVS_enable: setting.CVS_enable,
      ATM_enable: setting.ATM_enable,
      credit_enable: setting.credit_enable,
    });
    setShowEditDialog(true);
  };

  // 更新金流設定
  const handleUpdateSetting = async () => {
    try {
      await apiService.put(`/cash-flow-settings/${currentSetting.name}`, formData);
      toast.success("金流設定更新成功");
      setShowEditDialog(false);
      fetchCashFlowSettings();
    } catch (error) {
      console.error("更新金流設定失敗:", error);
      toast.error(
        error.response?.data?.message || "無法更新金流設定，請稍後再試"
      );
    }
  };

  // 刪除金流設定
  const handleDeleteSetting = async (name) => {
    if (window.confirm(`確定要刪除 ${name} 金流設定嗎？`)) {
      try {
        await apiService.delete(`/cash-flow-settings/${name}`);
        toast.success("金流設定刪除成功");
        fetchCashFlowSettings();
      } catch (error) {
        console.error("刪除金流設定失敗:", error);
        toast.error(
          error.response?.data?.message || "無法刪除金流設定，請稍後再試"
        );
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          新增金流設定
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : cashFlowSettings.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <AlertCircleIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">尚未設定金流服務</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              您尚未新增任何金流設定。點擊「新增金流設定」按鈕來設定第三方支付服務。
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              新增金流設定
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {cashFlowSettings.map((setting) => (
            <Card key={setting.name} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {setting.name === "ECPAY" ? (
                        <CreditCardIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <WalletIcon className="h-5 w-5 text-blue-600" />
                      )}
                      {setting.name} 金流服務
                    </CardTitle>
                    <CardDescription className="mt-1">
                      商店代號: {setting.merchant_ID}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSetting(setting)}
                      className="flex items-center gap-1"
                    >
                      <EditIcon className="h-4 w-4" />
                      編輯
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSetting(setting.name)}
                      className="flex items-center gap-1"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      刪除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      HashKey
                    </h3>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {setting.Hash_Key}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      HashIV
                    </h3>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {setting.Hash_IV}
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  啟用的支付方式
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      setting.credit_enable
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <CreditCardIcon
                      className={`h-5 w-5 ${
                        setting.credit_enable
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        setting.credit_enable
                          ? "font-medium"
                          : "text-gray-500"
                      }
                    >
                      信用卡支付
                    </span>
                  </div>
                  <div
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      setting.ATM_enable
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <ChevronsUpDownIcon
                      className={`h-5 w-5 ${
                        setting.ATM_enable ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        setting.ATM_enable ? "font-medium" : "text-gray-500"
                      }
                    >
                      ATM 轉帳
                    </span>
                  </div>
                  <div
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      setting.CVS_enable
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <ShoppingBagIcon
                      className={`h-5 w-5 ${
                        setting.CVS_enable ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        setting.CVS_enable ? "font-medium" : "text-gray-500"
                      }
                    >
                      超商代碼
                    </span>
                  </div>
                  <div
                    className={`p-3 border rounded-lg flex items-center gap-2 ${
                      setting.WEB_enable
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <WalletIcon
                      className={`h-5 w-5 ${
                        setting.WEB_enable ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        setting.WEB_enable ? "font-medium" : "text-gray-500"
                      }
                    >
                      WebATM
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 text-gray-500 text-sm">
                最後更新: {new Date(setting.updated_at).toLocaleString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 新增金流設定對話框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-blue-600" />
              新增金流設定
            </DialogTitle>
            <DialogDescription>
              完成第三方支付服務所需的API金鑰設定
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">金流服務名稱</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如: ECPAY"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="merchant_ID">商店代號 (Merchant ID)</Label>
              <Input
                id="merchant_ID"
                name="merchant_ID"
                placeholder="例如: 3002607"
                value={formData.merchant_ID}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="Hash_Key">Hash Key</Label>
              <Input
                id="Hash_Key"
                name="Hash_Key"
                placeholder="API 金鑰"
                value={formData.Hash_Key}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="Hash_IV">Hash IV</Label>
              <Input
                id="Hash_IV"
                name="Hash_IV"
                placeholder="API 密鑰"
                value={formData.Hash_IV}
                onChange={handleInputChange}
              />
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">啟用支付方式</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor="credit_enable">信用卡支付</Label>
                  </div>
                  <Switch
                    id="credit_enable"
                    checked={formData.credit_enable}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("credit_enable", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ChevronsUpDownIcon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor="ATM_enable">ATM 轉帳</Label>
                  </div>
                  <Switch
                    id="ATM_enable"
                    checked={formData.ATM_enable}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("ATM_enable", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor="CVS_enable">超商代碼</Label>
                  </div>
                  <Switch
                    id="CVS_enable"
                    checked={formData.CVS_enable}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("CVS_enable", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <WalletIcon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor="WEB_enable">WebATM</Label>
                  </div>
                  <Switch
                    id="WEB_enable"
                    checked={formData.WEB_enable}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("WEB_enable", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddSetting} className="flex items-center gap-1">
              <SaveIcon className="h-4 w-4" />
              儲存設定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯金流設定對話框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EditIcon className="h-5 w-5 text-blue-600" />
              編輯金流設定
            </DialogTitle>
            <DialogDescription>
              修改 {currentSetting?.name} 金流服務的設定
            </DialogDescription>
          </DialogHeader>

          {currentSetting && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_merchant_ID">商店代號 (Merchant ID)</Label>
                <Input
                  id="edit_merchant_ID"
                  name="merchant_ID"
                  value={formData.merchant_ID}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_Hash_Key">Hash Key</Label>
                <Input
                  id="edit_Hash_Key"
                  name="Hash_Key"
                  value={formData.Hash_Key}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_Hash_IV">Hash IV</Label>
                <Input
                  id="edit_Hash_IV"
                  name="Hash_IV"
                  value={formData.Hash_IV}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-3">啟用支付方式</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="h-5 w-5 text-gray-600" />
                      <Label htmlFor="edit_credit_enable">信用卡支付</Label>
                    </div>
                    <Switch
                      id="edit_credit_enable"
                      checked={formData.credit_enable}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("credit_enable", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChevronsUpDownIcon className="h-5 w-5 text-gray-600" />
                      <Label htmlFor="edit_ATM_enable">ATM 轉帳</Label>
                    </div>
                    <Switch
                      id="edit_ATM_enable"
                      checked={formData.ATM_enable}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("ATM_enable", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                      <Label htmlFor="edit_CVS_enable">超商代碼</Label>
                    </div>
                    <Switch
                      id="edit_CVS_enable"
                      checked={formData.CVS_enable}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("CVS_enable", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <WalletIcon className="h-5 w-5 text-gray-600" />
                      <Label htmlFor="edit_WEB_enable">WebATM</Label>
                    </div>
                    <Switch
                      id="edit_WEB_enable"
                      checked={formData.WEB_enable}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("WEB_enable", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpdateSetting} className="flex items-center gap-1">
              <SaveIcon className="h-4 w-4" />
              更新設定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashFlowSettings; 