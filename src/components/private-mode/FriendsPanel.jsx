/**
 * FriendsPanel — Manage friends, pending requests, and trusted contacts.
 *
 * Sections:
 *  - User identity card (display name + reroll)
 *  - Search + add by display name
 *  - Incoming requests (accept/decline)
 *  - Pending outgoing requests (cancel)
 *  - Accepted friends (toggle trusted, remove)
 */

import { useCallback, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import styles from '../../styles/private-mode/chat.module.css';
import FriendIdentityCard from './FriendIdentityCard';
import SearchFriendsField from './SearchFriendsField';
import FriendRequestsSections from './FriendRequestsSections';
import { isRealId, normalizeFriend } from './chatUtils';

export default function FriendsPanel({ myHandle, friends, setFriends }) {
  const incoming = friends.filter((f) => f.status === 'incoming');
  const outgoing = friends.filter((f) => f.status === 'outgoing');
  const accepted = friends.filter((f) => f.status === 'accepted');

  const accept = async (id) => {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'accepted' } : f)));
    if (!isRealId(id)) return;
    try {
      await fetch(`/api/friends/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
    } catch {
      /* keep optimistic */
    }
  };

  const remove = async (id, friendStatus) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    if (!isRealId(id)) return;
    try {
      if (friendStatus === 'accepted') {
        await fetch(`/api/friends/${id}`, { method: 'DELETE' });
      } else if (friendStatus === 'incoming') {
        await fetch(`/api/friends/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        });
      } else {
        await fetch(`/api/friends/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' }),
        });
      }
    } catch {
      /* keep optimistic */
    }
  };

  const toggleTrusted = async (id, value) => {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, isTrusted: value } : f)));
    if (!isRealId(id)) return;
    try {
      const res = await fetch(`/api/friends/${id}/trusted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trusted: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, isTrusted: !value } : f)));
    }
  };

  const sendRequest = useCallback(
    async (handle) => {
      if (!handle) return;
      const name = handle.trim();
      if (!name) return;
      if (friends.some((f) => f.displayName.toLowerCase() === name.toLowerCase())) return;

      const optimisticId = `pending-${Date.now()}`;
      setFriends((prev) => [
        ...prev,
        { id: optimisticId, displayName: name, emoji: name.slice(0, 2).toUpperCase(), status: 'outgoing' },
      ]);

      try {
        const res = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousDisplayName: name }),
        });
        if (!res.ok) {
          setFriends((prev) => prev.filter((f) => f.id !== optimisticId));
          return;
        }
        const body = await res.json();
        if (!body.friend) return;
        setFriends((prev) =>
          prev.map((f) => (f.id === optimisticId ? normalizeFriend(body.friend) : f))
        );
      } catch {
        setFriends((prev) => prev.filter((f) => f.id !== optimisticId));
      }
    },
    [friends, setFriends]
  );

  return (
    <div className={styles.friendsPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Friends connect by anonymous display name only. Real names are never shared.</span>
      </div>

      <FriendIdentityCard displayName={myHandle} />
      <SearchFriendsField friends={friends} onSendRequest={sendRequest} />
      <FriendRequestsSections
        incoming={incoming}
        outgoing={outgoing}
        accepted={accepted}
        onAccept={accept}
        onRemove={remove}
        onToggleTrusted={toggleTrusted}
      />
    </div>
  );
}
