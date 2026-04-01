# 奈雪的茶小程序后端 API 文档

## 概述

- **基础URL**: `http://localhost:8080`
- **数据格式**: JSON
- **认证方式**: JWT Token (除标注「无需登录」接口外，均需在请求头携带 `Authorization: Bearer <token>`)
- **统一响应格式**:

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 响应码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 业务处理失败 |
| 2001 | 请先登录 |
| 2002 | 登录已过期 |
| 3001 | 数据不存在 |
| 4001 | 余额不足 |
| 9999 | 系统错误 |

---

## 认证说明

### 请求头格式

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Token 获取

通过 `POST /member/login` 接口获取Token，登录成功后返回的 `token` 字段即为JWT Token。

---

## 1. 会员模块 (Member)

### 1.1 微信授权登录

**接口**: `POST /member/login`

**是否需要登录**: 否

**请求参数** (JSON):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | 是 | 微信登录code，通过 `wx.login()` 获取 |
| encryptedData | String | 否 | 加密的用户手机号数据 |
| iv | String | 否 | 加密算法的初始向量 |

**请求示例**:
```json
{
  "code": "0811hangPVfU3M1dzjKPVDn5n3V11hang",
  "encryptedData": "xxx",
  "iv": "xxx"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "customerId": 10001,
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.png",
    "mobilePhone": "13800138000",
    "isNewMember": true
  }
}
```

---

### 1.2 获取会员信息

**接口**: `GET /member/info`

**是否需要登录**: 是

**请求参数**: 无 (会员ID从Token中解析获取)

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "customerId": 10001,
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.png",
    "mobilePhone": "13800138000",
    "gender": 1,
    "cardNo": "NX888888888",
    "cardName": "V2",
    "memberLevel": 2,
    "memberLevelName": "VIP2",
    "pointNum": 1500,
    "couponNum": 3,
    "balance": 100.00,
    "giftBalance": 50.00,
    "currentValue": 800,
    "needValue": 1200,
    "birthday": "1990-01-01",
    "memberOrigin": "微信小程序",
    "expenseAmount": 500.00,
    "level": 2
  }
}
```

---

### 1.3 更新会员信息

**接口**: `PUT /member/info`

**是否需要登录**: 是

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | String | 否 | 昵称 |
| avatar | String | 否 | 头像URL |
| gender | Integer | 否 | 性别: 0-女 1-男 |
| birthday | String | 否 | 生日，格式: yyyy-MM-dd |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 2. 门店模块 (Store)

### 2.1 获取门店信息

**接口**: `GET /store`

**是否需要登录**: 否

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| longitude | String | 否 | 经度 |
| latitude | String | 否 | 纬度 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "奈雪的茶(万象城店)",
    "address": "深圳市南山区华润万象天地",
    "mobile": "0755-12345678",
    "longitude": "113.941",
    "latitude": "22.534"
  }
}
```

---

## 3. 商品模块 (Goods)

### 3.1 获取商品列表

**接口**: `GET /goods`

**是否需要登录**: 否

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category_id | Long | 否 | 分类ID，不传则返回全部 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "霸气芝士茉莉绿茗",
      "categoryId": 1,
      "categoryName": "奶茶",
      "price": 28.00,
      "image": "https://example.com/goods1.png",
      "description": "精选茉莉绿茗搭配浓郁芝士",
      "sales": 1000
    }
  ]
}
```

---

### 3.2 获取商品详情

**接口**: `GET /goods/{id}`

**是否需要登录**: 否

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 商品ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "霸气芝士茉莉绿茗",
    "categoryId": 1,
    "categoryName": "奶茶",
    "price": 28.00,
    "originalPrice": 32.00,
    "image": "https://example.com/goods1.png",
    "images": [
      "https://example.com/goods1.png",
      "https://example.com/goods1_2.png"
    ],
    "description": "精选茉莉绿茗搭配浓郁芝士",
    "sales": 1000,
    "stock": 99,
    "properties": [
      {
        "name": "规格",
        "options": ["中杯", "大杯"]
      },
      {
        "name": "甜度",
        "options": ["标准糖", "半糖", "无糖"]
      },
      {
        "name": "温度",
        "options": ["正常冰", "少冰", "去冰"]
      }
    ]
  }
}
```

---

## 4. 订单模块 (Order)

### 4.1 创建订单

**接口**: `POST /order`

**是否需要登录**: 是

**请求参数** (JSON):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storeId | Long | 是 | 门店ID |
| typeCate | Integer | 是 | 订单类型: 1-自取 2-外卖 |
| addressId | Long | 否 | 收货地址ID (外卖时必填) |
| remark | String | 否 | 订单备注 |
| couponId | Long | 否 | 使用的优惠券ID |
| goodsList | Array | 是 | 商品列表 |

