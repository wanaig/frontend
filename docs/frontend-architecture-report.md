# 奈雪的茶小程序 - 前端架构报告

---

## 一、项目概述

### 1.1 项目简介

本项目是基于 **UniApp + Vue** 技术栈开发的微信小程序，用于奈雪的茶线下门店的线上点餐、会员管理、订单管理等业务场景。

### 1.2 技术选型

| 技术 | 说明 |
|------|------|
| **框架** | UniApp (跨平台小程序框架) |
| **开发语言** | Vue 2.x + JavaScript |
| **状态管理** | Vuex |
| **样式** | SCSS |
| **UI 组件** | 自定义组件 + uni-ui |
| **构建工具** | HBuilderX / Vite |
| **目标平台** | 微信小程序 |

### 1.3 项目目录结构

```
naixue/
├── api/                    # API 数据层（Mock 数据）
│   ├── index.js           # API 统一入口（核心）
│   ├── client.js          # API 客户端备选版本
│   ├── goods.js           # 商品数据
│   ├── member.js          # 会员数据
│   ├── store.js           # 门店数据
│   ├── orders.js          # 订单数据
│   ├── addresses.js       # 地址数据
│   ├── coupons.js         # 优惠券数据
│   ├── packages.js        # 券包数据
│   ├── attendance.js      # 签到数据
│   ├── custom-points.js    # 积分数据
│   ├── points-mall.js     # 积分商城数据
│   ├── gift-cards.js      # 礼品卡数据
│   └── rechargeCards.js    # 储值卡数据
│
├── components/            # 公共组件
│   ├── modal/            # 模态框组件
│   ├── popup-layer/      # 弹出层组件
│   ├── uni-icons/        # 图标组件
│   ├── uni-steps/        # 步骤条组件
│   ├── uni-swipe-action/ # 滑动操作组件
│   ├── list-cell/       # 列表单元格
│   ├── jyf-parser/      # HTML 解析器（已弃用）
│   └── loading.vue        # 加载组件
│
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── menu/             # 点餐页
│   ├── take-foods/       # 取餐页
│   ├── mine/             # 我的页面
│   ├── orders/           # 订单相关
│   ├── login/            # 登录页
│   ├── address/          # 地址管理
│   ├── coupons/          # 优惠券
│   ├── integrals/        # 积分相关
│   ├── attendance/        # 签到
│   ├── balance/          # 储值
│   ├── packages/         # 券包
│   ├── giftcard/         # 礼品卡
│   ├── pay/              # 支付
│   ├── services/         # 服务
│   ├── activities/       # 活动
│   ├── invoice/          # 发票
│   └── review/           # 评价
│
├── static/               # 静态资源
│   ├── images/          # 图片资源
│   └── style/           # 样式文件
│
├── store/                # Vuex 状态管理
│   └── index.js         # Store 实例
│
├── common/               # 公共工具
│   ├── util.js          # 工具函数
│   └── uqrcode.js       # 二维码生成
│
├── App.vue              # 应用根组件
├── main.js              # 应用入口
├── pages.json           # 页面路由配置
├── manifest.json        # 应用配置
└── uni.scss             # 全局样式变量
```

---

## 二、核心架构

### 2.1 页面路由架构

基于 `pages.json` 配置的 **TabBar 多标签页面 + 子页面** 结构：

```
┌─────────────────────────────────────────────────────────┐
│                    TabBar 页面（4个）                      │
├─────────────────────────────────────────────────────────┤
│  [首页]     │  [点餐]     │  [取餐]     │  [我的]         │
│  index     │  menu      │  take-foods │  mine           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │         子页面（非 TabBar）              │
         ├────────────────────────────────────────┤
         │  login        - 登录页                   │
         │  orders       - 订单列表/详情             │
         │  address      - 地址管理                  │
         │  coupons      - 我的卡券                 │
         │  integrals    - 积分/积分明细/兑换详情     │
         │  attendance   - 签到                     │
         │  balance      - 会员储值                  │
         │  packages     - 券包列表/购买             │
         │  giftcard     - 礼品卡                   │
         │  pay          - 结算页                   │
         │  member-code  - 会员码                    │
         │  userinfo     - 用户信息                 │
         │  services     - 更多服务                 │
         │  help-center  - 帮助中心                  │
         │  activities   - 活动页                   │
         │  invoice      - 发票                      │
         │  review       - 评价                      │
         └────────────────────────────────────────┘
```

