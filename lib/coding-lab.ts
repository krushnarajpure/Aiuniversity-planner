export type Difficulty = "Easy" | "Medium" | "Hard";
export type CodingLanguage =
  | "Python"
  | "JavaScript"
  | "TypeScript"
  | "Java"
  | "C++"
  | "C#"
  | "Go"
  | "Rust"
  | "SQL";

export type LabTab =
  | "Overview"
  | "Problems"
  | "Workspace"
  | "DSA"
  | "Company"
  | "Interview"
  | "Submissions"
  | "Progress"
  | "Projects"
  | "Saved"
  | "Settings";

export type ExecutionStatus =
  | "Accepted"
  | "Wrong answer"
  | "Runtime error"
  | "Compilation error"
  | "Timeout"
  | "Internal error";

export type Example = {
  input: string;
  output: string;
  explanation: string;
};

export type CodingProblem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  acceptance: number;
  time: string;
  solved: number;
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  starter: Record<CodingLanguage, string>;
};

export type ExecutionResult = {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  executionTime: string;
  memoryUsed: string;
  exitCode: number;
  testResults: { label: string; passed: boolean; detail: string }[];
};

export const codingLanguages: CodingLanguage[] = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "SQL",
];

export const codingProblems: CodingProblem[] = [
  {
    id: 101,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 79,
    time: "20 min",
    solved: 1420,
    tags: ["Hash Map", "Interview"],
    description:
      "Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Each input has exactly one valid answer.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] = 2 + 7 = 9." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "The pair 2 and 4 sums to 6." },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    hints: ["Store seen values in a map.", "Look for the complement of each number."],
    starter: {
      Python: `def two_sum(nums, target):\n    seen = {}\n    for index, value in enumerate(nums):\n        need = target - value\n        if need in seen:\n            return [seen[need], index]\n        seen[value] = index\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
      JavaScript: `function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let index = 0; index < nums.length; index += 1) {\n    const need = target - nums[index];\n    if (seen.has(need)) return [seen.get(need), index];\n    seen.set(nums[index], index);\n  }\n\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      TypeScript: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n\n  for (let index = 0; index < nums.length; index += 1) {\n    const need = target - nums[index];\n    if (seen.has(need)) return [seen.get(need)!, index];\n    seen.set(nums[index], index);\n  }\n\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      Java: `import java.util.*;\n\npublic class Main {\n  static int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n\n    for (int index = 0; index < nums.length; index++) {\n      int need = target - nums[index];\n      if (seen.containsKey(need)) return new int[] { seen.get(need), index };\n      seen.put(nums[index], index);\n    }\n\n    return new int[] {};\n  }\n\n  public static void main(String[] args) {\n    System.out.println(Arrays.toString(twoSum(new int[] {2, 7, 11, 15}, 9)));\n  }\n}`,
      "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int> nums, int target) {\n  unordered_map<int, int> seen;\n\n  for (int index = 0; index < (int) nums.size(); index++) {\n    int need = target - nums[index];\n    if (seen.count(need)) return {seen[need], index};\n    seen[nums[index]] = index;\n  }\n\n  return {};\n}\n\nint main() {\n  auto result = twoSum({2, 7, 11, 15}, 9);\n  for (int value : result) cout << value << " ";\n  cout << endl;\n  return 0;\n}`,
      "C#": `using System;\nusing System.Collections.Generic;\n\nclass Program {\n  static int[] TwoSum(int[] nums, int target) {\n    Dictionary<int, int> seen = new();\n\n    for (int index = 0; index < nums.Length; index++) {\n      int need = target - nums[index];\n      if (seen.ContainsKey(need)) return new[] { seen[need], index };\n      seen[nums[index]] = index;\n    }\n\n    return Array.Empty<int>();\n  }\n\n  static void Main() {\n    Console.WriteLine(string.Join(", ", TwoSum(new[] { 2, 7, 11, 15 }, 9)));\n  }\n}`,
      Go: `package main\n\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n  seen := make(map[int]int)\n\n  for index, value := range nums {\n    need := target - value\n    if prevIndex, exists := seen[need]; exists {\n      return []int{prevIndex, index}\n    }\n    seen[value] = index\n  }\n\n  return nil\n}\n\nfunc main() {\n  fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n}`,
      Rust: `fn two_sum(nums: &[i32], target: i32) -> Vec<i32> {\n    let mut seen = std::collections::HashMap::new();\n\n    for (index, value) in nums.iter().enumerate() {\n        let need = target - value;\n        if let Some(prev) = seen.get(&need) {\n            return vec![*prev as i32, index as i32];\n        }\n        seen.insert(*value, index as i32);\n    }\n\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", two_sum(&[2, 7, 11, 15], 9));\n}`,
      SQL: `SELECT a.id, b.id\nFROM numbers a\nJOIN numbers b ON a.id < b.id\nWHERE a.value + b.value = 9;`,
    },
  },
  {
    id: 102,
    title: "Valid Parentheses",
    difficulty: "Medium",
    topic: "Stack",
    acceptance: 68,
    time: "30 min",
    solved: 930,
    tags: ["Stack", "String"],
    description: "Check whether a string containing parentheses, square brackets, and curly braces is valid and properly nested.",
    examples: [
      { input: "s = \"()[]{}\"", output: "true", explanation: "Every bracket is closed in the right order." },
      { input: "s = \"([)]\"", output: "false", explanation: "The sequence is not properly nested." },
    ],
    constraints: ["1 <= s.length <= 10^5", "Only the characters (), [], {} are included."],
    hints: ["Use a stack for opening brackets.", "Match the closing bracket with the top item on the stack."],
    starter: {
      Python: `def is_valid(s):\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        elif not stack or stack.pop() != pairs[ch]:\n            return False\n\n    return not stack\n\nprint(is_valid('()[]{}'))`,
      JavaScript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n\n  for (const ch of s) {\n    if ('([{'.includes(ch)) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n\n  return stack.length === 0;\n}\n\nconsole.log(isValid('()[]{}'));`,
      TypeScript: `function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n\n  for (const ch of s) {\n    if ('([{'.includes(ch)) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n\n  return stack.length === 0;\n}\n\nconsole.log(isValid('()[]{}'));`,
      Java: `import java.util.*;\n\npublic class Main {\n  static boolean isValid(String s) {\n    Deque<Character> stack = new ArrayDeque<>();\n    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');\n\n    for (char ch : s.toCharArray()) {\n      if (ch == '(' || ch == '[' || ch == '{') {\n        stack.push(ch);\n      } else {\n        if (stack.isEmpty() || stack.pop() != pairs.get(ch)) return false;\n      }\n    }\n\n    return stack.isEmpty();\n  }\n\n  public static void main(String[] args) {\n    System.out.println(isValid("()[]{}"));\n  }\n}`,
      "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isValid(string s) {\n  stack<char> st;\n  unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};\n\n  for (char ch : s) {\n    if (ch == '(' || ch == '[' || ch == '{') st.push(ch);\n    else {\n      if (st.empty() || st.top() != pairs[ch]) return false;\n      st.pop();\n    }\n  }\n\n  return st.empty();\n}\n\nint main() {\n  cout << boolalpha << isValid("()[]{}") << endl;\n  return 0;\n}`,
      "C#": `using System;\nusing System.Collections.Generic;\n\nclass Program {\n  static bool IsValid(string s) {\n    Stack<char> stack = new();\n    Dictionary<char, char> pairs = new() { {')', '('}, {']', '['}, {'}', '{'} };\n\n    foreach (var ch in s) {\n      if (ch == '(' || ch == '[' || ch == '{') {\n        stack.Push(ch);\n      } else if (stack.Count == 0 || stack.Pop() != pairs[ch]) {\n        return false;\n      }\n    }\n\n    return stack.Count == 0;\n  }\n\n  static void Main() {\n    Console.WriteLine(IsValid("()[]{}"));\n  }\n}`,
      Go: `package main\n\nimport "fmt"\n\nfunc isValid(s string) bool {\n  stack := []rune{}\n  pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}\n\n  for _, ch := range s {\n    if ch == '(' || ch == '[' || ch == '{' {\n      stack = append(stack, ch)\n    } else {\n      if len(stack) == 0 || stack[len(stack)-1] != pairs[ch] {\n        return false\n      }\n      stack = stack[:len(stack)-1]\n    }\n  }\n\n  return len(stack) == 0\n}\n\nfunc main() {\n  fmt.Println(isValid("()[]{}"))\n}`,
      Rust: `fn is_valid(s: &str) -> bool {\n    let mut stack = Vec::new();\n    let pairs = [(')', '('), (']', '['), ('}', '{')];\n    let mapping: std::collections::HashMap<char, char> = pairs.into_iter().collect();\n\n    for ch in s.chars() {\n        if matches!(ch, '(' | '[' | '{') {\n            stack.push(ch);\n        } else if let Some(expected) = mapping.get(&ch) {\n            if stack.pop() != Some(*expected) {\n                return false;\n            }\n        }\n    }\n\n    stack.is_empty()\n}\n\nfn main() {\n    println!("{}", is_valid("()[]{}"));\n}`,
      SQL: `SELECT CASE WHEN '()[]{}' = '()[]{}' THEN TRUE ELSE FALSE END;`,
    },
  },
  {
    id: 103,
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting",
    acceptance: 62,
    time: "25 min",
    solved: 880,
    tags: ["Sorting", "Intervals"],
    description: "Given a list of intervals, merge all overlapping intervals and return the merged result.",
    examples: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "The first two ranges overlap and merge into one." },
    ],
    constraints: ["1 <= intervals.length <= 10^4", "-10^9 <= start, end <= 10^9"],
    hints: ["Sort by start time.", "Merge when the next interval starts before the current end."],
    starter: {
      Python: `def merge(intervals):\n    if not intervals:\n        return []\n\n    intervals.sort()\n    merged = [intervals[0]]\n\n    for start, end in intervals[1:]:\n        last = merged[-1]\n        if start <= last[1]:\n            last[1] = max(last[1], end)\n        else:\n            merged.append([start, end])\n\n    return merged\n\nprint(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
      JavaScript: `function merge(intervals) {\n  if (!intervals.length) return [];\n\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n\n  for (const [start, end] of intervals.slice(1)) {\n    const last = merged[merged.length - 1];\n    if (start <= last[1]) last[1] = Math.max(last[1], end);\n    else merged.push([start, end]);\n  }\n\n  return merged;\n}\n\nconsole.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]]));`,
      TypeScript: `function merge(intervals: number[][]): number[][] {\n  if (!intervals.length) return [];\n\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged: number[][] = [intervals[0]];\n\n  for (const [start, end] of intervals.slice(1)) {\n    const last = merged[merged.length - 1];\n    if (start <= last[1]) last[1] = Math.max(last[1], end);\n    else merged.push([start, end]);\n  }\n\n  return merged;\n}\n\nconsole.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]]));`,
      Java: `import java.util.*;\n\npublic class Main {\n  static int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n    List<int[]> merged = new ArrayList<>();\n    merged.add(intervals[0]);\n\n    for (int i = 1; i < intervals.length; i++) {\n      int[] current = intervals[i];\n      int[] last = merged.get(merged.size() - 1);\n      if (current[0] <= last[1]) {\n        last[1] = Math.max(last[1], current[1]);\n      } else {\n        merged.add(current);\n      }\n    }\n\n    return merged.toArray(new int[0][]);\n  }\n\n  public static void main(String[] args) {\n    int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};\n    System.out.println(Arrays.deepToString(merge(intervals)));\n  }\n}`,
      "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<vector<int>> merge(vector<vector<int>> intervals) {\n  sort(intervals.begin(), intervals.end());\n  vector<vector<int>> merged;\n  merged.push_back(intervals[0]);\n\n  for (auto &current : intervals) {\n    auto &last = merged.back();\n    if (current[0] <= last[1]) last[1] = max(last[1], current[1]);\n    else merged.push_back(current);\n  }\n\n  return merged;\n}\n\nint main() {\n  vector<vector<int>> intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};\n  auto result = merge(intervals);\n  for (auto &row : result) cout << row[0] << " " << row[1] << "\n";\n  return 0;\n}`,
      "C#": `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n  static int[][] Merge(int[][] intervals) {\n    var sorted = intervals.OrderBy(x => x[0]).ToArray();\n    var merged = new List<int[]> { sorted[0] };\n\n    foreach (var current in sorted.Skip(1)) {\n      var last = merged[^1];\n      if (current[0] <= last[1]) last[1] = Math.Max(last[1], current[1]);\n      else merged.Add(current);\n    }\n\n    return merged.ToArray();\n  }\n\n  static void Main() {\n    int[][] intervals = { new[] { 1, 3 }, new[] { 2, 6 }, new[] { 8, 10 }, new[] { 15, 18 } };\n    Console.WriteLine(string.Join(" | ", Merge(intervals).Select(x => $"[{x[0]}, {x[1]}]")));\n  }\n}`,
      Go: `package main\n\nimport (\n  "fmt"\n  "sort"\n)\n\nfunc merge(intervals [][]int) [][]int {\n  sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })\n  merged := [][]int{intervals[0]}\n\n  for _, current := range intervals[1:] {\n    last := merged[len(merged)-1]\n    if current[0] <= last[1] {\n      if current[1] > last[1] { last[1] = current[1] }\n    } else {\n      merged = append(merged, current)\n    }\n  }\n\n  return merged\n}\n\nfunc main() {\n  fmt.Println(merge([][]int{{1, 3}, {2, 6}, {8, 10}, {15, 18}}))\n}`,
      Rust: `fn merge(intervals: &mut Vec<Vec<i32>>) -> Vec<Vec<i32>> {\n    intervals.sort_by(|a, b| a[0].cmp(&b[0]));\n    let mut merged = vec![intervals[0].clone()];\n\n    for current in intervals.iter().skip(1) {\n        let last = merged.last_mut().unwrap();\n        if current[0] <= last[1] {\n            last[1] = last[1].max(current[1]);\n        } else {\n            merged.push(current.clone());\n        }\n    }\n\n    merged\n}\n\nfn main() {\n    let mut intervals = vec![vec![1, 3], vec![2, 6], vec![8, 10], vec![15, 18]];\n    println!("{:?}", merge(&mut intervals));\n}`,
      SQL: `SELECT * FROM intervals ORDER BY start;`,
    },
  },
];

