declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any);
    [key: string]: any;
  }
  export namespace Prisma {
    export type TransactionWhereInput = any;
    export type TransactionCreateInput = any;
    export type TransactionUpdateInput = any;
    export type TransactionOrderByWithRelationInput = any;
    export type TransactionWhereUniqueInput = any;
    export type TransactionUncheckedCreateInput = any;
    export type TransactionUncheckedUpdateInput = any;
    export type TransactionSelect = any;
    export type TransactionInclude = any;
  }
  export type Transaction = any;
  export type User = any;
  export type Role = any;
  export type Asset = any;
  export type Wallet = any;
  export type AuditLog = any;
  export type RefreshToken = any;
}
