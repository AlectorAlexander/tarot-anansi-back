import * as bcrypt from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { sign } from 'jsonwebtoken';
import { IUser } from '../../modules/users/dtos/users.dtos';
import UsersService from '../../modules/users/service/users.service';
const { ObjectId } = require('mongodb');
const _id = new ObjectId();
import 'dotenv/config';
const { JWT_SECRET } = process.env;

enum ErrorTypes {
    EntityNotFound = 'EntityNotFound',
    InvalidMongoId = 'InvalidMongoId',
    InvalidCredentials = 'InvalidCredentials'
  }

const userModelMock = {
  create: jest.fn(),
  readOne: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};


jest.mock('bcrypt', () => ({
    default: {
      hash: jest.fn(),
      compare: jest.fn(),
    },
  }));
  

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    usersService = new UsersService(userModelMock);
  });

  describe('create', () => {
    it('should create a new user and return a token', async () => {
      const userData: IUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        _id: _id.toString()
      };

      const hashedPassword = 'hashedPassword';
      (bcrypt.default.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser: IUser = { ...userData, _id: _id.toString() };
      userModelMock.create.mockResolvedValue(createdUser);


      const token = 'jwtToken';
      (sign as jest.Mock).mockReturnValue(token);
      const result = await usersService.create(userData);

      expect(userModelMock.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(sign).toHaveBeenCalledWith(
        { id: createdUser._id },
        JWT_SECRET,
        expect.objectContaining({
          algorithm: 'HS256',
          expiresIn: '7d',
        })
      );
      
      
      

      expect(result).toBe(token);
    });
  });

  describe('readOne', () => {
    it('should return a token if user is found and passwords match', async () => {
      const email = 'john@example.com';
      const password = 'password123';
    
      const user: IUser = { email, password: 'hashedPassword' };
      userModelMock.readOne.mockResolvedValue(user);
    
      (bcrypt.default.compare as jest.Mock).mockResolvedValue(true);
    
      const token = 'jwtToken';
      (sign as jest.Mock).mockReturnValue(token);
    
      const result = await usersService.readOne(email, password);
    
      expect(userModelMock.readOne).toHaveBeenCalledWith(email);
      expect(bcrypt.default.compare).toHaveBeenCalledWith(password, user.password);
      expect(sign).toHaveBeenCalledWith({ id: user._id }, JWT_SECRET, expect.anything());
      expect(result).toBe(token);
    });
    

    it('should throw an error if user not found', async () => {
      const email = 'john@example.com';
      const password = 'password123';
      userModelMock.readOne.mockResolvedValue(null);

      await expect(usersService.readOne(email, password)).rejects.toThrow(ErrorTypes.EntityNotFound);

      expect(userModelMock.readOne).toHaveBeenCalledWith(email);
      expect(bcrypt.default.compare).not.toHaveBeenCalled();
    });

    it('should throw an error if passwords do not match', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      const user: IUser = { email, password: 'hashedPassword' };
      userModelMock.readOne.mockResolvedValue(user);

      (bcrypt.default.compare as jest.Mock).mockResolvedValue(false);

      await expect(usersService.readOne(email, password)).rejects.toThrow(ErrorTypes.InvalidCredentials);

      expect(userModelMock.readOne).toHaveBeenCalledWith(email);
      expect(bcrypt.default.compare).toHaveBeenCalledWith(password, user.password);
    });
  });

  describe('validate', () => {
    it('should validate a token and return true if user exists', async () => {
      const token = 'validToken';
      const userId = 'user123';
      const decodedToken = { id: userId };
      const user = { _id: userId };

      (verify as jest.Mock).mockReturnValue(decodedToken);
      userModelMock.readOne.mockResolvedValue(user);

      const result = await usersService.validate(token);

      expect(verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(userModelMock.readOne).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should throw an error if the token is invalid', async () => {
      const token = 'invalidToken';

      (verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(usersService.validate(token)).rejects.toThrow('Invalid token');
      expect(verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(userModelMock.readOne).not.toHaveBeenCalled();
    });

    it('should return false if user does not exist', async () => {
      const token = 'validToken';
      const userId = 'user123';

      (verify as jest.Mock).mockReturnValue({ id: userId });
      userModelMock.readOne.mockResolvedValue(null);

      const result = await usersService.validate(token);

      expect(verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(userModelMock.readOne).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });
  });
});

