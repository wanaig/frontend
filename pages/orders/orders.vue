<template>
	<view class="container">
		<view class="orders-list d-flex flex-column w-100" style="padding: 20rpx; padding-bottom: 0;">
			<view class="order-item" v-for="(item, index) in displayOrders" :key="index" style="margin-bottom: 30rpx;" @tap="detail(item)">
				<list-cell :hover="false">
					<view class="w-100 d-flex align-items-center">
						<view class="flex-fill d-flex flex-column">
							<view class="font-size-lg text-color-base" style="margin-bottom: 20rpx;">
								{{ item.store.name }}
							</view>
							<view class="font-size-sm text-color-assist">订单编号：{{ item.order_no }}</view>
						</view>
						<view class="font-size-lg text-color-primary">
							{{ item.status_text }}
						</view>
					</view>
				</list-cell>
				<list-cell :hover="false" last>
					<view class="w-100 d-flex flex-column">
						<view class="w-100 text-truncate font-size-lg text-color-base" style="margin-bottom: 20rpx;">
							{{ orderGoodsName(item.goods) }}
						</view>
						<view class="d-flex justify-content-between align-items-center" style="margin-bottom: 30rpx;">
							<view class="font-size-sm text-color-assist">
								{{ $util.formatDateTime(item.created_at) }}
							</view>
							<view class="d-flex font-size-sm text-color-base align-items-center">
								<view style="margin-right: 10rpx;">共{{ item.goods_num }}件商品，实付</view>
								<view class="font-size-lg">￥{{ item.amount }}</view>
							</view>
						</view>
						<!-- <view class="d-flex align-items-center justify-content-end">
							<view style="margin-right: 10rpx;">
								<button type="primary" plain size="mini" v-if="item.invoice_status > 0">查看发票</button>
								<button type="primary" plain size="mini" v-else @tap.stop="goToInvoice">开发票</button>
							</view>
							<view>
								<button type="primary" plain size="mini" @tap.stop="review(item)">去评价</button>
							</view>
						</view> -->
					</view>
				</list-cell>
			</view>
		</view>
		<!-- 无订单空状态 -->
		<view v-if="!loading && orders.length === 0" class="empty-state">
			<image src="/static/images/orders-empty.png" mode="aspectFit"></image>
			<view class="empty-text">暂无订单</view>
			<button type="primary" size="default" @tap="goToMenu">去点餐</button>
		</view>
		<!-- 加载更多 -->
		<view v-if="hasMore" class="load-more" @tap="loadMore">
			<view v-if="loadingMore" class="d-flex align-items-center just-content-center">
				<image src="/static/images/loadinggg.gif" class="loading-icon"></image>
				<view class="ml-10">加载中...</view>
			</view>
			<view v-else class="text-center text-color-assist">加载更多</view>
		</view>
		<!-- 无更多订单 -->
		<view v-if="!hasMore && allOrders.length > 0" class="no-more text-center text-color-assist">
			没有更多订单了
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import { getOrderList } from '@/api/index'

	export default {
		components: {
			listCell
		},
		data() {
			return {
				page: 1,
				pageSize: 8,
				orders: [],
				allOrders: [],
				hasMore: true,
				loadingMore: false,
				loading: true
			}
		},
		computed: {
			displayOrders() {
				return this.orders
			},
			orderGoodsName() {
				return (goods) => {
					let arr = []
					goods.forEach(good => arr.push(good.name + '*' + good.number))
					return arr.join('，')
				}
			}
		},
		async onLoad() {
			if(!this.$store.getters.isLogin) {
				uni.navigateTo({url: '/pages/login/login'})
			}
			await this.getOrders(true)
		},
		async onReachBottom() {
			if(this.hasMore) {
				await this.getOrders(false)
			}
		},
		async onPullDownRefresh() {
			await this.getOrders(true)
			uni.stopPullDownRefresh()
		},
		methods: {
			async getOrders(isRefresh = false) {
				uni.showLoading({ title: '加载中' })

				try {
					if(isRefresh) {
						this.allOrders = []
						this.orders = []
						this.page = 1
						this.hasMore = true
					}

					const orders = await getOrderList({
						page: this.page,
						page_size: this.pageSize
					})

					if(orders && orders.length > 0) {
						this.allOrders = this.allOrders.concat(orders)
						this.orders = this.allOrders.slice(0, this.page * this.pageSize)
						this.page += 1
						this.hasMore = this.allOrders.length > this.orders.length
					} else {
						this.hasMore = false
					}
				} catch (e) {
					console.error('获取订单失败:', e)
				}

				this.loading = false
				uni.hideLoading()
			},
			loadMore() {
				if (!this.hasMore || this.loadingMore) return

				this.loadingMore = true
				this.page++

				setTimeout(() => {
					this.orders = this.allOrders.slice(0, this.page * this.pageSize)
					this.hasMore = this.allOrders.length > this.orders.length
					this.loadingMore = false
				}, 300)
			},
			detail(order) {
				uni.navigateTo({
					url: '/pages/orders/detail?order=' + encodeURIComponent(JSON.stringify(order))
				})
			},
			review(order) {
				const date = order.completed_time.split(' ')[0]
				uni.navigateTo({
					url: '/pages/review/review?storename=' + order.store.name + '&typeCate=' + order.typeCate + '&date=' + date
				})
			},
			goToInvoice() {
				uni.navigateTo({
					url: '/pages/invoice/invoice'
				})
			},
			goToMenu() {
				uni.switchTab({ url: '/pages/menu/menu' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.loading-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.load-more,
	.no-more {
		padding: 30rpx 0;
		font-size: $font-size-sm;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 30rpx;
			opacity: 0.5;
		}

		.empty-text {
			font-size: $font-size-lg;
			color: $text-color-assist;
			margin-bottom: 40rpx;
		}

		button {
			width: 240rpx;
			height: 70rpx;
			line-height: 70rpx;
			border-radius: 35rpx;
			background: $uni-color-primary;
			color: #fff;
			font-size: $font-size-base;
		}
	}
</style>
