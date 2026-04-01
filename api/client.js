/**
 * =============================================================================
 * 奈雪的茶小程序 - 前端 API 客户端（备选版本）
 * =============================================================================
 *
 * 【文件说明】
 *   本文件是 api/index.js 的备选版本，功能完全相同
 *   如果项目不需要详细的注释，可以直接使用 index.js
 *
 * 【功能说明】
 *   - Mock 模式：使用本地模拟数据开发，无需后端支持
 *   - 真实 API 模式：对接后端 Spring Boot + SSM 服务
 *   - JWT Token 自动认证管理
 *   - 统一的错误处理和响应处理
 *
 * 【使用方式】
 *   import api, { wxLogin, getMemberInfo, ... } from '@/api/client.js'
 *
 * 【与 index.js 的区别】
 *   - index.js: 包含完整的中文注释和文档
 *   - client.js: 功能相同但注释较少
 *
 * =============================================================================
 */

// ===================== 模拟数据导入 ========================================

/**
 * 导入所有模块的模拟数据
 * 这些数据用于 Mock 模式下的开发测试
 */
import packages from './packages'             // 券包模拟数据
import store from './store'                   // 门店模拟数据
import goods from './goods'                   // 商品模拟数据
import levelBenefits from './level-benefits'  // 等级权益模拟数据
import member from './member'                 // 会员模拟数据
import rechargeCards from './rechargeCards'   // 储值卡模拟数据
import addresses from './addresses'            // 地址模拟数据
import attendance from './attendance'          // 签到规则模拟数据
import customPoints from './custom-points'    // 积分模拟数据
import pointsMall from './points-mall'        // 积分商城模拟数据
import attendanceList from './attendance-list' // 签到历史模拟数据
import todayAttendance from './today-attendance' // 今日签到模拟数据
import orders from './orders'                 // 订单模拟数据
import customerCoupons from './customer-coupons' // 优惠券模拟数据
import giftCards from './gift-cards'          // 礼品卡模拟数据

// ===================== 配置区 ========================================

/**
 * MOCK_MODE - 是否使用模拟数据模式
 * - true: 使用本地模拟数据，响应快速，适合 UI 开发
 * - false: 请求真实后端 API，需要启动后端服务
 *
 * 【开发阶段】设置为 true
 * 【联调阶段】设置为 false
 */
const MOCK_MODE = true

/**
 * BASE_URL - 后端 API 服务器地址
 *
 * 【本地开发】
 *   http://localhost:8080/api
 *   - Spring Boot 默认端口 8080
 *   - context-path 配置为 /api
 *
 * 【生产环境】
 *   https://api.naixue.com/api
 *   - 需要配置合法的 HTTPS 域名
 */
const BASE_URL = 'http://localhost:8080/api'

/**
 * Storage Keys - 本地存储的 Key 名称
 * 统一管理存储 key，便于维护和修改
 *
 * 【Token 存储】
 *   auth_token: JWT 认证令牌
 *   auth_token_expires: Token 过期时间戳（毫秒）
 *
 * 【用户信息存储】
 *   user_info: 用户基本信息（customerId, nickname, avatar 等）
 */
const TOKEN_KEY = 'auth_token'              // Token 存储键
const TOKEN_EXPIRES_KEY = 'auth_token_expires' // Token 过期时间键
const USER_INFO_KEY = 'user_info'           // 用户信息存储键

// ===================== 模拟数据容器 ========================================

/**
 * mockData - 所有模拟数据的统一容器
 *
 * 【数据结构】
 *   key: API 名称
 *   value: 对应的模拟数据
 *
 * 【使用场景】
 *   只有在 MOCK_MODE = true 时才会使用
 */
const mockData = {
  packages,            // 券包数据
  store,               // 门店数据
  goods,               // 商品数据
  levelBenefits,       // 等级权益数据
  member,              // 会员数据
  rechargeCards,       // 储值卡数据
  addresses,           // 地址数据
  attendance,          // 签到规则数据
  customPoints,        // 积分数据
  pointsMall,         // 积分商城数据
  attendanceList,      // 签到历史数据
  todayAttendance,     // 今日签到数据
  orders,              // 订单数据
  customerCoupons,     // 优惠券数据
  giftCards            // 礼品卡数据
}

