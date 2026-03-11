/*
 * @lc app=leetcode.cn id=678 lang=typescript
 * @lcpr version=30400
 *
 * [678] 有效的括号字符串
 */

// @lc code=start
function checkValidString(s: string): boolean {
  const brackets = [];
  const asterisks = [];

  for (let i = 0; i < s.length; i++) {
    const char = s.charAt(i);
    if ("(" === char) {
      brackets.push(i);
      continue;
    }
    if ("*" === char) {
      asterisks.push(i);
      continue;
    }
    if (")" === char) {
      if (brackets.length > 0) {
        brackets.pop();
        continue;
      }
      if (asterisks.length > 0) {
        asterisks.pop();
        continue;
      }
      return false;
    }
  }

  while (brackets.length > 0 && asterisks.length > 0) {
    const leftIndex = brackets.pop()!;
    const rightIndex = asterisks.pop()!;

    if (leftIndex > rightIndex) return false;
  }

  return brackets.length === 0;
}
// @lc code=end

/*
// @lcpr case=start
// "()"\n
// @lcpr case=end

// @lcpr case=start
// "(*)"\n
// @lcpr case=end

// @lcpr case=start
// "(*))"\n
// @lcpr case=end

 */
