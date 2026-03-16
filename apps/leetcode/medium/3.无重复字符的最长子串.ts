/*
 * @lc app=leetcode.cn id=3 lang=typescript
 * @lcpr version=30400
 *
 * [3] 无重复字符的最长子串
 */
// abcabcbb
// @lc code=start
function lengthOfLongestSubstring(s: string): number {
  if (s.length <= 1) return s.length;
  const map: Map<string, boolean> = new Map();
  let size = 0;
  let start = 0;
  let end = 0;
  while (end < s.length) {
    if (map.has(s[end])) {
      while (start < end) {
        if (s[start] !== s[end]) {
          map.delete(s[start]);
          start++;
        } else {
          start++;
          break;
        }
      }
    } else {
      map.set(s[end], true);
      const currSize = end - start + 1;
      size = currSize > size ? currSize : size;
    }
    end++;
  }

  return size;
}
// @lc code=end

/*
// @lcpr case=start
// "abcabcbb"\n
// @lcpr case=end

// @lcpr case=start
// "bbbbb"\n
// @lcpr case=end

// @lcpr case=start
// "pwwkew"\n
// @lcpr case=end

 */
