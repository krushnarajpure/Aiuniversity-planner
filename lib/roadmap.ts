export const roadmapPhases = [
    { id: "profile", title: "Profile", description: "Complete your placement profile and contact details." },
    { id: "resume", title: "Resume", description: "Build and validate a clear, ATS-friendly resume." },
    { id: "skills", title: "Skills", description: "Strengthen the skills required for your target roles." },
    { id: "aptitude", title: "Aptitude", description: "Practice quantitative, verbal, and logical reasoning." },
    { id: "projects", title: "Projects", description: "Document projects with clear technical evidence." },
    { id: "applications", title: "Applications", description: "Track focused applications and follow-ups." },
    { id: "interview", title: "Interview", description: "Prepare with structured interview practice." },
    { id: "placement", title: "Placement", description: "Convert preparation into placement opportunities." },
] as const;

export const roadmapTaskTemplates = [
    ["profile", "Complete placement profile", "Add your branch, links, and current placement details.", "HIGH", 20],
    ["resume", "Review resume structure", "Check contact, summary, education, skills, and project sections.", "HIGH", 30],
    ["resume", "Run resume analysis", "Use Resume Analyzer to identify evidence-based improvements.", "HIGH", 20],
    ["skills", "Choose target skills", "Review your placement profile and select skills to strengthen.", "MEDIUM", 30],
    ["skills", "Complete one skill practice", "Work on one pending technical skill with evidence.", "MEDIUM", 45],
    ["aptitude", "Take an aptitude test", "Complete one timed aptitude test and review the result.", "HIGH", 45],
    ["projects", "Document a project", "Record the problem, implementation, technology, and truthful outcome.", "MEDIUM", 40],
    ["applications", "Review active opportunities", "Find roles that match your actual profile and skills.", "MEDIUM", 25],
    ["interview", "Practice an interview", "Use the existing AI Interview feature for a focused session.", "HIGH", 30],
    ["placement", "Review placement readiness", "Inspect your readiness gaps and choose the next best action.", "LOW", 15],
] as const;

export type RoadmapPhase = (typeof roadmapPhases)[number];