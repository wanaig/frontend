# 奈雪的茶小程序 API 接口文档

> **后端实现文档**:
> - [api-ssm.md](api-ssm.md) - SSM (Spring + Spring MVC + MyBatis) 后端实现 **(推荐)**
> - [api-springboot.md](api-springboot.md) - Spring Boot + Maven + MySQL 8 后端实现
> - [api-backend.md](api-backend.md) - Node.js + Express 后端实现

## 一、基础信息

- **基础URL**: `https://api.naixue.com/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 二、JWT 认证说明

### 2.1 认证流程

```
┌─────────┐                              ┌─────────────┐
│  小程序  │                              │   后端 API   │
└────┬────┘                              └──────┬──────┘
     │                                        │
     │  1. wx.login() 获取 code               │
     │ ─────────────────────────────────────> │
     │                                        │
     │  2. POST /member/login(code)           │
     │ ─────────────────────────────────────> │
     │                                        │
     │  3. 验证 code，获取 openid/session_key  │
     │  4. 查询或创建会员                       │
     │  5. 生成 JWT Token                      │
     │                                        │
     │  6. { token, expires_in, userInfo }    │
     │ <───────────────────────────────────── │
     │                                        │
     │  7. 存储 Token                          │
     │  8. 后续请求携带 Token                  │
     │                                        │
```

### 2.2 Token 说明

| 属性 | 说明 |
|------|------|
| 类型 | Bearer Token |
| 格式 | `Authorization: Bearer <token>` |
| 有效期 | 7 天 (604800 秒) |
| 存储 | `uni.setStorageSync('auth_token', token)` |

### 2.3 需要认证的接口

以下接口请求时需要在 Header 中携带 Token：

| 接口 | 方法 | 说明 |
|------|------|------|
| /member/info | GET | 获取会员信息 |
| /member/info | PUT | 更新会员信息 |
| /address | GET/POST | 地址管理 |
| /address/{id} | PUT/DELETE | 地址 CRUD |
| /order | GET/POST | 订单管理 |
| /order/{id}/pay | PUT | 支付订单 |
| /order/{id}/cancel | PUT | 取消订单 |
| /coupon | GET | 我的优惠券 |
| /coupon/exchange | POST | 兑换优惠券 |
| /points | GET | 积分概况 |
| /points/flow | GET | 积分流水 |
| /attendance/sign | POST | 签到 |
| /points/exchange | POST | 积分兑换 |
| /recharge | POST | 储值 |

### 2.4 错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 2001 | 未登录 | 跳转登录页 |
| 2002 | Token 过期 | 清除 Token，跳转登录页 |

### 2.5 前端认证代码

```javascript
// API 请求封装
async function request(url, options = {}) {
  const token = uni.getStorageSync('auth_token')

  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }

  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  const response = await uni.request({
    url: `${BASE_URL}${url}`,
    ...options,
    header
  })

  const { code, message, data } = response.data

  if (code === 2001 || code === 2002) {
    // Token 无效，清除并跳转登录
    uni.removeStorageSync('auth_token')
    uni.reLaunch({ url: '/pages/login/login' })
    return Promise.reject(message)
  }

  return { code, message, data }
}
```

---

## 二、接口列表

### 2.1 门店相关

#### GET /store
获取门店信息

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| longitude | string | 否 | 经度 |
| latitude | string | 否 | 纬度 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "卓悦中心ONE AVENUE店",
    "address": "深圳市福田区海田路与福华一路交汇...",
    "mobile": "0755-82722513",
    "longitude": "114.065927",
    "latitude": "22.537361",
    "area_name": "福田区",
    "is_open": true,
    "is_takeout": 1,
    "takeout_server_status": true,
    "forhere_is_open": true,
    "min_price": "30.00",
    "packing_fee": "2.00",
    "delivery_cost": "2.00",
    "avg_delivery_cost_time": "40",
    "distance_text": "896m"
  }
}
```

---

