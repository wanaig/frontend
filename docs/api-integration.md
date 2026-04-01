# 奈雪的茶小程序 - 前后端联调指南

---

## 一、联调前准备

### 1.1 环境要求

**后端环境：**
- JDK 17+
- Maven 3.8+
- MySQL 8.0
- Redis (可选，用于session)

**前端环境：**
- HBuilderX / VS Code
- 微信开发者工具

### 1.2 启动后端服务

```bash
# 1. 进入后端项目目录
cd naixue-server

# 2. 修改配置文件
# 编辑 src/main/resources/application.yml
# 确保数据库连接正确
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/naixue?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password

# 3. 初始化数据库
mysql -u root -p < sql/init.sql

# 4. 启动服务
mvn spring-boot:run

# 或打包后运行
mvn clean package -DskipTests
java -jar target/naixue-server-1.0.0.jar
```

后端启动成功后：`http://localhost:8080/api`

### 1.3 配置微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `engineering-wechat-mini-program` 目录
3. 在「详情」→「本地设置」中：
   - 勾选「不校验合法域名」（开发阶段）
   - 或在「项目配置」中添加合法域名：
     - `http://localhost:8080` (开发)
     - `https://api.naixue.com` (生产)

---

## 二、切换到真实 API

### 2.1 修改前端配置

编辑 `api/index.js`：

```javascript
// ===================== 配置区 =====================
const MOCK_MODE = false  // 改为 false 启用真实 API
const BASE_URL = 'http://localhost:8080/api'  // 后端地址
// ===================== 配置区 =====================
```

### 2.2 验证连接

在微信开发者工具的「控制台」中测试：

```javascript
// 测试门店接口（公开接口，不需要认证）
uni.request({
  url: 'http://localhost:8080/api/store',
  success: (res) => {
    console.log('后端连接成功:', res.data)
  },
  fail: (err) => {
    console.error('后端连接失败:', err)
  }
})
```

---

## 三、联调测试清单

### 3.1 公开接口（无需登录）

| 接口 | 测试方法 | 预期结果 |
|------|----------|----------|
| GET /store | 获取门店信息 | 返回门店列表 |
| GET /goods | 获取商品列表 | 返回商品列表 |
| GET /goods?categoryId=1 | 获取分类商品 | 返回分类商品 |
| GET /recharge/card | 获取储值卡 | 返回储值卡列表 |
| GET /banner | 获取轮播图 | 返回轮播图列表 |

### 3.2 需登录接口

**步骤 1：微信登录**

```javascript
// 先获取微信 code
wx.login({
  success: async (res) => {
    const code = res.code
    // 调用后端登录
    const result = await wxLogin(code)
    console.log('登录成功:', result)
    // 保存登录数据
    saveLoginData(result)
  }
})
```

**步骤 2：测试需认证接口**

登录后测试以下接口：

| 接口 | 测试方法 | 预期结果 |
|------|----------|----------|
| GET /member/info | 获取会员信息 | 返回会员详情 |
| GET /address | 获取地址列表 | 返回地址列表 |
| GET /coupon | 获取优惠券 | 返回优惠券列表 |
| GET /points | 获取积分 | 返回积分信息 |
| GET /attendance/rule | 获取签到规则 | 返回签到规则 |

### 3.3 订单流程测试

```javascript
// 1. 创建订单
const order = await createOrder({
  storeId: 1,
  typeCate: 1,  // 1=自取
  goodsList: [
    { goodsId: 1, number: 1, property: '少糖' }
  ]
})
console.log('订单创建成功:', order)

// 2. 支付订单（模拟）
await payOrder(order.id, 'wechat')

// 3. 查询订单
const orderDetail = await getOrderDetail(order.id)
console.log('订单详情:', orderDetail)
```

---

## 四、常见问题

### 4.1 请求失败

**问题：** 请求显示「网络请求失败」

**排查步骤：**
1. 检查后端是否启动：`curl http://localhost:8080/api/store`
2. 检查 MOCK_MODE 是否为 false
3. 检查 BASE_URL 是否正确
4. 在微信开发者工具中查看「网络」面板

### 4.2 401 未授权

**问题：** 接口返回「请先登录」

**原因：** Token 未携带或已过期

**排查步骤：**
1. 检查 storage 中是否有 `auth_token`
2. 检查 Token 是否过期（与 `auth_token_expires` 比较）
3. 在请求头中确认有 `Authorization: Bearer xxx`

### 4.3 CORS 跨域

**问题：** 提示跨域错误

