/*
 * @lc app=leetcode.cn id=5 lang=typescript
 * @lcpr version=30400
 *
 * [5] 最长回文子串
 */

// @lc code=start
function longestPalindrome(s: string): string {
  if (s.length === 1) return s;
  let result = "";
  const helper = (m: number, n: number) => {
    while (m >= 0 && n < s.length && s.charAt(m) === s.charAt(n)) {
      m--;
      n++;
    }

    if (n - m - 1 > result.length) {
      result = s.slice(m + 1, n);
    }
  };
  for (let i = 0; i < s.length; i++) {
    helper(i, i);
    helper(i, i + 1);
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// "babad"\n
// @lcpr case=end

// @lcpr case=start
// "cbbd"\n
// @lcpr case=end

 */
