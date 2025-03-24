import { useState, useEffect } from "react";
import apiService from "../services/api";
import { toast } from "react-hot-toast";
import {
  CreditCardIcon,
  SaveIcon,
  RefreshCwIcon,
  InfoIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CashFlowSettings = () => {
  const [settings, setSettings] = useState({
    paymentMethods: {
      credit_card: {
        enabled: true,
        fee_percentage: 2.5,
        settlement_days: 3,
      },
      bank_transfer: {
        enabled: true,
        fee_percentage: 1.0,
        settlement_days: 1,
      },
      line_pay: {
        enabled: false,
        fee_percentage: 3.0,
        settlement_days: 2,
      }
    },
    notifications: {
      email_notifications: true,
      daily_summary: true,
      abnormal_transactions: true,
    },
    reconciliation: {
      auto_reconciliation: true,
      reconciliation_time: "23:00",
      reconciliation_frequency: "daily"
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("payment_methods");

  // 載入設定
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get("/settings/cash-flow");
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("獲取金流設定失敗:", error);
      toast.error("無法獲取金流設定，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  // 儲存設定
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await apiService.post("/settings/cash-flow", settings);
      toast.success("金流設定已更新");
    } catch (error) {
      console.error("儲存金流設定失敗:", error);
      toast.error("無法儲存金流設定，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  // 更新支付方式設定
  const updatePaymentMethod = (method, field, value) => {
    setSettings({
      ...settings,
      paymentMethods: {
        ...settings.paymentMethods,
        [method]: {
          ...settings.paymentMethods[method],
          [field]: value
        }
      }
    });
  };

  // 更新通知設定
  const updateNotification = (field, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: value
      }
    });
  };

  // 更新對帳設定
  const updateReconciliation = (field, value) => {
    setSettings({
      ...settings,
      reconciliation: {
        ...settings.reconciliation,
        [field]: value
      }
    });
  };

  // 取得支付方式顯示名稱
  const getPaymentMethodName = (method) => {
    const names = {
      credit_card: "信用卡",
      bank_transfer: "銀行轉帳",
      line_pay: "LINE Pay"
    };
    return names[method] || method;
  };

  // 渲染支付方式設定頁籤
  const renderPaymentMethodsTab = () => {
    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            手續費設定將影響系統計算淨收入的方式，結算天數用於預估資金到帳時間
          </AlertDescription>
        </Alert>

        {Object.keys(settings.paymentMethods).map((method) => (
          <Card key={method} className="overflow-hidden">
            <CardHeader className="bg-gray-50 pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-gray-600" />
                  {getPaymentMethodName(method)}
                </CardTitle>
                <Switch 
                  checked={settings.paymentMethods[method].enabled}
                  onCheckedChange={(checked) => updatePaymentMethod(method, "enabled", checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`fee-${method}`}>手續費率 (%)</Label>
                  <Input 
                    id={`fee-${method}`}
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.paymentMethods[method].fee_percentage}
                    onChange={(e) => updatePaymentMethod(method, "fee_percentage", parseFloat(e.target.value))}
                    disabled={!settings.paymentMethods[method].enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`settlement-${method}`}>結算天數</Label>
                  <Input 
                    id={`settlement-${method}`}
                    type="number" 
                    min="0"
                    max="30"
                    value={settings.paymentMethods[method].settlement_days}
                    onChange={(e) => updatePaymentMethod(method, "settlement_days", parseInt(e.target.value, 10))}
                    disabled={!settings.paymentMethods[method].enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染通知設定頁籤
  const renderNotificationsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>系統通知設定</CardTitle>
            <CardDescription>
              設定金流相關的通知方式與頻率
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-1">
                啟用電子郵件通知
              </Label>
              <Switch 
                id="email-notifications"
                checked={settings.notifications.email_notifications}
                onCheckedChange={(checked) => updateNotification("email_notifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-summary" className="flex-1">
                每日交易摘要
              </Label>
              <Switch 
                id="daily-summary"
                checked={settings.notifications.daily_summary}
                onCheckedChange={(checked) => updateNotification("daily_summary", checked)}
                disabled={!settings.notifications.email_notifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="abnormal-transactions" className="flex-1">
                異常交易警示
              </Label>
              <Switch 
                id="abnormal-transactions"
                checked={settings.notifications.abnormal_transactions}
                onCheckedChange={(checked) => updateNotification("abnormal_transactions", checked)}
                disabled={!settings.notifications.email_notifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染對帳設定頁籤
  const renderReconciliationTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>自動對帳設定</CardTitle>
            <CardDescription>
              設定系統自動對帳的時間與頻率
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reconciliation" className="flex-1">
                啟用自動對帳
              </Label>
              <Switch 
                id="auto-reconciliation"
                checked={settings.reconciliation.auto_reconciliation}
                onCheckedChange={(checked) => updateReconciliation("auto_reconciliation", checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reconciliation-time">對帳執行時間</Label>
              <Input 
                id="reconciliation-time"
                type="time" 
                value={settings.reconciliation.reconciliation_time}
                onChange={(e) => updateReconciliation("reconciliation_time", e.target.value)}
                disabled={!settings.reconciliation.auto_reconciliation}
              />
            </div>
            
            <div className="space-y-2">
              <Label>對帳頻率</Label>
              <RadioGroup 
                value={settings.reconciliation.reconciliation_frequency} 
                onValueChange={(value) => updateReconciliation("reconciliation_frequency", value)}
                disabled={!settings.reconciliation.auto_reconciliation}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">每日執行</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">每週執行</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">每月執行</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <section className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">金流設定</h1>
          <p className="text-gray-500 mt-1">管理支付方式、通知與對帳設定</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className="h-4 w-4" />
            重新載入
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <SaveIcon className="h-4 w-4" />
            儲存設定
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 mb-6">
          <TabsTrigger value="payment_methods" className="data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white">
            支付方式
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white">
            通知設定
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="data-[state=active]:bg-brandBlue-normal data-[state=active]:text-white">
            對帳設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment_methods">
          {renderPaymentMethodsTab()}
        </TabsContent>
        
        <TabsContent value="notifications">
          {renderNotificationsTab()}
        </TabsContent>
        
        <TabsContent value="reconciliation">
          {renderReconciliationTab()}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default CashFlowSettings; 