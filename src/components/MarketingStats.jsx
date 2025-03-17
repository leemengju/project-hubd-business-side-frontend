import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Percent, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingBag 
} from "lucide-react";

const StatsCard = ({ title, value, description, icon, iconBgColor }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconBgColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const MarketingStats = ({ coupons = [], campaigns = [] }) => {
  // 計算活躍優惠券數量
  const activeCoupons = coupons.filter(coupon => new Date(coupon.end_date) > new Date()).length;
  
  // 計算活躍活動數量
  const activeCampaigns = campaigns.filter(campaign => new Date(campaign.end_date) > new Date()).length;

  // 統計優惠券類型分佈
  const couponTypes = coupons.reduce((acc, coupon) => {
    const type = coupon.discount_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // 統計優惠券使用者範圍
  const targetedUsers = coupons.reduce((sum, coupon) => sum + (coupon.users?.length || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatsCard
        title="總優惠券數"
        value={coupons.length}
        description={`其中 ${activeCoupons} 個優惠券處於活躍狀態`}
        icon={<Tag className="h-4 w-4 text-brandBlue-normal" />}
        iconBgColor="bg-brandBlue-light"
      />
      <StatsCard
        title="總活動數"
        value={campaigns.length}
        description={`其中 ${activeCampaigns} 個活動正在進行中`}
        icon={<Calendar className="h-4 w-4 text-blue-500" />}
        iconBgColor="bg-blue-50"
      />
      <StatsCard
        title="最受歡迎折扣類型"
        value={Object.entries(couponTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "尚無資料"}
        description="根據已建立的優惠券類型統計"
        icon={<Percent className="h-4 w-4 text-green-500" />}
        iconBgColor="bg-green-50"
      />
      <StatsCard
        title="目標客戶數"
        value={targetedUsers}
        description="特定會員專屬優惠的目標使用者數"
        icon={<Users className="h-4 w-4 text-purple-500" />}
        iconBgColor="bg-purple-50"
      />
      <StatsCard
        title="預估轉換率"
        value="12.5%"
        description="優惠券和行銷活動帶來的轉換率評估"
        icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        iconBgColor="bg-orange-50"
      />
      <StatsCard
        title="平均訂單金額"
        value="NT$ 1,250"
        description="使用優惠的平均訂單金額"
        icon={<ShoppingBag className="h-4 w-4 text-red-500" />}
        iconBgColor="bg-red-50"
      />
    </div>
  );
};

export default MarketingStats; 