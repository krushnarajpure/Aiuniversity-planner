"use client";

import { useMemo, useState } from "react";

type Difficulty = "All" | "Easy" | "Medium" | "Hard";
type Language = "JavaScript" | "Python" | "Java" | "C++" | "C";
type Tab = "Description" | "Editorial" | "Submissions" | "Solutions";

type Problem = {
    id: number;
    title: string;
    difficulty: Exclude<Difficulty, "All">;
    topic: string;
    solved: number;
    description: string;
    examples: { input: string; output: string; explanation: string }[];
    constraints: string[];
    hint: string;
    starter: Record<Language, string>;
};

const LANGUAGE_IDS: Record<Language, number> = {
    JavaScript: 63,
    Python: 71,
    Java: 62,
    "C++": 54,
    C: 50,
};

const PROBLEMS: Problem[] = [
    {
        id: 1,
        title: "Reverse a String",
        difficulty: "Easy",
        topic: "Strings",
        solved: 1240,
        description:
            "Given a string, return the string in reverse order. Preserve every character exactly once.",
        examples: [
            {
                input: '"hello"',
                output: '"olleh"',
                explanation: "The characters are read from right to left.",
            },
            {
                input: '"placement"',
                output: '"tnemecalp"',
                explanation: "Reverse the complete string.",
            },
        ],
        constraints: [
            "1 <= length <= 100000",
            "The input contains printable characters.",
        ],
        hint: "Think about two pointers or the language's built-in reverse operation.",
        starter: {
            JavaScript: `function reverseString(s) {
  // Write your code here
  return s.split("").reverse().join("");
}

console.log(reverseString("hello"));`,
            Python: `def reverse_string(s):
    # Write your code here
    return s[::-1]

print(reverse_string("hello"))`,
            Java: `public class Main {
    static String reverseString(String s) {
        // Write your code here
        return new StringBuilder(s).reverse().toString();
    }

    public static void main(String[] args) {
        System.out.println(reverseString("hello"));
    }
}`,
            "C++": `#include <bits/stdc++.h>
using namespace std;

string reverseString(string s) {
    // Write your code here
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`,
            C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "hello";
    int n = strlen(s);

    for (int i = n - 1; i >= 0; i--) {
        putchar(s[i]);
    }

    putchar('\\n');
    return 0;
}`,
        },
    },
    {
        id: 2,
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Arrays",
        solved: 980,
        description:
            "Given an array of integers and a target, find two different positions whose values add up to the target.",
        examples: [
            {
                input: "[2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "2 + 7 = 9.",
            },
        ],
        constraints: [
            "2 <= array length <= 100000",
            "Each test case has exactly one valid pair.",
        ],
        hint: "A hash map can store numbers you have already seen.",
        starter: {
            JavaScript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }

  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
            Python: `def two_sum(nums, target):
    # Write your code here
    seen = {}

    for i, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], i]
        seen[value] = i

    return []

print(two_sum([2, 7, 11, 15], 9))`,
            Java: `import java.util.*;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (map.containsKey(need)) {
                return new int[]{map.get(need), i};
            }
            map.put(nums[i], i);
        }

        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(
            new int[]{2, 7, 11, 15}, 9
        )));
    }
}`,
            "C++": `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int> nums, int target) {
    unordered_map<int, int> mp;

    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];

        if (mp.count(need)) {
            return {mp[need], i};
        }

        mp[nums[i]] = i;
    }

    return {};
}

int main() {
    vector<int> ans = twoSum({2, 7, 11, 15}, 9);
    for (int x : ans) cout << x << " ";
    cout << endl;
}`,
            C: `#include <stdio.h>