// ===================== 认证相关方法 ========================================

/**
 * mockLogin - 模拟登录（Mock 模式专用）
 *
 * 【功能说明】
 *   生成一个假的 Token 和用户信息，用于模拟登录流程
 *
 * 【返回值】
 *   {
 *     token: 'mock_token_' + 时间戳,
 *     customerId: '343400246943295100',
 *     nickname: '微信用户',
 *     avatar: '/static/images/mine/default.png',
 *     mobilePhone: '18666600000'
 *   }
 *
 * 【存储操作】
 *   - 将 token 存入 storage
 *   - 将用户信息存入 storage
 */
function mockLogin() {
  // 生成假的 Token
  const mockToken = 'mock_token_' + Date.now()

  // 模拟用户信息
  const mockUserInfo = {
    customerId: '343400246943295100', // 模拟会员ID
    nickname: '微信用户',               // 模拟昵称
    avatar: '/static/images/mine/default.png', // 模拟头像
    mobilePhone: '18666600000'         // 模拟手机号
  }

  // 存入 storage
  uni.setStorageSync(TOKEN_KEY, mockToken)
  uni.setStorageSync(USER_INFO_KEY, mockUserInfo)

  // 返回登录结果
  return { token: mockToken, ...mockUserInfo }
}

/**
 * isTokenValid - 检查 Token 是否有效
 *
 * 【功能说明】
 *   验证存储的 Token 是否存在且未过期
 *
 * 【检查逻辑】
 *   1. 检查 token 是否存在
 *   2. 检查 token 是否过期（与 expires 时间比较）
 *
 * 【返回值】
 *   true: Token 有效
 *   false: Token 不存在或已过期
 */
function isTokenValid() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const expires = uni.getStorageSync(TOKEN_EXPIRES_KEY)

  // Token 不存在
  if (!token) return false

  // Token 已过期
  if (expires && Date.now() > expires) {
    clearAuth()
    return false
  }

  return true
}

/**
 * clearAuth - 清除认证信息
 *
 * 【功能说明】
 *   退出登录或 Token 过期时调用，清除所有认证相关存储
 *
 * 【清除内容】
 *   - auth_token: JWT 令牌
 *   - auth_token_expires: 过期时间
 *   - user_info: 用户信息
 */
function clearAuth() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(TOKEN_EXPIRES_KEY)
  uni.removeStorageSync(USER_INFO_KEY)
}

/**
 * getAuthHeader - 获取认证请求头
 *
 * 【功能说明】
 *   构建带有 JWT Token 的请求头
 *
 * 【返回值】
 *   { Authorization: 'Bearer <token>' }
 *   或
 *   {}（无 Token 时）
 *
 * 【使用场景】
 *   所有需要认证的 API 请求都需要调用此方法
 */
function getAuthHeader() {
  const token = uni.getStorageSync(TOKEN_KEY)

  // 构建 Bearer Token 格式的 Authorization 头
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ===================== 响应处理 ========================================

/**
 * handleResponse - 处理后端响应
 *
 * 【功能说明】
 *   统一处理响应，根据 code 判断成功或失败
 *
 * 【参数说明】
 *   @param {object} result - 后端返回的完整响应
 *   @param {function} reject - Promise reject 方法
 *
 * 【返回值】
 *   code === 0 时返回 result.data
 *   其他情况返回 undefined
 *
 * 【错误码分类】
 *   2001/2002: 认证错误（未登录/Token过期）
 *   其他: 业务错误
 */
function handleResponse(result, reject) {
  // 成功：code === 0
  if (result.code === 0) {
    return result.data
  }
  // 未登录或登录过期：code === 2001 或 2002
  else if (result.code === 2001 || result.code === 2002) {
    // 清除过期的认证信息
    clearAuth()

    // 提示用户
    uni.showToast({
      title: result.message || '请先登录',
      icon: 'none'
    })

    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)

    reject(new Error(result.message))
  }
  // 其他业务错误
  else {
    uni.showToast({
      title: result.message || '请求失败',
      icon: 'none'
    })
    reject(new Error(result.message))
  }
}

