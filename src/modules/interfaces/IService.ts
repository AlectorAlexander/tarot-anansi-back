export interface IService<T> {
    create(obj: T): Promise<T | String>;
    read(): Promise<T[]>;
    readOne(_id: string, projection?: any): Promise<T | String | null>;
    update(_id: string, obj: Partial<T>): Promise<T | null>;
    delete(_id: string): Promise<T | null>;
  }
  