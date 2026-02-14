import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import {
  SignupDto,
  LoginDto,
  AdminLoginDto,
  LoginByIdDto,
  CheckUserDto,
  RegisterUserDto,
  SetPasswordDto,
} from './dto/auth.dto';

// Department code mapping for user ID generation
const DEPARTMENT_CODES: Record<string, string> = {
  Удирдлага: 'DAG',
  'Дата анализын алба': 'DAA',
  'Ерөнхий аудитын хэлтэс': 'EAH',
  'Зайны аудит чанарын баталгаажуулалтын хэлтэс': 'ZAGCHBH',
  'Мэдээллийн технологийн аудитын хэлтэс': 'MTAH',
};

@Injectable()
export class AuthService {
  constructor(
    private database: DatabaseService,
    private jwtService: JwtService
  ) {}

  private get db() {
    return this.database.raw;
  }

  // Generate user ID based on department
  private async generateUserId(
    department: string,
    name: string
  ): Promise<string> {
    const deptCode = DEPARTMENT_CODES[department] || 'USR';

    // Format name: capitalize first letter of each part, keep hyphens
    const namePart = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('-')
      .replace(/\s+/g, '');

    if (department === 'Удирдлага') {
      return `.${namePart}-${deptCode}`;
    } else if (department === 'Дата анализын алба') {
      return `${deptCode}-${namePart}`;
    } else {
      return `DAG-${deptCode}-${namePart}`;
    }
  }

