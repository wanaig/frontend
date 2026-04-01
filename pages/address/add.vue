<template>
	<view class="container">
		<view class="form-box">
			<view class="form">
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">收货人</view>
						 <input class="input" placeholder="请输入收货人" v-model="form.acceptName" placeholder-class="text-color-assist"/>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">性别</view>
						<view class="radio-group">
							<view class="radio" :class="{'checked': form.sex == 0}" style="margin-right: 10rpx;" @tap="form.sex = 0">先生</view>
							<view class="radio" :class="{'checked': form.sex == 1}" @tap="form.sex = 1">女士</view>
						</view>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">联系方式</view>
						 <input class="input" placeholder="请输入收货人联系方式" v-model="form.mobile" placeholder-class="text-color-assist"/>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">收货地址</view>
						 <input class="input" placeholder="请选择收货地址" v-model="form.street" placeholder-class="text-color-assist"/>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">门牌号</view>
						 <input class="input" placeholder="请输入收货人详细地址" v-model="form.doorNumber" placeholder-class="text-color-assist"/>
					</view>
				</list-cell>
			</view>
			<view class="btn-section">
				<button type="primary" size="default" @tap="save">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import {postApi, putApi} from '@/api/index.js'

	export default {
		components: {
			listCell
		},
		data() {
			return {
				addressId: null,
				form: {
					acceptName: '',
					sex: 0,
					mobile: '',
					street: '',
					doorNumber: ''
				}
			}
		},
		async onLoad({id}) {
			if (id) {
				this.addressId = id
				await this.loadAddress(id)
			}
		},
		methods: {
			/**
			 * loadAddress - 加载地址详情
			 */
			async loadAddress(id) {
				try {
					uni.showLoading({ title: '加载中...' })
					// 获取地址详情
					const data = await this.$api('order.detail', { id })
					console.log('[地址] 详情:', data)

					if (data) {
						this.form = {
							acceptName: data.acceptName || '',
							sex: data.sex || 0,
							mobile: data.mobile || '',
							street: data.street || '',
							doorNumber: data.doorNumber || ''
						}
					}
					uni.hideLoading()
				} catch (err) {
					console.error('[地址] 加载失败:', err)
					uni.hideLoading()
				}
			},

			/**
			 * save - 保存地址（新增或更新）
			 */
			async save() {
				// 表单验证
				if (!this.form.acceptName) {
					uni.showToast({ title: '请输入收货人', icon: 'none' })
					return
				}
				if (!this.form.mobile) {
					uni.showToast({ title: '请输入联系方式', icon: 'none' })
					return
				}
				if (!this.form.street) {
					uni.showToast({ title: '请输入收货地址', icon: 'none' })
					return
				}

				try {
					uni.showLoading({ title: '保存中...' })

					// 构建请求数据
					const addressData = {
						acceptName: this.form.acceptName,
						sex: this.form.sex,
						mobile: this.form.mobile,
						street: this.form.street,
						doorNumber: this.form.doorNumber || '',
						isDefault: 0
					}

					console.log('[地址] 保存:', addressData)

					if (this.addressId) {
						// 更新地址
						await putApi('address.update', this.addressId, addressData)
						console.log('[地址] 更新成功')
					} else {
						// 新增地址
						await postApi('address.create', addressData)
						console.log('[地址] 新增成功')
					}

					uni.hideLoading()
					uni.showToast({ title: '保存成功', icon: 'success' })

					// 返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} catch (err) {
					console.error('[地址] 保存失败:', err)
					uni.hideLoading()
					uni.showToast({ title: '保存失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-box {
		width: 100%;
		height: 100%;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		color: $text-color-base;

		.form-input {
			display: flex;
			align-items: center;
			width: 100%;
		}

		.label {
			width: 200rpx;
			font-size: $font-size-lg;
			color: $text-color-base;
			font-weight: 500;
		}

		.input {
			flex: 1;
			display: flex;
			align-items: center;
		}

		.radio-group {
			display: flex;
			justify-content: flex-start;

			.radio {
				padding: 10rpx 30rpx;
				border-radius: 6rpx;
				border: 2rpx solid $text-color-assist;
				color: $text-color-assist;
				font-size: $font-size-base;

				&.checked {
					background-color: $color-primary;
					color: $text-color-white;
					border: 2rpx solid $color-primary;
				}
			}
		}

		.btn-section {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;

			button {
				font-size: $font-size-base;
				height: 90rpx;
				border-radius: 50rem !important;
				width: 85%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
</style>
