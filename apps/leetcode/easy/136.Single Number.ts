/*
 * @lc app=leetcode id=136 lang=typescript
 * @lcpr version=30400
 *
 * [136] Single Number
 */

// @lc code=start
function singleNumber(nums: number[]): number {
  let result = 0;
  for (let i = 0; i < nums.length; i++) {
    result ^= nums[i];
  }
  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [2,2,1]\n
// @lcpr case=end

// @lcpr case=start
// [4,1,2,1,2]\n
// @lcpr case=end

// @lcpr case=start
// [1]\n
// @lcpr case=end

 */