export const recentSubmissions = [
  { title: "Two Sum", language: "Python", verdict: "Accepted", runtime: "42 ms", memory: "18.2 MB" },
  { title: "Valid Parentheses", language: "JavaScript", verdict: "Wrong answer", runtime: "59 ms", memory: "12.1 MB" },
  { title: "Merge Intervals", language: "Java", verdict: "Accepted", runtime: "67 ms", memory: "22.4 MB" },
  { title: "Longest Substring", language: "C++", verdict: "Runtime error", runtime: "128 ms", memory: "31.8 MB" },
];

export const dsaTopics = [
  { name: "Arrays", progress: 72 },
  { name: "Strings", progress: 58 },
  { name: "Trees", progress: 34 },
  { name: "Graphs", progress: 27 },
  { name: "Dynamic Programming", progress: 41 },
  { name: "Greedy", progress: 63 },
  { name: "Hashing", progress: 79 },
];

export const companyChallenges = [
  { name: "Amazon", questions: 16, difficulty: "Medium", next: "String + DP" },
  { name: "Microsoft", questions: 12, difficulty: "Hard", next: "Graphs" },
  { name: "Google", questions: 18, difficulty: "Medium", next: "Arrays + Heap" },
  { name: "TCS", questions: 10, difficulty: "Easy", next: "Patterns" },
];

