/*
 * @lc app=leetcode id=172 lang=typescript
 * @lcpr version=30400
 *
 * [172] Factorial Trailing Zeroes
 */

// @lc code=start
function trailingZeroes(n: number): number {
  let result = 0;
  let i = 5;
  while (i <= n) {
    let start = i;
    while (start % 5 === 0) {
      result++;
      start = start / 5;
    }
    i += 5;
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 3\n
// @lcpr case=end

// @lcpr case=start
// 5\n
// @lcpr case=end

// @lcpr case=start
// 0\n
// @lcpr case=end

 */
