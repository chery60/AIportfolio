import type { Viewer, Comment } from '../types';

export const SIMULATED_VIEWERS: Viewer[] = [
  { id: 'v1', name: 'Alex Morgan', color: '#7C5CFC', initials: 'AM', isActive: true, location: 'San Francisco, CA' },
  { id: 'v2', name: 'Priya Sharma', color: '#FF6B9D', initials: 'PS', isActive: true, location: 'London, UK' },
  { id: 'v3', name: 'Jordan Lee', color: '#22D3EE', initials: 'JL', isActive: false, location: 'Toronto, CA' },
  { id: 'v4', name: 'Sam Williams', color: '#34D399', initials: 'SW', isActive: true, location: 'NYC, NY' },
  { id: 'v5', name: 'Riley Chen', color: '#FBBF24', initials: 'RC', isActive: false, location: 'Seoul, KR' },
];

export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'Alex Morgan',
    authorColor: '#7C5CFC',
    authorInitials: 'AM',
    content: 'The process steps section is really clear. Love how the color coding maps to the phases.',
    timestamp: '2 min ago',
    reactions: [
      { emoji: '❤️', count: 3 },
      { emoji: '🔥', count: 1 },
    ]
  },
  {
    id: 'c2',
    author: 'Priya Sharma',
    authorColor: '#FF6B9D',
    authorInitials: 'PS',
    content: 'Those metrics are impressive. How did you measure the design consistency score?',
    timestamp: '15 min ago',
    reactions: [
      { emoji: '👍', count: 2 },
    ]
  },
  {
    id: 'c3',
    author: 'Sam Williams',
    authorColor: '#34D399',
    authorInitials: 'SW',
    content: 'The canvas experience itself IS a portfolio piece. Meta and brilliant.',
    timestamp: '1 hr ago',
    reactions: [
      { emoji: '🎯', count: 5 },
      { emoji: '💯', count: 2 },
    ]
  },
];