### 2.2 商品相关

#### GET /goods
获取商品列表

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category_id | int | 否 | 分类ID，不传则返回全部 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "sort": 1,
      "icon": "",
      "id": 6905,
      "name": "奈雪早餐",
      "goods_list": [
        {
          "id": 65825,
          "name": "奈雪早餐",
          "price": 18.5,
          "content": "购买三明治,享早餐指定饮品半价",
          "images": "https://example.com/goods.jpg",
          "use_property": 0,
          "property": [],
          "stock": "9999956.00",
          "sales": 487
        }
      ]
    }
  ]
}
```

---

### 2.3 会员相关

#### POST /member/login
微信授权登录

**请求参数**
```json
{
  "code": "微信授权code",
  "encrypted_data": "解密手机号加密数据(可选)",
  "iv": "解密iv(可选)"
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800,
    "customerId": "343400246943295100",
    "nickname": "tinypuppet",
    "avatar": "/static/images/mine/default.png",
    "mobilePhone": "18666600000",
    "isNewMember": false
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT 令牌 |
| token_type | string | 令牌类型，固定为 "Bearer" |
| expires_in | int | 过期时间(秒)，7天 = 604800 |
| isNewMember | boolean | 是否新用户 |

**客户端存储**
```javascript
// 登录成功后
uni.setStorageSync('auth_token', data.token)
uni.setStorageSync('auth_token_expires', Date.now() + data.expires_in * 1000)
uni.setStorageSync('user_info', { customerId, nickname, avatar, ... })
```

**请求认证**
```
Authorization: Bearer <token>
```

#### GET /member/info
获取会员信息

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "customerId": "343400246943295100",
    "nickname": "tinypuppet",
    "avatar": "/static/images/mine/default.png",
    "mobilePhone": "18666600000",
    "gender": 1,
    "cardNo": "39390020696322222",
    "cardName": "V2",
    "memberLevel": 2,
    "memberLevelName": "VIP2",
    "pointNum": 413,
    "couponNum": 6,
    "balance": 0,
    "giftBalance": 0,
    "currentValue": 410,
    "needValue": 90,
    "birthday": "",
    "memberOrigin": "wechat"
  }
}
```

#### PUT /member/info
更新会员信息

**请求参数**
```json
{
  "nickname": "新昵称",
  "avatar": "头像URL",
  "gender": 1,
  "birthday": "1990-01-01"
}
```

#### GET /member/level-benefits
获取会员等级权益

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "level": 1,
      "cardName": "V1",
      "picture": "https://example.com/v1.png",
      "benefitsSummaries": [
        {
          "benefitsName": "开卡特权",
          "benefitsType": 0,
          "benefitsItemSummaries": [
            {
              "benefitsType": 0,
              "num": 2,
              "unitType": 0
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 2.4 地址相关

#### GET /address
获取收货地址列表

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "accept_name": "隔壁老王",
      "mobile": "18666600000",
      "sex": 0,
      "province": 440000,
      "city": 440300,
      "area": 440306,
      "province_name": "广东省",
      "city_name": "深圳市",
      "area_name": "南山区",
      "street": "有一间公寓八栋",
      "door_number": "AB1234",
      "is_default": 0,
      "poiname": "",
      "district": {
        "districts": "广东省深圳市南山区",
        "area": "宝安区",
        "city": "深圳市",
        "province": "广东省"
      }
    }
  ]
}
```

#### POST /address
新增收货地址

**请求参数**
```json
{
  "accept_name": "收货人",
  "mobile": "18666600000",
  "sex": 0,
  "province": 440000,
  "city": 440300,
  "area": 440306,
  "province_name": "广东省",
  "city_name": "深圳市",
  "area_name": "南山区",
  "street": "详细地址",
  "door_number": "门牌号",
  "is_default": 0
}
```

#### PUT /address/{id}
更新收货地址

#### DELETE /address/{id}
删除收货地址

