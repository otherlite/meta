/*
 * @lc app=leetcode.cn id=415 lang=typescript
 * @lcpr version=30400
 *
 * [415] 字符串相加
 */

// @lc code=start
function addStrings(num1: string, num2: string): string {
  let result = "";
  const num1s = num1.split("");
  const num2s = num2.split("");
  let carry = 0;

  while (num1s.length > 0 || num2s.length > 0) {
    const n1 = parseInt(num1s.pop() ?? "0");
    const n2 = parseInt(num2s.pop() ?? "0");
    const sum = n1 + n2 + carry;
    result = `${sum % 10}${result}`;
    carry = Math.floor(sum / 10);
  }

  return `${carry === 0 ? "" : carry}${result}`;
}
// @lc code=end

/*
// @lcpr case=start
// "11"\n"123"\n
// @lcpr case=end

// @lcpr case=start
// "456"\n"77"\n
// @lcpr case=end

// @lcpr case=start
// "0"\n"0"\n
// @lcpr case=end

 */
