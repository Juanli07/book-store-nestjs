import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { MapperService } from '../../shared/mapper.service';
import { Role } from '../role/role.entity';
import { UserDto } from './dto/user.dto';
import { UserDetails } from './user.details.entity';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly _userRepository: UserRepository,
        private readonly _mapperService: MapperService,
    ){}

    async get(id: number): Promise<UserDto> {
        
        if (!id) throw new BadRequestException('id must be sent');

        const user = await this._userRepository.findOne(id, { where: { status: 'ACTIVE' } });

        if (!(user instanceof User)) throw new NotFoundException();

        return this._mapperService.map<User, UserDto>(user, new UserDto());

    }

    async getAll(): Promise<UserDto[]> {
        
        const users: User[] = await this._userRepository.find({ where: { status: 'ACTIVE' } });

        return this._mapperService.mapCollection<User, UserDto>(users, new UserDto());

    }

    async create(user: User): Promise<UserDto> {
        
        const details = new UserDetails();
        user.details = details;

        const repo = await getConnection().getRepository(Role);
        const defaultRole = await repo.findOne({ where: { name: 'ADMIN' } });

        user.roles = [defaultRole];

        const savedUser = await this._userRepository.save(user);
        return this._mapperService.map<User, UserDto>(savedUser, new UserDto());
    }

    async update(id: number, user: User): Promise<UserDto> {
        
        await this._userRepository.update(id, user);
        return this._mapperService.map<User, UserDto>(user, new UserDto());
    }

    async delete(id: number): Promise<UserDto> {
        
        const userExists = await this._userRepository.findOne(id, { where: { status: 'ACTIVE' } });

        if (!(userExists instanceof User)) throw new NotFoundException();

        await this._userRepository.update(id, { status: 'INACTIVE' });
        return this._mapperService.map<User, UserDto>(userExists, new UserDto());
    }

}
