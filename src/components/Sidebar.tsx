import React, { useState } from 'react';
import { UserSession } from '../types';
import {
  Plus,
  BookOpen,
  Calendar,
  Trash2,
  TrendingUp,
  Download,
  Shield,
  Search,
  LogOut,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  sessions: UserSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenTrends: () => void;
  onOpenExport: () => void;
  onOpenThreatModel: () => void;
  userEmail?: string | null;
  userUid?: string;
  isCreating?: boolean;
}

const MOOD_COLORS: Record<string, string> = {
  reflective: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
  calm: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  inspired: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  anxious: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  grateful: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
  energized: 'bg-orange-950/60 text-orange-300 border-orange-800/60',
  neutral: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60',
};

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenTrends,
  onOpenExport,
  onOpenThreatModel,
  userEmail,
  userUid,
  isCreating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 h-screen bg-[#0F0F11] text-[#D4D4D8] flex flex-col border-r border-[#27272A] shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-serif font-bold text-lg shadow-md shadow-amber-500/10">
            J
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Personal Gemini Journal
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Zero-Trust Architecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action: New Journal Entry */}
      <div className="p-4 border-b border-[#27272A]">
        <button
          type="button"
          id="sidebar-new-session-btn"
          onClick={onCreateSession}
          disabled={isCreating}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>{isCreating ? 'Opening Session...' : 'New Journal Entry'}</span>
        </button>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="sidebar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past reflections..."
            className="w-full pl-8 pr-3 py-2 bg-[#141417] border border-[#27272A] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/60 transition"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-3 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Recent Sessions ({filteredSessions.length})
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-zinc-500">
            {searchQuery ? 'No matching reflections found.' : 'No journal sessions yet. Start your first reflection above!'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const moodStyle = session.moodTag ? MOOD_COLORS[session.moodTag] || MOOD_COLORS.neutral : MOOD_COLORS.neutral;
            const dateStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={session.id}
                id={`session-item-${session.id}`}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-start justify-between p-3 rounded-xl text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1F1F24] text-zinc-100 font-medium border border-[#2E2E35] shadow-sm'
                    : 'text-zinc-400 hover:bg-[#18181B] hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="truncate text-zinc-200 text-xs md:text-sm">{session.title}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    {session.moodTag && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${moodStyle}`}>
                        {session.moodTag}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  title="Delete Session"
                  onClick={(e) => onDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-[#27272A] rounded-md transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Phase 3 & Security Tooling Shortcuts */}
      <div className="p-3 border-t border-[#27272A] space-y-1">
        <button
          type="button"
          id="nav-mood-trends-btn"
          onClick={onOpenTrends}
          className="w-full px-3 py-2 text-zinc-300 hover:bg-[#18181B] hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Mood & Emotional Trends</span>
        </button>

        <button
          type="button"
          id="nav-export-btn"
          onClick={onOpenExport}
          className="w-full px-3 py-2 text-zinc-300 hover:bg-[#18181B] hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Journal Archive</span>
        </button>

        <button
          type="button"
          id="nav-threat-model-btn"
          onClick={onOpenThreatModel}
          className="w-full px-3 py-2 text-zinc-300 hover:bg-[#18181B] hover:text-white rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Threat Model & Rules Inspector</span>
        </button>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 bg-[#0A0A0B] border-t border-[#27272A] flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-xs font-medium text-zinc-200 truncate">
            {userEmail || 'Authenticated User'}
          </div>
          <div className="text-[10px] text-zinc-500 truncate font-mono">
            UID: {userUid ? `${userUid.slice(0, 10)}...` : 'Derived Server-Side'}
          </div>
        </div>

        <button
          type="button"
          id="sidebar-signout-btn"
          onClick={() => signOut(auth)}
          title="Sign Out"
          className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-[#18181B] rounded-lg transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
