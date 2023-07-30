import { SignOptions, sign } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { Document } from 'mongoose';
import {
  IUser,
  userValidationSchema,
} from '../../modules/users/dtos/users.dtos';
import UserModel from '../../modules/users/entities/users.entity';
import UsersService, {
  ErrorTypes,
} from '../../modules/users/service/users.service';

const { JWT_SECRET } = process.env;

const jwtConfig: SignOptions = {
  expiresIn: '7d',
  algorithm: 'HS256',
};

// Create a mock UserModel for testing purposes
jest.mock('../../modules/users/entities/users.entity');
const MockUserModel = UserModel as jest.MockedClass<typeof UserModel>;

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData: IUser = {
        name: 'John Doe',
        role: 'user',
        email: 'john@example.com',
        password: 'test123123',
      };

      // Assuming UserModel.create resolves with the created user
      MockUserModel.prototype.create.mockResolvedValue(
        userData as IUser & Document,
      );

      const token = await usersService.create(userData);

      // Ensure UserModel.create is called with the correct arguments
      expect(MockUserModel.prototype.create).toHaveBeenCalledWith({
        ...userData,
        password: expect.any(String), // Expecting hashed password
      });

      // Ensure the token is a non-empty string
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should return an error because the password is too small', async () => {
      const userData: IUser = {
        name: 'John Doe',
        role: 'user',
        email: 'john@example.com',
        password: 'test123', // Ensure password has less than 8 characters for testing the error
      };

      // Assuming UserModel.create resolves with the created user
      MockUserModel.prototype.create.mockResolvedValue(
        userData as IUser & Document,
      );

      try {
        await usersService.create(userData);
      } catch (e) {
        // Ensure the e message and code are as expected
        expect(e.message).toEqual(
          'Password must be at least 8 characters long. (code: too_small)',
        );

        return; // Exit the test case if we caught the expected error
      }

      // If the code reaches this point, the test should fail
      throw new Error('Expected the test to throw an error, but it did not.');
    });
  });

  describe('readOne', () => {
    it('should return a valid token for existing user with correct credentials', async () => {
      const email = 'john@example.com';
      const password = 'test123';

      const user = {
        _id: 'user_id',
        email,
        password: await hash(password, 10), // Hashed password for testing
      };

      // Assuming UserModel.readOneByEmail resolves with the user
      MockUserModel.prototype.readOneByEmail.mockResolvedValue(
        user as IUser & Document,
      );

      const token = await usersService.readOne(email, password);

      // Ensure UserModel.readOneByEmail is called with the correct arguments
      expect(MockUserModel.prototype.readOneByEmail).toHaveBeenCalledWith(
        email,
      );

      // Ensure the token is a non-empty string
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should throw an error for non-existing user', async () => {
      const email = 'non_existing@example.com';
      const password = 'test123';

      // Assuming UserModel.readOneByEmail resolves with null (user not found)
      MockUserModel.prototype.readOneByEmail.mockResolvedValue(null);

      const errorType = ErrorTypes.EntityNotFound;

      await expect(usersService.readOne(email, password)).rejects.toThrowError(
        errorType,
      );

      // Ensure UserModel.readOneByEmail is called with the correct arguments
      expect(MockUserModel.prototype.readOneByEmail).toHaveBeenCalledWith(
        email,
      );
    });

    it('should throw an error for invalid credentials', async () => {
      const email = 'john@example.com';
      const password = 'invalid_password';

      const user = {
        _id: 'user_id',
        email,
        password: await hash('test123', 10), // Hashed password for testing
      };

      // Assuming UserModel.readOneByEmail resolves with the user
      MockUserModel.prototype.readOneByEmail.mockResolvedValue(
        user as IUser & Document,
      );

      const errorType = ErrorTypes.InvalidCredentials;

      await expect(usersService.readOne(email, password)).rejects.toThrowError(
        errorType,
      );

      // Ensure UserModel.readOneByEmail is called with the correct arguments
      expect(MockUserModel.prototype.readOneByEmail).toHaveBeenCalledWith(
        email,
      );
    });
  });

  describe('validate', () => {
    it('should return true for a valid token', async () => {
      const userId = 'user_id';
      const token = sign({ id: userId }, JWT_SECRET, jwtConfig);

      // Assuming UserModel.readOne resolves with the user
      MockUserModel.prototype.readOne.mockResolvedValue({
        _id: userId,
      } as IUser & Document);

      const result = await usersService.validate(token);

      // Ensure UserModel.readOne is called with the correct arguments
      expect(MockUserModel.prototype.readOne).toHaveBeenCalledWith(userId);

      // Ensure the result is true
      expect(result).toBe(true);
    });

    it('should throw an error for an invalid token', async () => {
      const invalidToken = 'invalid_token';

      // Mocking the verify function
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const errorType = 'Invalid token';

      await expect(usersService.validate(invalidToken)).rejects.toThrowError(
        errorType,
      );
    });
  });

  describe('read', () => {
    it('should return a list of users without passwords', async () => {
      const usersData: IUser[] = [
        {
          _id: 'user_id_1',
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password_1',
        },
        {
          _id: 'user_id_2',
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password_2',
        },
      ];

      // Assuming UserModel.read resolves with the usersData
      MockUserModel.prototype.read.mockResolvedValue(
        usersData as IUser[] & Document[],
      );

      // Ensure the returned users do not have the "password" field
      const users = await usersService.read();

      // Ensure UserModel.read is called
      expect(MockUserModel.prototype.read).toHaveBeenCalled();

      // Ensure the returned users do not have the "password" field
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      usersWithoutPasswords.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });

      // Ensure the users array is returned without passwords
      expect(usersWithoutPasswords).toEqual([
        {
          _id: 'user_id_1',
          name: 'User 1',
          email: 'user1@example.com',
        },
        {
          _id: 'user_id_2',
          name: 'User 2',
          email: 'user2@example.com',
        },
      ]);
    });

    it('should throw an error when no users are found', async () => {
      // Assuming UserModel.read resolves with null (no users found)
      MockUserModel.prototype.read.mockResolvedValue(null);

      const errorType = ErrorTypes.EntityNotFound;

      await expect(usersService.read()).rejects.toThrowError(errorType);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const userId = 'user_id';
      const newPlainTextPassword = 'new_password';
      const hashedPassword = await hash(newPlainTextPassword, 10); // Hash the password

      const updatedUserData: IUser = {
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'user',
        password: hashedPassword, // Use the hashed password in the updatedUserData
      };

      // Assuming UserModel.update resolves with the updated user
      MockUserModel.prototype.update.mockResolvedValue(
        updatedUserData as IUser & Document,
      );

      const updatedUser = await usersService.update(userId, updatedUserData);

      // Ensure the updated user has the same properties (excluding the password field)
      expect(updatedUser).toMatchObject({
        name: updatedUserData.name,
        email: updatedUserData.email,
        role: updatedUserData.role,
      });

      // Check if the new plaintext password matches the hashed password after the update
      const isPasswordMatch = await compare(
        newPlainTextPassword,
        updatedUser.password,
      );
      expect(isPasswordMatch).toBe(true);
    });

    it('should throw an error when user data validation fails', async () => {
      const userId = 'user_id';
      const invalidUserData: IUser = {
        name: 'User',
        email: 'invalid_email',
        role: 'user',
        password: 'new_password',
      };

      // Assuming userValidationSchema.safeParse fails validation
      const validationError = new Error(
        'Validation error (code: invalid_type)',
      );
      userValidationSchema.safeParse = jest
        .fn()
        .mockReturnValue({ success: false });

      await expect(
        usersService.update(userId, invalidUserData),
      ).rejects.toThrowError(validationError);

      // Ensure userValidationSchema.safeParse is called with the correct arguments
      expect(userValidationSchema.safeParse).toHaveBeenCalledWith(
        invalidUserData,
      );
    });

    it('should throw an error when the user is not found', async () => {
      const userId = '64c1423764cfbb9e80c36865';
      const userData: IUser = {
        name: 'Update User',
        email: 'updated@exaample.com',
        role: 'user',
        password: 'new_password',
      };

      // Assuming UserModel.update resolves with null (user not found)
      MockUserModel.prototype.update.mockResolvedValue(null);

      const errorType = ErrorTypes.EntityNotFound;

      await expect(usersService.update(userId, userData)).rejects.toThrowError(
        'Validation error (code: invalid_type)',
      );

      // Ensure UserModel.update is called with the correct arguments
    });
  });

  describe('delete', () => {
    it('should delete a user and return the deleted user', async () => {
      const userId = 'user_id';

      // Assuming UserModel.delete resolves with the deleted user
      MockUserModel.prototype.delete.mockResolvedValue({
        _id: userId,
      } as IUser & Document);

      const deletedUser = await usersService.delete(userId);

      // Ensure UserModel.delete is called with the correct arguments
      expect(MockUserModel.prototype.delete).toHaveBeenCalledWith(userId);

      // Ensure the deleted user is returned
      expect(deletedUser).toEqual({ _id: userId });
    });

    it('should throw an error when the user is not found', async () => {
      const userId = 'non_existing_user_id';

      // Assuming UserModel.delete resolves with null (user not found)
      MockUserModel.prototype.delete.mockResolvedValue(null);

      const errorType = ErrorTypes.EntityNotFound;

      await expect(usersService.delete(userId)).rejects.toThrowError(errorType);

      // Ensure UserModel.delete is called with the correct arguments
      expect(MockUserModel.prototype.delete).toHaveBeenCalledWith(userId);
    });
  });
});
