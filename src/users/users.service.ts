import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private logger = new Logger('UserService');

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException('User not found.');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException('User not found.');
    }
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  async deactivate(id: string): Promise<User> {
    throw new Error('Not implemented');
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException('The user already exists.');

    this.logger.error(error);

    throw new InternalServerErrorException('Please check server logs.');
  }
}
