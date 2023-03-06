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
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';

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

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) return this.userRepository.find();

    return this.userRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] @> :roles')
      .setParameter('roles', roles)
      .getMany();
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

  async update(id: string, updateUserInput: UpdateUserInput, updateBy: User): Promise<User> {
    try {
      const user = await this.userRepository.preload({ id });

      const updatedUser: User = {
        ...user,
        ...updateUserInput,
        lastUpdateBy: updateBy,
      };

      return await this.userRepository.save(updatedUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async deactivate(id: string, user: User): Promise<User> {
    const userToBlock = await this.userRepository.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = user;

    return await this.userRepository.save(userToBlock);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException('The user already exists.');

    this.logger.error(error);

    throw new InternalServerErrorException('Please check server logs.');
  }
}
