import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Ийм нэртэй хэлтэс аль хэдийн байна');
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: { users: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    return department;
  }

  async findByName(name: string) {
    const department = await this.prisma.department.findUnique({
      where: { name },
      include: { users: { where: { isAdmin: false } } },
    });

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existing = await this.prisma.department.findUnique({
        where: { name: updateDepartmentDto.name },
      });

      if (existing) {
        throw new ConflictException('Ийм нэртэй хэлтэс аль хэдийн байна');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!department) {
      throw new NotFoundException('Хэлтэс олдсонгүй');
    }

    if (department.users.length > 0) {
      throw new ConflictException(
        'Энэ хэлтэст ажилтнууд байна. Эхлээд тэднийг шилжүүлнэ үү'
      );
    }

    await this.prisma.department.delete({ where: { id } });

    return { message: 'Хэлтсийг амжилттай устгалаа' };
  }
}
