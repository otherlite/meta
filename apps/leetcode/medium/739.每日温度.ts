/*
 * @lc app=leetcode.cn id=739 lang=typescript
 * @lcpr version=30400
 *
 * [739] 每日温度
 */

// @lc code=start
function dailyTemperatures(temperatures: number[]): number[] {
  let stack: number[] = [];
  const result: number[] = new Array(temperatures.length).fill(0);

  for (let i = 0; i < temperatures.length; i++) {
    while (
      stack.length > 0 &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const index = stack.pop()!;
      result[index] = i - index;
    }

    stack.push(i);
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [73,74,75,71,69,72,76,73]\n
// @lcpr case=end

// @lcpr case=start
// [30,40,50,60]\n
// @lcpr case=end

// @lcpr case=start
// [30,60,90]\n
// @lcpr case=end

 */