// ===================== URL 构建 ========================================

/**
 * buildUrl - 根据 API 名称构建完整 URL
 *
 * 【功能说明】
 *   将简化的 API 名称映射为完整的 RESTful URL
 *
 * 【URL 映射说明】
 *   对于带参数的 URL（如 /order/{id}/pay），使用函数返回
 *
 * 【返回值示例】
 *   buildUrl('member.login') → '/member/login'
 *   buildUrl('order.detail', {id: 123}) → '/order/123'
 */
function buildUrl(name, params) {
  /**
   * URL 映射表
   *
   * ===== 会员模块 =====
   * 'member.login': POST /member/login - 微信登录
   * member: GET/PUT /member/info - 获取/更新会员信息
   *
   * ===== 门店模块 =====
   * store: GET /store - 门店信息
   *
   * ===== 商品模块 =====
   * goods: GET /goods - 商品列表
   *
   * ===== 订单模块 =====
   * orders: GET /order - 订单列表
   * order.create: POST /order - 创建订单
   * order.detail: GET /order/{id} - 订单详情
   * order.pay: PUT /order/{id}/pay - 支付订单
   * order.cancel: PUT /order/{id}/cancel - 取消订单
   * order.progress: GET /order/{id}/progress - 订单进度
   *
   * ===== 地址模块 =====
   * addresses: GET /address - 地址列表
   * address.create: POST /address - 添加地址
   * address.update: PUT /address/{id} - 更新地址
   * address.delete: DELETE /address/{id} - 删除地址
   * address.setDefault: PUT /address/{id}/default - 设置默认地址
   *
   * ===== 优惠券模块 =====
   * customerCoupons: GET /coupon - 我的优惠券
   * coupon.available: GET /coupon/available - 可用优惠券
   * coupon.exchange: POST /coupon/exchange - 兑换优惠券
   *
   * ===== 积分模块 =====
   * customPoints: GET /points - 积分信息
   * points.flow: GET /points/flow - 积分流水
   *
   * ===== 签到模块 =====
   * attendance: GET /attendance/rule - 签到规则
   * attendance.sign: POST /attendance/sign - 签到
   * attendanceList: GET /attendance/history - 签到历史
   * todayAttendance: GET /attendance/today - 今日签到状态
   *
   * ===== 积分商城模块 =====
   * pointsMall: GET /points/goods - 积分商城商品
   * points.exchange: POST /points/exchange - 积分兑换
   *
   * ===== 储值模块 =====
   * rechargeCards: GET /recharge/card - 储值卡列表
   * recharge: POST /recharge - 储值
   *
   * ===== 礼品卡模块 =====
   * giftCards: GET /gift-card - 礼品卡列表
   *
   * ===== 券包模块 =====
   * packages: GET /packages - 券包列表
   *
   * ===== 等级权益模块 =====
   * levelBenefits: GET /level-benefits - 等级权益
   */
  const urlMap = {
    // 会员模块
    'member.login': '/member/login',
    member: '/member/info',

    // 门店模块
    store: '/store',

    // 商品模块
    goods: '/goods',

    // 订单模块
    orders: '/order',
    'order.create': '/order',
    'order.detail': (p) => `/order/${p.id}`,
    'order.pay': (p) => `/order/${p.id}/pay`,
    'order.cancel': (p) => `/order/${p.id}/cancel`,
    'order.progress': (p) => `/order/${p.id}/progress`,

    // 地址模块
    addresses: '/address',
    'address.create': '/address',
    'address.update': (p) => `/address/${p.id}`,
    'address.delete': (p) => `/address/${p.id}`,
    'address.setDefault': (p) => `/address/${p.id}/default`,

    // 优惠券模块
    customerCoupons: '/coupon',
    'coupon.available': '/coupon/available',
    'coupon.exchange': '/coupon/exchange',

    // 积分模块
    customPoints: '/points',
    'points.flow': '/points/flow',

    // 签到模块
    attendance: '/attendance/rule',
    attendanceList: '/attendance/history',
    todayAttendance: '/attendance/today',
    'attendance.sign': '/attendance/sign',

    // 积分商城模块
    pointsMall: '/points/goods',
    'points.exchange': '/points/exchange',

    // 储值模块
    rechargeCards: '/recharge/card',
    recharge: '/recharge',

    // 礼品卡模块
    giftCards: '/gift-card',

    // 券包模块
    packages: '/packages',

    // 等级权益模块
    levelBenefits: '/level-benefits'
  }

  const urlBuilder = urlMap[name]

  // 函数式 URL 构建（如带 ID 的路径）
  if (typeof urlBuilder === 'function') {
    return urlBuilder(params)
  }

  // 字符串直接返回，默认使用 / + name
  return urlBuilder || `/${name}`
}

