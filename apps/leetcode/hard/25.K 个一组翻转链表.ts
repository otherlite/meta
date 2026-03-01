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
  let dummy: ListNode = { val: 0, next: head };
  let prev = dummy;
  let curr = prev.next;
  let count = 0;
  let leftNode: ListNode = curr!;

  while (curr) {
    if (count === 0) {
      leftNode = curr;
    }
    if (count <= k - 1) {
      let node = curr.next;
      curr.next = prev.next;
      prev.next = curr;
      curr = node;
      leftNode.next = curr;
    }
    if (count === k - 1) {
      prev = leftNode;
    }
    count = (count + 1) % k;
  }
  if (count !== 0) {
    let result = null;
    curr = prev.next;
    while (curr) {
      let next = curr.next;
      curr.next = result;
      result = curr;
      prev.next = curr;
      curr = next;
    }
  }
  return dummy.next;
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
