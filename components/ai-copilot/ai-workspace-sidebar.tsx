"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Command,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { RefObject } from "react";

type Conversation = {
  id: string;
  title: string;
  updatedAt: Date;
};

export function AIWorkspaceSidebar({
  conversations,
  activeId,
  query,
  collapsed,
  mobileOpen,
  searchRef,
  onQuery,
  onNew,
  onLoad,
  onDelete,
  onToggle,
  onCloseMobile,
}: {
  conversations: Conversation[];
  activeId: string;
  query: string;
  collapsed: boolean;
  mobileOpen: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onQuery: (value: string) => void;
  onNew: () => void;
  onLoad: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
  onToggle: () => void;
  onCloseMobile: () => void;
}) {
  const visible = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[64px]" : "lg:w-[240px]"}`}
      >
        <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${collapsed ? "justify-center px-2" : "justify-between px-3"}`}>
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">AI Copilot</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand chat sidebar" : "Collapse chat sidebar"}
            title={collapsed ? "Expand chat sidebar" : "Collapse chat sidebar"}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={onNew}
            title="New chat"
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${collapsed ? "px-0" : "px-3"}`}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && "New chat"}
          </button>
          {!collapsed && (
            <label className="mt-2 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-400 focus-within:border-indigo-400 dark:border-slate-800 dark:bg-slate-900">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Search chats"
                aria-label="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
              <Command className="hidden h-3 w-3 shrink-0 text-slate-300 sm:block" />
            </label>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {!collapsed && <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent</p>}
          {visible.length ? (
            <div className="space-y-0.5">
              {visible.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onLoad(conversation)}
                    title={collapsed ? conversation.title : undefined}
                    className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-xs transition ${conversation.id === activeId ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"} ${collapsed ? "justify-center" : "pr-8"}`}
                  >
                    <Archive className="h-3.5 w-3.5 shrink-0" />
                    {!collapsed && <span className="truncate">{conversation.title}</span>}
                  </button>
                  {!collapsed && (
                    <button
                      type="button"
                      onClick={() => onDelete(conversation)}
                      aria-label={`Delete ${conversation.title}`}
                      title="Delete conversation"
                      className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 group-hover:block dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !collapsed && <p className="px-2 text-xs leading-5 text-slate-400">{query ? `No chats found for "${query}"` : "No chats yet. Start a conversation."}</p>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 p-2 dark:border-slate-800">
          <button type="button" title="AI settings" className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-200 ${collapsed ? "justify-center" : ""}`}>
            <Settings className="h-4 w-4" />
            {!collapsed && "AI settings"}
          </button>
        </div>
      </aside>
    </>
  );
}

export type { Conversation };