// ===================== 核心 API 方法 ========================================

/**
 * api - GET 请求主方法
 *
 * 【功能说明】
 *   小程序 API 统一入口，处理所有 GET 请求
 *
 * 【参数说明】
 *   @param {string} name - API 名称
 *   @param {object} params - URL 查询参数（可选）
 *
 * 【返回值】
 *   Promise 对象，成功时 resolve 返回 data
 *
 * 【使用示例】
 *   const store = await api('store')
 *   const goods = await api('goods', { categoryId: 1 })
 */
export default function api(name, params = {}) {
  return new Promise(async (resolve, reject) => {
    // Mock 模式
    if (MOCK_MODE) {
      if (name === 'member.login') {
        setTimeout(() => {
          resolve(mockLogin())
        }, 300)
      } else {
        setTimeout(() => {
          resolve(mockData[name])
        }, 300)
      }
    }
    // 真实 API 模式
    else {
      try {
        const header = getAuthHeader()
        const url = buildUrl(name, params)

        const response = await uni.request({
          url: `${BASE_URL}${url}`,
          method: 'GET',
          header,
          data: params
        })

        const result = response.data
        const data = handleResponse(result, reject)
        if (data !== undefined) {
          resolve(data)
        }
      } catch (error) {
        console.error(`API [${name}] 请求失败:`, error)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(error)
      }
    }
  })
}

// ===================== 认证相关导出方法 ========================================

/**
 * saveLoginData - 保存登录数据
 *
 * 【功能说明】
 *   登录成功后调用，将 Token 和用户信息存入 storage
 *
 * 【参数说明】
 *   @param {object} loginData - 登录返回的数据
 *
 * 【后端返回格式】
 *   {
 *     token: 'eyJhbGciOiJIUzI1NiJ9...',
 *     tokenType: 'Bearer',
 *     expiresIn: 604800,
 *     customerId: '343400246943295100',
 *     nickname: '张三',
 *     avatar: 'https://...',
 *     mobilePhone: '13800138000',
 *     isNewMember: false
 *   }
 *
 * 【使用示例】
 *   const loginResult = await wxLogin(code)
 *   saveLoginData(loginResult)
 */
export function saveLoginData(loginData) {
  const { token, expiresIn, ...userInfo } = loginData

  // 存储 Token
  uni.setStorageSync(TOKEN_KEY, token)

  // 计算并存储过期时间
  if (expiresIn) {
    const expiresTime = Date.now() + expiresIn * 1000
    uni.setStorageSync(TOKEN_EXPIRES_KEY, expiresTime)
  }

  // 存储用户信息
  uni.setStorageSync(USER_INFO_KEY, userInfo)
}

/**
 * getUserInfo - 获取当前用户信息
 *
 * 【返回值】
 *   用户信息对象 或 null
 *
 * 【使用示例】
 *   const userInfo = getUserInfo()
 *   if (userInfo) console.log(userInfo.nickname)
 */
export function getUserInfo() {
  return uni.getStorageSync(USER_INFO_KEY) || null
}

/**
 * getToken - 获取当前 Token
 *
 * 【返回值】
 *   Token 字符串 或 null
 */
export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || null
}

/**
 * isLogin - 检查是否已登录
 *
 * 【返回值】
 *   true: 已登录且 Token 有效
 *   false: 未登录或 Token 已过期
 */
