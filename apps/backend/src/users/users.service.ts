import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      position: user.position,
      department: user.department?.name,
      departmentId: user.departmentId,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    return {
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      position: user.position,
      department: user.department?.name,
      departmentId: user.departmentId,
      isAdmin: user.isAdmin,
      allowedTools: user.allowedTools ? JSON.parse(user.allowedTools) : [],
      createdAt: user.createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const updateData: any = {};

    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.position !== undefined)
      updateData.position = updateUserDto.position;
    if (updateUserDto.departmentId !== undefined)
      updateData.departmentId = updateUserDto.departmentId;
    if (updateUserDto.isAdmin !== undefined)
      updateData.isAdmin = updateUserDto.isAdmin;
    if (updateUserDto.allowedTools !== undefined) {
      updateData.allowedTools = JSON.stringify(updateUserDto.allowedTools);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { department: true },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      position: updatedUser.position,
      department: updatedUser.department?.name,
      departmentId: updatedUser.departmentId,
      isAdmin: updatedUser.isAdmin,
      allowedTools: updatedUser.allowedTools
        ? JSON.parse(updatedUser.allowedTools)
        : [],
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'Хэрэглэгчийг амжилттай устгалаа' };
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      include: { department: true },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
      department: updatedUser.department?.name,
    };
  }

  async updateTools(id: string, allowedTools: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { allowedTools: JSON.stringify(allowedTools) },
      include: { department: true },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      allowedTools: updatedUser.allowedTools
        ? JSON.parse(updatedUser.allowedTools)
        : [],
    };
  }
}
