import { IService } from 'src/modules/interfaces/IService';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import { IUser, userValidationSchema } from '../dtos/users.dtos';
import { hash, compare } from 'bcrypt';
import 'dotenv/config';
import UserModel from '../entities/users.entity';
import { SafeParseError } from 'zod';

export enum ErrorTypes {
  EntityNotFound = 'EntityNotFound',
  InvalidMongoId = 'InvalidMongoId',
  InvalidCredentials = 'InvalidCredentials',
}

const { JWT_SECRET } = process.env;

const jwtConfig: SignOptions = {
  expiresIn: '7d',
  algorithm: 'HS256',
};

class UsersService implements IService<IUser> {
  private _user: UserModel;

  constructor() {
    this._user = new UserModel();
  }

  private async validateDataAndCreate(data: IUser): Promise<IUser> {
    const parsed = userValidationSchema.safeParse(data);

    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IUser>; // Type assertion
      const { message, code } = errorDetails.error.errors[0];
      throw new Error(`${message} (code: ${code})`);
    }

    const { password } = data;
    const saltRounds = 10;
    const hashedPassword: string = await hash(password, saltRounds);
    const user = await this._user.create({
      ...parsed.data,
      password: hashedPassword,
    });
    return user;
  }

  public async create(data: IUser): Promise<string> {
    try {
      const user = await this.validateDataAndCreate(data);
      return sign({ id: user._id, role: user.role }, JWT_SECRET, jwtConfig);
    } catch (error) {
      throw error;
    }
  }

  public async readOne(email: string, password: string): Promise<string> {
    const user = await this._user.readOneByEmail(email);

    if (!user) {
      throw new Error(ErrorTypes.EntityNotFound);
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new Error(ErrorTypes.InvalidCredentials);
    }

    return sign({ id: user._id }, JWT_SECRET, jwtConfig);
  }

  public async validate(token): Promise<boolean> {
    try {
      const decodedToken = verify(token, JWT_SECRET) as { id: string };
      const userId = decodedToken.id;
      const user = await this._user.readOne(userId);
      if (user) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  public async read(): Promise<IUser[]> {
    const results = await this._user.read();
    if (!results) {
      throw new Error(ErrorTypes.EntityNotFound);
    }
    const users = results.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    return users;
  }

  public async update(id: string, obj: IUser | object): Promise<IUser> {
    const parsed = userValidationSchema.safeParse(obj);

    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IUser>; // Type assertion
      const errorMessage =
        errorDetails?.error?.errors?.[0]?.message || 'Validation error';
      const errorCode =
        errorDetails?.error?.errors?.[0]?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${errorCode})`);
    }

    let updatedUser: IUser;
    if ('password' in obj && typeof obj['password'] === 'string') {
      const saltRounds = 10;
      const hashedPassword: string = await hash(obj['password'], saltRounds);
      updatedUser = { ...obj, password: hashedPassword };
    } else {
      updatedUser = obj as IUser;
    }

    const User = await this._user.update(id, updatedUser);

    if (!User) throw new Error(ErrorTypes.EntityNotFound);

    return User;
  }

  public async delete(id: string): Promise<IUser> {
    const User = await this._user.delete(id);
    if (!User) throw new Error(ErrorTypes.EntityNotFound);
    return User;
  }
}

export default UsersService;
