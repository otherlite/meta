/*
 * @lc app=leetcode.cn id=125 lang=typescript
 * @lcpr version=30400
 *
 * [125] 验证回文串
 */

// @lc code=start
function isPalindrome(s: string): boolean {
  let start = 0;
  let end = s.length - 1;
  while (start <= end) {
    if (!/[a-zA-Z0-9]/.test(s.charAt(start))) {
      start++;
      continue;
    }
    if (!/[a-zA-Z0-9]/.test(s.charAt(end))) {
      end--;
      continue;
    }
    if (s.charAt(start).toLowerCase() === s.charAt(end).toLowerCase()) {
      start++;
      end--;
    } else {
      return false;
    }
  }
  return true;
}
// @lc code=end

/*
// @lcpr case=start
// "A man, a plan, a canal: Panama"\n
// @lcpr case=end

// @lcpr case=start
// "race a car"\n
// @lcpr case=end

// @lcpr case=start
// " "\n
// @lcpr case=end

 */