export function isLogin() {
  return isTokenValid()
}

/**
 * logout - 退出登录
 *
 * 【功能说明】
 *   清除所有认证信息，跳转到登录页
 */
export function logout() {
  clearAuth()
  uni.reLaunch({ url: '/pages/login/login' })
}

// ===================== POST 请求 ========================================

/**
 * postApi - POST 请求方法
 *
 * 【功能说明】
 *   处理所有 POST 请求，如登录、创建订单等
 *
 * 【参数说明】
 *   @param {string} name - API 名称
 *   @param {object} data - 请求体数据
 *
 * 【使用示例】
 *   const loginResult = await postApi('member.login', { code: 'xxx' })
 *   const order = await postApi('order.create', orderData)
 */
export function postApi(name, data = {}) {
  return new Promise(async (resolve, reject) => {
    // Mock 模式
    if (MOCK_MODE) {
      if (name === 'member.login') {
        setTimeout(() => {
          resolve(mockLogin())
        }, 300)
      } else {
        setTimeout(() => {
          resolve({ code: 0, message: 'success', data: {} })
        }, 300)
      }
    }
    // 真实 API 模式
    else {
      try {
        const header = getAuthHeader()
        header['Content-Type'] = 'application/json'

        const response = await uni.request({
          url: `${BASE_URL}${buildUrl(name, data)}`,
          method: 'POST',
          header,
          data
        })

        const result = response.data
        const responseData = handleResponse(result, reject)
        if (responseData !== undefined) {
          resolve(responseData)
        }
      } catch (error) {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(error)
      }
    }
  })
}

// ===================== PUT 请求 ========================================

/**
 * putApi - PUT 请求方法
 *
 * 【功能说明】
 *   处理所有 PUT 请求，用于更新资源
 *
 * 【参数说明】
 *   @param {string} name - API 名称
 *   @param {string} id - 资源 ID
 *   @param {object} data - 请求体数据
 *
 * 【RESTful 风格】
 *   PUT /order/{id} - 更新指定订单
 *   PUT /address/{id} - 更新指定地址
 *
 * 【使用示例】
 *   await putApi('order.pay', '123456', { payMode: 'wechat' })
 */
export function putApi(name, id, data = {}) {
  return requestApi('PUT', name, id, data)
}

// ===================== DELETE 请求 ========================================

/**
 * deleteApi - DELETE 请求方法
 *
 * 【功能说明】
 *   处理所有 DELETE 请求，用于删除资源
 *
 * 【参数说明】
 *   @param {string} name - API 名称
 *   @param {string} id - 资源 ID
 *
 * 【RESTful 风格】
 *   DELETE /address/{id} - 删除指定地址
 *
 * 【使用示例】
 *   await deleteApi('address.delete', '100')
 */
export function deleteApi(name, id) {
  return requestApi('DELETE', name, id, {})
}

// ===================== requestApi - 通用请求方法 ========================================

/**
 * requestApi - PUT/DELETE 通用请求方法
 *
 * 【功能说明】
 *   PUT 和 DELETE 请求的公共实现
 *
 * 【参数说明】
 *   @param {string} method - HTTP 方法（PUT 或 DELETE）
 *   @param {string} name - API 名称
 *   @param {string} id - 资源 ID
 *   @param {object} data - 请求体数据
 *
 * 【私有方法】
 *   本文件外部不应直接调用此方法，请使用 putApi() 或 deleteApi()
 */
function requestApi(method, name, id, data) {
  return new Promise(async (resolve, reject) => {
    // Mock 模式
    if (MOCK_MODE) {
      setTimeout(() => {
        resolve({ code: 0, message: 'success', data: {} })
      }, 300)
    }
    // 真实 API 模式
    else {
      try {
        const header = getAuthHeader()
        header['Content-Type'] = 'application/json'

        // 构建 URL
        const baseUrl = buildUrl(name, { id })
        const url = `${BASE_URL}${baseUrl}`

        const response = await uni.request({
          url,
          method,
          header,
          data
        })

        const result = response.data
        const responseData = handleResponse(result, reject)
        if (responseData !== undefined) {
          resolve(responseData)
        }
      } catch (error) {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(error)
      }
    }
  })
}

