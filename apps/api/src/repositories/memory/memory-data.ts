import { getPriorityFromType, type Notification, type NotificationType } from '../../domain/notification.js';
import type { Student } from '../../domain/student.js';

const now = new Date();

const createStudent = (id: string, name: string, email: string): Student => ({
  id,
  name,
  email,
  createdAt: now,
  updatedAt: now
});

const createNotification = (
  id: string,
  type: NotificationType,
  message: string,
  studentId: string,
  isRead = false,
  createdAt = now
): Notification => ({
  id,
  type,
  message,
  priority: getPriorityFromType(type),
  createdAt,
  updatedAt: createdAt,
  isRead,
  studentId
});

export const seededStudents: Student[] = [
  createStudent('student_001', 'Aarav Mehta', 'aarav.mehta@example.edu'),
  createStudent('student_002', 'Diya Sharma', 'diya.sharma@example.edu')
];

export const seededNotifications: Notification[] = [
  createNotification('notif_001', 'Placement', 'TechCore is visiting campus tomorrow for final-year placements.', 'student_001', false, new Date('2026-07-01T07:30:00.000Z')),
  createNotification('notif_002', 'Result', 'Semester 4 results have been published on the student portal.', 'student_001', true, new Date('2026-06-30T12:00:00.000Z')),
  createNotification('notif_003', 'Event', 'Registration is open for the campus innovation hackathon.', 'student_001', false, new Date('2026-06-29T16:45:00.000Z')),
  createNotification('notif_004', 'Placement', 'Final selection list for Apex Systems is now available.', 'student_002', false, new Date('2026-06-28T11:20:00.000Z'))
];
