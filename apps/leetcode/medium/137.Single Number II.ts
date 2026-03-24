/*
 * @lc app=leetcode id=137 lang=typescript
 * @lcpr version=30400
 *
 * [137] Single Number II
 */

// @lc code=start
function singleNumber2(nums: number[]): number {
  const countArr: number[] = Array(32).fill(0);
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < nums.length; j++) {
      countArr[i] += (nums[j] >> (31 - i)) & 1;
    }
  }
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) + (countArr[i] % 3);
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [2,2,3,2]\n
// @lcpr case=end

// @lcpr case=start
// [0,1,0,1,0,1,99]\n
// @lcpr case=end

 */
