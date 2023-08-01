import { Document } from 'mongoose';
import {
  ISchedules,
  schedulesValidationSchema,
} from '../../modules/schedules/dtos/schedules.dtos';
import SchedulesModel from '../../modules/schedules/entities/schedules.entity';
import SchedulesService from '../../modules/schedules/service/schedules.service';
import NotificationService from '../../modules/notifications/service/notifications.service';

// Create a mock SchedulesModel for testing purposes
jest.mock('../../modules/schedules/entities/schedules.entity');
const MockSchedulesModel = SchedulesModel as jest.MockedClass<
  typeof SchedulesModel
>;

jest.mock('../../modules/notifications/service/notifications.service');
const MockNotificationService = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

describe('SchedulesService', () => {
  let schedulesService: SchedulesService;

  beforeEach(() => {
    schedulesService = new SchedulesService(new MockNotificationService());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new schedule', async () => {
      const scheduleData: ISchedules = {
        user_id: '64bafc9ee604f1df0dd36d06',
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      // Assuming SchedulesModel.create resolves with the created schedule
      MockSchedulesModel.prototype.create.mockResolvedValue(
        scheduleData as ISchedules & Document,
      );

      const createdSchedule = await schedulesService.create(scheduleData);

      // Ensure SchedulesModel.create is called with the correct arguments
      expect(MockSchedulesModel.prototype.create).toHaveBeenCalledWith(
        scheduleData,
      );

      // Ensure the created schedule is returned
      expect(createdSchedule).toEqual(scheduleData);
    });

    it('should throw an error when schedule data validation fails', async () => {
      const invalidScheduleData: ISchedules = {
        user_id: 'inválido',
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      // Assuming schedulesValidationSchema.safeParse fails validation
      const validationError = new Error(
        'Validation error (code: invalid_type)',
      );
      // Mocking the safeParse function
      schedulesValidationSchema.safeParse = jest
        .fn()
        .mockReturnValue({ success: false });

      await expect(
        schedulesService.create(invalidScheduleData),
      ).rejects.toThrowError(validationError);

      // Ensure schedulesValidationSchema.safeParse is called with the correct arguments
      expect(schedulesValidationSchema.safeParse).toHaveBeenCalledWith(
        invalidScheduleData,
      );
    });
  });

  describe('read', () => {
    it('should return a list of schedules', async () => {
      const schedulesData: ISchedules[] = [
        {
          // Schedule data for testing
        },
        {
          // Schedule data for testing
        },
      ];

      // Assuming SchedulesModel.read resolves with the schedulesData
      MockSchedulesModel.prototype.read.mockResolvedValue(
        schedulesData as ISchedules[] & Document[],
      );

      const schedules = await schedulesService.read();

      // Ensure SchedulesModel.read is called
      expect(MockSchedulesModel.prototype.read).toHaveBeenCalled();

      // Ensure the returned schedules match the expected data
      expect(schedules).toEqual(schedulesData);
    });
  });

  describe('readOne', () => {
    it('should return a schedule by its ID', async () => {
      const scheduleId = 'schedule_id';
      const scheduleData: ISchedules = {
        // Schedule data for testing
      };

      // Assuming SchedulesModel.readOne resolves with the schedule data
      MockSchedulesModel.prototype.readOne.mockResolvedValue(
        scheduleData as ISchedules & Document,
      );

      const schedule = await schedulesService.readOne(scheduleId);

      // Ensure SchedulesModel.readOne is called with the correct argument
      expect(MockSchedulesModel.prototype.readOne).toHaveBeenCalledWith(
        scheduleId,
      );

      // Ensure the returned schedule matches the expected data
      expect(schedule).toEqual(scheduleData);
    });

    it('should return null when no schedule is found', async () => {
      const scheduleId = 'non_existing_schedule_id';

      // Assuming SchedulesModel.readOne resolves with null (no schedule found)
      MockSchedulesModel.prototype.readOne.mockResolvedValue(null);

      const schedule = await schedulesService.readOne(scheduleId);

      // Ensure SchedulesModel.readOne is called with the correct argument
      expect(MockSchedulesModel.prototype.readOne).toHaveBeenCalledWith(
        scheduleId,
      );

      // Ensure null is returned when no schedule is found
      expect(schedule).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return a list of schedules for a given user ID', async () => {
      const userId = 'user_id';
      const schedulesData: ISchedules[] = [
        {
          // Schedule data for testing
        },
        {
          // Schedule data for testing
        },
      ];

      // Assuming SchedulesModel.read resolves with the schedules data
      MockSchedulesModel.prototype.read.mockResolvedValue(
        schedulesData as ISchedules[] & Document[],
      );

      const schedules = await schedulesService.findByUserId(userId);

      // Ensure SchedulesModel.read is called with the correct argument
      expect(MockSchedulesModel.prototype.read).toHaveBeenCalledWith({
        user_id: userId,
      });

      // Ensure the returned schedules match the expected data
      expect(schedules).toEqual(schedulesData);
    });

    it('should return an empty list when no schedules are found for a user', async () => {
      const userId = 'non_existing_user_id';

      // Assuming SchedulesModel.read resolves with an empty array (no schedules found)
      MockSchedulesModel.prototype.read.mockResolvedValue(
        [] as ISchedules[] & Document[],
      );

      const schedules = await schedulesService.findByUserId(userId);

      // Ensure SchedulesModel.read is called with the correct argument
      expect(MockSchedulesModel.prototype.read).toHaveBeenCalledWith({
        user_id: userId,
      });

      // Ensure an empty array is returned when no schedules are found
      expect(schedules).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a schedule and return the updated schedule', async () => {
      const scheduleId = 'schedule_id';
      const newScheduleData: ISchedules = {
        user_id: '64bafc9ee604f1df0dd36d06',
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      // Assuming SchedulesModel.update resolves with the updated schedule
      MockSchedulesModel.prototype.update.mockResolvedValue(
        newScheduleData as ISchedules & Document,
      );

      const updatedSchedule = await schedulesService.update(
        scheduleId,
        newScheduleData,
      );

      // Ensure SchedulesModel.update is called with the correct arguments
      expect(MockSchedulesModel.prototype.update).toHaveBeenCalledWith(
        scheduleId,
        newScheduleData,
      );

      // Ensure the updated schedule matches the expected data
      expect(updatedSchedule).toEqual(newScheduleData);
    });

    it('should return null when the schedule is not found', async () => {
      const scheduleId = 'non_existing_schedule_id';
      const scheduleData: ISchedules = {
        user_id: '64bafc9ee604f1df0dd36d06',
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      // Assuming SchedulesModel.update resolves with null (schedule not found)
      MockSchedulesModel.prototype.update.mockResolvedValue(null);

      const updatedSchedule = await schedulesService.update(
        scheduleId,
        scheduleData,
      );

      // Ensure SchedulesModel.update is called with the correct arguments
      expect(MockSchedulesModel.prototype.update).toHaveBeenCalledWith(
        scheduleId,
        scheduleData,
      );

      // Ensure null is returned when the schedule is not found
      expect(updatedSchedule).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a schedule and return the deleted schedule', async () => {
      const scheduleId = 'schedule_id';
      const deletedScheduleData: ISchedules = {
        // Deleted schedule data for testing
      };

      // Assuming SchedulesModel.delete resolves with the deleted schedule
      MockSchedulesModel.prototype.delete.mockResolvedValue(
        deletedScheduleData as ISchedules & Document,
      );

      const deletedSchedule = await schedulesService.delete(scheduleId);

      // Ensure SchedulesModel.delete is called with the correct argument
      expect(MockSchedulesModel.prototype.delete).toHaveBeenCalledWith(
        scheduleId,
      );

      // Ensure the deleted schedule matches the expected data
      expect(deletedSchedule).toEqual(deletedScheduleData);
    });

    it('should return null when the schedule is not found', async () => {
      const scheduleId = 'non_existing_schedule_id';

      // Assuming SchedulesModel.delete resolves with null (schedule not found)
      MockSchedulesModel.prototype.delete.mockResolvedValue(null);

      const deletedSchedule = await schedulesService.delete(scheduleId);

      // Ensure SchedulesModel.delete is called with the correct argument
      expect(MockSchedulesModel.prototype.delete).toHaveBeenCalledWith(
        scheduleId,
      );

      // Ensure null is returned when the schedule is not found
      expect(deletedSchedule).toBeNull();
    });
  });
});
