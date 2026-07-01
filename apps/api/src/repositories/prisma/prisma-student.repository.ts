import type { Student } from '../../domain/student.js';
import type { StudentRepository } from '../student.repository.js';
import type { PrismaClient } from '@prisma/client';

export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({ where: { id } });
    return student ? this.mapStudent(student) : null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({ where: { email } });
    return student ? this.mapStudent(student) : null;
  }

  async listAll(): Promise<Student[]> {
    const students = await this.prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
    return students.map((student) => this.mapStudent(student));
  }

  private mapStudent(student: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }): Student {
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };
  }
}
