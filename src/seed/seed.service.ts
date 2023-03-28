import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = this.configService.get('STATE') === 'prod';
  }

  async executeSeed(): Promise<boolean> {
    if (this.isProd) throw new UnauthorizedException('We cannot run SEED on Prod');

    await this.deleteDatabase();

    const users = await this.loadUsers();

    this.loadItems(users);

    return true;
  }

  private async deleteDatabase() {
    await Promise.all([
      this.itemsRepository.createQueryBuilder().delete().where({}).execute(),
      this.userRepository.createQueryBuilder().delete().where({}).execute(),
    ]);
  }

  private async loadUsers(): Promise<User[]> {
    const usersPromises = [];

    for (const user of SEED_USERS) {
      usersPromises.push(this.usersService.create(user));
    }

    return await Promise.all(usersPromises);
  }

  private async loadItems(users: User[]): Promise<void> {
    const itemsPromises = [];

    for (const item of SEED_ITEMS) {
      itemsPromises.push(
        this.itemsService.create(item, users[Math.floor(Math.random() * users.length)]),
      );
    }

    await Promise.all(itemsPromises);
  }
}
