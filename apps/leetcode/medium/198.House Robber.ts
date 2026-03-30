/*
 * @lc app=leetcode id=198 lang=typescript
 * @lcpr version=30401
 *
 * [198] House Robber
 */

// @lc code=start
function rob(nums: number[]): number {
  const map: Record<number, number> = {};
  const dfs = (i: number): number => {
    if (i >= nums.length) return 0;
    if (map[i] !== undefined) return map[i];
    const first = nums[i] ?? 0;
    const second = nums[i + 1] ?? 0;
    const result = Math.max(first + dfs(i + 2), second + dfs(i + 3));
    map[i] = result;
    return result;
  };

  return dfs(0);
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,1]\n
// @lcpr case=end

// @lcpr case=start
// [2,7,9,3,1]\n
// @lcpr case=end

 */
