import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

// refac after
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const incomes = await this.find({ where: { type: 'income' } });

    const income = !incomes[0]
      ? 0
      : incomes
          .map(e => {
            if (!e) {
              return 0;
            }
            return e.value;
          })
          .reduce((total, acumulator) => total + acumulator);

    const outcomes = await this.find({ where: { type: 'outcome' } });

    const outcome = !outcomes[0]
      ? 0
      : outcomes
          .map(e => {
            if (!e) {
              return 0;
            }
            return e.value;
          })
          .reduce((total, acumulator) => total + acumulator);

    // const outcomes = (await this.find({ where: { type: 'outcome' } })) || [0];
    // const outcome = outcomes
    //   .map(e => {
    //     if (!e) {
    //       return 0;
    //     }
    //     return e.value;
    //   })
    //   .reduce((total, acumulator) => total + acumulator);

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
