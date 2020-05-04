// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface RequestDTO {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    // TODO
    const repoTransaction = getRepository(Transaction);
    const transaction = await repoTransaction.findOne({ where: { id } });
    if (!transaction) {
      throw new AppError('This ID is not valid', 400);
    }
    await repoTransaction.remove(transaction);
  }
}

export default DeleteTransactionService;
