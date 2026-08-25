import { dbStore, MockUser } from '../../database/mockDataStore';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { CryptoUtil } from '../../shared/utils/crypto';
import { v4 as uuidv4 } from 'uuid';

export class UsersService {
  public async listUsers(params: { page?: number; limit?: number; search?: string; role?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search?.toLowerCase();
    const role = params.role;

    let filtered = dbStore.users;

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.did.toLowerCase().includes(search)
      );
    }

    if (role && role !== 'All') {
      filtered = filtered.filter((u) => u.role === role);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      did: u.did,
      status: u.status,
      role: u.role,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt,
    }));

    return { users: paginated, total, page, limit };
  }

  public async getUserById(id: string) {
    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      did: user.did,
      status: user.status,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }

  public async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
  }) {
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await CryptoUtil.hashPassword(data.password);
    const did = `did:bel:${CryptoUtil.generateRandomToken(8)}`;

    const newUser: MockUser = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      did,
      status: 'ACTIVE',
      role: data.role,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.users.push(newUser);

    // Add audit log
    dbStore.auditLogs.unshift({
      id: `aud-${uuidv4().substring(0, 8)}`,
      userId: 'system',
      action: 'IDENTITY_CREATED',
      entity: 'User',
      entityId: newUser.id,
      details: `New identity ${newUser.did} created with role ${newUser.role}`,
      ipAddress: '10.200.1.45',
      status: 'SUCCESS',
      timestamp: new Date(),
      blockHeight: 2345679,
      cryptographicHash: CryptoUtil.generateSha256Hash(newUser),
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      did: newUser.did,
      role: newUser.role,
      status: newUser.status,
    };
  }

  public async updateUser(id: string, data: Partial<{ firstName: string; lastName: string; role: string; status: string }>) {
    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.role) user.role = data.role;
    if (data.status) user.status = data.status;
    user.updatedAt = new Date();

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      did: user.did,
      role: user.role,
      status: user.status,
    };
  }

  public async assignRole(id: string, newRole: string) {
    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const previousRole = user.role;
    user.role = newRole;
    user.updatedAt = new Date();

    // Log to audit trail
    dbStore.auditLogs.unshift({
      id: `aud-${uuidv4().substring(0, 8)}`,
      userId: 'usr-admin-01',
      action: 'ROLE_ASSIGNED',
      entity: 'User',
      entityId: user.id,
      details: `Role changed from ${previousRole} to ${newRole} for ${user.email}`,
      ipAddress: '10.200.1.45',
      status: 'SUCCESS',
      timestamp: new Date(),
      blockHeight: 2345680,
      cryptographicHash: CryptoUtil.generateSha256Hash({ id, newRole, previousRole }),
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    };
  }

  public async deleteUser(id: string) {
    const idx = dbStore.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    dbStore.users.splice(idx, 1);
    return { deleted: true, id };
  }
}

export const usersService = new UsersService();
