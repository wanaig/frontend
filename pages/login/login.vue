<template>
	<view class="container">
		<view class="intro">
			<image src="/static/images/logo.png"></image>
			<view class="tips">
				一杯好茶，一口软欧包
				<br>
				在奈雪遇见两种美好
			</view>
		</view>
		<view class="bottom">
			<!-- #ifdef H5 -->
				<button type="primary" size="default" class="login-btn" @tap="h5Login">
					登录
				</button>
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
				<button type="primary" size="default" class="login-btn" @tap="wxLogin">
					<image src="/static/images/mine/wechat.png"></image>
					微信一键登录
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
	</view>
</template>

<script>
	import { mapMutations } from 'vuex'
	import { wxLoginRegister, saveLoginData, getMemberInfo } from '@/api/index.js'

	export default {
		data() {
			return {}
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
			}
		}
	}
</script>

<style lang="scss" scoped>
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
	}
</style>
