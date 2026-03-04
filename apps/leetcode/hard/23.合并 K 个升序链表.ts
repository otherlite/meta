/*
 * @lc app=leetcode.cn id=23 lang=typescript
 * @lcpr version=30307
 *
 * [23] 合并 K 个升序链表
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */
interface ListNode {
  val: number;
  next: ListNode | null;
}
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (lists.length === 1) return lists[0];

  let minIndex = Infinity;
  let minVal = Infinity;
  for (let i = 0; i < lists.length; i++) {
    const curr = lists[i]?.val;
    if (curr !== undefined && curr < minVal) {
      minIndex = i;
      minVal = curr;
    }
  }

  if (minIndex === Infinity) return null;

  const minNode = lists[minIndex]!;
  lists[minIndex] = minNode?.next ?? null;

  minNode.next = mergeKLists(lists);

  return minNode;
}
// @lc code=end

/*
// @lcpr case=start
// [[1,4,5],[1,3,4],[2,6]]\n
// @lcpr case=end

// @lcpr case=start
// []\n
// @lcpr case=end

// @lcpr case=start
// [[]]\n
// @lcpr case=end

 */
