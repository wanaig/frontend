<template>
	<view class="container w-100 h-100" v-if="!loading">
		<view class="d-flex flex-column w-100" style="padding: 30rpx; padding-bottom: -34rpx; margin-bottom: 150rpx;">
			<view class="d-flex align-items-center bg-white"
				style="padding: 30rpx; height: 220rpx; margin-bottom: 34rpx; border-radius: 8rpx;"
				v-for="(item, index) in coupons" :key="index">
				<image :src="item.imageUrl" style="width: 200rpx; height: 160rpx; margin-right: 20rpx;"></image>
				<view class="d-flex flex-fill flex-column justify-content-between" style="height: 160rpx;">
					<view class="font-size-lg text-color-base">{{ item.title }}</view>
					<view class="d-flex justify-content-between align-items-center">
						<view class="font-size-sm">有效期至{{ item.endAt }}</view>
					</view>
				</view>
			</view>
		</view>
		<view class="d-flex position-fixed bg-base fixed-bottom text-color-primary font-size-base align-items-center just-content-center w-100"
			style="height: 150rpx;">
			<text>我的优惠券</text>
		</view>
	</view>
	<loading v-else></loading>
</template>

<script>
	import loading from '@/components/loading'

	export default {
		components: {
			loading
		},
		data() {
			return {
				loading: true,
				coupons: [],
				error: null
			}
		},
		async onLoad() {
			await this.getCoupons()
		},
		async onPullDownRefresh() {
			await this.getCoupons()
			uni.stopPullDownRefresh()
		},
		methods: {
			/**
			 * getCoupons - 获取优惠券列表
			 *
			 * 【API 调用】
			 *   GET /coupon
			 *
			 * 【错误处理】
			 *   - 401: 未登录，跳转登录页
			 *   - 网络错误: 显示错误信息
			 */
			async getCoupons() {
				try {
					this.loading = true
					this.error = null

					// 调用 API 获取优惠券列表
					const data = await this.$api('customerCoupons')
					console.log('[优惠券] 获取成功:', data)

					// 转换后端数据格式
					if (Array.isArray(data)) {
						this.coupons = data.map(coupon => ({
							id: coupon.id,
							couponId: coupon.couponId,
							title: coupon.title,
							couponExplain: coupon.couponExplain,
							imageUrl: coupon.imageUrl || '',
							discountAmount: coupon.discountAmount,
							discountUnit: coupon.discountUnit,
							beginAt: coupon.beginAt,
							endAt: coupon.endAt,
							couponType: coupon.couponType,
							sellerName: coupon.sellerName
						}))
					} else if (data && data.list) {
						this.coupons = data.list
					} else {
						this.coupons = []
					}

					console.log('[优惠券] 列表:', this.coupons)
				} catch (err) {
					console.error('[优惠券] 获取失败:', err)
					this.error = err.message || '获取优惠券失败'

					if (!err.message.includes('登录')) {
						uni.showToast({
							title: this.error,
							icon: 'none'
						})
					}
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-bottom: -150rpx;
	}
</style>
