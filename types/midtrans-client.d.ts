declare module "midtrans-client" {
  interface MidtransConfig {
    isProduction?: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  class Snap {
    constructor(config?: MidtransConfig);

    createTransaction(parameter: any): Promise<any>;
    createTransactionToken(parameter: any): Promise<string>;
    createTransactionRedirectUrl(parameter: any): Promise<string>;
  }

  class CoreApi {
    constructor(config?: MidtransConfig);

    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    refund(orderId: string, parameter?: any): Promise<any>;
    transactionStatus(orderId: string): Promise<any>;
    cancelTransaction(orderId: string): Promise<any>;
  }

  class Iris {
    constructor(config?: MidtransConfig);

    createBeneficiaries(parameter: any): Promise<any>;
    getBeneficiaries(): Promise<any>;
    getBeneficiary(id: string): Promise<any>;
    updateBeneficiary(id: string, parameter: any): Promise<any>;
    deleteBeneficiary(id: string): Promise<any>;

    validateBankAccount(parameter: any): Promise<any>;

    createPayouts(parameter: any): Promise<any>;
    approvePayouts(parameter: any): Promise<any>;
    rejectPayouts(parameter: any): Promise<any>;

    getBalance(): Promise<any>;
    getPayoutDetails(parameter: any): Promise<any>;
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
    Iris: typeof Iris;
  };

  export = midtransClient;
}