**goodsList 数组元素**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| goodsId | Long | 是 | 商品ID |
| number | Integer | 是 | 购买数量 |
| property | String | 否 | 规格属性，格式: "甜度,温度" |

**请求示例**:
```json
{
  "storeId": 1,
  "typeCate": 1,
  "addressId": null,
  "remark": "少冰",
  "couponId": 100,
  "goodsList": [
    {
      "goodsId": 1,
      "number": 2,
      "property": "半糖,少冰"
    },
    {
      "goodsId": 3,
      "number": 1,
      "property": "标准糖,去冰"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": 123456
  }
}
```

---

### 4.2 获取订单列表

**接口**: `GET /order`

**是否需要登录**: 是

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | Integer | 否 | 订单状态筛选 |
| page | Integer | 否 | 页码，默认1 |
| page_size | Integer | 否 | 每页数量，默认10 |

**订单状态说明**:

| 状态值 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 制作中 |
| 3 | 已完成 |
| 4 | 已取消 |
| 5 | 退款中 |
| 6 | 已退款 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 123456,
      "orderNo": "NX202401011234567890",
      "status": 2,
      "statusText": "制作中",
      "totalAmount": 56.00,
      "amount": 56.00,
      "goodsNum": 3,
      "payMode": "微信支付",
      "createdAt": 1704067200,
      "payedAt": 1704067260,
      "completedTime": null,
      "productionedTime": null,
      "postscript": "少冰",
      "sortNum": "A001",
      "typeCate": 1,
      "couponAmount": 0.00,
      "store": {
        "name": "奈雪的茶(万象城店)",
        "address": "深圳市南山区华润万象天地",
        "mobile": "0755-12345678"
      },
      "goods": [
        {
          "name": "霸气芝士茉莉绿茗",
          "number": 2,
          "price": "28.00",
          "amount": "56.00",
          "property": "半糖,少冰",
          "image": "https://example.com/goods1.png"
        }
      ],
      "discount": []
    }
  ]
}
```

---

### 4.3 获取订单详情

**接口**: `GET /order/{id}`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 订单ID |

**响应示例**: 参考 4.2 订单列表中的单个订单结构

---

### 4.4 取消订单

**接口**: `PUT /order/{id}/cancel`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 订单ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 4.5 支付订单

**接口**: `PUT /order/{id}/pay`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 订单ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 4.6 获取订单制作进度

**接口**: `GET /order/{id}/progress`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 订单ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": 2,
    "statusText": "制作中",
    "sortNum": "A001",
    "progress": [
      {
        "step": "已下单",
        "done": true,
        "time": "2024-01-01 12:00:00"
      },
      {
        "step": "制作中",
        "done": true,
        "time": null
      },
      {
        "step": "已完成",
        "done": false,
        "time": null
      }
    ]
  }
}
```

---

## 5. 地址模块 (Address)

### 5.1 获取地址列表

**接口**: `GET /address`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "memberId": 10001,
      "acceptName": "张三",
      "mobile": "13800138000",
      "sex": 1,
      "province": 440000,
      "city": 440300,
      "area": 440305,
      "provinceName": "广东省",
      "cityName": "深圳市",
      "areaName": "南山区",
      "street": "华润万象天地",
      "doorNumber": "1号楼101",
      "isDefault": 1
    }
  ]
}
```

---

### 5.2 新增地址

**接口**: `POST /address`

**是否需要登录**: 是

**请求参数** (JSON):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| acceptName | String | 是 | 收货人姓名 |
| mobile | String | 是 | 收货人手机号 |
| sex | Integer | 否 | 性别: 0-女 1-男 |
| province | Integer | 是 | 省份编码 |
| city | Integer | 是 | 城市编码 |
| area | Integer | 是 | 区县编码 |
| provinceName | String | 是 | 省份名称 |
| cityName | String | 是 | 城市名称 |
| areaName | String | 是 | 区县名称 |
| street | String | 是 | 街道/详细地址 |
| doorNumber | String | 否 | 门牌号 |
| isDefault | Integer | 否 | 是否设为默认地址: 0-否 1-是 |

**请求示例**:
```json
{
  "acceptName": "张三",
  "mobile": "13800138000",
  "sex": 1,
  "province": 440000,
  "city": 440300,
  "area": 440305,
  "provinceName": "广东省",
  "cityName": "深圳市",
  "areaName": "南山区",
  "street": "华润万象天地",
  "doorNumber": "1号楼101",
  "isDefault": 1
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 5.3 更新地址

**接口**: `PUT /address/{id}`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 地址ID |

**请求参数**: 同 5.2 新增地址

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 5.4 删除地址

**接口**: `DELETE /address/{id}`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 地址ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 5.5 设置默认地址

**接口**: `PUT /address/{id}/default`

**是否需要登录**: 是

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 地址ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 6. 优惠券模块 (Coupon)

### 6.1 获取优惠券列表

**接口**: `GET /coupon`

**是否需要登录**: 是

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | String | 否 | 类型筛选，默认 "all"，可选: "all", "unused", "used", "expired" |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "满30减5券",
      "type": 1,
      "typeName": "满减券",
      "amount": 5.00,
      "minAmount": 30.00,
      "validDays": 30,
      "status": "unused"
    }
  ]
}
```

---

### 6.2 兑换优惠券

**接口**: `POST /coupon/exchange`

**是否需要登录**: 是

**请求参数** (JSON):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | 是 | 兑换码 |

**请求示例**:
```json
{
  "code": "NAIXUE2024"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 6.3 获取可用优惠券

**接口**: `GET /coupon/available`

**是否需要登录**: 是

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| amount | BigDecimal | 是 | 订单金额 |

**响应示例**: 参考 6.1 优惠券列表

---

## 7. 积分模块 (Points)

### 7.1 获取积分概况

**接口**: `GET /points`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "pointNum": 1500,
    "totalPoints": 5000,
    "usedPoints": 3500,
    "rank": 100
  }
}
```

---

### 7.2 获取积分流水

**接口**: `GET /points/flow`

**是否需要登录**: 是

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| page_size | Integer | 否 | 每页数量，默认10 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "memberId": 10001,
      "changeType": 1,
      "changeNum": 10,
      "balance": 1510,
      "reason": "积分签到奖励",
      "sourceType": 5,
      "createdAt": "2024-01-01 12:00:00"
    }
  ]
}
```

