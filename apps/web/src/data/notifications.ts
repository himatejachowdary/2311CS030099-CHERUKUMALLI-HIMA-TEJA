export type NotificationType = 'Event' | 'Result' | 'Placement';

export type NotificationPriority = 'High' | 'Medium' | 'Low';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  priority: NotificationPriority;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  studentId: string;
}

export const sampleNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'Placement',
    message: 'TechCore is visiting campus tomorrow for final-year placements.',
    priority: 'High',
    createdAt: '2026-07-01T07:30:00.000Z',
    updatedAt: '2026-07-01T07:30:00.000Z',
    isRead: false,
    studentId: 'student_001'
  },
  {
    id: 'notif_002',
    type: 'Result',
    message: 'Semester 4 results have been published on the student portal.',
    priority: 'Medium',
    createdAt: '2026-06-30T12:00:00.000Z',
    updatedAt: '2026-06-30T12:00:00.000Z',
    isRead: true,
    studentId: 'student_001'
  },
  {
    id: 'notif_003',
    type: 'Event',
    message: 'Registration is open for the campus innovation hackathon.',
    priority: 'Low',
    createdAt: '2026-06-29T16:45:00.000Z',
    updatedAt: '2026-06-29T16:45:00.000Z',
    isRead: false,
    studentId: 'student_001'
  }
];
