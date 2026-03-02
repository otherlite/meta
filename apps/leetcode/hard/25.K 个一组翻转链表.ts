/*
 * @lc app=leetcode.cn id=25 lang=typescript
 * @lcpr version=30400
 *
 * [25] K 个一组翻转链表
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
function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  if (!head || k === 1) return head;

  let rightNode: ListNode | null = head;
  for (let i = 1; i <= k; i++) {
    if (!rightNode) {
      return head;
    }
    rightNode = rightNode.next;
  }

  const rightList: ListNode | null = reverseKGroup(rightNode, k);

  let prev = null;
  let curr: ListNode = head;
  let leftNode: ListNode = head;

  for (let i = 1; i <= k; i++) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next!;
  }

  leftNode.next = rightList;

  return prev;
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,4,5]\n2\n
// @lcpr case=end

// @lcpr case=start
// [1,2,3,4,5]\n3\n
// @lcpr case=end

 */
