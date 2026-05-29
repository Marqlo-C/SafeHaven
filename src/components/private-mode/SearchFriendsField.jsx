/**
 * SearchFriendsField — Search + dropdown for adding friends by display name.
 *
 * Features:
 *  - Debounced search (300ms) to `/api/users/search`
 *  - Dropdown shows results
 *  - Send friend request on selection
 *  - Prevents duplicate requests
 */

import { useCallback, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import styles from '../../styles/private-mode/chat.module.css';

const MONGO_ID_RE = /^[a-f0-9]{24}$/i;
const isRealId = (id) => MONGO_ID_RE.test(String(id));

function initialsForName(displayName) {
  return String(displayName || 'Friend').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'FR';
}

export default function SearchFriendsField({ friends, onSendRequest }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimer = useRef(null);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(searchTimer.current);
    if (val.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}`);
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.users || []);
        setShowDropdown(true);
      } catch {
        /* silent */
      }
    }, 300);
  };

  const sendRequest = useCallback(
    (handle) => {
      const name = (handle || query).trim();
      if (!name) return;
      if (friends.some((f) => f.displayName.toLowerCase() === name.toLowerCase())) return;

      setQuery('');
      setResults([]);
      setShowDropdown(false);
      onSendRequest(name);
    },
    [query, friends, onSendRequest]
  );

  return (
    <div className={styles.addFriendWrap}>
      <div className={styles.addFriendLabel}>Add by display name</div>
      <label className={styles.addFriendField}>
        <Search className={styles.smallIcon} aria-hidden="true" />
        <input
          value={query}
          onChange={handleQueryChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendRequest();
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Search by display name"
          aria-label="Add friend by display name"
          autoComplete="off"
        />
        {query.trim() && (
          <button type="button" className={styles.requestButton} onClick={() => sendRequest()}>
            Request
          </button>
        )}
      </label>
      {showDropdown && (
        <div className={styles.searchDropdown}>
          {results.length === 0 ? (
            <div className={styles.searchDropdownEmpty}>No users found</div>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                type="button"
                className={styles.searchDropdownItem}
                onMouseDown={(e) => {
                  e.preventDefault();
                  sendRequest(u.displayName);
                }}
              >
                <span className={styles.friendAvatar} aria-hidden="true">
                  {initialsForName(u.displayName)}
                </span>
                <span>{u.displayName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
