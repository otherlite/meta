/*
 * @lc app=leetcode.cn id=20 lang=typescript
 * @lcpr version=30307
 *
 * [20] 有效的括号
 */

// @lc code=start
function isValid(s: string): boolean {
  const map = { "[": "]", "(": ")", "{": "}" } as const;
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    const char = s.charAt(i);
    if (["[", "{", "("].includes(char)) {
      stack.push(map[char as keyof typeof map]);
    } else {
      const str2 = stack.pop();
      if (char !== str2) return false;
    }
  }

  return stack.length === 0;
}
// @lc code=end

/*
// @lcpr case=start
// "()"\n
// @lcpr case=end

// @lcpr case=start
// "()[]{}"\n
// @lcpr case=end

// @lcpr case=start
// "(]"\n
// @lcpr case=end

// @lcpr case=start
// "([])"\n
// @lcpr case=end

// @lcpr case=start
// "([)]"\n
// @lcpr case=end

 */
