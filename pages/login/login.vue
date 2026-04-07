<template>
	<view class="container">
		<view class="intro">
			<image src="/static/images/svg_2.svg"></image>
			<view class="tips">
				一杯甜茶，一份宠爱
				<br>
				在 Kitty 茶铺遇见双倍美好
			</view>

			<!-- <svg <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="150" r="140" fill="#8FD4A8"/>
  <text x="150" y="130" font-family="Arial, sans-serif" font-size="70" fill="#FFFFFF" text-anchor="middle" font-weight="bold">Kitty</text>
  <text x="150" y="220" font-family="Arial, sans-serif" font-size="70" fill="#FFFFFF" text-anchor="middle" font-weight="bold">の茶</text>
</svg> -->

			<!-- 组合 1（情侣互动主题）
			Logo：Kittyの茶铺
			Slogan：
			一杯甜茶，一个抱抱
			在 Kitty 茶铺遇见双倍美好
			按钮：微信一键登录（保留原图标，适配情侣场景）
			组合 2（姐姐服务主题）
			Logo：姐姐の茶屋
			Slogan：
			一杯奶茶，一份宠爱
			姐姐的茶屋，永远为你敞开
			按钮：姐姐的茶屋登录
			组合 3（全品类通用主题）
			Logo：Kitty の小厨房
			Slogan：
			一口甜茶，一份可爱
			Kitty 陪你，天天开心
			按钮：Kitty 一键登录 -->
		</view>
		<view class="bottom">
			<!-- #ifdef H5 -->
				<button type="primary" size="default" class="login-btn" @tap="showPhoneLogin">
					手机号登录
				</button>
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
				<button type="primary" size="default" class="login-btn" @tap="wxLogin">
					<image src="/static/images/mine/wechat.png"></image>
					微信一键登录
				</button>
			<!-- #endif -->
			<!-- #ifdef MP-TOUTIAO -->
				<button type="primary" size="default" class="login-btn" @tap="douyinLogin">
					抖音一键登录
				</button>
			<!-- #endif -->
			<!-- <view class="d-flex flex-column justify-content-evenly align-items-center text-center" style="height: 30vh;">
				<view class="w-100 font-size-base text-color-assist">新用户登录即加入会员，享会员权益</view>
				<view class="w-100 row d-flex just-content-around align-items-center font-size-sm text-color-assist">
					<view class="grid">
						<image src="/static/images/mine/rhyl.png"></image>
						<view>入会有礼</view>
					</view>
					<view class="grid">
						<image src="/static/images/mine/jfdh.png"></image>
						<view>积分兑换</view>
					</view>
					<view class="grid">
						<image src="/static/images/mine/sjtq.png"></image>
						<view>升级特权</view>
					</view>
					<view class="grid">
						<image src="/static/images/mine/srtq.png"></image>
						<view>生日特权</view>
					</view>
					<view class="grid">
						<image src="/static/images/mine/nxbz.png"></image>
						<view>奈雪宝藏</view>
					</view>
				</view>
				<view class="font-size-base text-color-primary">会员权益说明</view>
			</view> -->
		</view>
		<!-- 手机号登录弹窗 -->
		<view class="phone-popup" v-if="showPhonePopup">
			<view class="popup-mask" @click="closePhonePopup"></view>
			<view class="popup-box">
				<view class="popup-title">手机号登录</view>
				<input class="phone-input" type="number" v-model="phoneForm.phone" placeholder="请输入手机号" maxlength="11" />
				<view class="popup-btn" :class="{ disabled: !canPhoneLogin }" @tap="phoneLogin">登录</view>
				<view class="popup-close" @click="closePhonePopup">×</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex'
	import { wxLoginRegister, douyinLogin, phoneLogin as phoneLoginApi, saveLoginData, getMemberInfo } from '@/api/index.js'

	export default {
		data() {
			return {
				showPhonePopup: false,
				phoneForm: {
					phone: ''
				}
			}
		},
			computed: {
				canPhoneLogin() {
					return /^1[3-9]\d{9}$/.test(this.phoneForm.phone)
				}
			},
		methods: {
			...mapMutations(['SET_MEMBER']),

			/**
			 * wxLogin - 微信一键登录
			 *
			 * 【流程】
			 * 1. 调用 wx.login() 获取微信授权 code
			 * 2. 将 code 发送给后端 /member/wxlogin 接口
			 * 3. 后端用 code 换取 openid，自动创建新用户（如果不存在）
			 * 4. 后端返回 token 和会员信息
			 * 5. 调用 getMemberInfo 获取完整会员信息
			 * 6. 保存 token，存入 Vuex，跳转到会员页
			 */
			async wxLogin() {
				try {
					uni.showLoading({ title: '正在登录...' })

					// 1. 获取微信授权 code
					const loginRes = await this.wxLoginPromisify()
					if (!loginRes.code) {
						throw new Error('微信授权失败，未获取到 code')
					}

					// 2. 调用后端微信一键登录注册接口
					const loginData = await wxLoginRegister(loginRes.code)
					console.log('登录返回数据:', JSON.stringify(loginData, null, 2))

					// 3. 保存登录数据（token 和用户信息）
					saveLoginData(loginData)

					// 4. 获取完整会员信息并存入 Vuex
					const memberInfo = await getMemberInfo()
					console.log('完整会员信息:', JSON.stringify(memberInfo, null, 2))
					this.SET_MEMBER(memberInfo)

					uni.hideLoading()

					// 5. 显示登录结果并跳转
					const message = loginData.isNewMember ? '注册成功，欢迎加入奈雪会员' : '登录成功'
					uni.showToast({ title: message, icon: 'success' })

					// 等待 toast 显示
					await new Promise(resolve => setTimeout(resolve, 1500))

					uni.$emit('loginSuccess')
					const pages = getCurrentPages()
					if (pages.length > 1) {
						uni.navigateBack()
					} else {
						uni.reLaunch({ url: '/pages/menu/menu' })
					}

				} catch (err) {
					uni.hideLoading()
					console.error('微信登录失败:', err)

					uni.showModal({
						title: '登录失败',
						content: err.message || '请检查网络后重试',
						showCancel: false
					})
				}
			},

			/**
			 * wxLoginPromisify - 将 wx.login 转换为 Promise
			 */
			wxLoginPromisify() {
				return new Promise((resolve, reject) => {
					wx.login({
						success: resolve,
						fail: reject
					})
				})
			},

			/**
			 * h5Login - H5环境登录（开发测试用）
			 */
			async h5Login() {
				try {
					uni.showLoading({ title: '登录中...' })
					const Member = (await import('@/api/member')).default
					this.SET_MEMBER(Member)
					uni.hideLoading()
					uni.showToast({ title: '登录成功', icon: 'success' })
					uni.navigateBack()
				} catch (err) {
					uni.hideLoading()
					console.error('H5登录失败:', err)
				}
			},

			/**
			 * showPhoneLogin - 显示手机号登录弹窗
			 */
			showPhoneLogin() {
				this.showPhonePopup = true
			},

			/**
			 * closePhonePopup - 关闭手机号登录弹窗
			 */
			closePhonePopup() {
				this.showPhonePopup = false
				this.phoneForm = { phone: '' }
			},

			/**
			 * phoneLogin - 手机号登录/注册
			 */
			async phoneLogin() {
				console.log('phoneLogin called, canPhoneLogin:', this.canPhoneLogin, 'phone:', this.phoneForm.phone)
				try {
					if (!this.canPhoneLogin) return
					uni.showLoading({ title: '登录中...' })

					// 调用后端手机号登录接口
					const loginData = await phoneLoginApi(this.phoneForm.phone)
					saveLoginData(loginData)

					// 获取完整会员信息
					const memberInfo = await getMemberInfo()
					this.SET_MEMBER(memberInfo)

					uni.hideLoading()
					uni.showToast({ title: '登录成功', icon: 'success' })
					this.closePhonePopup()
					uni.$emit('loginSuccess')
					const pages = getCurrentPages()
					if (pages.length > 1) {
						uni.navigateBack()
					} else {
						uni.reLaunch({ url: '/pages/menu/menu' })
					}
				} catch (err) {
					uni.hideLoading()
					console.error('手机号登录失败:', err)
					uni.showModal({
						title: '登录失败',
						content: err.message || '请检查网络后重试',
						showCancel: false
					})
				}
			},

			/**
			 * douyinLogin - 抖音一键登录
			 */
			async douyinLogin() {
				try {
					uni.showLoading({ title: '正在登录...' })

					// 抖音使用 tt.login()
					const loginRes = await this.douyinLoginPromisify()
					if (!loginRes.code) {
						throw new Error('抖音授权失败，未获取到 code')
					}

					// 调用后端抖音登录注册接口
					const loginData = await douyinLogin(loginRes.code)
					console.log('抖音登录返回数据:', JSON.stringify(loginData, null, 2))

					// 保存登录数据
					saveLoginData(loginData)

					// 获取完整会员信息
					const memberInfo = await getMemberInfo()
					this.SET_MEMBER(memberInfo)

					uni.hideLoading()
					const message = loginData.isNewMember ? '注册成功，欢迎加入奈雪会员' : '登录成功'
					uni.showToast({ title: message, icon: 'success' })

					await new Promise(resolve => setTimeout(resolve, 1500))

					uni.$emit('loginSuccess')
					uni.reLaunch({ url: '/pages/menu/menu' })

				} catch (err) {
					uni.hideLoading()
					console.error('抖音登录失败:', err)

					uni.showModal({
						title: '登录失败',
						content: err.message || '请检查网络后重试',
						showCancel: false
					})
				}
			},

			/**
			 * douyinLoginPromisify - 将 tt.login 转换为 Promise
			 */
			douyinLoginPromisify() {
				return new Promise((resolve, reject) => {
					tt.login({
						success: resolve,
						fail: reject
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		position: relative;
	}

	.intro {
		width: 100%;
		height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		font-size: $font-size-base;
		color: $text-color-assist;

		image {
			width: 165rpx;
			height: 165rpx;
		}

		.tips {
			line-height: 72rpx;
			text-align: center;
		}
	}

	.bottom {
		height: 40vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 0 40rpx;

		.login-btn {
			width: 100%;
			border-radius: 50rem !important;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10rpx 0;

			image {
				width: 36rpx;
				height: 30rpx;
				margin-right: 10rpx;
			}
		}

		.row {
			.grid {
				width: 20%;
				image {
					width: 60rpx;
					height: 60rpx;
					margin-bottom: 10rpx;
				}
			}
		}

		.phone-login-btn {
			margin-top: 20rpx;
			background-color: #fff !important;
			color: $text-color-base !important;
			border: 1px solid $border-color !important;
		}
	}

	/* 手机号登录弹窗 */
	.phone-login-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;

		.popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
		}

		.popup-content {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 600rpx;
			background: #fff;
			border-radius: 24rpx;
			pointer-events: auto;
		}

		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			font-size: 32rpx;
			font-weight: bold;
			border-bottom: 1px solid #eee;

			.close-btn {
				font-size: 48rpx;
				color: #999;
				line-height: 1;
			}
		}

		.popup-body {
			padding: 40rpx 30rpx;

			.input-row {
				margin-bottom: 24rpx;
				border: 1px solid #ddd;
				border-radius: 8rpx;
				background: #fff;
				pointer-events: auto;

				input {
					display: block;
					width: 100%;
					padding: 20rpx;
					font-size: 28rpx;
					caret-color: #8FD4A8;
					pointer-events: auto;
				}
			}

			.code-row {
				display: flex;

				input {
					flex: 1;
					border: none;
				}

				.send-code-btn {
					padding: 0 20rpx;
					font-size: 24rpx;
					color: $uni-color-primary;
					background: #fff;
					border: none;
					border-left: 1px solid #ddd;

					&[disabled] {
						color: #999;
					}
				}
			}

			.login-confirm-btn {
				width: 100%;
				margin-top: 20rpx;
				border-radius: 50rem !important;

				&[disabled] {
					opacity: 0.6;
				}
			}
		}
	}

	/* 手机号登录弹窗 */
	.phone-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;

		.popup-mask {
			position: absolute;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
		}

		.popup-box {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 560rpx;
			background: #fff;
			border-radius: 24rpx;
			padding: 60rpx 40rpx 40rpx;
			box-sizing: border-box;
		}

		.popup-title {
			text-align: center;
			font-size: 34rpx;
			font-weight: bold;
			margin-bottom: 40rpx;
			color: #333;
		}

		.phone-input {
			width: 100%;
			height: 88rpx;
			border: 1px solid #ddd;
			border-radius: 10rpx;
			padding: 0 24rpx;
			box-sizing: border-box;
			font-size: 28rpx;
			margin-bottom: 30rpx;
		}

		.popup-btn {
			width: 100%;
			height: 88rpx;
			background: #8FD4A8;
			color: #fff;
			border-radius: 44rpx;
			font-size: 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			line-height: 88rpx;

			&.disabled {
				background: #ccc;
			}
		}

		.popup-close {
			position: absolute;
			top: 20rpx;
			right: 30rpx;
			font-size: 50rpx;
			color: #999;
		}
	}
</style>
