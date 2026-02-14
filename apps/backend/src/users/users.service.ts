import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  private get db() {
    return this.database.raw;
  }

  async findAll() {
    const users = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         ORDER BY u.createdAt DESC`
      )
      .all() as any[];

    return users.map(user => ({
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      position: user.position,
      department: user.departmentName,
      departmentId: user.departmentId,
      isAdmin: !!user.isAdmin,
      isActive: !!user.isActive,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }));
  }

  async findOne(id: string) {
    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.id = ?`
      )
      .get(id) as any;

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    return {
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      position: user.position,
      department: user.departmentName,
      departmentId: user.departmentId,
      isAdmin: !!user.isAdmin,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      createdAt: user.createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updateUserDto.name !== undefined) { fields.push('name = ?'); values.push(updateUserDto.name); }
    if (updateUserDto.position !== undefined) { fields.push('position = ?'); values.push(updateUserDto.position); }
    if (updateUserDto.departmentId !== undefined) { fields.push('departmentId = ?'); values.push(updateUserDto.departmentId); }
    if (updateUserDto.isAdmin !== undefined) { fields.push('isAdmin = ?'); values.push(updateUserDto.isAdmin ? 1 : 0); }
    if (updateUserDto.allowedTools !== undefined) { fields.push('allowedTools = ?'); values.push(JSON.stringify(updateUserDto.allowedTools)); }

    if (fields.length > 0) {
      fields.push("updatedAt = datetime('now')");
      values.push(id);
      this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.id = ?`
      )
      .get(id) as any;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      position: updated.position,
      department: updated.departmentName,
      departmentId: updated.departmentId,
      isAdmin: !!updated.isAdmin,
      allowedTools: updated.allowedTools ? JSON.parse(updated.allowedTools) : [],
    };
  }

  async remove(id: string) {
    const user = this.db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return { message: 'Хэрэглэгчийг амжилттай устгалаа' };
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = this.db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    this.db
      .prepare("UPDATE users SET isActive = ?, updatedAt = datetime('now') WHERE id = ?")
      .run(isActive ? 1 : 0, id);

    const updated = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.id = ?`
      )
      .get(id) as any;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      isActive: !!updated.isActive,
      department: updated.departmentName,
    };
  }

  async updateTools(id: string, allowedTools: string[]) {
    const user = this.db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    this.db
      .prepare("UPDATE users SET allowedTools = ?, updatedAt = datetime('now') WHERE id = ?")
      .run(JSON.stringify(allowedTools), id);

    const updated = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.id = ?`
      )
      .get(id) as any;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      allowedTools: updated.allowedTools ? JSON.parse(updated.allowedTools) : [],
    };
  }
}