export const interviewModes = [
  { label: "Timed challenge", minutes: 45 },
  { label: "System design warmup", minutes: 30 },
  { label: "Mock technical interview", minutes: 60 },
];

export const projectSamples = [
  { name: "Campus Planner", language: "Python", files: 8, status: "In progress" },
  { name: "Interview Prep Tracker", language: "TypeScript", files: 14, status: "Ready" },
  { name: "DSA Notebook", language: "Java", files: 6, status: "Archived" },
];

export function runCodeDemo(code: string, language: CodingLanguage, input: string): ExecutionResult {
  const trimmed = code.trim();

  if (!trimmed) {
    return {
      status: "Compilation error",
      stdout: "",
      stderr: "No source code was provided.",
      executionTime: "0 ms",
      memoryUsed: "0.0 MB",
      exitCode: 1,
      testResults: [{ label: "Sample check", passed: false, detail: "Add code before running." }],
    };
  }

  const lowerCode = trimmed.toLowerCase();
  if (lowerCode.includes("throw error") || lowerCode.includes("raise exception") || lowerCode.includes("segfault")) {
    return {
      status: "Runtime error",
      stdout: "",
      stderr: "Traceback (most recent call last):\n  File \"main\", line 3\nValueError: invalid input encountered",
      executionTime: "36 ms",
      memoryUsed: "11.8 MB",
      exitCode: 1,
      testResults: [{ label: "Sample check", passed: false, detail: "Input caused a runtime exception." }],
    };
  }

  if (language === "Python" && lowerCode.includes("print")) {
    return {
      status: "Accepted",
      stdout: `Hello, placement team!\nInput received: ${input || "demo"}\nResult: 15`,
      stderr: "",
      executionTime: "42 ms",
      memoryUsed: "18.2 MB",
      exitCode: 0,
      testResults: [
        { label: "Visible sample", passed: true, detail: "Output matched the expected result." },
        { label: "Hidden tests", passed: true, detail: "No edge-case regressions detected." },
      ],
    };
  }

  if (language === "JavaScript" && lowerCode.includes("console.log")) {
    return {
      status: "Accepted",
      stdout: `Hello from JavaScript\nInput: ${input || "demo"}\nOutput: 15`,
      stderr: "",
      executionTime: "51 ms",
      memoryUsed: "16.4 MB",
      exitCode: 0,
      testResults: [
        { label: "Visible sample", passed: true, detail: "JS logic completed successfully." },
        { label: "Hidden tests", passed: true, detail: "All checks are green." },
      ],
    };
  }

  if (input.includes("timeout")) {
    return {
      status: "Timeout",
      stdout: "",
      stderr: "Execution timed out after 2.0 seconds.",
      executionTime: "2000 ms",
      memoryUsed: "14.1 MB",
      exitCode: 124,
      testResults: [{ label: "Visible sample", passed: false, detail: "The loop exceeded the time limit." }],
    };
  }

  return {
    status: "Accepted",
    stdout: `Demo sandbox output\nLanguage: ${language}\nInput: ${input || "demo"}\nResult: 15`,
    stderr: "",
    executionTime: "63 ms",
    memoryUsed: "19.7 MB",
    exitCode: 0,
    testResults: [
      { label: "Visible sample", passed: true, detail: "Demo execution matched the expected output." },
      { label: "Edge case", passed: true, detail: "Boundary conditions are within the target range." },
    ],
  };
}
