import type { Student } from '../../domain/student.js';
import type { StudentRepository } from '../student.repository.js';

export class MemoryStudentRepository implements StudentRepository {
  constructor(private readonly students: Student[]) {}

  async findById(id: string): Promise<Student | null> {
    return this.students.find((student) => student.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.students.find((student) => student.email === email) ?? null;
  }

  async listAll(): Promise<Student[]> {
    return [...this.students];
  }
}