int main() {
    int nums[] = {2, 7, 11, 15};
    int n = 4;
    int target = 9;

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("[%d, %d]\\n", i, j);
                return 0;
            }
        }
    }

    return 0;
}`,
        },
    },
    {
        id: 3,
        title: "Valid Parentheses",
        difficulty: "Medium",
        topic: "Stack",
        solved: 740,
        description:
            "Determine whether every opening bracket is closed by the correct bracket in the correct order.",
        examples: [
            {
                input: '"()[]{}"',
                output: "true",
                explanation: "Every bracket is correctly matched.",
            },
            {
                input: '"([)]"',
                output: "false",
                explanation: "The closing bracket order is invalid.",
            },
        ],
        constraints: [
            "1 <= string length <= 100000",
            "Only (), {}, and [] appear.",
        ],
        hint: "Use a stack and remember the closing bracket expected for each opening bracket.",
        starter: {
            JavaScript: `function isValid(s) {
  // Write your code here
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };

  for (const ch of s) {
    if ("([{".includes(ch)) {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(isValid("()[]{}"));`,
            Python: `def is_valid(s):
    # Write your code here
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}

    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False

    return not stack

print(is_valid("()[]{}"))`,
            Java: `import java.util.*;

public class Main {
    static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                stack.push(ch);
            } else {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ((ch == ')' && open != '(') ||
                    (ch == ']' && open != '[') ||
                    (ch == '}' && open != '{')) {
                    return false;
                }
            }
        }

        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}"));
    }
}`,
            "C++": `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    stack<char> st;

    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') {
            st.push(ch);
        } else {
            if (st.empty()) return false;

            char open = st.top();
            st.pop();

            if ((ch == ')' && open != '(') ||
                (ch == ']' && open != '[') ||
                (ch == '}' && open != '{')) {
                return false;
            }
        }
    }

    return st.empty();
}

int main() {
    cout << boolalpha << isValid("()[]{}") << endl;
    return 0;
}`,
            C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "()[]{}";
    char stack[100000];
    int top = -1;
    int valid = 1;

    for (int i = 0; s[i] != '\\0'; i++) {
        char ch = s[i];

        if (ch == '(' || ch == '[' || ch == '{') {
            stack[++top] = ch;
        } else {
            if (top < 0) {
                valid = 0;
                break;
            }

            char open = stack[top--];

            if ((ch == ')' && open != '(') ||
                (ch == ']' && open != '[') ||
                (ch == '}' && open != '{')) {
                valid = 0;
                break;
            }
        }
    }

    if (top != -1) valid = 0;

    printf("%s\\n", valid ? "true" : "false");
    return 0;
}`,
        },
    },
    {
        id: 4,
        title: "Maximum Subarray",
        difficulty: "Medium",
        topic: "Dynamic Programming",
        solved: 615,
        description:
            "Find the contiguous subarray with the largest possible sum.",
        examples: [
            {
                input: "[-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The best subarray is [4,-1,2,1].",
            },
        ],
        constraints: [
            "1 <= array length <= 100000",
            "-10000 <= nums[i] <= 10000",
        ],
        hint: "At every position decide whether to extend the previous subarray or start again.",
        starter: {
            JavaScript: `function maxSubArray(nums) {
  // Write your code here
  let current = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }

  return best;
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
            Python: `def max_sub_array(nums):
    # Write your code here
    current = best = nums[0]

    for value in nums[1:]:
        current = max(value, current + value)
        best = max(best, current)

    return best

print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`,
            Java: `public class Main {
    static int maxSubArray(int[] nums) {
        int current = nums[0];
        int best = nums[0];

        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            best = Math.max(best, current);
        }

        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxSubArray(
            new int[]{-2,1,-3,4,-1,2,1,-5,4}
        ));
    }
}`,
            "C++": `#include <bits/stdc++.h>
using namespace std;

int maxSubArray(vector<int> nums) {
    int current = nums[0];
    int best = nums[0];

    for (int i = 1; i < (int)nums.size(); i++) {
        current = max(nums[i], current + nums[i]);
        best = max(best, current);
    }

    return best;
}

int main() {
    cout << maxSubArray({-2,1,-3,4,-1,2,1,-5,4}) << endl;
    return 0;
}`,
            C: `#include <stdio.h>

