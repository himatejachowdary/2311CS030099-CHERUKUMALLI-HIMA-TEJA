import type { Student } from '../domain/student.js';

export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  listAll(): Promise<Student[]>;
}
