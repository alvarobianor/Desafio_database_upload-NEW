/* eslint-disable no-await-in-loop */
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getCustomRepository, getRepository } from 'typeorm';
import uploadConfig from '../config/upload';
// import AppError from '../errors/AppError';
// import ServiceCreate from './CreateTransactionService';

import TransactionCustom from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

import Category from '../models/Category';

interface RequestDTO {
  filename: string;
}

interface CSVImport {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: RequestDTO): Promise<Transaction[]> {
    // TODO

    const repoTransaction = getCustomRepository(TransactionCustom);
    const repoCategory = getRepository(Category);

    const pathFileName = path.join(uploadConfig.directory, filename);

    const readCSVStream = fs.createReadStream(pathFileName);

    const parseStream = csvParse({
      from_line: 2,
      // ltrim: true,
      // rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    // Starts Here

    const transactionsFinisheds: Transaction[] = [];
    const transactions: CSVImport[] = [];
    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((data: string) =>
        data.trim(),
      );
      if (!title || !type || !value || !category) {
        return;
      }
      transactions.push({ title, type, value, category });
      // console.log(categories);
      // console.log(transactions);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
      // parseCSV.on('error', err => {
      //   throw new AppError(err.message, 400);
      // });
    });

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < transactions.length; index++) {
      const element = transactions[index];
      const balance = await repoTransaction.getBalance();
      if (!(element.type === 'outcome' && element.value > balance.total)) {
        const existCategory = await repoCategory.findOne({
          where: { title: element.category },
          select: ['id'],
        });
        if (!existCategory) {
          await repoCategory.save({ title: element.category });
        }

        const category_id = ((await repoCategory.findOne({
          where: { title: element.category },
          select: ['id'],
        })) as unknown) as string;

        const transaction = repoTransaction.create({
          title: element.title,
          value: element.value,
          type: element.type,
          category_name: element.category,
          category_id,
        });
        await repoTransaction.save(transaction);
        transactionsFinisheds.push(transaction);
      }
    }

    // const newTransacation = transactions.map(async (element, index) => {
    //   const { title, type, value, category } = element;
    //   const all = await repoTransaction.find();
    //   console.log(total, index);
    //   if (!(type === 'outcome' && value > total[total.length - 1])) {
    //     const existCategory = await repoCategory.findOne({
    //       where: { title: category },
    //       select: ['id'],
    //     });
    //     if (!existCategory) {
    //       await repoCategory.save({ title: category });
    //     }

    //     const category_id = ((await repoCategory.findOne({
    //       where: { title: category },
    //       select: ['id'],
    //     })) as unknown) as string;

    //     const transaction = repoTransaction.create({
    //       title,
    //       value,
    //       type,
    //       category_name: category,
    //       category_id,
    //     });
    //     // await repoTransaction.save(transaction);
    //   }
    //   if (type === 'income') {
    //     total.push(value);
    //   }
    // });

    return transactionsFinisheds;
  }
}

export default ImportTransactionsService;
