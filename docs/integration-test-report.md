# 奈雪的茶小程序 - 前后端联调测试报告

---

## 一、联调准备

### 1.1 已完成的修改

| 文件 | 修改内容 | 说明 |
|------|----------|------|
| `api/index.js` | `MOCK_MODE = false` | 启用真实 API 模式 |
| `api/index.js` | 错误码对齐后端文档 | 更新 errorMessages |
| `pages/login/login.vue` | 重写登录逻辑 | 使用真实 wxLogin API |

### 1.2 前置条件

**后端服务必须已启动：**
```bash
cd naixue-server
mvn spring-boot:run
# 服务地址: http://localhost:8080/api
```

**微信开发者工具配置：**
- 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

---

## 二、接口映射分析

### 2.1 URL 映射表（已验证）

| 前端 API | HTTP | 后端路径 | 状态 |
|----------|------|----------|------|
| member.login | POST | /member/login | ✅ 正确 |
| member | GET | /member/info | ✅ 正确 |
| member | PUT | /member/info | ✅ 正确 |
| store | GET | /store | ✅ 正确 |
| goods | GET | /goods | ✅ 正确 |
| orders | GET | /order | ✅ 正确 |
| order.create | POST | /order | ✅ 正确 |
| order.detail | GET | /order/{id} | ✅ 正确 |
| order.pay | PUT | /order/{id}/pay | ✅ 正确 |
| order.cancel | PUT | /order/{id}/cancel | ✅ 正确 |
| addresses | GET | /address | ✅ 正确 |
| address.create | POST | /address | ✅ 正确 |
| address.update | PUT | /address/{id} | ✅ 正确 |
| address.delete | DELETE | /address/{id} | ✅ 正确 |
| customerCoupons | GET | /coupon | ✅ 正确 |
| coupon.available | GET | /coupon/available | ✅ 正确 |
| coupon.exchange | POST | /coupon/exchange | ✅ 正确 |
| customPoints | GET | /points | ✅ 正确 |
| points.flow | GET | /points/flow | ✅ 正确 |
| attendance | GET | /attendance/rule | ✅ 正确 |
| attendance.sign | POST | /attendance/sign | ✅ 正确 |
| attendanceList | GET | /attendance/history | ✅ 正确 |
| todayAttendance | GET | /attendance/today | ✅ 正确 |
| rechargeCards | GET | /recharge/card | ✅ 正确 |
| recharge | POST | /recharge | ✅ 正确 |
| giftCards | GET | /gift-card | ✅ 正确 |
| packages | GET | /packages | ✅ 正确 |
| levelBenefits | GET | /level-benefits | ✅ 正确 |

### 2.2 参数命名差异

| 前端参数 | 后端参数 | 说明 | 状态 |
|----------|----------|------|------|
| categoryId | category_id | camelCase vs snake_case | ⚠️ 需后端支持 |
| pageSize | page_size | camelCase vs snake_case | ⚠️ 需后端支持 |

**说明：** Spring Boot 默认可以自动将 camelCase 转换为 snake_case，但需确保后端配置正确。

---

## 三、数据结构差异（关键问题）

### 3.1 商品数据 - ⚠️ 存在显著差异

**前端期望格式（按分类嵌套）：**
```javascript
[
  {
    id: 6905,                    // 分类ID
    name: "奈雪早餐",              // 分类名称
    goods_list: [                 // 分类下的商品列表
      {
        id: 65825,
        name: "奈雪早餐",
        price: 18.5,
        images: "https://...",
        use_property: 0
      }
    ]
  }
]
```

**后端返回格式（扁平列表）：**
```json
{
  "data": [
    {
      "id": 1,
      "name": "霸气芝士茉莉绿茗",
      "categoryId": 1,
      "categoryName": "奶茶",
      "price": 28.00,
      "image": "https://..."
    }
  ]
}
```

**解决方案（选其一）：**

**方案A - 后端改造（推荐）：**
```java
// 修改后端 GET /goods 返回分类嵌套结构
@GetMapping("/goods")
public Result<List<Map<String, Object>>> getGoods() {
    // 按 categoryId 分组返回
}
```

