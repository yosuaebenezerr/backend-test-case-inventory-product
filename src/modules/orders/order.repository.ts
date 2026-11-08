import prisma from "../../db/index.js";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const iris = new midtransClient.Iris({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const orderRepository = {
  orderProduct: async ({
    userId,
    namaCustomer,
    paymentMethod,
    productSells,
  }: {
    userId: string;
    namaCustomer: string;
    paymentMethod: "CASH" | "MIDTRANS";
    productSells: {
      productId: string;
      quantity: number;
    }[];
  }) => {
    const numberTransaction = `TRX-${Date.now()}`;
    // 1. Simpan pesanan & potong stok di Database via Prisma Transaction
    const newTransaction = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productSells.map((p) => p.productId) } },
        select: {
          id: true,
          priceSell: true,
          profit: true,
          stock: true,
        },
      });
      // Validasi ketersediaan dan stok produk
      let calculatedTotal = 0;
      let calculatedProfit = 0;

      for (const productSell of productSells) {
        const product = products.find((p) => p.id === productSell.productId);
        if (!product) {
          throw new Error(`Product ${productSell.productId} tidak ditemukan`);
        }
        if (productSell.quantity <= 0) {
          throw new Error(
            `Quantity product ${productSell.productId} harus lebih dari 0`,
          );
        }
        if (product.stock < productSell.quantity) {
          throw new Error(
            `Stok product ${productSell.productId} tidak mencukupi`,
          );
        }
        // Hitung total harga & laba pesanan ini saja
        calculatedTotal += productSell.quantity * product.priceSell;
        calculatedProfit += productSell.quantity * product.profit;
      }

      if (paymentMethod === "CASH") {
        throw new Error("Uang pembayaran tunai kurang dari total belanja!");
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          namaCustomer,
          numberTransaction,
          totalTransaction: calculatedTotal,
          totalProfit: calculatedProfit,
          paymentMethod,
          transactionProductSells: {
            create: productSells.map((productSell) => {
              const product = products.find(
                (p) => p.id === productSell.productId,
              )!;
              return {
                productId: productSell.productId,
                quantity: productSell.quantity,
                totalPrice: productSell.quantity * product.priceSell,
                totalProfit: productSell.quantity * product.profit,
              };
            }),
          },
        },
        include: {
          transactionProductSells: true,
        },
      });

      for (const productSell of productSells) {
        const result = await tx.product.updateMany({
          where: {
            id: productSell.productId,
            stock: { gte: productSell.quantity },
          },
          data: {
            stock: { decrement: productSell.quantity },
          },
        });
        if (result.count === 0) {
          throw new Error(
            `Stok product ${productSell.productId} tidak mencukupi`,
          );
        }
      }
      return transaction;
    });

    if (paymentMethod === "CASH") {
      return {
        order: newTransaction,
        payment: null,
      };
    }

    const midtransParameter = {
      transaction_details: {
        order_id: newTransaction.numberTransaction,
        gross_amount: newTransaction.totalTransaction,
      },
      customer_details: {
        first_name: namaCustomer,
      },
    };
    const midtransResponse = await snap.createTransaction(midtransParameter);
    return {
      order: newTransaction,
      payment: {
        token: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
      },
    };
  },

  getAllTransaction: async ({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const whereCondition = {
      userId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };
    const [transaction, total] = await Promise.all([
      await prisma.transaction.findMany({
        where: {
          ...whereCondition,
        },
        select: {
          numberTransaction: true,
          namaCustomer: true,
          createdAt: true,
          totalTransaction: true,
          totalProfit: true,
          transactionProductSells: {
            select: {
              product: {
                select: {
                  name: true,
                  priceSell: true,
                },
              },
              quantity: true,
              totalPrice: true,
              totalProfit: true,
            },
          },
        },
      }),
      await prisma.transaction.aggregate({
        where: {
          ...whereCondition,
        },

        _sum: {
          totalTransaction: true,
          totalProfit: true,
        },
      }),
    ]);
    return {
      data: transaction,
      totalTransaction: total._sum.totalTransaction,
      totalProfit: total._sum.totalProfit,
    };
  },

  transactionHighlight: async ({ userId }: { userId: string }) => {
    return await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        numberTransaction: true,
        namaCustomer: true,
        createdAt: true,
        totalTransaction: true,
      },
      take: 8,
    });
  },

  chartTransaction: async ({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const rawTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      select: {
        createdAt: true,
        totalTransaction: true,
      },
      // 1. PINDAHKAN orderBy KE SINI (Di luar select)
      orderBy: {
        createdAt: "asc",
      },
    });

    const grouped = rawTransactions.reduce(
      (acc, curr) => {
        if (!curr.createdAt) return acc;
        const date = curr.createdAt.toISOString().split("T")[0]!;
        if (!acc[date]) {
          // Tambahkan property 'count' di sini
          acc[date] = { date: date, totalTransaction: 0, count: 0 };
        }
        acc[date].totalTransaction += curr.totalTransaction;
        acc[date].count += 1; // Hitung jumlah transaksinya
        return acc;
      },
      {} as Record<string, any>,
    );

    console.log(Object.values(grouped));

    return Object.values(grouped);
  },

  createMidtransTransaction: async ({
    orderId,
    totalAmount,
  }: {
    orderId: string;
    totalAmount: number;
  }) => {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return transaction;
  },

  createIrisTransaction: async () => {
    const parameter = {
      transaction_details: {
        order_id: `IRIS-${Date.now()}`,
        gross_amount: 10000,
      },
    };
  },
};

export default orderRepository;
