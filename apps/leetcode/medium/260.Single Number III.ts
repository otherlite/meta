/*
 * @lc app=leetcode id=260 lang=typescript
 * @lcpr version=30400
 *
 * [260] Single Number III
 */

// @lc code=start
function singleNumber(nums: number[]): number[] {
  let xOrSum = 0;
  for (let i = 0; i < nums.length; i++) {
    xOrSum ^= nums[i];
  }

  const mask = xOrSum & -xOrSum;
  let resultA = 0;
  let resultB = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] & mask) {
      resultA ^= nums[i];
    } else {
      resultB ^= nums[i];
    }
  }

  return [resultA, resultB];
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,1,3,2,5]\n
// @lcpr case=end

// @lcpr case=start
// [-1,0]\n
// @lcpr case=end

// @lcpr case=start
// [0,1]\n
// @lcpr case=end

 */