### 2.2 状态管理架构 (Vuex)

```javascript
// store/index.js
const store = new Vuex.Store({
  state: {
    store: {},        // 当前门店信息
    cart: [],         // 购物车
    orderType: 'takein',  // 订单类型：takein=自取, takeout=外卖
    address: {},      // 当前收货地址
    addresses: [],     // 地址列表
    member: {},       // 会员信息
    order: {}         // 当前订单
  },
  getters: {
    isLogin: state => Object.keys(state.member).length > 0
  },
  mutations: {
    SET_ORDER_TYPE,
    SET_MEMBER,
    SET_ADDRESS,
    SET_ADDRESSES,
    SET_STORE,
    SET_CART,
    REMOVE_CART,
    SET_ORDER
  },
  actions: {
    getStore  // 获取门店信息
  }
})
```

### 2.3 API 数据流架构

```
┌─────────────────────────────────────────────────────────┐
│                    页面组件 (Page)                       │
│                                                         │
│   async onLoad() {                                      │
│     const goods = await this.$api('goods')            │
│     this.goodsList = goods                             │
│   }                                                    │
└──────────────────────┬────────────────────────────────┘
                       │ this.$api(name)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   api/index.js                          │
│                                                         │
│   export default function api(name, params) {           │
│     if (MOCK_MODE) {                                   │
│       return mockData[name]  // 返回模拟数据              │
│     } else {                                           │
│       return uni.request({...})  // 请求真实 API         │
│     }                                                  │
│   }                                                    │
└──────────────────────┬────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   api/*.js      │         │   真实后端 API   │
│   (Mock 数据)    │         │   Spring Boot   │
│                 │         │                 │
│  goods.js       │         │  /api/goods     │
│  member.js      │         │  /api/member    │
│  store.js       │         │  /api/store     │
│  orders.js      │         │  /api/order     │
└─────────────────┘         └─────────────────┘
```

---

## 三、页面模块详解

### 3.1 首页 (pages/index/index.vue)

**功能说明：** 应用入口页面，展示门店入口和会员快捷入口。

**核心逻辑：**

| 方法 | 说明 |
|------|------|
| `takein()` | 选择自取，跳转到点餐页 |
| `takeout()` | 选择外卖，需登录后跳转地址选择 |
| `integrals()` | 跳转积分商城，需登录 |
| `memberCode()` | 跳转会员码，需登录 |
| `packages()` | 跳转会员券包 |
| `invite()` | 跳转买茶送包活动页 |

**数据依赖：**
- Vuex `state.member` - 会员信息（昵称、积分）
- Vuex `getters.isLogin` - 登录状态

**页面结构：**
```
首页
├── Banner 区域（固定高度 600rpx）
│   └── 欢迎语 + 品牌标语
├── 入口卡片
│   ├── 自取入口
│   └── 外卖入口
├── 会员信息栏
│   ├── 我的积分（跳转积分商城）
│   └── 会员码（跳转会员码页）
├── 快捷导航
│   ├── 奈雪商城（左侧大卡片）
│   └── 买茶送包 + 会员券包（右侧卡片）
└── 会员新鲜事（活动展示）
```

### 3.2 点餐页 (pages/menu/menu.vue)

**功能说明：** 商品浏览、分类切换、购物车管理的核心交易页面。

**核心逻辑：**

| 方法 | 说明 |
|------|------|
| `init()` | 页面初始化，获取门店和商品数据 |
| `handleMenuTap(id)` | 点击分类菜单，滚动到对应商品分类 |
| `handleGoodsScroll()` | 监听商品列表滚动，自动切换高亮分类 |
| `calcSize()` | 计算各分类的滚动位置（用于联动） |
| `handleAddToCart()` | 添加商品到购物车 |
| `handleReduceFromCart()` | 从购物车减少商品 |
| `showGoodDetailModal()` | 显示商品详情弹窗 |
| `handleAddToCartInModal()` | 从详情弹窗添加商品到购物车 |
| `openCartPopup()` | 显示/隐藏购物车列表 |
| `handleCartClear()` | 清空购物车 |
| `toPay()` | 跳转结算页 |

