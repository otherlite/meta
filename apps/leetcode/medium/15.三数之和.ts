/*
 * @lc app=leetcode.cn id=15 lang=typescript
 * @lcpr version=30400
 *
 * [15] 三数之和
 */
// [-1,0,1,2,-1,-4]
// [-4,-1,-1,0,1,2]
// [[-1,0,1]]	[[-1,-1,2],[-1,0,1]]

// @lc code=start
function threeSum(nums: number[]): number[][] {
  const arr = nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) continue;
    const num1 = arr[i];
    let leftIndex = i + 1;
    let rightIndex = arr.length - 1;
    while (leftIndex < rightIndex) {
      const left = arr[leftIndex];
      const right = arr[rightIndex];
      const sum = num1 + left + right;

      if (sum === 0) {
        res.push([num1, arr[leftIndex], arr[rightIndex]]);
      }
      if (sum <= 0) {
        while (arr[++leftIndex] === left) {}
      }
      if (sum > 0) {
        while (arr[--rightIndex] === right) {}
      }
    }
  }
  return res;
}
// @lc code=end

/*
// @lcpr case=start
// [-1,0,1,2,-1,-4]\n
// @lcpr case=end

// @lcpr case=start
// [0,1,1]\n
// @lcpr case=end

// @lcpr case=start
// [0,0,0]\n
// @lcpr case=end

 */
