const fs = require('fs');
const path = require('path');
const p = 'a:/Mentora EID V2/Mentora-frontend/src/pages/classroom/ClassroomPageRefactored.tsx';
let content = fs.readFileSync(p, 'utf8');

// 1. Imports
content = content.replace(
  'import { messagingService } from "../../services/messagingService";',
  'import { messagingService } from "../../services/messagingService";\nimport { notificationSignalR } from "../../notifications/services/notificationSignalR";\nimport { NotificationType } from "../../notifications/types/notification.enums";'
);

// 2. Add refreshDashboard and SignalR useEffect before the first useEffect
const beforeUseEffect = `  // ensure roadmap phases are loaded into the builder store even if the roadmap tab
  // component isn't mounted. This moves the responsibility to the page-level.
  useEffect(() => {`;

const refreshDashboardCode = `const refreshDashboard = useCallback(async () => {
  try {
    setIsDashboardLoading(true);

    if (isMentor) {
      const response = await classroomService.getClassroomDashboard(classroomProgramId);

      if (!response?.success) {
        console.error('Dashboard request failed:', response?.message ?? 'Unknown error');
        return;
      }

      setDashboardData(response.data);
      const studentsFromApi = Array.isArray(response.data?.students) ? response.data.students : [];

      const mappedStudents = studentsFromApi.map((student: any) => ({
        id: student.studentId,
        name: student.fullName,
        email: student.lastCompletedItemTitle || 'No Activity Yet',
        statusLabel: student.tasksWaitingForReview > 0 ? 'Needs Feedback' : student.isAtRisk ? 'Idle Student' : 'Module Active',
        statusTone: student.tasksWaitingForReview > 0 ? 'feedback' : student.isAtRisk ? 'idle' : 'active',
        moduleLabel: student.lastCompletedItemTitle || 'No Activity',
        progress: student.overallCompletionPercent,
        completedTasks: student.completedTasks,
        totalTasks: student.totalTasks,
        lastActive: student.lastCompletedAt,
      }));

      setMentorStudents(mappedStudents);
    } else {
      const response = await classroomService.getClassroomCompletion(classroomProgramId);

      if (response?.success && response.data?.students) {
        const currentMentee = response.data.students.find((s: any) => s.studentId === user?.userId);
        if (currentMentee) {
          setDashboardData({ averageRoadmapCompletion: currentMentee.overallCompletionPercent });
        } else {
          setDashboardData({ averageRoadmapCompletion: 0 });
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch dashboard', error);
  } finally {
    setIsDashboardLoading(false);
  }
}, [classroomProgramId, isMentor, user?.userId, setMentorStudents]);

useEffect(() => {
  const unsubscribe = notificationSignalR.onReceiveNotification((notification) => {
    if (
      notification.type === NotificationType.SubmissionReviewed ||
      notification.type === NotificationType.MentorFeedbackAdded
    ) {
      refreshDashboard();
      if (!isMentor) {
        setHaveLoadedMenteeTasks(false); // Force mentee tasks to refresh
      }
    }
  });

  return () => {
    unsubscribe();
  };
}, [refreshDashboard, isMentor]);

  // ensure roadmap phases are loaded into the builder store even if the roadmap tab
  // component isn't mounted. This moves the responsibility to the page-level.
  useEffect(() => {`;

content = content.replace(beforeUseEffect, refreshDashboardCode);

// 3. Replace fetchDashboard logic
const fetchDashboardRegex = /const fetchDashboard = async \(\) => {[\s\S]*?setIsDashboardLoading\(false\);\n  }\n};\n/;

content = content.replace(fetchDashboardRegex, `const fetchDashboard = async () => {
      await refreshDashboard();
    };\n`);

// 4. Update dependencies
content = content.replace(
  'fetchClassroomRoadmapResource,\n     isMentor\n  ]);',
  'fetchClassroomRoadmapResource,\n     isMentor,\n     refreshDashboard\n  ]);'
);

// 5. Update handleSubmitMentorReview
content = content.replace(
  'queryClient.invalidateQueries({ queryKey: [\'pendingReviews\', classroomProgramId] });\n\n    await refreshMentorTaskData();',
  'queryClient.invalidateQueries({ queryKey: [\'pendingReviews\', classroomProgramId] });\n\n    await refreshMentorTaskData();\n    await refreshDashboard();'
);

fs.writeFileSync(p, content, 'utf8');
console.log('Modifications completed successfully.');
