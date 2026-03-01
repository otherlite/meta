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

  let dummy: ListNode = { val: 0, next: head };
  let prev = dummy;

  for (let i = 1; i < left; i++) {
    prev = prev.next!;
  }

  let leftNode = prev.next;
  let curr = leftNode;
  let next = null;

  for (let i = left; i <= right; i++) {
    next = curr!.next;
    curr!.next = prev.next;
    prev.next = curr;
    curr = next;
  }

  leftNode!.next = curr;

  return dummy.next;
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
