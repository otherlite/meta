/*
 * @lc app=leetcode.cn id=92 lang=typescript
 * @lcpr version=30400
 *
 * [92] 反转链表 II
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

function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number,
): ListNode | null {
  if (!head || left === right) return head;

  if (left === 1) {
    let prev = null;
    let curr = head;
    let leftNode = head;
    while (left <= right) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next!;
      left++;
    }

    leftNode.next = curr;

    return prev;
  }

  const next = head.next;
  head.next = reverseBetween(next, left - 1, right - 1);
  return head;
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,4,5]\n2\n4\n
// @lcpr case=end

// @lcpr case=start
// [5]\n1\n1\n
// @lcpr case=end

 */
