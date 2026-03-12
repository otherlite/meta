/*
 * @lc app=leetcode.cn id=43 lang=typescript
 * @lcpr version=30400
 *
 * [43] 字符串相乘
 */

// @lc code=start
function multiply(num1: string, num2: string): string {
  if (num1 === "0" || num2 === "0") return "0";
  let l1 = num1.length;
  let l2 = num2.length;
  const result: number[] = new Array(l1 + l2).fill(0);

  for (let i = l1 - 1; i >= 0; i--) {
    for (let j = l2 - 1; j >= 0; j--) {
      const mul = parseInt(num1.charAt(i)) * parseInt(num2.charAt(j));
      const p1 = i + j;
      const p2 = i + j + 1;
      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);
    }
  }

  if (result[0] === 0) result.shift();

  return result.join("");
}
// @lc code=end

/*
// @lcpr case=start
// "2"\n"3"\n
// @lcpr case=end

// @lcpr case=start
// "123"\n"456"\n
// @lcpr case=end

 */
