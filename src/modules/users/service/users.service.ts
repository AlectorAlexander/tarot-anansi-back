import { IService } from "src/modules/interfaces/IService";
import { sign, SignOptions, verify } from 'jsonwebtoken';
import { IUser, userValidationSchema } from "../dtos/users.dtos";
import { hash, compare } from 'bcrypt';
import 'dotenv/config';
import UserModel from '../entities/users.entity';

enum ErrorTypes {
    EntityNotFound = 'EntityNotFound',
    InvalidMongoId = 'InvalidMongoId',
    InvalidCredentials = 'InvalidCredentials'
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


    public async create(data: IUser): Promise<String> {
      try {
        const parsed = userValidationSchema.safeParse(data);
        
        if (!parsed.success) {
          throw new Error('Erro na validação do usuário.');
        }
      
        const { password } = data;
        const saltRounds = 10;
        const hashedPassword: string = await hash(password, saltRounds);
        const user = await this._user.create({ ...parsed.data, password: hashedPassword });
        
        return sign({ id: user._id }, JWT_SECRET, jwtConfig);
      } catch (error) {
        throw new Error('Erro ao criar o usuário. Detalhes do erro: ' + error.message);
      }
    }
      
      
    
    public async readOne(email: string, password: string): Promise<IUser> {
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
    

      public async validate(token): Promise<Boolean> {
        try {
            const decodedToken = verify(token, JWT_SECRET) as { id: string };
            const userId = decodedToken.id; 
            const user =  await this._user.readOne(userId)
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