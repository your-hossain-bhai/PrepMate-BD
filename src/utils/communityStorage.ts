import { CommunityPost } from '../types';
import { INITIAL_POSTS } from '../data/mockCommunity';

const COMMUNITY_POSTS_KEY = 'prepmate_community_posts_v2';

export function getSavedCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_POSTS;
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_POSTS;
  } catch (err) {
    console.error('Failed to load community posts from local storage:', err);
    return INITIAL_POSTS;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save community posts to local storage:', err);
  }
}