**数据流：**
```javascript
// 从 Vuex 获取
state.orderType  // 订单类型（takein/takeout）
state.address    // 收货地址
state.store      // 门店信息

// 本地状态
this.cart        // 购物车列表
this.goods       // 商品分类列表（含商品）
this.currentCateId  // 当前高亮的分类ID
```

**购物车计算属性：**
```javascript
getCartGoodsNumber()  // 购物车商品总数量
getCartGoodsPrice()   // 购物车商品总价格
disabledPay()          // 是否禁用结算按钮
spread()              // 距起送价还差多少
```

### 3.3 我的页面 (pages/mine/mine.vue)

**功能说明：** 会员中心，展示会员信息和提供各项服务入口。

**会员数据展示：**
- 头像、昵称、会员等级
- 成长值进度条
- 奈雪券数量、积分、余额、礼品卡余额

**我的服务入口：**
| 入口 | 页面 | 需登录 |
|------|------|--------|
| 积分签到 | /pages/attendance/attendance | 是 |
| 送她心愿 | - | 否 |
| 奈雪商城 | - | 否 |
| 联系客服 | - | 否 |
| 我的订单 | /pages/orders/orders | 是 |
| 我的资料 | /pages/mine/userinfo | 是 |
| 收货地址 | /pages/address/address | 是 |
| 更多服务 | /pages/services/services | 否 |

### 3.4 登录页 (pages/login/login.vue)

**功能说明：** 微信授权登录，获取用户信息。

**登录流程：**
```
┌─────────────────┐
│   页面加载       │
└────────┬────────┘
         ▼
┌─────────────────┐
│  用户点击按钮    │
│  (getUserInfo)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  获取微信用户    │
│  授权信息       │
└────────┬────────┘
         ▼
┌─────────────────┐
│  调用 SET_MEMBER │
│  存入 Vuex      │
└────────┬────────┘
         ▼
┌─────────────────┐
│  uni.navigateBack()│
│  返回上一页     │
└─────────────────┘
```

**兼容处理：**
- `#ifdef MP-WEIXIN`: 微信小程序使用 `open-type="getUserInfo"` 获取用户信息
- `#ifdef H5`: H5 环境使用简化登录

### 3.5 订单模块

#### 订单列表 (pages/orders/orders.vue)
- 支持 Tab 切换：全部/待支付/制作中/已完成/已取消
- 支持下拉刷新、上拉加载更多
- 跳转到订单详情

#### 订单详情 (pages/orders/detail.vue)
- 展示订单完整信息（商品列表、金额、状态）
- 支持取消订单、查看进度、评价

### 3.6 积分模块

| 页面 | 文件 | 功能 |
|------|------|------|
| 积分首页 | integrals/integrals.vue | 积分概览、签到入口 |
| 积分明细 | integrals/flow.vue | 积分变动流水记录 |
| 兑换详情 | integrals/detail.vue | 积分商品兑换详情 |

### 3.7 签到模块 (pages/attendance/attendance.vue)

- 展示签到日历
- 支持月度切换
- 显示连续签到天数和累计积分
- 调用签到 API

---

## 四、API 数据层详解

### 4.1 API 入口 (api/index.js)

**核心导出：**
```javascript
// 默认导出 - GET 请求
export default function api(name, params)

// 认证相关
export function saveLoginData(loginData)
export function getUserInfo()
export function getToken()
export function isLogin()
export function logout()

// HTTP 方法
export function postApi(name, data)
export function putApi(name, id, data)
export function deleteApi(name, id)

// 业务 API
export function wxLogin(code)
export function getMemberInfo()
export function updateMemberInfo(nickname, avatar, gender, birthday)
export function getStore(longitude, latitude)
export function getGoods(params)
export function getOrderList(params)
export function getOrderDetail(orderId)
export function createOrder(orderData)
export function payOrder(orderId, payMode)
export function cancelOrder(orderId, reason)
// ... 更多
```

