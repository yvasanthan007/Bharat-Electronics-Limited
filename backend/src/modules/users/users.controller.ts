import { Request, Response } from 'express';
import { usersService } from './users.service';
import { ApiResponse } from '../../shared/utils/response';

export class UsersController {
  public listUsers = async (req: Request, res: Response): Promise<void> => {
    const { users, total, page, limit } = await usersService.listUsers(req.query);
    ApiResponse.paginated(res, users, page, limit, total, 'Users retrieved successfully');
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await usersService.getUserById(req.params.id);
    ApiResponse.success(res, user, 'User details retrieved');
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const user = await usersService.createUser(req.body);
    ApiResponse.created(res, user, 'User identity created successfully');
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const user = await usersService.updateUser(req.params.id, req.body);
    ApiResponse.success(res, user, 'User updated successfully');
  };

  public assignRole = async (req: Request, res: Response): Promise<void> => {
    const result = await usersService.assignRole(req.params.id, req.body.role);
    ApiResponse.success(res, result, 'Role assigned successfully');
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const result = await usersService.deleteUser(req.params.id);
    ApiResponse.success(res, result, 'User identity revoked');
  };
}

export const usersController = new UsersController();