// ===================== 业务接口封装（推荐使用）================================

/**
 * =============================================================================
 * 以下是封装好的业务 API 方法
 * 相比直接调用 api()，这些方法更直观，更容易理解业务含义
 * =============================================================================
 */

/**
 * wxLogin - 微信登录
 *
 * 【功能说明】
 *   调用后端微信登录接口，用 code 换取 session
 *
 * 【参数说明】
 *   @param {string} code - 微信授权码（通过 wx.login() 获取）
 *   @param {string} encryptedData - 加密数据（可选）
 *   @param {string} iv - 加密向量（可选）
 *
 * 【前置条件】
 *   先调用 wx.login() 获取 code
 *
 * 【使用示例】
 *   wx.login({
 *     success: async (res) => {
 *       const loginData = await wxLogin(res.code)
 *       saveLoginData(loginData)
 *     }
 *   })
 */
export function wxLogin(code, encryptedData, iv) {
  return postApi('member.login', {
    code,
    encryptedData,
    iv
  })
}

/**
 * getMemberInfo - 获取会员信息
 *
 * 【功能说明】
 *   获取当前登录会员的详细信息
 *
 * 【需要认证】
 *   是
 *
 * 【使用示例】
 *   const member = await getMemberInfo()
 */
export function getMemberInfo() {
  return api('member')
}

/**
 * updateMemberInfo - 更新会员信息
 *
 * 【参数说明】
 *   @param {string} nickname - 昵称
 *   @param {string} avatar - 头像 URL
 *   @param {number} gender - 性别（0-女 1-男）
 *   @param {string} birthday - 生日（格式：YYYY-MM-DD）
 */
export function updateMemberInfo(nickname, avatar, gender, birthday) {
  return putApi('member.info', null, {
    nickname,
    avatar,
    gender,
    birthday
  })
}

/**
 * getStoreList - 获取门店列表
 *
 * 【参数说明】
 *   @param {string} longitude - 经度（可选）
 *   @param {string} latitude - 纬度（可选）
 *
 * 【需要认证】
 *   否，公开接口
 */
export function getStoreList(longitude, latitude) {
  return api('store', { longitude, latitude })
}

/**
 * getGoodsList - 获取商品列表
 *
 * 【参数说明】
 *   @param {object} params - 查询参数 { categoryId }
 *
 * 【需要认证】
 *   否，公开接口
 */
export function getGoodsList(params = {}) {
  return api('goods', params)
}

/**
 * getOrderList - 获取订单列表
 *
 * 【参数说明】
 *   @param {object} params - { status, page, pageSize }
 *
 * 【需要认证】
 *   是
 */
export function getOrderList(params = {}) {
  return api('orders', params)
}

/**
 * getOrderDetail - 获取订单详情
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 */
export function getOrderDetail(orderId) {
  return api('order.detail', { id: orderId })
}

/**
 * createOrder - 创建订单
 *
 * 【参数说明】
 *   @param {object} orderData - 订单数据
 *
 * 【订单数据格式】
 *   {
 *     storeId: 1,
 *     typeCate: 1,
 *     goodsList: [{ goodsId: 1, number: 1, property: '少糖' }],
 *     postscript: '备注'
 *   }
 */
export function createOrder(orderData) {
  return postApi('order.create', orderData)
}

/**
 * payOrder - 支付订单
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 *   @param {string} payMode - 支付方式
 */
export function payOrder(orderId, payMode) {
  return putApi('order.pay', orderId, { payMode })
}

/**
 * cancelOrder - 取消订单
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 *   @param {string} reason - 取消原因
 */
export function cancelOrder(orderId, reason) {
  return putApi('order.cancel', orderId, { reason })
}

/**
 * getCouponList - 获取优惠券列表
 *
 * 【参数说明】
 *   @param {object} params - { status } 0-未使用 1-已使用 2-已过期
 */
export function getCouponList(params = {}) {
  return api('customerCoupons', params)
}

/**
 * getAvailableCoupons - 获取可用优惠券
 *
 * 【参数说明】
 *   @param {object} params - { totalAmount }
 */
