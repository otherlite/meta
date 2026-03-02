/*
 * @lc app=leetcode.cn id=141 lang=typescript
 * @lcpr version=30307
 *
 * [141] 环形链表
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
function hasCycle(head: ListNode | null): boolean {
  if (!head) return false;

  let curr: ListNode | null = head;
  let quick: ListNode | null = head.next;

  while (curr && quick) {
    if (curr === quick) {
      return true;
    }
    curr = curr.next;
    quick = quick.next?.next ?? null;
  }

  return false;
}
// @lc code=end

/*
// @lcpr case=start
// [3,2,0,-4]\n1\n
// @lcpr case=end

// @lcpr case=start
// [1,2]\n0\n
// @lcpr case=end

// @lcpr case=start
// [1]\n-1\n
// @lcpr case=end

 */
