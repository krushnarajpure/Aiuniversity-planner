CREATE TABLE "CollegeTimetable" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "facultyName" TEXT,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeTimetable_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CollegeTimetable_userId_courseCode_day_startTime_endTime_key" ON "CollegeTimetable"("userId", "courseCode", "day", "startTime", "endTime");
CREATE INDEX "CollegeTimetable_userId_day_idx" ON "CollegeTimetable"("userId", "day");
CREATE INDEX "CollegeTimetable_courseId_idx" ON "CollegeTimetable"("courseId");

ALTER TABLE "CollegeTimetable" ADD CONSTRAINT "CollegeTimetable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollegeTimetable" ADD CONSTRAINT "CollegeTimetable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;