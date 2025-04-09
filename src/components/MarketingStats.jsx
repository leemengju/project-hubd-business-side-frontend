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
  // 計算優惠券狀態數量
  const couponStatusCounts = {
    active: coupons.filter(coupon => coupon.calculated_status === 'active').length,
    disabled: coupons.filter(coupon => coupon.calculated_status === 'disabled').length,
    expired: coupons.filter(coupon => coupon.calculated_status === 'expired').length,
    scheduled: coupons.filter(coupon => coupon.calculated_status === 'scheduled').length
  };
  
  // 計算活動狀態數量
  const campaignStatusCounts = {
    active: campaigns.filter(campaign => campaign.calculated_status === 'active').length,
    disabled: campaigns.filter(campaign => campaign.calculated_status === 'disabled').length,
    expired: campaigns.filter(campaign => campaign.calculated_status === 'expired').length,
    scheduled: campaigns.filter(campaign => campaign.calculated_status === 'scheduled').length
  };

  // 統計優惠券類型分佈
  const couponTypes = coupons.reduce((acc, coupon) => {
    const type = coupon.discount_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // 獲取最受歡迎的折扣類型
  const getMostPopularDiscountType = (types) => {
    if (Object.keys(types).length === 0) return "尚無資料";
    
    const sortedTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const [type, _] = sortedTypes[0];
    
    // 中文化顯示
    const typeNames = {
      'percentage': '百分比折扣',
      'fixed': '固定金額折扣',
      'shipping': '免運費',
      'buy_x_get_y': '買X送Y'
    };
    
    return typeNames[type] || type;
  };

  // 統計優惠券使用者範圍
  const targetedUsers = coupons.reduce((sum, coupon) => sum + (coupon.users?.length || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatsCard
        title="總優惠券數"
        value={coupons.length}
        description={`啟用中: ${couponStatusCounts.active} | 排程中: ${couponStatusCounts.scheduled} | 已過期: ${couponStatusCounts.expired}`}
        icon={<Tag className="h-4 w-4 text-brandBlue-normal" />}
        iconBgColor="bg-brandBlue-light"
      />
      <StatsCard
        title="總活動數"
        value={campaigns.length}
        description={`進行中: ${campaignStatusCounts.active} | 排程中: ${campaignStatusCounts.scheduled} | 已結束: ${campaignStatusCounts.expired}`}
        icon={<Calendar className="h-4 w-4 text-blue-500" />}
        iconBgColor="bg-blue-50"
      />
      <StatsCard
        title="最受歡迎折扣類型"
        value={getMostPopularDiscountType(couponTypes)}
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
        title="即將到期優惠"
        value={`${couponStatusCounts.active + campaignStatusCounts.active}`}
        description="目前啟用中的優惠券與活動總數"
        icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        iconBgColor="bg-orange-50"
      />
      <StatsCard
        title="預計上線優惠"
        value={`${couponStatusCounts.scheduled + campaignStatusCounts.scheduled}`}
        description="排程中的優惠券與活動總數"
        icon={<ShoppingBag className="h-4 w-4 text-red-500" />}
        iconBgColor="bg-red-50"
      />
    </div>
  );
};

export default MarketingStats; 