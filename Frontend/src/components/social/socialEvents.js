// Tiny pub/sub so a change made on one screen (a comment added, a post
// deleted, someone followed) updates every list showing that post.
//   emitPostChange(id, patch)   — merge `patch` into the post
//   emitPostRemoved(id)         — post deleted or hidden (reported)
//   emitAuthorFollow(userId, f) — follow state changed for an author
const listeners = new Set();

export function subscribeSocial(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const emit = (event) => listeners.forEach((fn) => fn(event));
export const emitPostChange = (id, patch) => emit({ type: 'change', id, patch });
export const emitPostRemoved = (id) => emit({ type: 'removed', id });
export const emitAuthorFollow = (userId, following) => emit({ type: 'follow', userId, following });
export const emitFeedStale = () => emit({ type: 'stale' });

// Applies an event to an array of posts (returns the same array if unaffected).
export function applySocialEvent(posts, event) {
  switch (event.type) {
    case 'change':
      return posts.some((p) => p.id === event.id) ? posts.map((p) => (p.id === event.id ? { ...p, ...event.patch } : p)) : posts;
    case 'removed':
      return posts.some((p) => p.id === event.id) ? posts.filter((p) => p.id !== event.id) : posts;
    case 'follow':
      return posts.some((p) => p.author.id === event.userId)
        ? posts.map((p) => (p.author.id === event.userId ? { ...p, authorFollowed: event.following } : p))
        : posts;
    default:
      return posts;
  }
}