export function getAvailableCoupons(params = {}) {
  return api('coupon.available', params)
}

/**
 * exchangeCoupon - 兑换优惠券
 *
 * 【参数说明】
 *   @param {string} couponId - 优惠券ID或兑换码
 */
export function exchangeCoupon(couponId) {
  return postApi('coupon.exchange', { couponId })
}

/**
 * getPoints - 获取积分信息
 *
 * 【使用示例】
 *   const points = await getPoints()
 */
export function getPoints() {
  return api('customPoints')
}

/**
 * getPointsFlow - 获取积分流水
 *
 * 【参数说明】
 *   @param {object} params - { page, pageSize }
 */
export function getPointsFlow(params = {}) {
  return api('points.flow', params)
}

/**
 * getAttendanceRule - 获取签到规则
 *
 * 【使用示例】
 *   const rule = await getAttendanceRule()
 */
export function getAttendanceRule() {
  return api('attendance')
}

/**
 * getAttendanceHistory - 获取签到历史
 *
 * 【参数说明】
 *   @param {object} params - { page, pageSize }
 */
export function getAttendanceHistory(params = {}) {
  return api('attendanceList', params)
}

/**
 * getTodayAttendance - 今日签到状态
 *
 * 【使用示例】
 *   const today = await getTodayAttendance()
 */
export function getTodayAttendance() {
  return api('todayAttendance')
}

/**
 * signIn - 签到
 *
 * 【使用示例】
 *   const result = await signIn()
 */
export function signIn() {
  return postApi('attendance.sign')
}

/**
 * getPointsMallGoods - 获取积分商城商品
 *
 * 【参数说明】
 *   @param {object} params - { page, pageSize }
 */
export function getPointsMallGoods(params = {}) {
  return api('pointsMall', params)
}

/**
 * exchangePointsGoods - 积分兑换
 *
 * 【参数说明】
 *   @param {string} goodsId - 商品ID
 *   @param {number} quantity - 数量
 */
export function exchangePointsGoods(goodsId, quantity) {
  return postApi('points.exchange', { goodsId, quantity })
}

/**
 * getRechargeCardList - 获取储值卡列表
 */
export function getRechargeCardList() {
  return api('rechargeCards')
}

/**
 * recharge - 储值
 *
 * 【参数说明】
 *   @param {string} cardId - 储值卡ID
 *   @param {number} amount - 金额
 *   @param {string} payMode - 支付方式
 */
export function recharge(cardId, amount, payMode) {
  return postApi('recharge', { cardId, amount, payMode })
}

/**
 * getGiftCardList - 获取礼品卡列表
 */
export function getGiftCardList(params = {}) {
  return api('giftCards', params)
}

/**
 * getPackageList - 获取券包列表
 */
export function getPackageList(params = {}) {
  return api('packages', params)
}

/**
 * getAddressList - 获取收货地址列表
 */
export function getAddressList() {
  return api('addresses')
}

/**
 * addAddress - 添加收货地址
 *
 * 【参数说明】
 *   @param {object} addressData - 地址数据
 *
 * 【地址数据格式】
 *   {
 *     acceptName: '张三',
 *     mobile: '13800138000',
 *     provinceName: '广东省',
 *     cityName: '深圳市',
 *     areaName: '福田区',
 *     street: '海田路28号',
 *     isDefault: true
 *   }
 */
export function addAddress(addressData) {
  return postApi('address.create', addressData)
}

/**
 * updateAddress - 更新收货地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 *   @param {object} addressData - 要更新的数据
 */
export function updateAddress(addressId, addressData) {
  return putApi('address.update', addressId, addressData)
}

/**
 * deleteAddress - 删除收货地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 */
export function deleteAddress(addressId) {
  return deleteApi('address.delete', addressId)
}

/**
 * setDefaultAddress - 设置默认地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 */
export function setDefaultAddress(addressId) {
  return putApi('address.setDefault', addressId, {})
}

/**
 * getLevelBenefits - 获取等级权益
 */
export function getLevelBenefits() {
  return api('levelBenefits')
}
