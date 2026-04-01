/**
 * =============================================================================
 * 奈雪的茶小程序 - API 统一入口
 * =============================================================================
 *
 * 【功能说明】
 *   本文件是小程序所有 API 调用的统一入口，提供：
 *   - Mock 模式：使用本地模拟数据开发，无需后端支持
 *   - 真实 API 模式：对接后端 Spring Boot + SSM 服务
 *   - JWT Token 自动认证管理
 *   - 统一的错误处理和响应处理
 *
 * 【使用方式】
 *   import api, { wxLogin, getMemberInfo, ... } from '@/api/index.js'
 *
 * 【切换模式】
 *   将下方 MOCK_MODE 改为 false 即可切换到真实 API
 *
 * 【认证流程】
 *   1. 调用 wxLogin(code) 获取 Token
 *   2. saveLoginData() 自动保存 Token 和用户信息
 *   3. 后续请求自动携带 Authorization: Bearer <token>
 *   4. Token 过期时自动跳转登录页
 *
 * 【文件结构】
 *   - 配置区：MOCK_MODE、BASE_URL、Storage Keys
 *   - 模拟数据：Mock 模式下使用的数据
 *   - 核心方法：api()、postApi()、putApi()、deleteApi()
 *   - 认证方法：saveLoginData()、getUserInfo()、logout()
 *   - 业务方法：wxLogin()、getMemberInfo() 等便捷封装
 *
 * =============================================================================
 */

// ===================== 模拟数据导入（Mock 模式使用）========================
// 这些是从本地文件导入的模拟数据，用于开发阶段不依赖后端
// 联调时将这些数据替换为真实 API 调用即可

import packages from './packages'           // 券包模拟数据
import store from './store'                 // 门店模拟数据
import goods from './goods'                 // 商品模拟数据
import levelBenefits from './level-benefits' // 等级权益模拟数据
import member from './member'               // 会员模拟数据
import rechargeCards from './rechargeCards'  // 储值卡模拟数据
import addresses from './addresses'          // 地址模拟数据
import attendance from './attendance'        // 签到规则模拟数据
import customPoints from './custom-points'  // 积分模拟数据
import pointsMall from './points-mall'     // 积分商城模拟数据
import attendanceList from './attendance-list' // 签到历史模拟数据
import todayAttendance from './today-attendance' // 今日签到模拟数据
import orders from './orders'               // 订单模拟数据
import customerCoupons from './customer-coupons' // 优惠券模拟数据
import giftCards from './gift-cards'        // 礼品卡模拟数据

// ===================== 配置区（重要：修改此处切换模式）========================
// 【开发阶段】MOCK_MODE = true，使用本地模拟数据
// 【联调阶段】MOCK_MODE = false，对接后端真实 API

/**
 * MOCK_MODE - 是否使用模拟数据模式
 * - true: 使用本地模拟数据，响应快速，适合 UI 开发
 * - false: 请求真实后端 API，需要启动后端服务
 *
 * 【重要】联调测试时必须改为 false
 * 【后端地址】http://localhost:8080/api
 */
const MOCK_MODE = false  // ⚠️ 联调测试时改为 false

/**
 * BASE_URL - 后端 API 服务器地址
 *
 * 【本地开发】
 *   http://localhost:8080/api
 *   Spring Boot 默认端口 8080，context-path 为 /api
 *
 * 【生产环境】
 *   https://api.naixue.com/api
 *   需要配置合法的 HTTPS 域名
 *
 * 【微信开发者工具】
 *   如果提示域名不合法，在「详情」→「本地设置」中勾选
 *   「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」
 */
const BASE_URL = 'http://192.168.46.107:8080/api'

/**
 * Storage Keys - 本地存储的 Key 名称
 * 统一管理存储 key，便于维护和修改
 *
 * 【Token 存储】
 *   auth_token: JWT 认证令牌
 *   auth_token_expires: Token 过期时间戳（毫秒）
 *
 * 【用户信息】
 *   user_info: 用户基本信息（customerId, nickname, avatar 等）
 */
const TOKEN_KEY = 'auth_token'             // Token 存储键
const TOKEN_EXPIRES_KEY = 'auth_token_expires' // Token 过期时间键
const USER_INFO_KEY = 'user_info'          // 用户信息存储键

// ===================== 模拟数据容器 ========================================

/**
 * mockData - 所有模拟数据的统一容器
 *
 * 【数据结构】
 *   key: API 名称（与 buildUrl 中的 urlMap key 对应）
 *   value: 对应的模拟数据
 *
 * 【使用场景】
 *   只有在 MOCK_MODE = true 时才会使用
 */
const mockData = {
  packages,          // 券包数据
  store,             // 门店数据
  goods,             // 商品数据
  levelBenefits,     // 等级权益数据
  member,            // 会员数据
  rechargeCards,     // 储值卡数据
  addresses,         // 地址数据
  attendance,        // 签到规则数据
  customPoints,      // 积分数据
  pointsMall,        // 积分商城数据
  attendanceList,    // 签到历史数据
  todayAttendance,   // 今日签到数据
  orders,            // 订单数据
  customerCoupons,   // 优惠券数据
  giftCards          // 礼品卡数据
}

// ===================== 认证相关方法 ========================================

/**
 * mockLogin - 模拟登录（Mock 模式专用）
 *
 * 【功能说明】
 *   生成一个假的 Token 和用户信息，用于模拟登录流程
 *   联调时应使用真实的 wxLogin() 函数
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
  // 生成假的 Token（实际使用中会被真实 JWT 替换）
  const mockToken = 'mock_token_' + Date.now()

  // 模拟用户信息（可根据需要修改）
  const mockUserInfo = {
    customerId: '343400246943295100', // 模拟会员ID
    nickname: '微信用户',               // 模拟昵称
    avatar: '/static/images/mine/default.png', // 模拟头像
    mobilePhone: '18666600000'         // 模拟手机号
  }

  // 将模拟数据存入 storage（与真实登录流程保持一致）
  uni.setStorageSync(TOKEN_KEY, mockToken)
  uni.setStorageSync(USER_INFO_KEY, mockUserInfo)

  // 返回登录结果（包含 token 和用户信息）
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
 *
 * 【特殊说明】
 *   Token 过期时会自动清除存储的认证信息
 */
