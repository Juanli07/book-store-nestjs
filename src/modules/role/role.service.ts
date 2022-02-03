import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { MapperService } from '../../shared/mapper.service';
import { Role } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {

    constructor(
        @InjectRepository(RoleRepository)
        private readonly _roleRepository: RoleRepository,
    ){}

    async get(id: number): Promise<Role> {
        
        if (!id) throw new BadRequestException('id must be sent');

        const role = await this._roleRepository.findOne(id, { where: { status: 'ACTIVE' } });

        if (!(role instanceof Role)) throw new NotFoundException();

        return role;

    }

    async getAll(): Promise<Role[]> {
        
        const roles: Role[] = await this._roleRepository.find({ where: { status: 'ACTIVE' } });

        return roles;

    }

    async create(role: Role): Promise<Role> {

        const savedRole = await this._roleRepository.save(role);
        return savedRole;
    }

    async update(id: number, role: Role): Promise<Role> {
        
        await this._roleRepository.update(id, role);
        return role;
    }

    async delete(id: number): Promise<Role> {
        
        const roleExists = await this._roleRepository.findOne(id, { where: { status: 'ACTIVE' } });

        if (!(roleExists instanceof Role)) throw new NotFoundException();

        await this._roleRepository.update(id, { status: 'INACTIVE' });
        return roleExists;
    }

}