import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { searchService } from '../../services/messageService';
import { Avatar } from '../common/Avatar';

export const NewConversationModal = ({ isOpen, onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchService.searchUsers(q);
      if (res.success) {
        setResults(res.users.filter((u) => !u.isSelf));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or username..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-100 dark:bg-[#182235] border border-transparent focus:border-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-[#273449]">
          {loading ? (
            <div className="p-4 flex justify-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            results.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#182235] rounded-xl cursor-pointer transition-colors"
              >
                <Avatar src={u.avatar} name={u.name} size="sm" isVerified={u.isVerified} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <p className="text-xs text-gray-400 text-center py-4">No users found.</p>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">
              Type to search for someone to message.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
