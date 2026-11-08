import { NextFunction, Request, Response } from "express";
import orderRepository from "./order.repository.js";
import orderService from "./order.service.js";

interface createOrderPayload {
  namaCustomer: string;
  paymentMethod: "CASH" | "MIDTRANS";
  productSells: {
    productId: string;
    quantity: number;
  }[];
}
const orderController = {
  createOrder: async (
    req: Request<{}, {}, createOrderPayload>,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id;
    const { namaCustomer, paymentMethod, productSells } = req.body;

    try {
      const response = await orderRepository.orderProduct({
        userId: userId!,
        namaCustomer,
        paymentMethod,
        productSells,
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Order berhasil dibuat",
        data: {
          token: response?.payment?.token ?? null,
          numberTransaction: response.order.numberTransaction,
          totalTransaction: response.order.totalTransaction,
          redirectUrl: response?.payment?.redirectUrl ?? null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  handleGetAllTransactions: async (
    req: Request<{ userId: string }, {}, { startDate: Date; endDate: Date }>,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        statusCode: res.statusCode,
        message: "startDate dan endDate harus diisi",
      });
    }
    if (startDate > endDate) {
      return res.status(400).json({
        status: "error",
        statusCode: res.statusCode,
        message: "startDate harus lebih kecil dari endDate",
      });
    }
    try {
      const response = await orderService.getAllTransactions({
        userId: userId!,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan semua transaksi",
        data: {
          transactions: response.data,
          totalTransaction: response.totalTransaction,
          totalProfit: response.totalProfit,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  handleGetHighlightTransactions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        statusCode: res.statusCode,
        message: "userId tidak ditemukan",
      });
    }

    try {
      const response = await orderRepository.transactionHighlight({ userId });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan highlight transaksi",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },

  handleGetChartTransactions: async (
    req: Request<
      { userId: string },
      {},
      { startDate: string; endDate: string }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        statusCode: res.statusCode,
        message: "userId tidak ditemukan",
      });
    }

    try {
      const response = await orderService.getChartTransaction({
        userId,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan chart transaksi",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },

  handleTransactionMidtrans: async (
    req: Request<{}, {}, { orderId: string; totalAmount: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { orderId, totalAmount } = req.body;
      const trx = await orderRepository.createMidtransTransaction({
        orderId,
        totalAmount,
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil membuat transaksi Midtrans",
        data: {
          token: trx.token,
          redirect_url: trx.redirect_url,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
export default orderController;
