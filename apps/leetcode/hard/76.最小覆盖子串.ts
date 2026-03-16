/*
 * @lc app=leetcode.cn id=76 lang=typescript
 * @lcpr version=30400
 *
 * [76] 最小覆盖子串
 */

// @lc code=start
function minWindow(s: string, t: string): string {
  let result = "";

  // T 的字母次数
  const map: Map<string, number> = new Map();
  for (let i = 0; i < t.length; i++) {
    const char = t.charAt(i);
    map.set(char, (map.get(char) ?? 0) + 1);
  }

  // T 的去重字母次数
  let size = map.size;

  // 双指针从头到尾遍历
  let start = 0;
  let end = 0;
  while (end < s.length) {
    if (map.has(s[end])) {
      map.set(s[end], map.get(s[end])! - 1);
    }
    if (map.get(s[end]) === 0) {
      size--;
    }
    while (size === 0) {
      // 设置子串
      if (!result || end - start < result.length) {
        result = s.slice(start, end + 1);
      }
      if (map.has(s[start])) {
        if (map.get(s[start]) === 0) size++;
        map.set(s[start], map.get(s[start])! + 1);
      }
      start++;
    }

    end++;
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// "ADOBECODEBANC"\n"ABC"\n
// @lcpr case=end

// @lcpr case=start
// "a"\n"a"\n
// @lcpr case=end

// @lcpr case=start
// "a"\n"aa"\n
// @lcpr case=end

 */
