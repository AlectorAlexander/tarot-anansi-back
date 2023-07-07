import { IModel } from './../../interfaces/IModel';
import { IService } from "src/modules/interfaces/IService";
import { IUser, userValidationSchema } from "../dtos/users.dtos";

enum ErrorTypes {
    EntityNotFound = 'EntityNotFound',
    InvalidMongoId = 'InvalidMongoId',
  }

class UsersService implements IService<IUser> {
    private _user: IModel<IUser>;

    constructor(model: IModel<IUser>) {
        this._user = model;
    }

    public async create(data: unknown): Promise<IUser> {
        const parsed = userValidationSchema.safeParse(data)

        if (!parsed.success) {
            throw parsed;
        }
        const result = await this._user.create(parsed.data);
        return result;
    }
    
    public async readOne(id: string): Promise<IUser> {
        const result = await this._user.readOne(id);
        if (!result) {
            throw new Error(ErrorTypes.EntityNotFound);
        }
        return result;
    }

    public async read(): Promise<IUser[]> {
        const result = await this._user.read();
        if (!result) {
            throw new Error(ErrorTypes.EntityNotFound);
        }
        return result;
    }

    public async update(id:string, obj: IUser | object):Promise<IUser> {
        const User = await this._user.update(id, obj);
        const parsed = userValidationSchema.safeParse(obj);
        if (!parsed.success) {
          throw parsed;
        }
        if (!User) throw new Error(ErrorTypes.EntityNotFound);
        return User;
      }
    
      public async delete(id:string):Promise<IUser> {
        const User = await this._user.delete(id);
        if (!User) throw new Error(ErrorTypes.EntityNotFound);
        return User;
      }
    }

export default UsersService;