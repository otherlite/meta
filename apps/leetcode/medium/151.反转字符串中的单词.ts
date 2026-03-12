/*
 * @lc app=leetcode.cn id=151 lang=typescript
 * @lcpr version=30400
 *
 * [151] 反转字符串中的单词
 */

// @lc code=start
function reverseWords(s: string): string {
  return s.trim().split(/\s+/).reverse().join(" ");
}
// @lc code=end

/*
// @lcpr case=start
// "the sky is blue"\n
// @lcpr case=end

// @lcpr case=start
// "  hello world  "\n
// @lcpr case=end

// @lcpr case=start
// "a good   example"\n
// @lcpr case=end

 */
