import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExerciseDto,
  CreateWorkoutLogDto,
  CreateBodyStatsDto,
} from './dto/fitness.dto';

@Injectable()
export class FitnessService {
  constructor(private prisma: PrismaService) {}

  // Check if user has access to fitness tool
  private async checkAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;
    if (user.isAdmin) return true;

    try {
      const allowedTools = user.allowedTools
        ? JSON.parse(user.allowedTools)
        : [];
      return allowedTools.includes('fitness');
    } catch {
      return false;
    }
  }

  // ============ EXERCISES ============

  async getExercises(userId: string) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.prisma.exercise.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createExercise(userId: string, dto: CreateExerciseDto) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.prisma.exercise.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async deleteExercise(userId: string, exerciseId: string) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const exercise = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, userId },
    });

    if (!exercise) throw new NotFoundException('Дасгал олдсонгүй');

    return this.prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }

  // ============ WORKOUT LOGS ============

  async getWorkoutLogs(userId: string, limit = 100) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        exercise: true,
      },
    });
  }

  async createWorkoutLog(userId: string, dto: CreateWorkoutLogDto) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    // Check if exercise belongs to user
    const exercise = await this.prisma.exercise.findFirst({
      where: { id: dto.exerciseId, userId },
    });

    if (!exercise) throw new NotFoundException('Дасгал олдсонгүй');

    return this.prisma.workoutLog.create({
      data: {
        ...dto,
        userId,
      },
      include: {
        exercise: true,
      },
    });
  }

  async deleteWorkoutLog(userId: string, logId: string) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const log = await this.prisma.workoutLog.findFirst({
      where: { id: logId, userId },
    });

    if (!log) throw new NotFoundException('Бүртгэл олдсонгүй');

    return this.prisma.workoutLog.delete({
      where: { id: logId },
    });
  }

  // ============ BODY STATS ============

  async getBodyStats(userId: string, limit = 30) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.prisma.bodyStats.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async createBodyStats(userId: string, dto: CreateBodyStatsDto) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.prisma.bodyStats.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async deleteBodyStats(userId: string, statsId: string) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const stats = await this.prisma.bodyStats.findFirst({
      where: { id: statsId, userId },
    });

    if (!stats) throw new NotFoundException('Бүртгэл олдсонгүй');

    return this.prisma.bodyStats.delete({
      where: { id: statsId },
    });
  }

  // ============ DASHBOARD DATA ============

  async getDashboardData(userId: string) {
    const hasAccess = await this.checkAccess(userId);
    if (!hasAccess) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const [exercises, workoutLogs, bodyStats] = await Promise.all([
      this.prisma.exercise.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workoutLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100,
        include: { exercise: true },
      }),
      this.prisma.bodyStats.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      exercises,
      workoutLogs,
      bodyStats,
    };
  }
}
