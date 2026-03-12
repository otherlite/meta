/*
 * @lc app=leetcode.cn id=394 lang=typescript
 * @lcpr version=30400
 *
 * [394] 字符串解码
 */
// 3[a]2[bc]
// @lc code=start
function decodeString(s: string): string {
  let stack: string[] = [];
  let subStack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const char = s.charAt(i);
    if (char !== "]") {
      stack.push(char);
    } else {
      while (stack.length > 0) {
        const char = stack.pop()!;
        if (char === "[") {
          const num = stack.pop()!;
          stack.push(new Array(parseInt(num)).fill(subStack.join("")).join(""));
          subStack = [];
          break;
        } else {
          subStack.push(char);
        }
      }
    }
  }

  return stack.join("");
}
// @lc code=end

/*
// @lcpr case=start
// "3[a]2[bc]"\n
// @lcpr case=end

// @lcpr case=start
// "3[a2[c]]"\n
// @lcpr case=end

// @lcpr case=start
// "2[abc]3[cd]ef"\n
// @lcpr case=end

 */
