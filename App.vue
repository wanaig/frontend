<script>
// 屏蔽个人小程序不能使用的企业版 API
if (typeof wx.getWxaAsyncSecInfo === 'function') {
	wx.getWxaAsyncSecInfo = function() {
		return { errMsg: 'disabled' }
	}
}

export default {
	onLaunch: function() {
		console.log('App Launch');
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	}
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '~@/static/style/app.scss';
</style>
