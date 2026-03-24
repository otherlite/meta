/*
 * @lc app=leetcode id=50 lang=typescript
 * @lcpr version=30400
 *
 * [50] Pow(x, n)
 */

// @lc code=start
function myPow(x: number, n: number): number {
  if (n === 0) return 1;
  if (n < 0) return myPow(1 / x, -n);
  const result = myPow(x, Math.floor(n / 2));
  if (n % 2) return result * result * x;
  return result * result;
}
// @lc code=end

/*
// @lcpr case=start
// 2.00000\n10\n
// @lcpr case=end

// @lcpr case=start
// 2.10000\n3\n
// @lcpr case=end

// @lcpr case=start
// 2.00000\n-2\n
// @lcpr case=end

 */