**解决：** 确保后端已配置 CORS（后端已配置，见 WebMvcConfig.java）

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
}
```

### 4.4 登录后仍提示未登录

**问题：** 已调用 saveLoginData 但仍提示未登录

**排查：**
1. 检查 saveLoginData 是否正确保存 token
2. 检查 getAuthHeader() 是否正确读取 token
3. 检查后端 JWT 配置是否正确

---

## 五、API 对照表

### 5.1 前端 API 名称 → 后端 URL

| 前端 API 名称 | HTTP | 后端 URL | 说明 |
|---------------|------|----------|------|
| member.login | POST | /member/login | 微信登录 |
| member | GET | /member/info | 获取会员信息 |
| member | PUT | /member/info | 更新会员信息 |
| store | GET | /store | 获取门店 |
| goods | GET | /goods | 获取商品 |
| orders | GET | /order | 获取订单列表 |
| order.create | POST | /order | 创建订单 |
| order.detail | GET | /order/{id} | 订单详情 |
| order.pay | PUT | /order/{id}/pay | 支付订单 |
| order.cancel | PUT | /order/{id}/cancel | 取消订单 |
| addresses | GET | /address | 地址列表 |
| address.create | POST | /address | 添加地址 |
| address.update | PUT | /address/{id} | 更新地址 |
| address.delete | DELETE | /address/{id} | 删除地址 |
| customerCoupons | GET | /coupon | 优惠券列表 |
| coupon.available | GET | /coupon/available | 可用优惠券 |
| coupon.exchange | POST | /coupon/exchange | 兑换优惠券 |
| customPoints | GET | /points | 积分 |
| points.flow | GET | /points/flow | 积分流水 |
| attendance | GET | /attendance/rule | 签到规则 |
| attendance.sign | POST | /attendance/sign | 签到 |
| attendanceList | GET | /attendance/history | 签到历史 |
| todayAttendance | GET | /attendance/today | 今日签到 |
| pointsMall | GET | /points/goods | 积分商城 |
| points.exchange | POST | /points/exchange | 积分兑换 |
| rechargeCards | GET | /recharge/card | 储值卡 |
| recharge | POST | /recharge | 储值 |
| giftCards | GET | /gift-card | 礼品卡 |
| packages | GET | /packages | 券包 |
| levelBenefits | GET | /level-benefits | 等级权益 |

---

## 六、响应格式

### 6.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 6.2 错误响应

```json
{
  "code": 3001,
  "message": "会员不存在",
  "data": null
}
```

### 6.3 错误码表

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 1001 | 参数错误 | 检查请求参数 |
| 2001 | 请先登录 | 跳转登录页 |
| 2002 | 登录已过期 | 重新登录 |
| 3001 | 会员不存在 | 提示用户 |
| 3002 | 积分不足 | 提示用户 |
| 3003 | 优惠券不可用 | 提示用户 |
| 4001 | 订单不存在 | 刷新订单列表 |
| 4002 | 订单状态错误 | 提示用户 |
| 4003 | 库存不足 | 提示用户 |
| 5001 | 商品不存在 | 刷新商品 |
| 5002 | 商品已下架 | 提示用户 |
| 9001 | 系统错误 | 反馈技术人员 |

---

## 七、开发模式切换

### 7.1 开发阶段（MOCK_MODE = true）

```javascript
const MOCK_MODE = true
```

- 使用本地模拟数据
- 无需启动后端
- 响应速度快
- 用于 UI 开发和功能测试

### 7.2 联调阶段（MOCK_MODE = false）

```javascript
const MOCK_MODE = false
const BASE_URL = 'http://localhost:8080/api'
```

- 请求真实后端
- 需要启动后端服务
- 用于接口对接和数据调试

### 7.3 生产阶段

```javascript
const MOCK_MODE = false
const BASE_URL = 'https://api.naixue.com/api'
```

- 请求真实服务器
- 需要配置合法域名
- 用于线上发布

---

## 八、接口测试示例

### 8.1 在 HBuilderX 控制台测试

```javascript
// 在任意页面的 onShow 或按钮点击中测试
onShow() {
  // 测试公开接口
  this.testStore()

  // 测试需登录接口（先登录）
  // this.testMember()
},

methods: {
  async testStore() {
    const store = await this.$api('store')
    console.log('门店数据:', store)
  },

  async testMember() {
    const member = await this.$api('member')
    console.log('会员数据:', member)
  }
}
```

### 8.2 在微信开发者工具测试

```javascript
// 在控制台直接调用
const api = require('/api/index.js').default

// 测试登录
api.wxLogin('test_code').then(res => {
  console.log('登录结果:', res)
  api.saveLoginData(res)
})

// 测试会员接口
api('member').then(res => {
  console.log('会员信息:', res)
})
```

---

## 九、日志查看

### 9.1 前端日志

微信开发者工具 → 「调试器」→「Console」

### 9.2 后端日志

控制台输出：
```
com.naixue: DEBUG  # DEBUG 级别
org.springframework: INFO  # INFO 级别
```

### 9.3 网络请求

微信开发者工具 → 「Network」面板
- 查看请求详情
- 复制请求为 cURL
- 查看响应数据