int main() {
    int nums[] = {-2,1,-3,4,-1,2,1,-5,4};
    int n = 9;

    int current = nums[0];
    int best = nums[0];

    for (int i = 1; i < n; i++) {
        current = nums[i] > current + nums[i]
            ? nums[i]
            : current + nums[i];

        if (current > best) best = current;
    }

    printf("%d\\n", best);
    return 0;
}`,
        },
    },
];

export default function CodingPracticeLab() {
    const [selectedId, setSelectedId] = useState(1);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("All");
    const [topic, setTopic] = useState("All");
    const [language, setLanguage] = useState<Language>("JavaScript");
    const [tab, setTab] = useState<Tab>("Description");
    const [code, setCode] = useState(PROBLEMS[0].starter.JavaScript);
    const [stdin, setStdin] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"idle" | "running" | "passed">("idle");
    const [hintOpen, setHintOpen] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const selectedProblem =
        PROBLEMS.find((problem) => problem.id === selectedId) ?? PROBLEMS[0];

    const topics = useMemo(
        () => ["All", ...Array.from(new Set(PROBLEMS.map((p) => p.topic)))],
        []
    );

    const filteredProblems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return PROBLEMS.filter((problem) => {
            const matchesSearch =
                !query ||
                problem.title.toLowerCase().includes(query) ||
                problem.topic.toLowerCase().includes(query);

            const matchesDifficulty =
                difficulty === "All" || problem.difficulty === difficulty;

            const matchesTopic = topic === "All" || problem.topic === topic;

            return matchesSearch && matchesDifficulty && matchesTopic;
        });
    }, [search, difficulty, topic]);

    const selectProblem = (problem: Problem) => {
        setSelectedId(problem.id);
        setCode(problem.starter[language]);
        setOutput("");
        setError("");
        setStatus("idle");
        setTab("Description");
        setHintOpen(false);
    };

    const changeLanguage = (nextLanguage: Language) => {
        setLanguage(nextLanguage);
        setCode(selectedProblem.starter[nextLanguage]);
        setOutput("");
        setError("");
        setStatus("idle");
    };

    const resetCode = () => {
        setCode(selectedProblem.starter[language]);
        setOutput("");
        setError("");
        setStatus("idle");
    };

    const executeCode = async () => {
        setStatus("running");
        setOutput("");
        setError("");

        try {
            const response = await fetch("/api/code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: LANGUAGE_IDS[language],
                    stdin,
                }),
            });

            const data: {
                error?: string;
                result?: {
                    status?: { id?: number; description?: string };
                    stdout?: string | null;
                    stderr?: string | null;
                    compile_output?: string | null;
                    time?: string | null;
                    memory?: number | null;
                };
            } = await response.json();

            if (!response.ok) {
                setStatus("idle");
                setError(data.error || "Code execution failed.");
                return;
            }

            const result = data.result;

            if (result?.status?.id === 3) {
                setStatus("passed");
                setOutput(result.stdout?.trimEnd() || "Program finished with no output.");
                setHistory((prev) =>
                    [`${selectedProblem.title} • ${language} • Accepted`, ...prev].slice(
                        0,
                        10
                    )
                );
            } else {
                setStatus("idle");
                setError(
                    result?.stderr ||
                    result?.compile_output ||
                    result?.status?.description ||
                    "Code did not execute successfully."
                );
            }
        } catch (err) {
            console.error(err);
            setStatus("idle");
            setError(
                "Unable to connect to /api/code. Make sure your Next.js server is running."
            );
        }
    };

    const submitCode = async () => {
        await executeCode();
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <header className="border-b border-slate-800 bg-slate-950/95">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 py-4">
                    <div>
                        <p className="mb-1 text-xs text-slate-500">
                            Placement / Coding Practice
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 font-bold text-blue-400">
                                {"</>"}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Coding Practice Lab</h1>
                                <p className="text-sm text-slate-400">
                                    Practice. Improve. Get Placed. 🚀
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <div>
                            <p className="text-xs text-slate-500">🔥 Day Streak</p>
                            <p className="font-bold">12 Days</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Problems Solved</p>
                            <p className="font-bold">86</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Accuracy</p>
                            <p className="font-bold text-emerald-400">78%</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_320px]">
                <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="border-b border-slate-800 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">Problems</h2>
                            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                                {filteredProblems.length}
                            </span>
                        </div>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search problems..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                        />

                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map(
                                (item) => (
                                    <button
                                        key={item}
                                        onClick={() => setDifficulty(item)}
                                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${difficulty === item
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-800 text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>

                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none"
                        >
                            {topics.map((item) => (
                                <option key={item} value={item}>
                                    Topic: {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="max-h-[650px] overflow-y-auto p-2">
                        {filteredProblems.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-500">
                                No problems found.
                            </div>
                        ) : (
                            filteredProblems.map((problem) => (
                                <button
                                    key={problem.id}
                                    onClick={() => selectProblem(problem)}
                                    className={`mb-1 w-full rounded-xl p-3 text-left transition ${selectedId === problem.id
                                            ? "border border-blue-500/40 bg-blue-500/10"
                                            : "border border-transparent hover:bg-slate-800"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-sm font-medium">
                                            {problem.id}. {problem.title}
                                        </span>
                                        <span
                                            className={`text-[11px] ${problem.difficulty === "Easy"
                                                    ? "text-emerald-400"
                                                    : problem.difficulty === "Medium"
                                                        ? "text-amber-400"
                                                        : "text-red-400"
                                                }`}
                                        >
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {problem.topic} • {problem.solved} solved
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="border-b border-slate-800 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                                        {selectedProblem.topic}
                                    </span>
                                    <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                                        Placement
                                    </span>
                                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                                        Practice
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedProblem.solved.toLocaleString()} students solved
                                    this problem
                                </p>
                            </div>

                            <button
                                onClick={() => setFavorite((value) => !value)}
                                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                            >
                                {favorite ? "★ Saved" : "☆ Save"}
                            </button>
                        </div>

                        <div className="mt-5 flex gap-6 overflow-x-auto border-b border-slate-800 text-sm">
                            {(
                                ["Description", "Editorial", "Submissions", "Solutions"] as Tab[]
                            ).map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setTab(item)}
                                    className={`whitespace-nowrap border-b-2 pb-3 ${tab === item
                                            ? "border-blue-500 text-blue-400"
                                            : "border-transparent text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[470px] overflow-y-auto p-5">
                        {tab === "Description" && (
                            <>
                                <p className="leading-7 text-slate-300">
                                    {selectedProblem.description}
                                </p>

                                <h3 className="mt-6 mb-3 font-semibold">Examples</h3>
                                <div className="space-y-3">
                                    {selectedProblem.examples.map((example, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                                        >
                                            <p className="text-xs font-semibold text-slate-500">
                                                Example {index + 1}
                                            </p>
                                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-slate-200">
                                                Input: {example.input}
                                                {"\n"}Output: {example.output}
                                            </pre>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {example.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="mt-6 mb-3 font-semibold">Constraints</h3>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
                                    {selectedProblem.constraints.map((constraint) => (
                                        <li key={constraint}>{constraint}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {tab === "Editorial" && (
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                                <h3 className="font-semibold text-blue-400">
                                    Recommended Approach
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                    Start with the simplest correct approach, then identify the
                                    data structure or algorithm that reduces unnecessary work.
                                    Aim for clean code and understand the time and space
                                    complexity before submitting.
                                </p>
                                <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-400">
                                    Think → Plan → Code → Test → Optimize
                                </div>
                            </div>
                        )}

                        {tab === "Submissions" && (
                            <div className="space-y-2">
                                {history.length === 0 ? (
                                    <div className="rounded-xl border border-slate-800 p-6 text-center text-sm text-slate-500">
                                        No submissions in this session yet.
                                    </div>
                                ) : (
                                    history.map((item, index) => (
                                        <div
                                            key={`${item}-${index}`}
                                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm"
                                        >
                                            <span className="text-slate-300">{item}</span>
                                            <span className="text-emerald-400">Accepted</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {tab === "Solutions" && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <h3 className="font-semibold">Community Solutions</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Community solution sharing can be connected to your database
                                    later. For now, use the editor and submission history.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={language}
                                    onChange={(e) =>
                                        changeLanguage(e.target.value as Language)
                                    }
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none"
                                >
                                    {(Object.keys(LANGUAGE_IDS) as Language[]).map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => setFontSize((size) => Math.max(11, size - 1))}
                                    className="rounded-lg border border-slate-700 px-2.5 py-2 text-xs hover:bg-slate-800"
                                >
                                    A-
                                </button>
                                <button
                                    onClick={() => setFontSize((size) => Math.min(22, size + 1))}
                                    className="rounded-lg border border-slate-700 px-2.5 py-2 text-xs hover:bg-slate-800"
                                >
                                    A+
                                </button>
                                <button
                                    onClick={resetCode}
                                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                                >
                                    Reset
                                </button>
                            </div>

                            <button
                                onClick={() => setShowShortcuts(true)}
                                className="text-xs text-slate-500 hover:text-slate-300"
                            >
                                Keyboard shortcuts
                            </button>
                        </div>

                        <div className="bg-slate-950 p-4">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                                style={{ fontSize }}
                                className="min-h-[390px] w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono leading-6 text-slate-200 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="border-t border-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                                <div className="text-xs text-slate-500">
                                    Language ID: {LANGUAGE_IDS[language]} • Sandbox execution
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={executeCode}
                                        disabled={status === "running"}
                                        className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {status === "running" ? "Running..." : "▶ Run Code"}
                                    </button>
                                    <button
                                        onClick={submitCode}
                                        disabled={status === "running"}
                                        className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-800">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                    <h3 className="text-sm font-semibold">Custom Input</h3>
                                    <span className="text-xs text-slate-600">
                                        Optional stdin
                                    </span>
                                </div>
                                <textarea
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                    placeholder="Enter input for your program..."
                                    className="min-h-[80px] w-full resize-y bg-slate-950 p-4 font-mono text-sm text-slate-300 outline-none placeholder:text-slate-700"
                                />
                            </div>

                            <div className="border-t border-slate-800">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                    <h3 className="text-sm font-semibold">Output</h3>
                                    {status === "passed" && (
                                        <span className="text-xs text-emerald-400">
                                            ✓ Execution Successful
                                        </span>
                                    )}
                                    {status === "running" && (
                                        <span className="text-xs text-blue-400">Running...</span>
                                    )}
                                </div>

                                <div className="min-h-[130px] bg-slate-950 p-4 font-mono text-sm">
                                    {status === "running" ? (
                                        <span className="text-blue-400">
                                            Running your code in the sandbox...
                                        </span>
                                    ) : error ? (
                                        <pre className="whitespace-pre-wrap text-red-400">
                                            {error}
                                        </pre>
                                    ) : output ? (
                                        <pre className="whitespace-pre-wrap text-emerald-400">
                                            {output}
                                        </pre>
                                    ) : (
                                        <span className="text-slate-600">
                                            Run your code to see the output here.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Smart Hint</h2>
                            <button
                                onClick={() => setHintOpen((value) => !value)}
                                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                            >
                                {hintOpen ? "Hide" : "Show"}
                            </button>
                        </div>

                        {hintOpen ? (
                            <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
                                💡 {selectedProblem.hint}
                            </p>
                        ) : (
                            <p className="mt-3 text-sm text-slate-500">
                                Stuck? Get a small hint without opening the full solution.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                        <h2 className="font-semibold">Your Progress</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-slate-500">Easy</span>
                                    <span>42 / 60</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800">
                                    <div className="h-2 w-[70%] rounded-full bg-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-slate-500">Medium</span>
                                    <span>31 / 80</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800">
                                    <div className="h-2 w-[39%] rounded-full bg-amber-500" />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-slate-500">Hard</span>
                                    <span>13 / 50</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800">
                                    <div className="h-2 w-[26%] rounded-full bg-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                        <h2 className="font-semibold">Lab Features</h2>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {[
                                "Multi-language",
                                "Live execution",
                                "Custom input",
                                "Hints",
                                "Editorial",
                                "History",
                                "Favorites",
                                "Progress",
                                "Search",
                                "Filters",
                                "Font controls",
                                "Responsive UI",
                            ].map((feature) => (
                                <div
                                    key={feature}
                                    className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-slate-400"
                                >
                                    ✓ {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {showShortcuts && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setShowShortcuts(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
                            <button
                                onClick={() => setShowShortcuts(false)}
                                className="text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Run code</span>
                                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs">
                                    Ctrl + Enter
                                </kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Save</span>
                                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs">
                                    Ctrl + S
                                </kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Reset editor</span>
                                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs">
                                    Reset
                                </kbd>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
