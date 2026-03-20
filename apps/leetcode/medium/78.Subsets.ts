/*
 * @lc app=leetcode id=78 lang=typescript
 * @lcpr version=30400
 *
 * [78] Subsets
 */

// @lc code=start
function subsets(nums: number[]): number[][] {
  if (nums.length === 0) return [[]];
  const result: number[][] = [[]];
  while (nums.length > 0) {
    const num = nums.pop()!;
    const length = result.length;
    for (let i = 0; i < length; i++) {
      result.push(result[i].concat(num));
    }
  }
  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3]\n
// @lcpr case=end

// @lcpr case=start
// [0]\n
// @lcpr case=end

 */
