import orderRepository from "./order.repository.js";

const orderService = {
  getAllTransactions: async ({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: Date;
    endDate: Date;
  }) => {
    if (startDate > endDate) {
      throw new Error("startDate harus lebih kecil dari endDate");
    }
    const response = await orderRepository.getAllTransaction({
      userId,
      startDate,
      endDate,
    });
    const trx = response.data.map((t) => {
      return {
        numberTransaction: t.numberTransaction,
        namaCustomer: t.namaCustomer,
        dateTransaction: t.createdAt,
        totalTransaction: t.totalTransaction,
        totalProfit: t.totalProfit,
        detailProduct: t.transactionProductSells.map((tps) => ({
          nameProduct: tps.product.name,
          priceProduct: tps.product.priceSell,
          quantity: tps.quantity,
          totalPrice: tps.totalPrice,
          totalProfit: tps.totalProfit,
        })),
      };
    });
    return { ...response, data: trx };
  },

  getChartTransaction: async ({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: string;
    endDate: string;
  }) => {
    if (startDate && endDate && startDate > endDate) {
      throw new Error("startDate harus lebih kecil dari endDate");
    }

    const response = await orderRepository.chartTransaction({
      userId,
      startDate,
      endDate,
    });

    return response.map((tx: any) => {
      return {
        date: tx.date,
        count: tx.count, 
        value: tx.totalTransaction,
      };
    });
  },
};

export default orderService;
