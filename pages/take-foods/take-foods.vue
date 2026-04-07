<template>
	<view class="container">
		<view v-if="loading" class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
			<image src="/static/images/loadinggg.gif" class="drinks-img"></image>
		</view>
		<view v-else-if="!orders.length" class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
			<image src="/static/images/loadinggg.gif" class="drinks-img"></image>
			<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
				<view>您还没有点单</view>
				<view>快去犒劳一下自己吧~</view>
			</view>
			<button type="primary" class="drink-btn" size="default" @tap="menu">去点餐</button>
			<view class="font-size-sm text-color-primary" @tap="goToOrders">查看历史订单</view>
		</view>
		<template v-else>
			<view class="order-box">
				<view class="bg-white" v-for="(order, orderIndex) in displayOrders" :key="orderIndex">
					<view class="section">
						<!-- store info begin -->
						<list-cell :hover="false">
							<view class="w-100 d-flex align-items-center">
								<view class="d-flex flex-column w-60">
									<view class="w-100 font-size-lg text-color-base text-truncate">{{ order.store.name }}</view>
								</view>
								<!-- <view class="d-flex justify-content-end align-items-center w-40">
									<image src="/static/images/order/mobile.png" style="width: 60rpx; height: 60rpx;margin-right: 30rpx;"></image>
									<image src="/static/images/order/navigation.png" style="width: 60rpx; height: 60rpx;"></image>
								</view> -->
							</view>
						</list-cell>
						<!-- store info end -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<view class="d-flex align-items-center just-content-center" v-if="order.typeCate == 1">
									<view class="sort-num">{{ order.sortNum }}</view>
								</view>
								<!-- steps begin -->
								<view class="d-flex just-content-center">
									<view class="steps d-flex flex-column" :class="{'w-80': order.typeCate == 1, 'w-100': order.typeCate == 2}">
										<view class="steps__img-column">
											<view class="steps__img-column-item">
												<image src="/static/images/order/ordered_selected.png" v-if="order.status >= 1"></image>
												<image src="/static/images/order/ordered_selected.png" v-else></image>
											</view>
											<view class="steps__img-column-item" :class="{active: order.status >= 2}">
												<image src="/static/images/order/production_selected.png" v-if="order.status >= 2"></image>
												<image src="/static/images/order/production.png" v-else></image>
											</view>
											<view class="steps__img-column-item" :class="{active: order.status >= 3}" v-if="order.typeCate == 2">
												<image src="/static/images/order/delivery_selected.png" v-if="order.status >= 3"></image>
												<image src="/static/images/order/delivered.png" v-else></image>
											</view>
											<view class="steps__img-column-item" :class="{active: order.status >= 4}">
												<image src="/static/images/order/delivered_selected.png" v-if="order.status >= 4"></image>
												<image src="/static/images/order/delivered.png" v-else></image>
											</view>
										</view>
										<view class="steps__text-column">
											<view class="steps__text-column-item" :class="{active: order.status >= 1}">
												<view class="steps__column-item-line bg-transparent"></view>
												<view class="steps__text-column-item-text">已下单</view>
												<view class="steps__column-item-line"></view>
											</view>
											<view class="steps__text-column-item" :class="{active: order.status >= 2}">
												<view class="steps__column-item-line"></view>
												<view class="steps__text-column-item-text">制作中</view>
												<view class="steps__column-item-line"></view>
											</view>
											<view class="steps__text-column-item" :class="{active: order.status >= 3}" v-if="order.typeCate == 2">
												<view class="steps__column-item-line"></view>
												<view class="steps__text-column-item-text">配送中</view>
												<view class="steps__column-item-line"></view>
											</view>
											<view class="steps__text-column-item" :class="{active: order.status >= 4}">
												<view class="steps__column-item-line"></view>
												<view class="steps__text-column-item-text">
													{{ order.typeCate == 2 ? '已送达' : '请取餐' }}
												</view>
												<view class="steps__column-item-line bg-transparent"></view>
											</view>
										</view>
									</view>
								</view>
								<!-- steps end -->
								<!-- goods begin -->
								<view class="w-100 d-flex flex-column position-relative mt-30" style="margin-bottom: -40rpx;">
									<view class="w-100 d-flex align-items-center mb-40" v-for="(good, index) in order.goods" :key="index">
										<view class="d-flex flex-column w-60 overflow-hidden">
											<view class="font-size-lg text-color-base mb-10 text-truncate">{{ good.name }}</view>
											<view class="font-size-sm text-color-assist text-truncate">{{ good.property }}</view>
										</view>
										<view class="d-flex w-40 align-items-center justify-content-between pl-30">
											<view class="font-size-base text-color-base">x{{ good.number }}</view>
											<view class="font-size-base text-color-base font-weight-bold">￥{{ good.price }}</view>
										</view>
									</view>
								</view>
								<!-- goods end -->
							</view>
						</list-cell>
					</view>
					<view class="section">
						<!-- payment and amount begin -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<!-- <view class="pay-cell">
									<view>支付方式</view>
									<view class="font-weight-bold">{{ order.payMode }}</view>
								</view> -->
								<view class="pay-cell">
									<view>金额总计</view>
									<view class="font-weight-bold">￥{{ order.amount }}</view>
								</view>
							</view>
						</list-cell>
						<!-- payment and amount end -->
					</view>
					<view class="section">
						<!-- order info begin -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<view class="pay-cell">
									<view>下单时间</view>
									<view class="font-weight-bold"> <!--{{ formatDateTime(order.createdAt) }}--> {{ order.completedTime }}</view>
								</view>
								<view class="pay-cell">
									<view>下单门店</view>
									<view class="font-weight-bold">{{ order.store.name }}</view>
								</view>
								<!-- <view class="pay-cell">
									<view>支付方式</view>
									<view class="font-weight-bold">{{ order.payMode }}</view>
								</view> -->
								<view class="pay-cell">
									<view>订单号</view>
									<view class="font-weight-bold">{{ order.orderNo }}</view>
								</view>
							</view>
						</list-cell>
						<!-- order info end -->
					</view>
					<!-- order other info begin -->
					<list-cell :hover="false" padding="50rpx 30rpx 20rpx" last>
						<view class="w-100 d-flex flex-column">
							<!-- <view class="pay-cell">
								<view>取单号</view>
								<view class="font-weight-bold">{{ order.sortNum }}</view>
							</view>
							<view class="pay-cell">
								<view>享用方式</view>
								<view class="font-weight-bold">{{ order.typeCate == 1 ? '自取' : '外卖' }}</view>
							</view>
							<view class="pay-cell">
								<view>取餐时间</view>
								<view class="font-weight-bold">立即取餐</view>
							</view>
							<view class="pay-cell">
								<view>完成制作时间</view>
								<view class="font-weight-bold">{{ order.productionedTime || '制作中' }}</view>
							</view> -->
							<view class="pay-cell">
								<view>备注</view>
								<view class="font-weight-bold">{{ order.postscript || '无' }}</view>
							</view>
						</view>
					</list-cell>
					<!-- order other info end -->
				</view>
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
			<view v-if="!hasMore && orders.length > 0" class="no-more text-center text-color-assist">
				没有更多订单了
			</view>
		</template>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import {mapState, mapGetters} from 'vuex'

	export default {
		components: {
			listCell
		},
		data() {
			return {
				loading: true,
				orders: [],
				page: 1,
				pageSize: 3,
				hasMore: true,
				loadingMore: false,
				allOrders: []  // 存储所有订单用于分页
			}
		},
		computed: {
			...mapState(['order', 'orderType', 'address', 'store']),
			...mapGetters(['isLogin']),
			displayOrders() {
				return this.allOrders.slice(0, this.page * this.pageSize)
			}
		},
		async onLoad() {
			if(!this.isLogin) {
				uni.navigateTo({url: '/pages/login/login'})
				return
			}
			await this.loadCurrentOrder()
		},
		async onShow() {
			if (!this.isLogin) return
			await this.loadCurrentOrder()
		},
		onReachBottom() {
			if (this.hasMore && !this.loadingMore) {
				this.loadMore()
			}
		},
		methods: {
			/**
			 * loadCurrentOrder - 获取当前有效订单
			 */
			async loadCurrentOrder() {
				try {
					this.loading = true
					console.log('[取餐] 正在加载订单...')

					// 调用后端订单列表接口
					const data = await this.$api('orders')
					console.log('[取餐] 订单列表:', data)

					// 获取所有有效订单（status < 4 表示未完成）
					if (Array.isArray(data) && data.length > 0) {
						// 按创建时间倒序
						const sortedOrders = data.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
						// 筛选有效订单
						const activeOrders = sortedOrders.filter(o => o.status < 4)
						// 转换后端数据格式到前端格式
						this.allOrders = activeOrders.map(activeOrder => ({
							id: activeOrder.id,
							orderNo: activeOrder.orderNo,
							status: activeOrder.status,
							statusText: activeOrder.statusText,
							totalAmount: activeOrder.totalAmount,
							amount: activeOrder.amount,
							payMode: activeOrder.payMode || '余额支付',
							createdAt: activeOrder.created_at,
							completedTime: activeOrder.completedTime,
							productionedTime: activeOrder.productionedTime,
							postscript: activeOrder.postscript,
							sortNum: activeOrder.sortNum,
							typeCate: activeOrder.typeCate,
							store: activeOrder.store || {},
							goods: (activeOrder.goods || []).map(g => ({
								name: g.name,
								number: g.number,
								price: g.price,
								property: g.property || ''
							}))
						}))
						this.orders = this.allOrders
						// 判断是否还有更多
						this.hasMore = this.allOrders.length > this.pageSize
						console.log('[取餐] 有效订单列表:', this.orders)
					} else {
						this.allOrders = []
						this.orders = []
						this.hasMore = false
					}
				} catch (err) {
					console.error('[取餐] 加载失败:', err)
					this.allOrders = []
					this.orders = []
					this.hasMore = false
				} finally {
					this.loading = false
				}
			},

			/**
			 * loadMore - 加载更多订单
			 */
			loadMore() {
				if (!this.hasMore || this.loadingMore) return

				this.loadingMore = true
				this.page++

				// 模拟加载延迟
				setTimeout(() => {
					this.orders = this.allOrders.slice(0, this.page * this.pageSize)
					this.hasMore = this.allOrders.length > this.page * this.pageSize
					this.loadingMore = false
				}, 300)
			},

			/**
			 * formatDateTime - 格式化时间戳
			 */
			formatDateTime(timestamp) {
				if (!timestamp) return ''
				const date = new Date(timestamp * 1000)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				const second = String(date.getSeconds()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}:${second}`
			},

			goToOrders() {
				if(!this.$store.getters.isLogin) {
					uni.navigateTo({url: '/pages/login/login'})
					return
				}
				uni.navigateTo({
					url: '/pages/orders/orders'
				})
			},
			menu() {
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef H5 */
	page {
		min-height: 100%;
		background-color: $bg-color;
	}
	/* #endif */
	.order-box {
		padding: 20rpx;
		/* #ifdef H5 */
		margin-bottom: 100rpx;
		/* #endif */

		.bg-white {
			margin-bottom: 24rpx;
		}
	}
	
	.drinks-img {
		width: 260rpx;
		height: 260rpx;
	}

	.load-more,
	.no-more {
		padding: 30rpx 0;
		font-size: $font-size-sm;
	}

	.tips {
		margin: 60rpx 0 80rpx;
		line-height: 48rpx;
	}
	
	.drink-btn {
		width: 320rpx;
		border-radius: 50rem !important;
		margin-bottom: 40rpx;
		font-size: $font-size-base;
		line-height: 3.0;
	}
	
	@mixin arch {
		content: "";
		position: absolute;
		background-color: $bg-color;
		width: 30rpx;
		height: 30rpx;
		bottom: -15rpx;
		z-index: 10;
		border-radius: 100%;
	}
	
	.section {
		position: relative;
		
		&::before {
			@include arch;
			left: -15rpx;
		}
		
		&::after {
			@include arch;
			right: -15rpx;
		}
	}
	
	.pay-cell {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: $font-size-base;
		color: $text-color-base;
		margin-bottom: 40rpx;

		&:nth-last-child(1) {
			margin-bottom: 0;
		}
	}
	
	.sort-num {
		font-size: 64rpx;
		font-weight: bold;
		color: $text-color-base;
		line-height: 2;
	}
	
	.steps__img-column {
		display: flex;
		margin: 30rpx 0;
		
		.steps__img-column-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			
			image {
				width: 80rpx;
				height: 80rpx;
			}
		}
	}
	
	.steps__text-column {
		display: flex;
		margin-bottom: 40rpx;
		
		.steps__text-column-item {
			flex: 1;
			display: inline-flex;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: $font-size-base;
			color: $text-color-assist;
			
			&.active {
				color: $text-color-base;
				font-weight: bold;
				
				.steps__column-item-line {
					background-color: $text-color-base;
				}
			}
			
			.steps__column-item-line{
				flex: 1;
				height: 2rpx;
				background-color: #919293;
				transform: scaleY(0.5);
			}
			
			.steps__text-column-item-text {
				margin: 0 8px;
			}
		}
	}
</style>
