import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private database: DatabaseService) {}

  private get db() {
    return this.database.raw;
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existing = this.db
      .prepare('SELECT id FROM departments WHERE name = ?')
      .get(createDepartmentDto.name);

    if (existing) {
      throw new ConflictException('Ийм нэртэй хэлтэс аль хэдийн байна');
    }

    const id = this.database.uuid();
    this.db
      .prepare(
        'INSERT INTO departments (id, name, description, manager, employeeCount) VALUES (?, ?, ?, ?, ?)'
      )
      .run(
        id,
        createDepartmentDto.name,
        createDepartmentDto.description || null,
        createDepartmentDto.manager || null,
        createDepartmentDto.employeeCount || 0
      );

    return this.db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
  }

  async findAll() {
    const departments = this.db
      .prepare('SELECT * FROM departments ORDER BY createdAt DESC')
      .all() as any[];

    return departments.map(dept => {
      const users = this.db
        .prepare('SELECT id, userId, name, position, email, isActive FROM users WHERE departmentId = ?')
        .all(dept.id);
      return { ...dept, users };
    });
  }

  async findOne(id: string) {
    const department = this.db
      .prepare('SELECT * FROM departments WHERE id = ?')
      .get(id) as any;

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    const users = this.db
      .prepare('SELECT id, userId, name, position, email, isActive FROM users WHERE departmentId = ?')
      .all(id);

    return { ...department, users };
  }

  async findByName(name: string) {
    const department = this.db
      .prepare('SELECT * FROM departments WHERE name = ?')
      .get(name) as any;

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    const users = this.db
      .prepare(
        'SELECT id, userId, name, position, email FROM users WHERE departmentId = ? AND isAdmin = 0'
      )
      .all(department.id);

    return { ...department, users };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = this.db
      .prepare('SELECT * FROM departments WHERE id = ?')
      .get(id) as any;

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existing = this.db
        .prepare('SELECT id FROM departments WHERE name = ?')
        .get(updateDepartmentDto.name);
      if (existing) {
        throw new ConflictException('Ийм нэртэй хэлтэс аль хэдийн байна');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updateDepartmentDto.name !== undefined) { fields.push('name = ?'); values.push(updateDepartmentDto.name); }
    if (updateDepartmentDto.description !== undefined) { fields.push('description = ?'); values.push(updateDepartmentDto.description); }
    if (updateDepartmentDto.manager !== undefined) { fields.push('manager = ?'); values.push(updateDepartmentDto.manager); }
    if (updateDepartmentDto.employeeCount !== undefined) { fields.push('employeeCount = ?'); values.push(updateDepartmentDto.employeeCount); }

    if (fields.length > 0) {
      fields.push("updatedAt = datetime('now')");
      values.push(id);
      this.db.prepare(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
  }

  async remove(id: string) {
    const department = this.db
      .prepare('SELECT * FROM departments WHERE id = ?')
      .get(id) as any;

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    const users = this.db
      .prepare('SELECT id FROM users WHERE departmentId = ?')
      .all(id);

    if (users.length > 0) {
      throw new ConflictException(
        'Энэ хэлтэст ажилтнууд байна. Эхлээд тэднийг шилжүүлнэ үү'
      );
    }

    this.db.prepare('DELETE FROM departments WHERE id = ?').run(id);
    return { message: 'Хэлтсийг амжилттай устгалаа' };
  }
}
