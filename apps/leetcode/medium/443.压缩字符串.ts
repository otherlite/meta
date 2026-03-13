/*
 * @lc app=leetcode.cn id=443 lang=typescript
 * @lcpr version=30400
 *
 * [443] 压缩字符串
 */
// abbbb
// count = curr = 2
// @lc code=start
function compress(chars: string[]): number {
  let write = 0;
  let curr = 0;

  while (curr < chars.length) {
    let count = 0;
    const char = chars[curr];
    while (char === chars[curr]) {
      count++;
      curr++;
    }

    chars[write++] = char;
    if (count > 1) {
      const str = `${count}`;
      for (let i = 0; i < str.length; i++) {
        chars[write++] = str.charAt(i);
      }
    }
  }

  return write;
}
// @lc code=end

/*
// @lcpr case=start
// ["a","a","b","b","c","c","c"]\n
// @lcpr case=end

// @lcpr case=start
// ["a"]\n
// @lcpr case=end

// @lcpr case=start
// ["a","b","b","b","b","b","b","b","b","b","b","b","b"]\n
// @lcpr case=end

 */
