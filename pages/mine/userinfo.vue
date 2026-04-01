<template>
	<view class="container d-flex flex-column">
		<view class="flex-fill form">
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">昵称</view>
					<view class="input flex-fill">
						<input type="text" placeholder="请填写昵称" placeholder-class="text-color-assist font-size-base" 
						v-model="member.nickname">
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">手机号码</view>
					<view class="input flex-fill">
						<input type="text" v-model="member.mobilePhone" disabled>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">性别</view>
					<view class="input flex-fill">
						<view class="radio-group">
							<view class="radio" :class="{'checked': member.gender == '1'}" style="margin-right: 10rpx;" @tap="member.gender=1">先生</view>
							<view class="radio" :class="{'checked': member.gender == '2'}" @tap="member.gender=2">女士</view>
						</view>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false" :arrow="!member.birthday">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">生日</view>
					<view class="input flex-fill">
						<picker mode="date" :value="date" :start="startDate" :end="endDate" v-if="!member.birthday" @change="handleDateChange">
							生日当天有惊喜
						</picker>
						<input type="text" v-else :value="member.birthday" disabled>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false" last>
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">入会时间</view>
					<view class="input flex-fill">
						<input type="text" v-model="member.openingCardDate" disabled>
					</view>
				</view>
			</list-cell>
		</view>
		<view class="btn-box d-flex align-items-center just-content-center">
			<button type="primary" class="save-btn" @tap="save">保存</button>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	
	export default {
		components: {
			listCell
		},
		data() {
			const currentDate = this.getDate({format: true})
			return {
				member: {},
				date: currentDate
			}
		},
		computed: {
		   startDate() {
				return this.getDate('start');
			},
			endDate() {
				return this.getDate('end');
			}
		},
		async onLoad() {
			await this.loadMemberInfo()
		},
		methods: {
			/**
			 * loadMemberInfo - 加载会员信息
			 */
			async loadMemberInfo() {
				try {
					uni.showLoading({ title: '加载中...' })

					const data = await this.$api('member')
					console.log('[会员] 信息:', data)

					if (data) {
						this.member = {
							customerId: data.customerId,
							nickname: data.nickname || '',
							avatar: data.avatar || '',
							mobilePhone: data.mobilePhone || '',
							gender: data.gender == 0 ? '2' : (data.gender == 1 ? '1' : '1'),
							birthday: data.birthday || '',
							memberLevel: data.memberLevel || data.level || 1,
							pointNum: data.pointNum || 0,
							couponNum: data.couponNum || 0,
							balance: data.balance || 0,
							giftBalance: data.giftBalance || 0,
							currentValue: data.currentValue || 0,
							needValue: data.needValue || 0,
							openingCardDate: data.openingCardDate || ''
						}
					}

					uni.hideLoading()
				} catch (err) {
					console.error('[会员] 信息加载失败:', err)
					uni.hideLoading()
				}
			},

			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();

				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			handleDateChange(e) {
				this.member.birthday = e.target.value
			},

			/**
			 * save - 保存会员信息
			 */
			async save() {
				// 表单验证
				if (!this.member.nickname) {
					uni.showToast({ title: '请输入昵称', icon: 'none' })
					return
				}

				try {
					uni.showLoading({ title: '保存中...' })

					// 转换性别格式：前端1=先生,2=女士 → 后端1=男,0=女
					const gender = this.member.gender == '1' ? 1 : 0

					// 获取 token
					const token = uni.getStorageSync('auth_token')
					console.log('[会员] Token:', token)

					// 直接使用 uni.request 发送 PUT 请求
					const response = await uni.request({
						url: 'http://192.168.46.107:8080/api/member/info',
						method: 'PUT',
						header: {
							'Authorization': token ? `Bearer ${token}` : '',
							'Content-Type': 'application/json'
						},
						data: {
							nickname: this.member.nickname,
							gender: gender,
							birthday: this.member.birthday
						}
					})

					console.log('[会员] 更新响应:', JSON.stringify(response, null, 2))

					uni.hideLoading()

					// 提取响应数据
					const result = response.data
					console.log('[会员] result:', result)
					console.log('[会员] result.code:', result && result.code)

					// 判断是否成功
					if (result && result.code === 0) {
						uni.showToast({ title: '保存成功', icon: 'success' })
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else if (result) {
						uni.showToast({ title: result.message || '保存失败', icon: 'none' })
					} else {
						uni.showToast({ title: '保存成功', icon: 'success' })
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				} catch (err) {
					console.error('[会员] 保存失败:', err)
					uni.hideLoading()
					uni.showToast({ title: '保存失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	height: 100%;
}

.container {
	padding: 20rpx 30rpx;
}

.form {
	border-radius: 8rpx;
}

.form-input {
	.label {
		width: 160rpx;
		font-size: $font-size-base;
		color: $text-color-base;
	}
	
	.input {
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
}

.btn-box {
	height: calc((100vh - 40rpx) / 2);
}

.save-btn {
	width: 90%;
	border-radius: 50rem !important;
	font-size: $font-size-lg;
}
</style>
