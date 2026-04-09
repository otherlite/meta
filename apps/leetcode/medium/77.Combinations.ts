/*
 * @lc app=leetcode id=77 lang=typescript
 * @lcpr version=30400
 *
 * [77] Combinations
 */

// 4 2
// @lc code=start
function combine(n: number, k: number): number[][] {
  if (k === 1) return Array.from({ length: n }).map((i, index) => [index + 1]);

  const result: number[][] = [];

  let start = n;

  while (start >= k) {
    const rest = combine(start - 1, k - 1);
    for (let i = 0; i < rest.length; i++) {
      result.push(rest[i].concat(start));
    }
    start--;
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 4\n2\n
// @lcpr case=end

// @lcpr case=start
// 1\n1\n
// @lcpr case=end

 */
