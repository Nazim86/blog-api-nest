import { EntityManager } from 'typeorm';

export class TransactionRepository {
  async save(data, manager: EntityManager) {
    return await manager.save(data);
  }
}