**方案B - 前端转换：**
```javascript
// 在 api/index.js 或页面中转换
function transformGoods(flatList) {
  const grouped = {}
  flatList.forEach(good => {
    if (!grouped[good.categoryId]) {
      grouped[good.categoryId] = {
        id: good.categoryId,
        name: good.categoryName,
        goods_list: []
      }
    }
    grouped[good.categoryId].goods_list.push(good)
  })
  return Object.values(grouped)
}
```

### 3.2 会员数据

**前端期望字段：**
- `customerId` ✅ 匹配
- `nickname` ✅ 匹配
- `avatar` ✅ 匹配
- `mobilePhone` ✅ 匹配
- `memberLevel` ✅ 匹配
- `pointNum` ✅ 匹配
- `balance` ✅ 匹配
- `giftBalance` ✅ 匹配
- `currentValue` ✅ 匹配
- `needValue` ✅ 匹配

**状态：** ✅ 会员数据结构基本匹配

### 3.3 订单数据

**前端期望字段：**
- `id` / `order_id` ⚠️ 需确认
- `orderNo` ✅ 匹配
- `status` ✅ 匹配
- `totalAmount` ✅ 匹配
- `goodsList` ✅ 匹配

**状态：** ⚠️ 需验证 order_id vs id 字段名

---

## 四、页面联调测试清单

### 4.1 公开接口（无需登录）

| 页面 | 接口 | 测试要点 | 状态 |
|------|------|----------|------|
| 首页 | GET /store | 门店信息展示 | ⏳ 待测试 |
| 首页 | GET /banner | 轮播图展示 | ⏳ 待测试 |
| 点餐页 | GET /goods | 商品列表/分类展示 | ⚠️ 数据结构不匹配 |
| 储值页 | GET /recharge/card | 储值卡列表 | ⏳ 待测试 |
| 礼品卡 | GET /gift-card | 礼品卡列表 | ⏳ 待测试 |
| 券包 | GET /packages | 券包列表 | ⏳ 待测试 |

### 4.2 需登录接口

| 页面 | 接口 | 测试要点 | 状态 |
|------|------|----------|------|
| 登录页 | POST /member/login | 微信登录+Token | ⚠️ 需真机测试 |
| 我的 | GET /member/info | 会员信息展示 | ⏳ 待测试 |
| 我的 | GET /coupon | 优惠券数量 | ⏳ 待测试 |
| 积分 | GET /points | 积分展示 | ⏳ 待测试 |
| 积分明细 | GET /points/flow | 积分流水 | ⏳ 待测试 |
| 签到 | GET /attendance/rule | 签到规则 | ⏳ 待测试 |
| 签到 | POST /attendance/sign | 签到操作 | ⏳ 待测试 |
| 地址列表 | GET /address | 地址列表 | ⏳ 待测试 |
| 添加地址 | POST /address | 新增地址 | ⏳ 待测试 |
| 订单列表 | GET /order | 订单列表 | ⏳ 待测试 |
| 订单详情 | GET /order/{id} | 订单详情 | ⏳ 待测试 |
| 创建订单 | POST /order | 创建订单 | ⏳ 待测试 |
| 支付订单 | PUT /order/{id}/pay | 支付操作 | ⏳ 待测试 |
| 取消订单 | PUT /order/{id}/cancel | 取消操作 | ⏳ 待测试 |

---

## 五、已修复问题

### 5.1 登录页面改造

**问题：** 原登录页使用 Mock 数据，未对接真实 API

**修改文件：** `pages/login/login.vue`

**修改内容：**
```javascript
// 修改前（Mock模式）
import Member from '@/api/member'
this.SET_MEMBER(Member)  // 直接使用静态数据

// 修改后（真实API）
// 1. 调用 wx.login() 获取 code
const loginRes = await this.wxLoginPromisify()
// 2. 调用后端登录接口
const loginData = await this.$api('member.login', { code })
// 3. 保存 token
this.$api.saveLoginData(loginData)
// 4. 存入 Vuex
this.SET_MEMBER(member)
```

### 5.2 错误码对齐

**问题：** 前端错误码与后端不一致

**修改文件：** `api/index.js`

**修改内容：**
```javascript
// 修改前
const errorMessages = {
  3001: '会员不存在',
  4001: '订单不存在',
  // ...
}

// 修改后（与后端API文档一致）
const errorMessages = {
  0: '成功',
  1001: '参数错误',
  1002: '业务处理失败',
  2001: '请先登录',
  2002: '登录已过期',
  3001: '数据不存在',
  4001: '余额不足',
  9999: '系统错误'
}
```