function isTokenValid() {
  // 从 storage 读取 Token
  const token = uni.getStorageSync(TOKEN_KEY)

  // 从 storage 读取过期时间
  const expires = uni.getStorageSync(TOKEN_EXPIRES_KEY)

  // 检查 1：Token 不存在
  if (!token) return false

  // 检查 2：Token 已过期
  if (expires && Date.now() > expires) {
    // 过期则清除认证信息
    clearAuth()
    return false
  }

  // Token 存在且未过期
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
 *
 * 【使用场景】
 *   - 用户主动退出登录
 *   - Token 过期被检测到
 *   - 401 未授权错误处理
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
 *   uni.request({ header: getAuthHeader(), ... })
 */
function getAuthHeader() {
  const token = uni.getStorageSync(TOKEN_KEY)

  // 如果有 Token，构建 Bearer Token 格式的 Authorization 头
  // 后端 JwtInterceptor 会解析此请求头
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ===================== 响应处理 ========================================

/**
 * handleError - 错误码对应的错误消息
 *
 * 【数据结构】
 *   key: 错误码（后端返回的 code）
 *   value: 用户友好的错误提示
 *
 * 【错误码分类】
 *   1xxx: 参数错误
 *   2xxx: 认证错误
 *   3xxx: 会员相关错误
 *   4xxx: 订单相关错误
 *   5xxx: 商品相关错误
 *   6xxx: 地址相关错误
 *   9xxx: 系统错误
 *
 * 【使用方式】
 *   handleError(code, message) 会根据 code 显示对应提示
 *   如果后端返回的消息为空，则显示错误码对应的默认消息
 */
const errorMessages = {
  0: '成功',
  1001: '参数错误',
  1002: '业务处理失败',
  2001: '请先登录',
  2002: '登录已过期，请重新登录',
  3001: '数据不存在',
  4001: '余额不足',
  9999: '系统错误'
}

/**
 * handleError - 处理错误并显示提示
 *
 * @param {number} code - 错误码
 * @param {string} message - 错误消息（优先使用）
 *
 * 【逻辑说明】
 *   - 优先使用后端返回的 message
 *   - 如果 message 为空，使用预定义的错误码提示
 *   - 显示 uni.showToast 提示用户
 *
 * 【参数说明】
 *   code: 后端返回的错误码，如 2001、3002 等
 *   message: 后端返回的业务错误消息，如"积分不足"
 */
function handleError(code, message) {
  // 优先使用后端返回的 message，其次使用预定义消息
  const toastMessage = errorMessages[code] || message || '请求失败'

  // 显示错误提示（2秒自动关闭）
  uni.showToast({
    title: toastMessage,
    icon: 'none',   // 不显示图标，只有文字
    duration: 2000  // 2秒后自动关闭
  })
}

// ===================== URL 构建 ========================================

/**
 * buildUrl - 根据 API 名称构建完整 URL
 *
 * 【功能说明】
 *   将简化的 API 名称映射为完整的 RESTful URL
 *   与后端 Controller 的 @RequestMapping 路径保持一致
 *
 * 【URL 映射表结构】
 *   key: 前端使用的 API 名称（简写）
 *   value: 后端实际路径（字符串或函数）
 *
 * 【函数式 URL】
 *   对于带参数的 URL（如 /order/{id}/pay），使用函数返回
 *   例如：'order.detail': (p) => `/order/${p.id}/pay`
 *
 * 【返回值示例】
 *   buildUrl('member.login')      → '/member/login'
 *   buildUrl('order.detail', {id: 123}) → '/order/123'
 *   buildUrl('goods', {categoryId: 1}) → '/goods'
 */
function buildUrl(name, params) {
  /**
   * URL 映射表
   * =================== 会员模块 ===================
   * member.login: POST /member/login - 微信授权登录
   * member: GET/PUT /member/info - 获取/更新会员信息
   *
   * =================== 门店模块 ===================
   * store: GET /store - 获取门店信息
   *
   * =================== 商品模块 ===================
   * goods: GET /goods - 获取商品列表（支持 categoryId 参数）
   *
   * =================== 订单模块 ===================
   * orders: GET /order - 获取订单列表
   * order.create: POST /order - 创建订单
   * order.detail: GET /order/{id} - 订单详情
   * order.pay: PUT /order/{id}/pay - 支付订单
   * order.cancel: PUT /order/{id}/cancel - 取消订单
   * order.progress: GET /order/{id}/progress - 订单进度
   *
   * =================== 地址模块 ===================
   * addresses: GET /address - 获取地址列表
   * address.create: POST /address - 添加地址
   * address.update: PUT /address/{id} - 更新地址
   * address.delete: DELETE /address/{id} - 删除地址
   * address.setDefault: PUT /address/{id}/default - 设置默认地址
   *
   * =================== 优惠券模块 ===================
   * customerCoupons: GET /coupon - 我的优惠券
   * coupon.available: GET /coupon/available - 可用优惠券
   * coupon.exchange: POST /coupon/exchange - 兑换优惠券
   *
   * =================== 积分模块 ===================
   * customPoints: GET /points - 积分信息
   * points.flow: GET /points/flow - 积分流水
   *
   * =================== 签到模块 ===================
   * attendance: GET /attendance/rule - 签到规则
   * attendance.sign: POST /attendance/sign - 签到
   * attendanceList: GET /attendance/history - 签到历史
   * todayAttendance: GET /attendance/today - 今日签到状态
   *
   * =================== 积分商城模块 ===================
   * pointsMall: GET /points/goods - 积分商城商品
   * points.exchange: POST /points/exchange - 积分兑换
   *
   * =================== 储值模块 ===================
   * rechargeCards: GET /recharge/card - 储值卡列表
   * recharge: POST /recharge - 储值
   *
   * =================== 礼品卡模块 ===================
   * giftCards: GET /gift-card - 礼品卡列表
   *
   * =================== 券包模块 ===================
   * packages: GET /packages - 券包列表
   *
   * =================== 等级权益模块 ===================
   * levelBenefits: GET /level-benefits - 等级权益
   */
  const urlMap = {
    // ===== 会员模块 =====
    'member.login': '/member/login',           // POST - 微信登录（需授权）
    'member.wxlogin': '/member/wxlogin',       // POST - 微信一键登录注册（只需code）
    member: '/member/info',                   // GET/PUT - 会员信息

    // ===== 门店模块 =====
    store: '/store',                           // GET - 门店信息

    // ===== 商品模块 =====
    goods: '/goods',                          // GET - 商品列表
    goodsCategory: '/goodsCategory',          // GET - 商品分类列表

    // ===== 订单模块 =====
    orders: '/order',                         // GET/POST - 订单列表/创建订单
    'order.create': '/order',                  // POST - 创建订单（别名）
    'order.detail': (p) => `/order/${p.id}`,   // GET - 订单详情
    'order.pay': (p) => `/order/${p.id}/pay`, // PUT - 支付订单
    'order.cancel': (p) => `/order/${p.id}/cancel`, // PUT - 取消订单
    'order.progress': (p) => `/order/${p.id}/progress`, // GET - 订单进度

    // ===== 地址模块 =====
    addresses: '/address',                     // GET/POST - 地址列表/添加地址
    'address.create': '/address',               // POST - 添加地址（别名）
    'address.update': (p) => `/address/${p.id}`, // PUT - 更新地址
    'address.delete': (p) => `/address/${p.id}`, // DELETE - 删除地址
    'address.setDefault': (p) => `/address/${p.id}/default`, // PUT - 设置默认地址

    // ===== 优惠券模块 =====
    customerCoupons: '/coupon',                // GET - 我的优惠券
    'coupon.available': '/coupon/available',  // GET - 可用优惠券
    'coupon.exchange': '/coupon/exchange',     // POST - 兑换优惠券

    // ===== 积分模块 =====
    customPoints: '/points',                   // GET - 积分信息
    'points.flow': '/points/flow',            // GET - 积分流水

    // ===== 签到模块 =====
    attendance: '/attendance/rule',           // GET - 签到规则
    attendanceList: '/attendance/history',     // GET - 签到历史
    todayAttendance: '/attendance/today',      // GET - 今日签到状态
    'attendance.sign': '/attendance/sign',     // POST - 签到

    // ===== 积分商城模块 =====
    pointsMall: '/points/goods',              // GET - 积分商城商品
    'points.exchange': '/points/exchange',    // POST - 积分兑换

    // ===== 储值模块 =====
    rechargeCards: '/recharge/card',          // GET - 储值卡列表
    recharge: '/recharge',                    // POST - 储值

    // ===== 礼品卡模块 =====
    giftCards: '/gift-card',                  // GET - 礼品卡列表

    // ===== 券包模块 =====
    packages: '/packages',                    // GET - 券包列表

    // ===== 等级权益模块 =====
    levelBenefits: '/level-benefits'          // GET - 等级权益
  }

  // 从映射表获取 URL 构建器
  const urlBuilder = urlMap[name]

  // 如果是函数（如带 ID 的路径），执行函数获取完整 URL
  if (typeof urlBuilder === 'function') {
    return urlBuilder(params)
  }

  // 如果是字符串，直接返回
  // 如果找不到对应的 URL，默认使用 / + name
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
 *   @param {string} name - API 名称（对应 buildUrl 中的 key）
 *   @param {object} params - URL 查询参数（可选）
 *
 * 【返回值】
 *   Promise 对象，成功时 resolve 返回 data，失败时 reject 抛出错误
 *
 * 【执行流程】
 *   1. 判断 MOCK_MODE，决定使用模拟数据还是真实请求
 *   2. Mock 模式：直接从 mockData 返回数据（300ms 延迟模拟网络）
 *   3. 真实模式：构建 URL，发送 uni.request 请求
 *   4. 处理响应：成功返回 data，失权跳转登录页，其他错误显示提示
 *
 * 【使用示例】
 *   // 获取门店信息
 *   const store = await api('store')
 *
 *   // 获取商品列表（带参数）
 *   const goods = await api('goods', { categoryId: 1 })
 */
export default function api(name, params = {}) {
  return new Promise(async (resolve, reject) => {
    // ================ Mock 模式 ================
    if (MOCK_MODE) {
      // 模拟登录特殊处理
      if (name === 'member.login') {
        setTimeout(() => {
          resolve(mockLogin())
        }, 300)
      } else {
        // 其他 API 直接从 mockData 返回
        setTimeout(() => {
          resolve(mockData[name])
        }, 300) // 300ms 延迟模拟网络请求
      }
    }
    // ================ 真实 API 模式 ================
    else {
      try {
        // 构建认证请求头
        const header = getAuthHeader()

        // 构建完整 URL
        const url = buildUrl(name, params)

        console.log(`[API] ${name} → ${BASE_URL}${url}`)

        // 发送请求
        const response = await uni.request({
          url: `${BASE_URL}${url}`, // 拼接 baseURL 和 path
          method: 'GET',            // GET 请求
          header,                   // 认证请求头
          data: params              // 查询参数
        })

        // 调试：打印完整响应
        console.log(`[API] ${name} 响应详情:`, JSON.stringify(response, null, 2))

        // ================ 响应格式校验 ================
        if (!response || typeof response !== 'object') {
          console.error(`[API] ${name} 响应无效:`, response)
          uni.showToast({ title: '服务器响应无效', icon: 'none' })
          reject(new Error('响应无效'))
          return
        }

        // ================ 响应状态码检查 ================
        // 检查 HTTP 状态码
        if (response.statusCode === 401) {
          console.error(`[API] ${name} 认证失败 (401)`)
          clearAuth()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('登录已过期'))
          return
        }

        if (response.statusCode !== 200 && response.statusCode !== undefined) {
          console.error(`[API] ${name} HTTP错误:`, response.statusCode)
          uni.showToast({
            title: `请求失败 (${response.statusCode})`,
            icon: 'none'
          })
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        // 如果 statusCode 为 undefined 但有有效数据，直接使用数据
        // 处理数组格式的响应（部分开发工具会返回数组格式）
        let result
        if (Array.isArray(response)) {
          // 数组格式：response[0] 可能是 null，response[1] 才是真正的响应对象
          const actualResponse = response.find(r => r && typeof r === 'object' && r.statusCode) || response[response.length - 1]
          if (actualResponse && actualResponse.data) {
            result = actualResponse.data
          } else {
            result = actualResponse
          }
        } else {
          result = response.data
        }

        // ================ 响应数据校验 ================
        // 检查响应是否有效
        if (!result || typeof result !== 'object') {
          console.error(`[API] ${name} 响应格式错误:`, result)
          uni.showToast({
            title: '服务器响应格式错误',
            icon: 'none'
          })
          reject(new Error('响应格式错误'))
          return
        }

        console.log(`[API] ${name} 响应:`, result)

        // ================ 响应处理 ================
        // 成功：code === 0
        if (result.code === 0) {
          resolve(result.data)
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

          // 延迟跳转到登录页（等待提示显示）
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)

          reject(new Error(result.message))
        }
        // 其他业务错误
        else {
          handleError(result.code, result.message)
          reject(new Error(result.message))
        }
      }
      // ================ 网络错误处理 ================
      catch (error) {
        console.error(`API [${name}] 请求失败:`, error)

        // 根据错误类型给出提示
        let errorMsg = '网络请求失败'
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络'
          } else if (error.errMsg.includes('abort')) {
            errorMsg = '请求被中断'
          }
        }

        uni.showToast({
          title: errorMsg,
          icon: 'none'
        })

        reject(error)
      }
    }
  })
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
 * 【与 GET 的区别】
 *   - GET: 参数通过 URL query string 传递
 *   - POST: 参数通过请求体 JSON 传递
 *
 * 【使用示例】
 *   // 微信登录
 *   const loginResult = await postApi('member.login', { code: 'xxx' })
 *
 *   // 创建订单
 *   const order = await postApi('order.create', {
 *     storeId: 1,
 *     typeCate: 1,
 *     goodsList: [...]
 *   })
 */
export function postApi(name, data = {}) {
  return new Promise(async (resolve, reject) => {
    // ================ Mock 模式 ================
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
    // ================ 真实 API 模式 ================
    else {
      try {
        // 构建请求头
        const header = getAuthHeader()
        header['Content-Type'] = 'application/json' // POST 需要声明 content-type

        // 构建 URL
        const url = buildUrl(name, data)

        console.log(`[API] ${name} → POST ${BASE_URL}${url}`, data)

        // 发送请求
        const response = await uni.request({
          url: `${BASE_URL}${url}`,
          method: 'POST',
          header,
          data // 请求体
        })

        // 调试：打印完整响应
        console.log(`[API] ${name} 响应详情:`, JSON.stringify(response, null, 2))

        // ================ 响应格式校验 ================
        // 检查响应是否有效
        if (!response || typeof response !== 'object') {
          console.error(`[API] ${name} 响应无效:`, response)
          uni.showToast({ title: '服务器响应无效', icon: 'none' })
          reject(new Error('响应无效'))
          return
        }

        // ================ 响应状态码检查 ================
        if (response.statusCode === 401) {
          console.error(`[API] ${name} 认证失败 (401)`)
          clearAuth()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('登录已过期'))
          return
        }

        if (response.statusCode !== 200 && response.statusCode !== undefined) {
          console.error(`[API] ${name} HTTP错误:`, response.statusCode)
          uni.showToast({
            title: `请求失败 (${response.statusCode})`,
            icon: 'none'
          })
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        // 如果 statusCode 为 undefined 但有有效数据，直接使用数据
        // 处理数组格式的响应（部分开发工具会返回数组格式）
        let result
        if (Array.isArray(response)) {
          console.log(`[API] ${name} 响应是数组，长度:`, response.length)
          // 数组格式：response[0] 可能是 null，response[1] 才是真正的响应对象
          const actualResponse = response.find(r => r && typeof r === 'object' && r.statusCode) || response[response.length - 1]
          console.log(`[API] ${name} 找到的actualResponse:`, actualResponse)
          if (actualResponse && actualResponse.data) {
            result = actualResponse.data
            console.log(`[API] ${name} 从actualResponse.data提取result成功`)
          } else if (actualResponse) {
            result = actualResponse
            console.log(`[API] ${name} 直接使用actualResponse作为result`)
          } else {
            result = null
            console.error(`[API] ${name} 无法从数组中提取有效响应`)
          }
        } else {
          result = response.data
        }

        console.log(`[API] ${name} 最终result:`, JSON.stringify(result, null, 2))

        // ================ 响应数据校验 ================
        if (!result || typeof result !== 'object') {
          console.error(`[API] ${name} 响应格式错误:`, result)
          uni.showToast({
            title: '服务器响应格式错误',
            icon: 'none'
          })
          reject(new Error('响应格式错误'))
          return
        }

        console.log(`[API] ${name} 响应:`, result)

        // 响应处理（与 GET 相同）
        if (result.code === 0) {
          resolve(result.data)
        } else if (result.code === 2001 || result.code === 2002) {
          clearAuth()
          uni.showToast({
            title: result.message || '请先登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error(result.message))
        } else {
          handleError(result.code, result.message)
          reject(new Error(result.message))
        }
      } catch (error) {
        console.error(`[API] ${name} 请求失败:`, error)
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
 *   @param {string} id - 资源 ID（如订单ID、地址ID）
 *   @param {object} data - 请求体数据
 *
 * 【RESTful 风格】
 *   PUT /order/{id} - 更新指定订单
 *   PUT /address/{id} - 更新指定地址
 *
 * 【使用示例】
 *   // 支付订单
 *   await putApi('order.pay', '123456', { payMode: 'wechat' })
 *
 *   // 更新地址
 *   await putApi('address.update', '100', {
 *     acceptName: '张三',
 *     mobile: '13800138000'
 *   })
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
 *   // 删除地址
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
    // ================ Mock 模式 ================
    if (MOCK_MODE) {
      setTimeout(() => {
        resolve({ code: 0, message: 'success', data: {} })
      }, 300)
    }
    // ================ 真实 API 模式 ================
    else {
      try {
        // 构建请求头
        const header = getAuthHeader()
        header['Content-Type'] = 'application/json'

        // 构建 URL（使用函数式 URL 构建处理 /order/{id}/pay 等路径）
        const baseUrl = buildUrl(name, { id })
        const url = `${BASE_URL}${baseUrl}`

        console.log(`[API] ${name} → ${method} ${url}`)

        // 发送请求
        const response = await uni.request({
          url,
          method,    // PUT 或 DELETE
          header,
          data
        })

        // 调试：打印完整响应
        console.log(`[API] ${name} 响应详情:`, JSON.stringify(response, null, 2))

        // ================ 响应格式校验 ================
        if (!response || typeof response !== 'object') {
          console.error(`[API] ${name} 响应无效:`, response)
          uni.showToast({ title: '服务器响应无效', icon: 'none' })
          reject(new Error('响应无效'))
          return
        }

        // ================ 响应状态码检查 ================
        if (response.statusCode === 401) {
          console.error(`[API] ${name} 认证失败 (401)`)
          clearAuth()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('登录已过期'))
          return
        }

        if (response.statusCode !== 200 && response.statusCode !== undefined) {
          console.error(`[API] ${name} HTTP错误:`, response.statusCode)
          uni.showToast({
            title: `请求失败 (${response.statusCode})`,
            icon: 'none'
          })
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        // 如果 statusCode 为 undefined 但有有效数据，直接使用数据
        const result = response.data

        // ================ 响应数据校验 ================
        if (!result || typeof result !== 'object') {
          console.error(`[API] ${name} 响应格式错误:`, result)
          uni.showToast({
            title: '服务器响应格式错误',
            icon: 'none'
          })
          reject(new Error('响应格式错误'))
          return
        }

        // 响应处理（与 GET 相同）
        if (result.code === 0) {
          resolve(result.data)
        } else if (result.code === 2001 || result.code === 2002) {
          clearAuth()
          uni.showToast({
            title: result.message || '请先登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error(result.message))
        } else {
          handleError(result.code, result.message)
          reject(new Error(result.message))
        }
      } catch (error) {
        console.error(`[API] ${name} 请求失败:`, error)
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
 *     token: 'eyJhbGciOiJIUzI1NiJ9...',  // JWT 令牌
 *     tokenType: 'Bearer',               // Token 类型
 *     expiresIn: 604800,                  // 过期时间（秒，7天）
 *     customerId: '343400246943295100',  // 会员ID
 *     nickname: '张三',                    // 昵称
 *     avatar: 'https://...',              // 头像
 *     mobilePhone: '13800138000',        // 手机号
 *     isNewMember: false                 // 是否新会员
 *   }
 *
 * 【存储内容】
 *   - auth_token: JWT 令牌
 *   - auth_token_expires: 过期时间戳
 *   - user_info: 用户信息（去除 token 相关字段）
 *
 * 【使用示例】
 *   const loginResult = await wxLogin(code)
 *   saveLoginData(loginResult)
 */
export function saveLoginData(loginData) {
  // 解构登录数据
  // loginData 来自后端 LoginVO，包含 token 和用户信息
  const { token, expiresIn, ...userInfo } = loginData

  // 1. 存储 Token
  uni.setStorageSync(TOKEN_KEY, token)

  // 2. 计算并存储过期时间
  // expiresIn 单位是秒，需要转换为毫秒
  if (expiresIn) {
    const expiresTime = Date.now() + expiresIn * 1000
    uni.setStorageSync(TOKEN_EXPIRES_KEY, expiresTime)
  }

  // 3. 存储用户信息（排除 token 相关字段）
  // ...userInfo 包含 customerId, nickname, avatar, mobilePhone 等
  uni.setStorageSync(USER_INFO_KEY, userInfo)
}

/**
 * getUserInfo - 获取当前用户信息
 *
 * 【返回值】
 *   用户信息对象 或 null（未登录）
 *   {
 *     customerId: '343400246943295100',
 *     nickname: '张三',
 *     avatar: 'https://...',
 *     mobilePhone: '13800138000'
 *   }
 *
 * 【使用示例】
 *   const userInfo = getUserInfo()
 *   if (userInfo) {
 *     console.log('当前用户:', userInfo.nickname)
 *   }
 */
export function getUserInfo() {
  return uni.getStorageSync(USER_INFO_KEY) || null
}

/**
 * getToken - 获取当前 Token
 *
 * 【返回值】
 *   Token 字符串 或 null（未登录）
 *
 * 【使用场景】
 *   - 手动验证 Token
 *   - 调试时查看 Token
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
 *
 * 【使用场景】
 *   - 页面加载时检查登录状态
 *   - 决定是否显示登录按钮
 *
 * 【示例】
 *   if (!isLogin()) {
 *     uni.showToast({ title: '请先登录' })
 *     return
 *   }
 */
export function isLogin() {
  return isTokenValid()
}

/**
 * logout - 退出登录
 *
 * 【功能说明】
 *   清除所有认证信息，跳转到登录页
 *
 * 【执行操作】
 *   1. clearAuth() - 清除 Token、过期时间、用户信息
 *   2. uni.reLaunch - 关闭所有页面，跳转到登录页
 *
 * 【使用场景】
 *   - 用户点击"退出登录"按钮
 *   - 安全考虑需要切换账号
 */
export function logout() {
  clearAuth()
  uni.reLaunch({ url: '/pages/login/login' })
}

// ===================== 便捷 API 封装（推荐使用）================================

/**
 * =============================================================================
 * 以下是封装好的业务 API 方法，推荐在页面中直接使用
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
 *
 * 【前置条件】
 *   先调用 wx.login() 获取 code：
 *   wx.login({
 *     success: (res) => {
 *       const code = res.code
 *       wxLogin(code)
 *     }
 *   })
 *
 * 【使用示例】
 *   wx.login({
 *     success: async (res) => {
 *       try {
 *         const loginData = await wxLogin(res.code)
 *         saveLoginData(loginData)
 *         console.log('登录成功')
 *       } catch (e) {
 *         console.error('登录失败', e)
 *       }
 *     }
 *   })
 */
export function wxLogin(code) {
  return postApi('member.login', { code })
}

/**
 * wxLoginRegister - 微信一键登录注册
 *
 * 【功能说明】
 *   调用后端微信一键登录注册接口，用 code 换取 session
 *   如果用户不存在，后端自动创建新用户
 *
 * 【参数说明】
 *   @param {string} code - 微信授权码（通过 wx.login() 获取）
 *
 * 【前置条件】
 *   先调用 wx.login() 获取 code
 *
 * 【使用示例】
 *   wx.login({
 *     success: async (res) => {
 *       try {
 *         const loginData = await wxLoginRegister(res.code)
 *         saveLoginData(loginData)
 *         console.log('登录成功')
 *       } catch (e) {
 *         console.error('登录失败', e)
 *       }
 *     }
 *   })
 */
export function wxLoginRegister(code) {
  return postApi('member.wxlogin', { code })
}

/**
 * getMemberInfo - 获取会员信息
 *
 * 【功能说明】
 *   获取当前登录会员的详细信息
 *
 * 【需要认证】
 *   是，需要有效的 Token
 *
 * 【使用示例】
 *   const member = await getMemberInfo()
 *   console.log('会员等级:', member.memberLevel)
 */
export function getMemberInfo() {
  return api('member')
}

/**
 * updateMemberInfo - 更新会员信息
 *
 * 【功能说明】
 *   更新会员的昵称、头像、性别、生日等信息
 *
 * 【参数说明】
 *   @param {string} nickname - 昵称
 *   @param {string} avatar - 头像 URL
 *   @param {number} gender - 性别（0-女 1-男）
 *   @param {string} birthday - 生日（格式：YYYY-MM-DD）
 *
 * 【使用示例】
 *   await updateMemberInfo('新昵称', 'https://...', 1, '1990-01-01')
 */
export function updateMemberInfo(nickname, avatar, gender, birthday) {
  return putApi('member.info', null, { nickname, avatar, gender, birthday })
}

/**
 * getStore - 获取门店信息
 *
 * 【功能说明】
 *   获取门店信息，支持按位置排序
 *
 * 【参数说明】
 *   @param {string} longitude - 经度（可选）
 *   @param {string} latitude - 纬度（可选）
 *
 * 【需要认证】
 *   否，公开接口
 *
 * 【使用示例】
 *   const store = await getStore('114.065927', '22.537361')
 */
export function getStore(longitude, latitude) {
  return api('store', { longitude, latitude }).then(data => {
    // 转换后端字段名为前端需要的格式
    if (!data) return {}
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      tel: data.tel,
      mobile: data.mobile,
      longitude: data.longitude,
      latitude: data.latitude,
      areaName: data.areaName,
      isOpen: data.isOpen,
      isTakeout: data.isTakeout,
      min_price: data.minPrice,
      packing_fee: data.packingFee,
      delivery_cost: data.deliveryCost,
      avg_delivery_cost_time: data.avgDeliveryCostTime,
      distance_text: data.distanceText || '未知距离'
    }
  })
}

/**
 * getGoods - 获取商品列表
 *
 * 【功能说明】
 *   获取商品列表，支持按分类筛选
 *   后端返回扁平数据，前端需要按分类分组
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.categoryId - 分类ID（可选）
 *
 * 【需要认证】
 *   否，公开接口
 *
 * 【使用示例】
 *   const goods = await getGoods({ categoryId: 1 })
 */
export function getGoods(params) {
  return api('goods', params).then(data => {
    // 调试：打印后端返回的原始数据
    console.log('[API] getGoods 原始数据:', JSON.stringify(data, null, 2))
    // 转换后端扁平数据为前端需要的分类嵌套结构
    const result = transformGoodsList(data)
    console.log('[API] getGoods 转换后数据:', JSON.stringify(result, null, 2))
    return result
  })
}

/**
 * getGoodsCategory - 获取商品分类列表
 *
 * 【功能说明】
 *   获取所有商品分类
 *
 * 【需要认证】
 *   否，公开接口
 *
 * 【使用示例】
 *   const categories = await getGoodsCategory()
 */
export function getGoodsCategory() {
  return api('goodsCategory').then(data => {
    console.log('[API] getGoodsCategory 原始数据:', JSON.stringify(data, null, 2))
    // 转换后端分类数据为前端需要的格式
    const list = Array.isArray(data) ? data : (data.data || data.list || [])
    return list.map(cate => ({
      id: cate.id,
      name: cate.name,
      sort: cate.sort || 0,
      icon: cate.icon || ''
    }))
  })
}

/**
 * transformGoodsList - 将后端扁平商品数据转换为分类嵌套结构
 *
 * @param {Array|Object} data - 后端返回的商品数据
 *
 * 【后端返回格式】
 *   { data: [{ id, name, categoryId, categoryName, price, image, ... }] }
 *
 * 【前端期望格式】
 *   [{ id: categoryId, name: categoryName, goods_list: [{ id, name, price, images, ... }] }]
 */
function transformGoodsList(data) {
  // 兼容 data.data 或直接是数组的情况
  const list = Array.isArray(data) ? data : (data.data || [])

  // 按 categoryId 分组
  const grouped = {}
  list.forEach(item => {
    const cateId = item.categoryId
    if (!grouped[cateId]) {
      grouped[cateId] = {
        id: cateId,
        name: item.categoryName || '',
        icon: item.categoryIcon || '',
        goods_list: []
      }
    }
    // 将商品添加到对应分类
    grouped[cateId].goods_list.push({
      id: item.id,
      name: item.name,
      price: item.price,
      images: item.image || item.images,
      content: item.description || item.content || '',
      use_property: item.useProperty || item.use_property || 0,
      property: item.property || []
    })
  })

  // 转换为数组并返回
  return Object.values(grouped)
}

/**
 * getOrderList - 获取订单列表
 *
 * 【功能说明】
 *   获取当前用户的订单列表
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.status - 订单状态（0-待支付 1-已支付 2-制作中 3-已完成 4-已取消）
 *   @param {number} params.page - 页码
 *   @param {number} params.pageSize - 每页数量
 *
 * 【需要认证】
 *   是
 *
 * 【使用示例】
 *   const orders = await getOrderList({ status: 1, page: 1, pageSize: 10 })
 */
export function getOrderList(params) {
  return api('orders', params)
}

/**
 * getOrderDetail - 获取订单详情
 *
 * 【功能说明】
 *   获取指定订单的详细信息
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 *
 * 【需要认证】
 *   是
 *
 * 【使用示例】
 *   const detail = await getOrderDetail('123456789')
 */
export function getOrderDetail(orderId) {
  return api('order.detail', { id: orderId })
}

/**
 * createOrder - 创建订单
 *
 * 【功能说明】
 *   创建新订单
 *
 * 【参数说明】
 *   @param {object} orderData - 订单数据
 *   @param {number} orderData.storeId - 门店ID
 *   @param {number} orderData.typeCate - 订单类型（1-自取 2-外卖）
 *   @param {array} orderData.goodsList - 商品列表
 *   @param {string} orderData.couponId - 优惠券ID（可选）
 *   @param {string} orderData.postscript - 备注（可选）
 *
 * 【商品列表格式】
 *   [
 *     { goodsId: 1, number: 2, property: '少糖' },
 *     { goodsId: 2, number: 1, property: '去冰' }
 *   ]
 *
 * 【使用示例】
 *   const order = await createOrder({
 *     storeId: 1,
 *     typeCate: 1,
 *     goodsList: [{ goodsId: 1, number: 1, property: '少糖' }],
 *     postscript: '麻烦快点'
 *   })
 */
export function createOrder(orderData) {
  return postApi('order.create', orderData)
}

/**
 * payOrder - 支付订单
 *
 * 【功能说明】
 *   发起订单支付
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 *   @param {string} payMode - 支付方式（wechat-微信支付）
 *
 * 【使用示例】
 *   await payOrder('123456', 'wechat')
 */
export function payOrder(orderId, payMode) {
  return putApi('order.pay', orderId, { payMode })
}

/**
 * cancelOrder - 取消订单
 *
 * 【功能说明】
 *   取消未支付的订单
 *
 * 【参数说明】
 *   @param {string} orderId - 订单ID
 *   @param {string} reason - 取消原因
 *
 * 【使用示例】
 *   await cancelOrder('123456', '不想要了')
 */
export function cancelOrder(orderId, reason) {
  return putApi('order.cancel', orderId, { reason })
}

/**
 * getAddressList - 获取收货地址列表
 *
 * 【功能说明】
 *   获取当前用户的所有收货地址
 *
 * 【需要认证】
 *   是
 *
 * 【使用示例】
 *   const addresses = await getAddressList()
 */
export function getAddressList() {
  return api('addresses')
}

/**
 * addAddress - 添加收货地址
 *
 * 【参数说明】
 *   @param {object} addressData - 地址数据
 *   @param {string} addressData.acceptName - 收货人姓名
 *   @param {string} addressData.mobile - 手机号
 *   @param {string} addressData.provinceName - 省份
 *   @param {string} addressData.cityName - 城市
 *   @param {string} addressData.areaName - 区县
 *   @param {string} addressData.street - 详细地址
 *   @param {boolean} addressData.isDefault - 是否默认地址
 *
 * 【使用示例】
 *   await addAddress({
 *     acceptName: '张三',
 *     mobile: '13800138000',
 *     provinceName: '广东省',
 *     cityName: '深圳市',
 *     areaName: '福田区',
 *     street: '海田路28号',
 *     isDefault: true
 *   })
 */
export function addAddress(addressData) {
  return postApi('address.create', addressData)
}

/**
 * updateAddress - 更新收货地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 *   @param {object} addressData - 要更新的地址数据
 *
 * 【使用示例】
 *   await updateAddress('100', { acceptName: '李四' })
 */
export function updateAddress(addressId, addressData) {
  return putApi('address.update', addressId, addressData)
}

/**
 * deleteAddress - 删除收货地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 *
 * 【使用示例】
 *   await deleteAddress('100')
 */
export function deleteAddress(addressId) {
  return deleteApi('address.delete', addressId)
}

/**
 * setDefaultAddress - 设置默认地址
 *
 * 【参数说明】
 *   @param {string} addressId - 地址ID
 *
 * 【使用示例】
 *   await setDefaultAddress('100')
 */
export function setDefaultAddress(addressId) {
  return putApi('address.setDefault', addressId, {})
}

/**
 * getCouponList - 获取优惠券列表
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.status - 状态（0-未使用 1-已使用 2-已过期）
 *
 * 【使用示例】
 *   const coupons = await getCouponList({ status: 0 })
 */
export function getCouponList(params) {
  return api('customerCoupons', params)
}

/**
 * getAvailableCoupons - 获取可用优惠券
 *
 * 【功能说明】
 *   根据订单金额获取可用的优惠券列表
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.totalAmount - 订单总金额
 *
 * 【使用示例】
 *   const available = await getAvailableCoupons({ totalAmount: 100 })
 */
export function getAvailableCoupons(params) {
  return api('coupon.available', params)
}

/**
 * exchangeCoupon - 兑换优惠券
 *
 * 【参数说明】
 *   @param {string} couponId - 优惠券ID或兑换码
 *
 * 【使用示例】
 *   await exchangeCoupon('COUPON2024')
 */
export function exchangeCoupon(couponId) {
  return postApi('coupon.exchange', { couponId })
}

/**
 * getPoints - 获取积分信息
 *
 * 【功能说明】
 *   获取当前用户的积分信息
 *
 * 【使用示例】
 *   const points = await getPoints()
 *   console.log('当前积分:', points.pointNum)
 */
export function getPoints() {
  return api('customPoints')
}

/**
 * getPointsFlow - 获取积分流水
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.page - 页码
 *   @param {number} params.pageSize - 每页数量
 *
 * 【使用示例】
 *   const flow = await getPointsFlow({ page: 1, pageSize: 20 })
 */
export function getPointsFlow(params) {
  return api('points.flow', params)
}

/**
 * getAttendanceRule - 获取签到规则
 *
 * 【功能说明】
 *   获取签到规则，包括连续签到奖励等
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
 *   @param {object} params - 查询参数
 *   @param {number} params.page - 页码
 *   @param {number} params.pageSize - 每页数量
 *
 * 【使用示例】
 *   const history = await getAttendanceHistory({ page: 1 })
 */
export function getAttendanceHistory(params) {
  return api('attendanceList', params)
}

/**
 * getTodayAttendance - 获取今日签到状态
 *
 * 【功能说明】
 *   查询今日是否已签到
 *
 * 【使用示例】
 *   const today = await getTodayAttendance()
 *   if (today.isSign) {
 *     console.log('今日已签到，获得', today.attendancePoint, '积分')
 *   }
 */
export function getTodayAttendance() {
  return api('todayAttendance')
}

/**
 * signIn - 签到
 *
 * 【功能说明】
 *   执行签到操作，获得积分
 *
 * 【使用示例】
 *   const result = await signIn()
 *   console.log('签到成功，获得', result.attendancePoint, '积分')
 *   console.log('连续签到', result.rewardDays, '天')
 */
export function signIn() {
  return postApi('attendance.sign')
}

/**
 * getPointsMallGoods - 获取积分商城商品
 *
 * 【参数说明】
 *   @param {object} params - 查询参数
 *   @param {number} params.page - 页码
 *   @param {number} params.pageSize - 每页数量
 *
 * 【使用示例】
 *   const goods = await getPointsMallGoods({ page: 1 })
 */
export function getPointsMallGoods(params) {
  return api('pointsMall', params)
}

/**
 * exchangePointsGoods - 积分兑换商品
 *
 * 【参数说明】
 *   @param {string} goodsId - 商品ID
 *   @param {number} quantity - 兑换数量
 *
 * 【使用示例】
 *   await exchangePointsGoods('GOODS001', 1)
 */
export function exchangePointsGoods(goodsId, quantity) {
  return postApi('points.exchange', { goodsId, quantity })
}

/**
 * getRechargeCardList - 获取储值卡列表
 *
 * 【功能说明】
 *   获取可购买的储值卡列表
 *
 * 【使用示例】
 *   const cards = await getRechargeCardList()
 */
export function getRechargeCardList() {
  return api('rechargeCards')
}

/**
 * recharge - 储值
 *
 * 【参数说明】
 *   @param {string} cardId - 储值卡ID
 *   @param {number} amount - 储值金额
 *   @param {string} payMode - 支付方式
 *
 * 【使用示例】
 *   await recharge('CARD001', 100, 'wechat')
 */
export function recharge(cardId, amount, payMode) {
  return postApi('recharge', { cardId, amount, payMode })
}

/**
 * getGiftCardList - 获取礼品卡列表
 *
 * 【使用示例】
 *   const cards = await getGiftCardList()
 */
export function getGiftCardList() {
  return api('giftCards')
}

/**
 * getPackageList - 获取券包列表
 *
 * 【使用示例】
 *   const packages = await getPackageList()
 */
export function getPackageList() {
  return api('packages')
}

/**
 * getLevelBenefits - 获取等级权益
 *
 * 【功能说明】
 *   获取会员等级对应的权益信息
 *
 * 【使用示例】
 *   const benefits = await getLevelBenefits()
 */
export function getLevelBenefits() {
  return api('levelBenefits')
}