#### PUT /address/{id}/default
设置默认地址

---

### 2.5 订单相关

#### GET /order
获取订单列表

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认10 |
| status | int | 否 | 订单状态筛选 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "order_no": "ABCDEFGHIJKLMN0001",
      "status": 5,
      "status_text": "已完成",
      "total_amount": "50.00",
      "amount": "50.00",
      "goods_num": 2,
      "pay_mode": "微信支付",
      "created_at": 1588936782,
      "payed_at": 1588936805,
      "completed_time": "2020-05-08 19:25:39",
      "productioned_time": "2020-05-08 19:24:37",
      "postscript": "打包",
      "sort_num": "8093",
      "typeCate": 1,
      "coupon_amount": 0,
      "store": {
        "name": "福永同泰时代城店",
        "address": "广东省深圳市宝安区...",
        "mobile": "075523224859"
      },
      "goods": [
        {
          "name": "霸气葡萄",
          "number": 1,
          "price": "28.00",
          "amount": "28.00",
          "property": "去冰,标准糖",
          "image": "https://example.com/goods.jpg"
        }
      ],
      "discount": [
        {
          "name": "茶饮满二赠一券",
          "amount": "28.00",
          "method": "coupon"
        }
      ]
    }
  ]
}
```

#### POST /order
创建订单

**请求参数**
```json
{
  "store_id": 1,
  "type_cate": 1,
  "address_id": 1,
  "remark": "打包",
  "coupon_id": null,
  "goods_list": [
    {
      "goods_id": 65825,
      "number": 1,
      "property": "去冰,标准糖"
    }
  ]
}
```

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": 1,
    "order_no": "ABCDEFGHIJKLMN0001",
    "amount": "50.00"
  }
}
```

#### GET /order/{id}
获取订单详情

#### PUT /order/{id}/cancel
取消订单

#### PUT /order/{id}/pay
支付订单

#### GET /order/{id}/progress
获取订单制作进度

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": 2,
    "status_text": "制作中",
    "progress": [
      { "step": "已下单", "time": "2020-05-08 19:20:05", "done": true },
      { "step": "制作中", "time": "2020-05-08 19:22:37", "done": true },
      { "step": "已完成", "time": null, "done": false }
    ],
    "sort_num": "8093"
  }
}
```

---

### 2.6 优惠券相关

#### GET /coupon
获取优惠券列表

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 筛选类型: all-全部 1-茶饮券 2-酒屋券 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "couponId": "1",
      "title": "生日免费券",
      "couponExplain": "<p>1. 在有效期内...</p>",
      "imageUrl": "https://example.com/coupon.jpg",
      "discountAmount": null,
      "discountUnit": 1,
      "beginAt": "2020-05-10 00:00:00",
      "endAt": "2020-06-08 23:59:59",
      "useTimeScope": [{"begin": "00:00:00", "end": "23:59:59"}],
      "couponType": 1,
      "sellerName": "奈雪の茶"
    }
  ]
}
```

#### POST /coupon/exchange
兑换优惠券

**请求参数**
```json
{
  "code": "兑换码"
}
```

#### GET /coupon/available
获取可用优惠券

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| amount | decimal | 是 | 订单金额 |

---

### 2.7 积分相关

#### GET /points
获取积分概况

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalPoints": 487,
    "foreverPoints": 0,
    "soonExpiredPoints": 0,
    "expiredTime": null
  }
}
```

#### GET /points/flow
获取积分流水

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "happenedDate": "2020-05-11",
      "changeType": 1,
      "changeNum": 1,
      "reason": "积分签到奖励",
      "sourceType": 5,
      "sellerName": "奈雪の茶",
      "createdAt": "2020-05-11 00:17:47"
    }
  ]
}
```

---

### 2.8 签到相关

