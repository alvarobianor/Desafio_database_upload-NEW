import { getRepository, getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionCustom from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // TODO
    const repoTransaction = getCustomRepository(TransactionCustom);
    const repoCategory = getRepository(Category);

    const balance = await repoTransaction.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'This product coust more than you have in balance',
        400,
      );
    }
    const existCategory = await repoCategory.findOne({
      where: { title: category },
      select: ['id'],
    });
    if (!existCategory) {
      await repoCategory.save({ title: category });
    }

    const category_id = ((await repoCategory.findOne({
      where: { title: category },
      select: ['id'],
    })) as unknown) as string;

    const transaction = repoTransaction.create({
      title,
      value,
      type,
      category_name: category,
      category_id,
    });

    await repoTransaction.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
