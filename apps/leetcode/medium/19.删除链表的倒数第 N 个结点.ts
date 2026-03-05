/*
 * @lc app=leetcode.cn id=19 lang=typescript
 * @lcpr version=30307
 *
 * [19] 删除链表的倒数第 N 个结点
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
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  if (!head) return null;
  const dummy: ListNode | null = { val: 0, next: head };
  let curr: ListNode | null = head;
  let total = 0;
  while (curr) {
    curr = curr.next;
    total++;
  }
  let index = total - n;
  let targetNode: ListNode = dummy;
  while (index > 0) {
    targetNode = targetNode.next!;
    index--;
  }

  targetNode.next = targetNode.next?.next ?? null;

  return dummy.next;
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,4,5]\n2\n
// @lcpr case=end

// @lcpr case=start
// [1]\n1\n
// @lcpr case=end

// @lcpr case=start
// [1,2]\n1\n
// @lcpr case=end

 */
