/**
 * AI Interview Question Bank
 * Searchable and filterable question repository
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Search, Filter, BookmarkIcon } from "lucide-react";

export default function QuestionBankPage() {
  const [searchText, setSearchText] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const questions = [
    {
      id: 1,
      question: "What is the virtual DOM in React?",
      difficulty: "easy",
      topic: "React",
      type: "Technical",
      views: 1200,
      saved: false,
    },
    {
      id: 2,
      question: "Design a system to handle 1 million concurrent users",
      difficulty: "expert",
      topic: "System Design",
      type: "Technical",
      views: 450,
      saved: true,
    },
    {
      id: 3,
      question: "Tell me about a time you failed and how you handled it",
      difficulty: "medium",
      topic: "Behavioral",
      type: "Behavioral",
      views: 980,
      saved: false,
    },
    {
      id: 4,
      question: "How would you optimize a slow database query?",
      difficulty: "hard",
      topic: "Databases",
      type: "Technical",
      views: 650,
      saved: false,
    },
    {
      id: 5,
      question: "Implement a function to reverse a linked list",
      difficulty: "medium",
      topic: "Coding",
      type: "Coding",
      views: 2300,
      saved: true,
    },
  ];

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    hard: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchText.toLowerCase());
    const matchesDifficulty = !difficulty || q.difficulty === difficulty;
    const matchesTopic = !selectedTopic || q.topic === selectedTopic;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">QUESTIONS</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Question Bank
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Search and practice from 2000+ interview questions
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder-slate-500 transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Difficulty Filter */}
              <div>
                <select
                  value={difficulty || ""}
                  onChange={(e) => setDifficulty(e.target.value || null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <select
                  value={selectedTopic || ""}
                  onChange={(e) => setSelectedTopic(e.target.value || null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">All Topics</option>
                  <option value="React">React</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Databases">Databases</option>
                  <option value="Coding">Coding</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredQuestions.length} questions
            </div>
          </div>

          {/* Questions List */}
          <div className="mt-6 space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            difficultyColor[question.difficulty]
                          }`}
                        >
                          {question.difficulty.charAt(0).toUpperCase() +
                            question.difficulty.slice(1)}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {question.type}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {question.views} views
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-medium text-slate-900 dark:text-white">
                        {question.question}
                      </h3>
                      <div className="mt-3 flex items-center gap-4">
                        <button className="text-sm font-medium text-primary hover:text-primary/80">
                          Practice
                        </button>
                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                          View Answer
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {}}
                      className={`shrink-0 transition-all ${
                        question.saved
                          ? "text-primary"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <BookmarkIcon
                        className="h-5 w-5"
                        fill={question.saved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
                <p className="text-slate-600 dark:text-slate-400">
                  No questions found matching your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