### 4.2 Mock 数据结构

| 文件 | 数据结构 | 说明 |
|------|----------|------|
| `goods.js` | Array<Category\> | 分类列表，每类含商品列表 |
| `member.js` | Object | 会员信息 |
| `store.js` | Object | 门店信息 |
| `orders.js` | Array<Order\> | 订单列表 |
| `addresses.js` | Array<Address\> | 地址列表 |
| `coupons.js` | Array<Coupon\> | 优惠券列表 |
| `attendance.js` | Object | 签到规则 |
| `points-mall.js` | Array<Goods\> | 积分商城商品 |

### 4.3 URL 映射表（后端接口对应）

| 前端 API 名称 | 后端路径 | 方法 |
|---------------|----------|------|
| member.login | /member/login | POST |
| member | /member/info | GET/PUT |
| store | /store | GET |
| goods | /goods | GET |
| orders | /order | GET/POST |
| order.detail | /order/{id} | GET |
| order.pay | /order/{id}/pay | PUT |
| addresses | /address | GET/POST |
| customerCoupons | /coupon | GET |
| customPoints | /points | GET |
| attendance | /attendance/rule | GET |
| attendance.sign | /attendance/sign | POST |
| rechargeCards | /recharge/card | GET |
| giftCards | /gift-card | GET |
| packages | /packages | GET |

---

## 五、组件库

### 5.1 组件列表

| 组件 | 路径 | 功能 |
|------|------|------|
| modal | components/modal/ | 模态框弹窗 |
| popup-layer | components/popup-layer/ | 弹出层（支持上下左右方向）|
| uni-icons | components/uni-icons/ | 图标组件 |
| uni-steps | components/uni-steps/ | 步骤条 |
| uni-swipe-action | components/uni-swipe-action/ | 滑动操作 |
| list-cell | components/list-cell/ | 列表单元格 |
| loading | components/loading.vue | 加载动画 |
| jyf-parser | components/jyf-parser/ | HTML 解析（**已弃用，用 rich-text 替代**）|

### 5.2 通用组件使用示例

```vue
<!-- 模态框 -->
<modal :show="modalVisible" class="good-detail-modal">
  <view>内容</view>
</modal>

<!-- 弹出层 -->
<popup-layer direction="top" :show-pop="popupVisible">
  <template slot="content">
    <view>弹出内容</view>
  </template>
</popup-layer>

<!-- 滑动操作 -->
<uni-swipe-action>
  <uni-swipe-action-item>
    <view>滑动内容</view>
  </uni-swipe-action-item>
</uni-swipe-action>
```

---

## 六、样式系统

### 6.1 全局样式文件

| 文件 | 说明 |
|------|------|
| `static/style/app.scss` | 全局公共样式 |
| `uni.scss` | UniApp 全局 SCSS 变量 |

### 6.2 主要 SCSS 变量

```scss
// uni.scss 中的全局变量
$color-primary: #97AF13;        // 主色调（奈雪绿）
$color-warning: #FFA11A;         // 警告色
$color-assist: #878889;         // 辅助色（灰色）

$font-size-sm: 22rpx;           // 小字体
$font-size-base: 24rpx;        // 基础字体
$font-size-lg: 28rpx;          // 大字体

$box-shadow: 0 10rpx 8rpx rgba(0,0,0,0.1);  // 卡片阴影
```

### 6.3 常用样式类

| 类名 | 说明 |
|------|------|
| `.d-flex` | flex 布局 |
| `.flex-column` | 纵向排列 |
| `.align-items-center` | 垂直居中 |
| `.justify-content-center` | 水平居中 |
| `.text-color-primary` | 主色调文字 |
| `.text-color-assist` | 辅助色文字 |
| `.font-size-sm/base/lg` | 字体大小 |
| `.font-weight-bold` | 加粗 |

---

## 七、业务流程图

### 7.1 点餐流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   首页       │────▶│   点餐页     │────▶│  购物车      │
│  (takein)   │     │  (menu)     │     │  (cart)     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  商品详情    │────▶│   结算页     │
                    │   (modal)   │     │   (pay)     │
                    └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   订单页     │
                                        │  (orders)   │
                                        └─────────────┘
