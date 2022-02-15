import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { status } from '../../shared/entity-status.enum';
import { getConnection } from 'typeorm';
import { Role } from '../role/role.entity';
import { RoleRepository } from '../role/role.repository';
import { UserDto } from './dto/user.dto';
import { UserDetails } from './user.details.entity';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly _userRepository: UserRepository,
        @InjectRepository(RoleRepository)
        private readonly _roleRepository: RoleRepository,
    ){}

    async get(id: number): Promise<User> {
        
        if (!id) throw new BadRequestException('id must be sent');

        const user = await this._userRepository.findOne(id, { where: { status: status.ACTIVE } });

        if (!(user instanceof User)) throw new NotFoundException();

        return user;

    }

    async getAll(): Promise<User[]> {
        
        const users: User[] = await this._userRepository.find({ where: { status: status.ACTIVE } });

        return users;

    }

    async create(user: User): Promise<User> {
        
        const details = new UserDetails();
        user.details = details;

        const repo = await getConnection().getRepository(Role);
        const defaultRole = await repo.findOne({ where: { name: 'ADMIN' } });

        user.roles = [defaultRole];

        const savedUser = await this._userRepository.save(user);
        return savedUser;
    }

    async update(id: number, user: User): Promise<User> {
        
        await this._userRepository.update(id, user);
        return user;
    }

    async delete(id: number): Promise<User> {
        
        const userExists = await this._userRepository.findOne(id, { where: { status: status.ACTIVE } });

        if (!(userExists instanceof User)) throw new NotFoundException();

        await this._userRepository.update(id, { status: 'INACTIVE' });
        return userExists;
    }

    async setRoleToUser(userId: number, roleId: number) {
        
        const userExists = await this._userRepository.findOne(userId, { where: { status: status.ACTIVE } });
        if (!(userExists instanceof User)) throw new NotFoundException();

        const roleExists = await this._roleRepository.findOne(roleId, { where: { status: status.ACTIVE } });
        if (!roleExists) throw new NotFoundException('Role does not exist');

        if (!userExists.roles.includes(roleExists)) {
            userExists.roles.push(roleExists);
            await this._userRepository.save(userExists);
        }

        return true;
    }

}
