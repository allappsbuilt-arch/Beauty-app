import { useEffect, useState } from 'react';
import { applySocialEvent, subscribeSocial } from './socialEvents';

// Post list state that stays in sync with likes/comments/deletes/follows
// made anywhere in the app. `onStale` runs when a new post was created.
export function usePostList(onStale) {
  const [posts, setPosts] = useState([]);
  useEffect(() => subscribeSocial((event) => {
    if (event.type === 'stale') onStale?.();
    else setPosts((list) => applySocialEvent(list, event));
  }), [onStale]);
  return [posts, setPosts];
}
