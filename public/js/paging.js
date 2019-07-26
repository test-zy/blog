// 处理分页
module.exports.paging = function (dataArr, showCount, curPage) {
	let totalPage,
		showData

	curPage = Number(curPage) || 1

	totalPage = Math.ceil(dataArr.length / showCount)

	/* 防止边界情况：用户手动修改地址栏的 page 值时 */
	if (curPage > totalPage) {
		curPage = totalPage
	}
	if (curPage < 1) {
		curPage = 1
	}

	showData = dataArr.slice(curPage * showCount - showCount, curPage * showCount)

	return {
		totalPage,
		showData,
		curPage
	}
}
