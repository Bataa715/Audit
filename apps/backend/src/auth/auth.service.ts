import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

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
      // Format: .NAME-DAG (e.g., .Tuya-DAG)
      return `.${namePart}-${deptCode}`;
    } else if (department === 'Дата анализын алба') {
      // Format: DAA-NAME (e.g., DAA-Bataa)
      return `${deptCode}-${namePart}`;
    } else {
      // Format: DAG-DEPTCODE-NAME (e.g., DAG-EAH-Bataa)
      return `DAG-${deptCode}-${namePart}`;
    }
  }

  async signup(signupDto: SignupDto) {
    const { email, password, name, department, position } = signupDto;

    // Generate user ID based on department
    const userId = await this.generateUserId(department, name);

    // Generate email if not provided (username@internal.local format)
    const userEmail =
      email || `${name.toLowerCase().replace(/\s+/g, '.')}@internal.local`;

    // Check if user ID already exists
    const existingUserById = await this.prisma.user.findFirst({
      where: { userId },
    });

    if (existingUserById) {
      throw new ConflictException(
        `Энэ хэрэглэгчийн ID (${userId}) аль хэдийн бүртгэлтэй байна`
      );
    }

    // Хэрэглэгч бүртгэлтэй эсэхийг шалгах
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      // If generated email exists, add timestamp
      const timestamp = Date.now();
      const uniqueEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.${timestamp}@internal.local`;
      return this.createUser(
        uniqueEmail,
        password,
        name,
        department,
        position,
        userId
      );
    }

    return this.createUser(
      userEmail,
      password,
      name,
      department,
      position,
      userId
    );
  }

  private async createUser(
    email: string,
    password: string,
    name: string,
    department: string,
    position: string,
    userId: string
  ) {
    // Нууц үгийг hash-лах
    const hashedPassword = await bcrypt.hash(password, 10);

    // Department-г олох эсвэл үүсгэх
    let dept = await this.prisma.department.findUnique({
      where: { name: department },
    });

    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          name: department,
          description: '',
          employeeCount: 1,
        },
      });
    } else {
      await this.prisma.department.update({
        where: { id: dept.id },
        data: { employeeCount: dept.employeeCount + 1 },
      });
    }

    // Хэрэглэгч үүсгэх
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        position,
        userId,
        departmentId: dept.id,
        isAdmin: false,
        allowedTools: JSON.stringify(['todo', 'fitness']),
      },
    });

    // JWT token үүсгэх
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
        department: department,
        isAdmin: user.isAdmin,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { department, username, password } = loginDto;

    // Хэлтэс олох
    const dept = await this.prisma.department.findUnique({
      where: { name: department },
    });

    if (!dept) {
      throw new UnauthorizedException('Хэлтэс олдсонгүй');
    }

    // Хэрэглэгч олох (хэлтэс ба нэрээр)
    const user = await this.prisma.user.findFirst({
      where: {
        name: username,
        departmentId: dept.id,
      },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Таны эрх идэвхгүй байна. Админд хандана уу.'
      );
    }

    // Нууц үг шалгах
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT token үүсгэх
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
        department: user.department?.name,
        departmentId: user.departmentId,
        isAdmin: user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { username, password } = adminLoginDto;

    // Find user by name or userId
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ name: username }, { userId: username }],
        isAdmin: true,
      },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Админ хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Таны эрх идэвхгүй байна.');
    }

    // Нууц үг шалгах
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Админ хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT token үүсгэх
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
        department: user.department?.name,
        departmentId: user.departmentId,
        isAdmin: user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  async getUsersByDepartment(departmentName: string) {
    // Хэлтэс олох
    const dept = await this.prisma.department.findUnique({
      where: { name: departmentName },
      include: {
        users: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    if (!dept) {
      return { users: [] };
    }

    return {
      users: dept.users,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      position: user.position,
      department: user.department?.name,
      departmentId: user.departmentId,
      isAdmin: user.isAdmin,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
    };
  }

  // Login by user ID (e.g., DAG-EAH-BATAA)
  async loginById(loginByIdDto: LoginByIdDto) {
    const { userId, password } = loginByIdDto;

    // Find user by userId
    const user = await this.prisma.user.findFirst({
      where: { userId },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Таны эрх идэвхгүй байна. Админд хандана уу.'
      );
    }

    // Нууц үг шалгах
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна'
      );
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT token үүсгэх
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
        department: user.department?.name,
        departmentId: user.departmentId,
        isAdmin: user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  // Search users by userId for autocomplete
  async searchUsersByUserId(query: string) {
    if (!query || query.length < 2) {
      return { users: [] };
    }

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { userId: { contains: query } },
              { name: { contains: query } },
            ],
          },
        ],
      },
      include: { department: true },
      take: 10,
    });

    return {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        userId: user.userId || '',
        department: user.department?.name || '',
        position: user.position,
      })),
    };
  }

  // Check if user exists and has password
  async checkUser(checkUserDto: CheckUserDto) {
    const { userId } = checkUserDto;

    const user = await this.prisma.user.findFirst({
      where: { userId },
      include: { department: true },
    });

    if (!user) {
      return {
        exists: false,
        hasPassword: false,
        userId: null,
        name: null,
        department: null,
      };
    }

    // Check if user has a password set (not null/empty or a placeholder)
    const hasPassword =
      user.password &&
      user.password.length > 0 &&
      !user.password.startsWith('PENDING_');

    return {
      exists: true,
      hasPassword,
      userId: user.userId,
      name: user.name,
      department: user.department?.name || null,
      isActive: user.isActive,
    };
  }

  // Register a new user without password
  async registerUser(registerUserDto: RegisterUserDto) {
    const { department, position, name } = registerUserDto;

    // Generate user ID based on department
    const userId = await this.generateUserId(department, name);

    // Check if user ID already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { userId },
    });

    if (existingUser) {
      throw new ConflictException(
        `Энэ хэрэглэгчийн ID (${userId}) аль хэдийн бүртгэлтэй байна`
      );
    }

    // Generate email
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@internal.local`;

    // Department-г олох эсвэл үүсгэх
    let dept = await this.prisma.department.findUnique({
      where: { name: department },
    });

    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          name: department,
          description: '',
          employeeCount: 1,
        },
      });
    } else {
      await this.prisma.department.update({
        where: { id: dept.id },
        data: { employeeCount: dept.employeeCount + 1 },
      });
    }

    // Create user with placeholder password (to be set by user on first login)
    const user = await this.prisma.user.create({
      data: {
        email,
        password: 'PENDING_PASSWORD', // Placeholder - user must set password on first login
        name,
        position,
        userId,
        departmentId: dept.id,
        isAdmin: false,
        isActive: true,
        allowedTools: JSON.stringify(['todo', 'fitness']),
      },
    });

    return {
      success: true,
      userId: user.userId,
      name: user.name,
      department: department,
      position: user.position,
      message: 'Бүртгэл амжилттай. Нууц үгээ үүсгэнэ үү.',
    };
  }

  // Set password for first-time user
  async setPassword(setPasswordDto: SetPasswordDto) {
    const { userId, password } = setPasswordDto;

    // Find user by userId
    const user = await this.prisma.user.findFirst({
      where: { userId },
      include: { department: true },
    });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    // Check if user already has a real password
    if (user.password && !user.password.startsWith('PENDING_')) {
      throw new BadRequestException('Нууц үг аль хэдийн тохируулагдсан байна');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token and log in the user
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
        department: user.department?.name,
        departmentId: user.departmentId,
        isAdmin: user.isAdmin,
        allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      },
      token,
    };
  }

  // Generate userId prefix based on department (for frontend preview)
  getUserIdPrefix(department: string): string {
    const deptCode = DEPARTMENT_CODES[department] || 'USR';

    if (department === 'Удирдлага') {
      return `.`; // Will become .NAME-DAG
    } else {
      return `DAG-${deptCode}-`; // Will become DAG-DEPTCODE-NAME
    }
  }
}
