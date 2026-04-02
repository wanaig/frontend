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
			<!-- <list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">手机号码</view>
					<view class="input flex-fill">
						<input type="text" v-model="member.mobilePhone" disabled>
					</view>
				</view>
			</list-cell> -->
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">性别</view>
					<view class="input flex-fill">
						<view class="radio-group">
							<view class="radio" :class="{'checked': member.gender == '1'}" style="margin-right: 10rpx;" @tap="member.gender='1'">先生</view>
							<view class="radio" :class="{'checked': member.gender == '2'}" @tap="member.gender='2'">女士</view>
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
		<view class="btn-box">
			<button type="primary" class="save-btn" @tap="save">保存</button>
			<button type="warn" class="logout-btn" @tap="logout">退出登录</button>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import {getMemberInfo, updateMemberInfo, logout} from '@/api/index.js'
	import {mapMutations} from 'vuex'

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
			...mapMutations(['SET_MEMBER']),
			startDate() {
				return this.getDate('start')
			},
			endDate() {
				return this.getDate('end')
			}
		},
		async onLoad() {
			await this.loadMemberInfo()
		},
		methods: {
			async loadMemberInfo() {
				try {
					uni.showLoading({ title: '加载中...' })
					const data = await getMemberInfo()

					if (data) {
						// 后端 gender: 0=未知, 1=男, 2=女
						// 前端 gender: '1'=先生, '2'=女士
						this.member = {
							customerId: data.customerId,
							nickname: data.nickname || '',
							avatar: data.avatar || '',
							mobilePhone: data.mobilePhone || '',
							gender: data.gender == 1 ? '1' : (data.gender == 2 ? '2' : '1'),
							birthday: this.formatDateTime(data.birthday),
							memberLevel: data.memberLevel || data.level || 1,
							pointNum: data.pointNum || 0,
							couponNum: data.couponNum || 0,
							balance: data.balance || 0,
							giftBalance: data.giftBalance || 0,
							currentValue: data.currentValue || 0,
							needValue: data.needValue || 0,
							openingCardDate: this.formatTimestamp(data.createdAt)
						}
					}
					uni.hideLoading()
				} catch (err) {
					uni.hideLoading()
				}
			},

			formatTimestamp(timestamp) {
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

			formatDateTime(dateStr) {
				if (!dateStr) return ''
				const date = new Date(dateStr)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				const second = String(date.getSeconds()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}:${second}`
			},

			getDate(type) {
				const date = new Date()
				let year = date.getFullYear()
				let month = date.getMonth() + 1
				let day = date.getDate()

				if (type === 'start') {
					year = year - 60
				} else if (type === 'end') {
					year = year + 2
				}
				month = month > 9 ? month : '0' + month
				day = day > 9 ? day : '0' + day
				return `${year}-${month}-${day}`
			},
			handleDateChange(e) {
				this.member.birthday = e.target.value
			},

			async save() {
				if (!this.member.nickname) {
					return uni.showToast({ title: '请输入昵称', icon: 'none' })
				}

				uni.showLoading({ title: '保存中...' })

				// 前端 gender: '1'=先生, '2'=女士
				// 后端 gender: 1=男, 2=女
				const gender = this.member.gender === '1' ? 1 : 2

				try {
					await updateMemberInfo(
						this.member.nickname,
						this.member.avatar,
						gender,
						this.member.birthday
					)

					uni.hideLoading()
					uni.showToast({ title: '保存成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 1500)
				} catch (err) {
					uni.hideLoading()
					uni.showToast({ title: '保存失败', icon: 'none' })
				}
			},
			logout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							logout()
						}
					}
				})
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
	display: flex;
	flex-direction: column;
	align-items: center;
}

.save-btn {
	width: 90%;
	border-radius: 50rem !important;
	font-size: $font-size-lg;
}

.logout-btn {
	width: 90%;
	margin-top: 20rpx;
	border-radius: 50rem !important;
	font-size: $font-size-lg;
}
</style>