```

### 7.2 外卖点餐流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   首页       │────▶│  外卖入口    │────▶│  地址选择    │
│  (takeout)  │     │  (takeout)  │     │ (address)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   点餐页     │
                                        │  (menu)     │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   结算页     │
                                        │   (pay)     │
                                        └─────────────┘
```

### 7.3 登录流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   需登录     │────▶│   登录页     │────▶│  微信授权    │
│   页面       │     │  (login)    │     │  (getUserInfo)│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  SET_MEMBER │
                                        │  (Vuex)     │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  返回上一页  │
                                        │(navigateBack)│
                                        └─────────────┘
```

---

## 八、数据模型

### 8.1 会员 (Member)

```javascript
{
  customerId: '343400246943295100',  // 会员ID
  nickname: 'tinypuppet',            // 昵称
  avatar: '/static/images/...',     // 头像
  mobilePhone: '18666600000',       // 手机号
  cardNo: '39390020696322222',      // 会员卡号
  cardName: 'V2',                   // 等级名称
  memberLevel: 2,                    // 会员等级(1-6)
  memberLevelName: 'VIP2',           // 等级显示名
  pointNum: 413,                    // 积分数量
  couponNum: 6,                     // 优惠券数量
  balance: 0,                       // 余额
  giftBalance: 0,                   // 礼品卡余额
  currentValue: 410,                // 当前成长值
  needValue: 90,                    // 距下一级所需成长值
  expenseAmount: null,              // 累计消费金额
  birthday: '',                    // 生日
  memberOrigin: 'wechat',          // 会员来源
  openingCardDate: '2018-10-20'    // 开卡时间
}
```

### 8.2 门店 (Store)

```javascript
{
  storeId: null,
  name: '卓悦中心ONE AVENUE店',     // 门店名称
  address: '深圳市福田区...',       // 门店地址
  mobile: '0755-82722513',          // 联系电话
  tel: '',
  longitude: '114.065927',          // 经度
  latitude: '22.537361',           // 纬度
  distance_text: '1.5km',          // 距离文本
  is_open: 1,                       // 是否营业
  is_takeout: 1,                    // 是否支持外卖
  min_price: 30,                   // 起送价
  packing_fee: 2,                   // 包装费
  delivery_cost: 2                  // 配送费
}
```

### 8.3 商品 (Goods)

```javascript
{
  sort: 1,
  id: 6905,
  name: '奈雪早餐',
  icon: '',
  is_show_backstage: 0,
  goods_list: [{
    id: 65825,
    name: '奈雪早餐',
    price: 18.5,
    images: 'https://...',
    content: '购买三明治,享早餐指定饮品半价',
    use_property: 0,               // 是否有规格属性
    stock: '9999956.00',            // 库存
    sales: 487,                     // 销量
    status: true,                   // 是否上架
    property: [],                  // 规格属性列表
    number: 1                      // 购车数量
  }]
}
```

### 8.4 订单 (Order)

```javascript
{
  id: '129884331948447300',
  orderNo: 'N20220812123456',       // 订单号
  storeId: 1,
  storeName: '卓悦中心店',
  memberId: '343400246943295100',
  typeCate: 1,                      // 1=自取 2=外卖
  status: 1,                        // 0=待支付 1=已支付 2=制作中 3=已完成 4=已取消
  totalAmount: 52.00,             // 总金额
  amount: 52.00,                  // 实付金额
  goodsNum: 3,                    // 商品数量
  payMode: 'wechat',              // 支付方式
  payedAt: '2022-08-12 10:30:00', // 支付时间
  sortNum: 'A005',                // 取餐号
  postscript: '少冰',             // 备注
  goodsList: [{
    goodsId: 65825,
    goodsName: '奈雪早餐',
    price: 18.50,
    number: 1,
    amount: 18.50,
    property: '大杯/少糖'
  }]
}
```

---

## 九、环境配置

### 9.1 开发环境切换

```javascript
// api/index.js
const MOCK_MODE = true   // true=模拟数据, false=真实API
const BASE_URL = 'http://localhost:8080/api'
```

### 9.2 微信开发者工具配置

1. 勾选「不校验合法域名」（开发阶段）
2. 或在「项目配置」中添加：
   - `http://localhost:8080` (开发)
   - `https://api.naixue.com` (生产)

