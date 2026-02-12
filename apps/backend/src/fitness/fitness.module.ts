import { Module } from '@nestjs/common';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FitnessController],
  providers: [FitnessService],
})
export class FitnessModule {}