---

## 六、待解决问题

### 6.1 高优先级

| # | 问题 | 影响页面 | 解决方案 |
|---|------|---------|---------|
| 1 | 商品数据结构不匹配 | 点餐页 | 后端改造或前端转换 |
| 2 | 微信登录需真机测试 | 登录页 | 开发者工具无法测试 wx.login |

### 6.2 中优先级

| # | 问题 | 影响 | 解决方案 |
|---|------|-----|---------|
| 1 | order_id vs id 字段名 | 订单相关页面 | 统一字段名 |
| 2 | 参数命名 camelCase | 所有分页接口 | 后端配置或前端转换 |

---

## 七、测试方法

### 7.1 本地测试步骤

**1. 启动后端服务：**
```bash
cd naixue-server
mvn spring-boot:run
```

**2. 修改前端配置：**
```javascript
// api/index.js
const MOCK_MODE = false
const BASE_URL = 'http://localhost:8080/api'
```

**3. 在微信开发者工具中测试：**

```javascript
// 控制台测试 - 门店接口（公开）
uni.request({
  url: 'http://localhost:8080/api/store',
  success: (res) => {
    console.log('门店信息:', res.data)
  }
})

// 控制台测试 - 会员信息（需先登录）
const token = uni.getStorageSync('auth_token')
uni.request({
  url: 'http://localhost:8080/api/member/info',
  header: { Authorization: 'Bearer ' + token },
  success: (res) => {
    console.log('会员信息:', res.data)
  }
})
```

### 7.2 分模块测试

**步骤1：测试公开接口**
- 首页门店信息
- 点餐页商品列表
- 轮播图

**步骤2：测试登录流程**
- 微信授权登录
- Token 保存验证
- 会员信息获取

**步骤3：测试订单流程**
- 创建订单
- 支付订单
- 查询订单

---

## 八、后端接口补充需求

根据前端页面功能，后端需补充以下接口：

| 接口 | 说明 | 优先级 |
|------|------|--------|
| GET /banner | 首页轮播图 | 高 |
| GET /packages | 券包列表 | 高 |
| GET /points/goods | 积分商城商品 | 中 |
| POST /points/exchange | 积分兑换 | 中 |
| GET /level-benefits | 等级权益 | 中 |
| POST /order/{id}/remark | 订单备注 | 低 |

---

## 九、注意事项

### 9.1 微信登录限制

- 微信小程序中 `wx.login()` 必须在真机上测试
- 开发者工具中的 `wx.login()` 返回的是模拟 code
- 建议：开发者工具中跳过登录，直接测试其他接口

### 9.2 CORS 跨域

后端已配置 CORS（见 `WebMvcConfig.java`），如遇跨域问题检查：
```java
registry.addMapping("/**")
    .allowedOriginPatterns("*")
```

### 9.3 Token 传递

确认所有需要认证的请求都携带了 Token：
```javascript
// api/index.js 中已实现
const header = getAuthHeader()  // { Authorization: 'Bearer xxx' }
```

---

## 十、附录：错误码对照表

| 错误码 | 说明 | 前端提示 |
|--------|------|----------|
| 0 | 成功 | - |
| 1001 | 参数错误 | 参数错误 |
| 1002 | 业务处理失败 | 业务处理失败 |
| 2001 | 请先登录 | 请先登录 |
| 2002 | 登录已过期 | 登录已过期，请重新登录 |
| 3001 | 数据不存在 | 数据不存在 |
| 4001 | 余额不足 | 余额不足 |
| 9999 | 系统错误 | 系统错误 |

---

## 十一、联调检查清单

### 11.1 启动检查
- [ ] 后端服务已启动（http://localhost:8080/api）
- [ ] 前端 MOCK_MODE = false
- [ ] 微信开发者工具已勾选「不校验合法域名」

### 11.2 接口检查
- [ ] 门店接口返回数据
- [ ] 商品接口返回数据（注意数据结构）
- [ ] 登录接口返回 token
- [ ] Token 已存入 storage
- [ ] 会员信息接口返回数据

### 11.3 页面功能检查
- [ ] 首页展示门店信息
- [ ] 点餐页展示商品列表
- [ ] 登录后会员信息正确显示
- [ ] 积分、优惠券数据正确显示
