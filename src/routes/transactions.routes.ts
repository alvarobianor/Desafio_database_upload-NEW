import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const repoTransactions = getCustomRepository(TransactionsRepository);
  const transactionsList = await repoTransactions.find();
  const transactions = transactionsList.map(e => {
    delete e.category_id;
    delete e.category;
    delete e.created_at;
    delete e.updated_at;
    return e;
  });
  const balance = await repoTransactions.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO

  const { title, category, type, value } = request.body;
  const createService = new CreateTransactionService();
  const transaction = await createService.execute({
    title,
    category,
    type,
    value,
  });

  delete transaction.category_id;
  delete transaction.updated_at;
  delete transaction.created_at;

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;
  const serviceDelete = new DeleteTransactionService();
  await serviceDelete.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;

    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute({
      filename,
    });

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
