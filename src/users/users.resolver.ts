import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { ValidRoleArgs } from 'src/items/dto/args/roles.arg';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateUserInput } from './dto/update-user.input';
import { ItemsService } from 'src/items/items.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(@Args() validRoles: ValidRoleArgs, @CurrentUser(['admin']) user: User): Promise<User[]> {
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser(['admin']) user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User)
  deactivateUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser(['admin']) user: User,
  ): Promise<User> {
    return this.usersService.deactivate(id, user);
  }

  @ResolveField(() => Int, { name: 'ItemsCount' })
  async ItemsCount(@CurrentUser(['admin']) adminUser: User, @Parent() user: User): Promise<number> {
    return this.itemsService.itemsCountByUser(user);
  }
}