#### GET /attendance/rule
获取签到规则

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "points": 1, "day_name": 1, "is_day": 1 },
    { "points": 1, "day_name": 2, "is_day": 0 },
    { "points": 10, "day_name": 7, "is_day": 0 }
  ]
}
```

#### GET /attendance/today
获取今日签到状态

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "is_attendance": 0,
    "total_points": 0,
    "attendance_points": 1,
    "attendance_category": 1,
    "attendance_continuity_day": 1,
    "list": [
      { "attendance_day": 1, "coupon_name": "", "coupon_id": "0", "status": 0 }
    ]
  }
}
```

#### POST /attendance/sign
签到

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "points": 1,
    "continuous_day": 1,
    "total_points": 488
  }
}
```

#### GET /attendance/history
获取签到历史

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": "1",
      "date": "2020-04-25",
      "attendance_point": 1,
      "reward_days": 1,
      "store_id": 1
    }
  ]
}
```

---

### 2.9 积分商城相关

#### GET /points/goods
获取积分商品列表

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category | string | 否 | 分类名称 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "奈雪好券": [
      {
        "id": 574,
        "goods_name": "软欧包免费券",
        "points_price": 800,
        "amount": "0.00",
        "exchange_type": 1,
        "goods_stock": 99665,
        "exchanged_num": 1241,
        "img": ["https://example.com/goods.jpg"],
        "exchange_desc": "<p>兑换规则...</p>",
        "goods_type": 2
      }
    ],
    "奈雪好物": [],
    "奈雪联名": [],
    "奈雪好茶": []
  }
}
```

#### POST /points/exchange
积分兑换

**请求参数**
```json
{
  "goods_id": 574,
  "num": 1
}
```

---

### 2.10 储值相关

#### GET /recharge/card
获取储值卡列表

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1948,
      "name": "100元",
      "value": "100.00",
      "sell_price": "100.00",
      "desc": "1. 储值成功后，不可退款...",
      "image": "https://example.com/card.jpg",
      "sales": 314,
      "status": 1,
      "gifts": []
    }
  ]
}
```

#### POST /recharge
会员储值

**请求参数**
```json
{
  "card_id": 1948,
  "pay_mode": "wechat"
}
```

---

### 2.11 礼品卡相关

#### GET /gift-card
获取礼品卡分类

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "title": "奈雪の茶心意卡券购买及使用规则",
    "content": "<p>1.发售渠道...</p>",
    "img": "https://example.com/banner.jpg",
    "show_type": 1,
    "banner_activity_name": "拥抱同一份热爱",
    "banner_activity_id": 38,
    "category_list": [
      {
        "id": 41,
        "name": "送TA六一限定卡",
        "activityIds": "41,42",
        "themesList": [
          {
            "activityId": 41,
            "activityName": "梦回童年六一玩趣",
            "activityCode": "474613760767721473",
            "imageUrls": ["https://example.com/theme.jpg"]
          }
        ]
      }
    ]
  }
}
```

---

### 2.12 轮播图相关

#### GET /banner
获取轮播图

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| position | string | 否 | 位置，默认home |

---

## 三、错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 缺少必填参数 |
| 2001 | 未登录 |
| 2002 | 登录已过期 |
| 3001 | 会员不存在 |
| 3002 | 积分不足 |
| 3003 | 优惠券不可用 |
| 4001 | 订单不存在 |
| 4002 | 订单状态错误 |
| 4003 | 库存不足 |
| 5001 | 商品不存在 |
| 5002 | 商品已下架 |
| 6001 | 地址不存在 |
| 9001 | 系统错误 |

---

## 四、订单状态说明

| 状态码 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 制作中 |
| 3 | 已完成 |
| 4 | 已取消 |
| 5 | 退款中 |
| 6 | 已退款 |

---

## 五、会员等级说明

| 等级 | 名称 | 成长值要求 |
|------|------|-----------|
| 1 | V1 | 0 |
| 2 | V2 | 500 |
| 3 | V3 | 2000 |
| 4 | V4 | 5000 |
| 5 | V5 | 15000 |
| 6 | V6 | 50000 |
