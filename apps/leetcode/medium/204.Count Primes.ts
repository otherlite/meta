/*
 * @lc app=leetcode id=204 lang=typescript
 * @lcpr version=30400
 *
 * [204] Count Primes
 */

// @lc code=start
function countPrimes(n: number): number {
  const primes = Array(n).fill(1);
  let result = 0;
  for (let i = 2; i <= n; i++) {
    if (primes[i]) {
      result++;
      for (let x = i * i; x <= n; x += i) {
        primes[x] = 0;
      }
    }
  }
  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 10\n
// @lcpr case=end

// @lcpr case=start
// 0\n
// @lcpr case=end

// @lcpr case=start
// 1\n
// @lcpr case=end

 */
