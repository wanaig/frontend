<template>
	<view class="container">
		<view class="main">
			<view v-if="loading" class="no-address-tips">
				<image src="/static/images/loading.gif" style="width: 100rpx; height: 100rpx;"></image>
			</view>
			<view v-else-if="!addresses.length" class="no-address-tips">
				<view class="mb-30">暂无地址信息</view>
				<view>请点击底部按钮添加地址信息</view>
			</view>
			<template v-else>
				<uni-swipe-action>
					<uni-swipe-action-item class="address-wrapper" :options="swipeOption" @click="handleSwipeClick(address.id)" v-for="(address, index) in addresses" :key="index">
						<view class="address" @tap="chooseAddress(address)">
							<view class="left flex-fill overflow-hidden mr-20">
								<view class="font-size-lg font-weight-bold text-truncate" style="margin-bottom: 10rpx;">{{ address.street }}</view>
								<view class="font-size-sm text-color-assist">
									{{ address.acceptName }} {{ address.sex == 1 ? '先生' : '女士' }} {{ address.mobile }}
								</view>
							</view>
							<image src="/static/images/edit.png" class="edit-icon" @tap.stop="edit(address.id)"></image>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</template>
		</view>
		<view class="btn-box">
			<button type="primary" size="default" @tap="add">新增地址</button>
		</view>
	</view>
</template>

<script>
	import {mapMutations} from 'vuex'
	import uniSwipeAction from '../../components/uni-swipe-action/uni-swipe-action'
	import uniSwipeActionItem from '../../components/uni-swipe-action-item/uni-swipe-action-item'
	import {deleteApi} from '@/api/index.js'

	export default {
		components: {
			uniSwipeAction,
			uniSwipeActionItem
		},
		data() {
			return {
				scene: 'menu',
				is_choose: false,
				loading: true,
				addresses: [],
				swipeOption: [
					{
						text: '删除',
						style: {
							backgroundColor: '#D12E32'
						}
					}
				]
			}
		},
		async onLoad({is_choose, scene}) {
			this.is_choose = is_choose === 'true' || is_choose === true
			this.scene = scene || 'menu'
			await this.loadAddresses()
		},
		async onShow() {
			// 每次显示页面时刷新地址列表
			await this.loadAddresses()
		},
		methods: {
			...mapMutations(['SET_ADDRESS', 'SET_ADDRESSES', 'SET_ORDER_TYPE']),

			/**
			 * loadAddresses - 加载地址列表
			 */
			async loadAddresses() {
				try {
					this.loading = true
					console.log('[地址] 正在加载...')

					const data = await this.$api('addresses')
					console.log('[地址] 获取成功:', data)

					// 转换后端数据格式
					if (Array.isArray(data)) {
						this.addresses = data.map(addr => ({
							id: addr.id,
							acceptName: addr.acceptName,
							mobile: addr.mobile,
							sex: addr.sex,
							province: addr.province,
							city: addr.city,
							area: addr.area,
							provinceName: addr.provinceName,
							cityName: addr.cityName,
							areaName: addr.areaName,
							street: addr.street,
							doorNumber: addr.doorNumber,
							isDefault: addr.isDefault,
							poiname: addr.poiname
						}))
					} else {
						this.addresses = []
					}

					console.log('[地址] 列表:', this.addresses)
				} catch (err) {
					console.error('[地址] 加载失败:', err)
					this.addresses = []
				} finally {
					this.loading = false
				}
			},

			add() {
				uni.navigateTo({
					url: '/pages/address/add'
				})
			},
			edit(id) {
				uni.navigateTo({
					url: '/pages/address/add?id=' + id
				})
			},
			handleSwipeClick(id) {
				uni.showModal({
					title: '提示',
					content: '确定要删除？',
					success: async res => {
						if (res.confirm) {
							try {
								// 调用后端删除接口
								await deleteApi('address.delete', id)
								console.log('[地址] 删除成功:', id)

								// 从本地列表移除
								const index = this.addresses.findIndex(item => item.id == id)
								if (index > -1) {
									this.addresses.splice(index, 1)
								}

								uni.showToast({title: '删除成功！', icon: 'success'})
							} catch (err) {
								console.error('[地址] 删除失败:', err)
								uni.showToast({title: '删除失败', icon: 'none'})
							}
						}
					}
				})
			},
			chooseAddress(address) {
				if (!this.is_choose) return
				this.SET_ADDRESS(address)
				this.SET_ORDER_TYPE('takeout')
				if (this.scene == 'menu') {
					uni.switchTab({
						url: '/pages/menu/menu'
					})
				} else if (this.scene == 'pay') {
					uni.navigateTo({
						url: '/pages/pay/pay'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100%;
	}

	.main {
		width: 100%;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		padding-bottom: 100rpx;

		.address-wrapper {
			margin-bottom: 30rpx;
		}

		.address {
			width: 100%;
			padding: 40rpx 30rpx;
			background-color: #FFFFFF;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.right {
				flex: 1;
				overflow: hidden;
				display: flex;
				flex-direction: column;
			}

			.edit-icon {
				width: 50rpx;
				height: 50rpx;
				flex-shrink: 0;
			}
		}
	}

	.btn-box {
		height: 100rpx;
		background-color: #FFFFFF;
		box-shadow: 0 0 20rpx rgba($color: $text-color-assist, $alpha: 0.1);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 10rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;

		button {
			height: 80rpx;
			width: 80%;
			border-radius: 50rem !important;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>