### 9.3 后端接口要求

- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **认证方式**: `Authorization: Bearer <token>`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": { ... }
  }
  ```

---

## 十、已修复问题记录

| 问题 | 文件 | 解决方案 |
|------|------|----------|
| SCSS 变量 `$uni-bg-color-mask` 未定义 | uni.scss | 添加缺失的 uni-app 变量 |
| `/deep/` 语法弃用 | attendance.vue, flow.vue | 改用 `::v-deep` |
| jyf-parser 使用 Web API (document.querySelector) | coupons.vue, detail.vue | 改用原生 `rich-text` 组件 |

---

## 十一、待优化项

| 优先级 | 项 | 说明 |
|--------|----|------|
| 高 | 登录流程对接后端 | 目前使用 Mock 数据，需对接真实微信登录 |
| 高 | 订单流程对接后端 | 创建订单、支付、查询订单状态 |
| 中 | 积分签到对接后端 | 签到 API |
| 中 | 优惠券对接后端 | 领取、使用优惠券 |
| 低 | 会员信息编辑 | 修改昵称、头像 |
| 低 | 地址管理 CRUD | 增删改查收货地址 |

---

## 十二、文件清单

### 页面文件 (26个)

| 序号 | 页面路径 | 功能 |
|------|----------|------|
| 1 | pages/index/index.vue | 首页 |
| 2 | pages/menu/menu.vue | 点餐页 |
| 3 | pages/take-foods/take-foods.vue | 取餐页 |
| 4 | pages/mine/mine.vue | 我的 |
| 5 | pages/pay/pay.vue | 结算页 |
| 6 | pages/remark/remark.vue | 备注页 |
| 7 | pages/packages/index.vue | 券包列表 |
| 8 | pages/packages/detail.vue | 券包详情 |
| 9 | pages/balance/balance.vue | 储值页 |
| 10 | pages/login/login.vue | 登录页 |
| 11 | pages/address/address.vue | 地址列表 |
| 12 | pages/address/add.vue | 添加地址 |
| 13 | pages/integrals/integrals.vue | 积分首页 |
| 14 | pages/attendance/attendance.vue | 签到页 |
| 15 | pages/orders/orders.vue | 订单列表 |
| 16 | pages/orders/detail.vue | 订单详情 |
| 17 | pages/mine/member-code.vue | 会员码 |
| 18 | pages/coupons/coupons.vue | 我的卡券 |
| 19 | pages/mine/userinfo.vue | 用户信息 |
| 20 | pages/integrals/flow.vue | 积分明细 |
| 21 | pages/integrals/detail.vue | 兑换详情 |
| 22 | pages/review/review.vue | 评价页 |
| 23 | pages/activities/invite.vue | 邀请活动 |
| 24 | pages/services/services.vue | 更多服务 |
| 25 | pages/invoice/invoice.vue | 发票页 |
| 26 | pages/services/help-center.vue | 帮助中心 |
| 27 | pages/giftcard/giftcard.vue | 礼品卡 |

### API 文件 (17个)

| 文件 | 数据 |
|------|------|
| api/index.js | API 入口 |
| api/client.js | API 客户端备选 |
| api/goods.js | 商品数据 |
| api/member.js | 会员数据 |
| api/store.js | 门店数据 |
| api/orders.js | 订单数据 |
| api/addresses.js | 地址数据 |
| api/customer-coupons.js | 优惠券数据 |
| api/packages.js | 券包数据 |
| api/attendance.js | 签到规则数据 |
| api/attendance-list.js | 签到历史数据 |
| api/today-attendance.js | 今日签到数据 |
| api/custom-points.js | 积分数据 |
| api/points-flow.js | 积分流水数据 |
| api/points-mall.js | 积分商城数据 |
| api/gift-cards.js | 礼品卡数据 |
| api/rechargeCards.js | 储值卡数据 |
| api/level-benefits.js | 等级权益数据 |
