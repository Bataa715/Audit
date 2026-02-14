import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateExerciseDto,
  CreateWorkoutLogDto,
  CreateBodyStatsDto,
} from './dto/fitness.dto';

@Injectable()
export class FitnessService {
  constructor(private database: DatabaseService) {}

  private get db() {
    return this.database.raw;
  }

  private checkAccess(userId: string): boolean {
    const user = this.db.prepare('SELECT isAdmin, allowedTools FROM users WHERE id = ?').get(userId) as any;
    if (!user) return false;
    if (user.isAdmin) return true;

    try {
      const allowedTools = user.allowedTools ? JSON.parse(user.allowedTools) : [];
      return allowedTools.includes('fitness');
    } catch {
      return false;
    }
  }

  // ============ EXERCISES ============

  async getExercises(userId: string) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.db
      .prepare('SELECT * FROM exercises WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId);
  }

  async createExercise(userId: string, dto: CreateExerciseDto) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const id = this.database.uuid();
    this.db
      .prepare('INSERT INTO exercises (id, name, category, description, userId) VALUES (?, ?, ?, ?, ?)')
      .run(id, dto.name, dto.category || null, dto.description || null, userId);

    return this.db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
  }

  async deleteExercise(userId: string, exerciseId: string) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const exercise = this.db
      .prepare('SELECT * FROM exercises WHERE id = ? AND userId = ?')
      .get(exerciseId, userId);

    if (!exercise) throw new NotFoundException('Дасгал олдсонгүй');

    this.db.prepare('DELETE FROM exercises WHERE id = ?').run(exerciseId);
    return exercise;
  }

  // ============ WORKOUT LOGS ============

  async getWorkoutLogs(userId: string, limit = 100) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const logs = this.db
      .prepare(
        `SELECT wl.*, e.name as exerciseName, e.category as exerciseCategory
         FROM workout_logs wl
         LEFT JOIN exercises e ON wl.exerciseId = e.id
         WHERE wl.userId = ?
         ORDER BY wl.date DESC
         LIMIT ?`
      )
      .all(userId, limit) as any[];

    return logs.map(log => ({
      ...log,
      exercise: { id: log.exerciseId, name: log.exerciseName, category: log.exerciseCategory },
    }));
  }

  async createWorkoutLog(userId: string, dto: CreateWorkoutLogDto) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const exercise = this.db
      .prepare('SELECT * FROM exercises WHERE id = ? AND userId = ?')
      .get(dto.exerciseId, userId);

    if (!exercise) throw new NotFoundException('Дасгал олдсонгүй');

    const id = this.database.uuid();
    this.db
      .prepare(
        'INSERT INTO workout_logs (id, exerciseId, userId, sets, repetitions, weight, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, dto.exerciseId, userId, dto.sets || null, dto.repetitions || null, dto.weight || null, dto.notes || null);

    const log = this.db.prepare('SELECT * FROM workout_logs WHERE id = ?').get(id) as any;
    return { ...log, exercise };
  }

  async deleteWorkoutLog(userId: string, logId: string) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const log = this.db
      .prepare('SELECT * FROM workout_logs WHERE id = ? AND userId = ?')
      .get(logId, userId);

    if (!log) throw new NotFoundException('Бүртгэл олдсонгүй');

    this.db.prepare('DELETE FROM workout_logs WHERE id = ?').run(logId);
    return log;
  }

  // ============ BODY STATS ============

  async getBodyStats(userId: string, limit = 30) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    return this.db
      .prepare('SELECT * FROM body_stats WHERE userId = ? ORDER BY date DESC LIMIT ?')
      .all(userId, limit);
  }

  async createBodyStats(userId: string, dto: CreateBodyStatsDto) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const id = this.database.uuid();
    this.db
      .prepare('INSERT INTO body_stats (id, userId, weight, height) VALUES (?, ?, ?, ?)')
      .run(id, userId, dto.weight, dto.height);

    return this.db.prepare('SELECT * FROM body_stats WHERE id = ?').get(id);
  }

  async deleteBodyStats(userId: string, statsId: string) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const stats = this.db
      .prepare('SELECT * FROM body_stats WHERE id = ? AND userId = ?')
      .get(statsId, userId);

    if (!stats) throw new NotFoundException('Бүртгэл олдсонгүй');

    this.db.prepare('DELETE FROM body_stats WHERE id = ?').run(statsId);
    return stats;
  }

  // ============ DASHBOARD DATA ============

  async getDashboardData(userId: string) {
    if (!this.checkAccess(userId)) throw new ForbiddenException('Эрх хүрэхгүй байна');

    const exercises = this.db
      .prepare('SELECT * FROM exercises WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId);

    const workoutLogsRaw = this.db
      .prepare(
        `SELECT wl.*, e.name as exerciseName, e.category as exerciseCategory
         FROM workout_logs wl
         LEFT JOIN exercises e ON wl.exerciseId = e.id
         WHERE wl.userId = ?
         ORDER BY wl.date DESC
         LIMIT 100`
      )
      .all(userId) as any[];

    const workoutLogs = workoutLogsRaw.map(log => ({
      ...log,
      exercise: { id: log.exerciseId, name: log.exerciseName, category: log.exerciseCategory },
    }));

    const bodyStats = this.db
      .prepare('SELECT * FROM body_stats WHERE userId = ? ORDER BY date DESC LIMIT 30')
      .all(userId);

    return { exercises, workoutLogs, bodyStats };
  }
}