  async signup(signupDto: SignupDto) {
    const { email, password, name, department, position } = signupDto;

    const userId = await this.generateUserId(department, name);

    const userEmail =
      email || `${name.toLowerCase().replace(/\s+/g, '.')}@internal.local`;

    const existingUserById = this.db
      .prepare('SELECT id FROM users WHERE userId = ?')
      .get(userId);
    if (existingUserById) {
      throw new ConflictException(
        `Энэ хэрэглэгчийн ID (${userId}) аль хэдийн бүртгэлтэй байна`
      );
    }

    const existingUser = this.db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(userEmail);

    if (existingUser) {
      const timestamp = Date.now();
      const uniqueEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.${timestamp}@internal.local`;
      return this.createUser(
        uniqueEmail, password, name, department, position, userId
      );
    }

    return this.createUser(
      userEmail, password, name, department, position, userId
    );
  }

  private async createUser(
    email: string,
    password: string,
    name: string,
    department: string,
    position: string,
    usrId: string
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    let dept = this.db
      .prepare('SELECT * FROM departments WHERE name = ?')
      .get(department) as any;

    if (!dept) {
      const deptId = this.database.uuid();
      this.db
        .prepare(
          'INSERT INTO departments (id, name, description, employeeCount) VALUES (?, ?, ?, ?)'
        )
        .run(deptId, department, '', 1);
      dept = { id: deptId, name: department };
    } else {
      this.db
        .prepare(
          'UPDATE departments SET employeeCount = employeeCount + 1 WHERE id = ?'
        )
        .run(dept.id);
    }

    const id = this.database.uuid();
    this.db
      .prepare(
        `INSERT INTO users (id, email, password, name, position, userId, departmentId, isAdmin, allowedTools)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
      )
      .run(id, email, hashedPassword, name, position, usrId, dept.id, JSON.stringify(['todo', 'fitness']));

    const token = this.jwtService.sign({ id, email, userId: usrId });

    return {
      user: {
        id,
        email,
        userId: usrId,
        name,
        position,
        department,
        isAdmin: false,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { department, username, password } = loginDto;

    const dept = this.db
      .prepare('SELECT * FROM departments WHERE name = ?')
      .get(department) as any;

    if (!dept) {
      throw new UnauthorizedException('Хэлтэс олдсонгүй');
    }

    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.name = ? AND u.departmentId = ?`
      )
      .get(username, dept.id) as any;

    if (!user) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Таны эрх идэвхгүй байна. Админд хандана уу.'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    this.db
      .prepare('UPDATE users SET lastLoginAt = datetime(\'now\') WHERE id = ?')
      .run(user.id);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      userId: user.userId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        name: user.name,
        position: user.position,
        department: user.departmentName,
        departmentId: user.departmentId,
        isAdmin: !!user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { username, password } = adminLoginDto;

    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE (u.name = ? OR u.userId = ?) AND u.isAdmin = 1`
      )
      .get(username, username) as any;

    if (!user) {
      throw new UnauthorizedException(
        'Админ хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Таны эрх идэвхгүй байна.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Админ хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    this.db
      .prepare('UPDATE users SET lastLoginAt = datetime(\'now\') WHERE id = ?')
      .run(user.id);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      userId: user.userId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        name: user.name,
        position: user.position,
        department: user.departmentName,
        departmentId: user.departmentId,
        isAdmin: !!user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  async getUsersByDepartment(departmentName: string) {
    const users = this.db
      .prepare(
        `SELECT u.id, u.name, u.position
         FROM users u JOIN departments d ON u.departmentId = d.id
         WHERE d.name = ? AND u.isActive = 1`
      )
      .all(departmentName) as any[];

    return { users: users || [] };
  }

  async validateUser(userId: string) {
    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.id = ?`
      )
      .get(userId) as any;

    if (!user) return null;

    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      position: user.position,
      department: user.departmentName,
      departmentId: user.departmentId,
      isAdmin: !!user.isAdmin,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
    };
  }

  async loginById(loginByIdDto: LoginByIdDto) {
    const { userId, password } = loginByIdDto;

    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.userId = ?`
      )
      .get(userId) as any;

    if (!user) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Таны эрх идэвхгүй байна. Админд хандана уу.'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    this.db
      .prepare('UPDATE users SET lastLoginAt = datetime(\'now\') WHERE id = ?')
      .run(user.id);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      userId: user.userId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        name: user.name,
        position: user.position,
        department: user.departmentName,
        departmentId: user.departmentId,
        isAdmin: !!user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  async searchUsersByUserId(query: string) {
    if (!query || query.length < 2) {
      return { users: [] };
    }

    const pattern = `%${query}%`;
    const users = this.db
      .prepare(
        `SELECT u.id, u.name, u.userId, u.position, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.isActive = 1 AND (u.userId LIKE ? OR u.name LIKE ?)
         LIMIT 10`
      )
      .all(pattern, pattern) as any[];

    return {
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        userId: u.userId || '',
        department: u.departmentName || '',
        position: u.position,
      })),
    };
  }

  async checkUser(checkUserDto: CheckUserDto) {
    const { userId } = checkUserDto;

    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.userId = ?`
      )
      .get(userId) as any;

    if (!user) {
      return {
        exists: false,
        hasPassword: false,
        userId: null,
        name: null,
        department: null,
      };
    }

    const hasPassword =
      user.password &&
      user.password.length > 0 &&
      !user.password.startsWith('PENDING_');

    return {
      exists: true,
      hasPassword,
      userId: user.userId,
      name: user.name,
      department: user.departmentName || null,
      isActive: !!user.isActive,
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { department, position, name } = registerUserDto;

    const userId = await this.generateUserId(department, name);

    const existingUser = this.db
      .prepare('SELECT id FROM users WHERE userId = ?')
      .get(userId);

    if (existingUser) {
      throw new ConflictException(
        `Энэ хэрэглэгчийн ID (${userId}) аль хэдийн бүртгэлтэй байна`
      );
    }

    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@internal.local`;

    let dept = this.db
      .prepare('SELECT * FROM departments WHERE name = ?')
      .get(department) as any;

    if (!dept) {
      const deptId = this.database.uuid();
      this.db
        .prepare(
          'INSERT INTO departments (id, name, description, employeeCount) VALUES (?, ?, ?, ?)'
        )
        .run(deptId, department, '', 1);
      dept = { id: deptId };
    } else {
      this.db
        .prepare(
          'UPDATE departments SET employeeCount = employeeCount + 1 WHERE id = ?'
        )
        .run(dept.id);
    }

    const id = this.database.uuid();
    this.db
      .prepare(
        `INSERT INTO users (id, email, password, name, position, userId, departmentId, isAdmin, isActive, allowedTools)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`
      )
      .run(id, email, 'PENDING_PASSWORD', name, position, userId, dept.id, JSON.stringify(['todo', 'fitness']));

    return {
      success: true,
      userId,
      name,
      department,
      position,
      message: 'Бүртгэл амжилттай. Нууц үгээ үүсгэнэ үү.',
    };
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    const { userId, password } = setPasswordDto;

    const user = this.db
      .prepare(
        `SELECT u.*, d.name as departmentName
         FROM users u LEFT JOIN departments d ON u.departmentId = d.id
         WHERE u.userId = ?`
      )
      .get(userId) as any;

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    if (user.password && !user.password.startsWith('PENDING_')) {
      throw new BadRequestException('Нууц үг аль хэдийн тохируулагдсан байна');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    this.db
      .prepare(
        'UPDATE users SET password = ?, lastLoginAt = datetime(\'now\') WHERE id = ?'
      )
      .run(hashedPassword, user.id);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      userId: user.userId,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        name: user.name,
        position: user.position,
        department: user.departmentName,
        departmentId: user.departmentId,
        isAdmin: !!user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  getUserIdPrefix(department: string): string {
    const deptCode = DEPARTMENT_CODES[department] || 'USR';

    if (department === 'Удирдлага') {
      return `.`;
    } else {
      return `DAG-${deptCode}-`;
    }
  }
}