---

## 8. 签到模块 (Attendance)

### 8.1 获取签到规则

**接口**: `GET /attendance/rule`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "dayName": 1, "points": 1, "isDay": 1 },
    { "dayName": 2, "points": 1, "isDay": 0 },
    { "dayName": 3, "points": 2, "isDay": 0 },
    { "dayName": 4, "points": 3, "isDay": 0 },
    { "dayName": 5, "points": 5, "isDay": 0 },
    { "dayName": 6, "points": 5, "isDay": 0 },
    { "dayName": 7, "points": 10, "isDay": 0 }
  ]
}
```

---

### 8.2 获取今日签到状态

**接口**: `GET /attendance/today`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isAttendance": 0,
    "totalPoints": 1500,
    "attendanceContinuityDay": 3,
    "attendancePoints": 1,
    "attendanceCategory": 1,
    "list": [
      { "attendanceDay": 1, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 2, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 3, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 4, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 5, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 6, "couponName": "", "couponId": "0", "status": 0 },
      { "attendanceDay": 7, "couponName": "", "couponId": "0", "status": 0 }
    ]
  }
}
```

---

### 8.3 签到

**接口**: `POST /attendance/sign`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "points": 3,
    "continuousDay": 4,
    "totalPoints": 1503
  }
}
```

---

### 8.4 获取签到历史

**接口**: `GET /attendance/history`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "memberId": 10001,
      "date": "2024-01-01",
      "attendancePoint": 3,
      "rewardDays": 4
    }
  ]
}
```

---

## 9. 储值模块 (Recharge)

### 9.1 获取储值卡列表

**接口**: `GET /recharge/card`

**是否需要登录**: 是

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "奈雪会员储值卡",
      "amount": 100.00,
      "giftAmount": 10.00,
      "description": "充100送10"
    },
    {
      "id": 2,
      "name": "奈雪会员储值卡",
      "amount": 200.00,
      "giftAmount": 30.00,
      "description": "充200送30"
    }
  ]
}
```

---

### 9.2 会员储值

**接口**: `POST /recharge`

**是否需要登录**: 是

**请求参数** (JSON):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| cardId | Long | 是 | 储值卡ID |
| payMode | String | 是 | 支付方式: "wechat" 微信支付, "balance" 余额支付 |

**请求示例**:
```json
{
  "cardId": 1,
  "payMode": "wechat"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 10. 轮播图模块 (Banner)

### 10.1 获取轮播图列表

**接口**: `GET /banner`

**是否需要登录**: 否

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| position | String | 否 | 位置，默认 "home" |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "新年活动",
      "image": "https://example.com/banner1.png",
      "link": "/pages/activity/newyear",
      "position": "home",
      "sort": 1
    }
  ]
}
```

---

## 附录: 会员等级说明

| 等级 | 名称 | 成长值要求 |
|------|------|-----------|
| V1 | 普通会员 | 0 |
| V2 | 银卡会员 | 500 |
| V3 | 金卡会员 | 2000 |
| V4 | 白金会员 | 5000 |
| V5 | 黑金会员 | 15000 |
| V6 | 钻卡会员 | 50000 |

---

## 附录: 错误码汇总

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 业务处理失败 |
| 2001 | 请先登录 |
| 2002 | 登录已过期 |
| 3001 | 数据不存在 |
| 4001 | 余额不足 |
| 9999 | 系统错误 |
