<template>
	<view class="container" style="padding:20rpx;">
		<view v-if="!order.id" class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
			<image src="/static/images/loadinggg.gif" class="drinks-img"></image>
			<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
				<view>订单不存在</view>
			</view>
		</view>
		<view v-else style="padding-bottom: 100rpx;">
			<view class="bg-white">
				<view class="section">
					<!-- store info begin -->
					<list-cell :hover="false">
						<view class="w-100 d-flex align-items-center">
							<view class="d-flex flex-column w-60">
								<view class="w-100 font-size-lg text-color-base text-truncate mb-10">{{ storeName }}</view>
								<view class="w-100 d-flex align-items-center overflow-hidden">
									<image src="/static/images/order/location.png" class="flex-shrink-0" style="width: 30rpx; height: 30rpx;"></image>
									<view class="text-truncate font-size-sm text-color-assist">{{ storeAddress }}</view>
								</view>
							</view>
							<view class="d-flex justify-content-end align-items-center w-40">
								<image src="/static/images/order/mobile.png" style="width: 60rpx; height: 60rpx;margin-right: 30rpx;"></image>
								<image src="/static/images/order/navigation.png" style="width: 60rpx; height: 60rpx;"></image>
							</view>
						</view>
					</list-cell>
					<!-- store info end -->
					<!-- goods begin -->
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column position-relative" style="margin-bottom: -40rpx;">
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
					</list-cell>
					<!-- goods end -->
				</view>
				<view class="section">
					<!-- payment and amount begin -->
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column">
							<view class="pay-cell">
								<view>支付方式</view>
								<view class="font-weight-bold">{{ order.pay_mode }}</view>
							</view>
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
								<view class="font-weight-bold">{{ $util.formatDateTime(order.created_at) }}</view>
							</view>
							<view class="pay-cell">
								<view>下单门店</view>
								<view class="font-weight-bold">{{ storeName }}</view>
							</view>
							<view class="pay-cell">
								<view>支付方式</view>
								<view class="font-weight-bold">{{ order.pay_mode }}</view>
							</view>
							<view class="pay-cell">
								<view>订单号</view>
								<view class="font-weight-bold">{{ order.order_no }}</view>
							</view>
						</view>
					</list-cell>
					<!-- order info end -->
				</view>
				<!-- order other info begin -->
				<list-cell :hover="false" padding="50rpx 30rpx 20rpx" last>
					<view class="w-100 d-flex flex-column">
						<view class="pay-cell">
							<view>取单号</view>
							<view class="font-weight-bold">{{ order.sort_num }}</view>
						</view>
						<view class="pay-cell">
							<view>享用方式</view>
							<view class="font-weight-bold">自取</view>
						</view>
						<view class="pay-cell">
							<view>取餐时间</view>
							<view class="font-weight-bold">立即取餐</view>
						</view>
						<!-- <view class="pay-cell">
							<view>完成制作时间</view>
							<view class="font-weight-bold">{{ order.productioned_time }}</view>
						</view> -->
						<view class="pay-cell">
							<view>备注</view>
							<view class="font-weight-bold">{{ order.postscript || '无' }}</view>
						</view>
					</view>
				</list-cell>
				<!-- order other info end -->
			</view>
			<view class="position-relative w-100">
				<image src="/static/images/order/bottom.png" mode="widthFix" class="w-100"></image>
				<!-- <view class="invote-box" v-if="!order.invoice_status">
					<view class="font-size-base text-color-primary" @tap="goToInvoice">去开发票</view>
					<image src="/static/images/order/right.png"></image>
				</view> -->
			</view>
		</view>
		<!-- <view class="btn-box">
			<view class="item" v-if="order.invoice_status > 0"><button type="primary">查看发票</button></view>
			<view class="item"><button type="primary" plain @tap="review">去评价</button></view>
			<view class="item"><button type="primary">再来一单</button></view>
		</view> -->
	</view>
</template>

<script>
import listCell from '@/components/list-cell/list-cell';

export default {
	components: {
		listCell
	},
	data() {
		return {
			order: {}
		};
	},
	computed: {
		storeName() {
			const order = this.order
			return order && order.store ? order.store.name : ''
		},
		storeAddress() {
			const order = this.order
			return order && order.store ? order.store.address : ''
		}
	},
	onLoad(options) {
		const orderStr = options.order
		if (orderStr) {
			try {
				this.order = JSON.parse(decodeURIComponent(orderStr))
			} catch (e) {
				console.error('解析订单数据失败:', e)
				this.order = {}
			}
		}
	},
	methods: {
		review() {
			if (!this.order.id) return
			const date = (this.order.completed_time || '').split(' ')[0]
			uni.navigateTo({
				url: '/pages/review/review?storename=' + this.storeName + '&typeCate=' + this.order.typeCate + '&date=' + date
			})
		},
		goToInvoice() {
			uni.navigateTo({
				url: '/pages/invoice/invoice'
			})
		}
	}
};
</script>

<style lang="scss" scoped>
	.drinks-img {
		width: 260rpx;
		height: 260rpx;
	}

	.tips {
		margin: 60rpx 0 80rpx;
		line-height: 48rpx;
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

.invote-box {
	position: absolute;
	width: 100%;
	left: 0;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	
	image {
		width: 30rpx;
		height: 30rpx;
	}
}

.btn-box {
	background-color: #ffffff;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 120rpx;
	box-shadow: 0 0 20rpx rgba($color: #000000, $alpha: 0.1);
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	z-index: 11;
	
	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 10rpx;
		flex: 1;
		flex-shrink: 0;
		
		button {
			width: 100%;
			border-radius: 50rem !important;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
		}
	}
}
</style>
