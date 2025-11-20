import { EscrowService } from './escrow.service';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    createPaymentIntent(req: any, body: {
        marketplaceItemId: string;
        amount: number;
        currency?: string;
    }): Promise<{
        success: boolean;
        transactionId: string;
        amount: number;
        currency: string;
        paymentUrl: string;
    }>;
    getUserTransactions(req: any): Promise<{
        success: boolean;
        transactions: ({
            marketplaceItem: {
                title: string;
                id: string;
                price: number;
            };
            buyer: {
                firstName: string;
                lastName: string;
                id: string;
            };
            seller: {
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.EscrowStatus;
            currency: string;
            marketplaceItemId: string;
            paymentReference: string | null;
            buyerId: string;
            amount: number;
            sellerId: string;
            paymentProvider: string | null;
            paidAt: Date | null;
            releasedAt: Date | null;
            refundedAt: Date | null;
        })[];
    }>;
    getSellerBalance(req: any): Promise<{
        success: boolean;
        balance: {
            id: string;
            updatedAt: Date;
            total: number;
            sellerId: string;
            pending: number;
            available: number;
        };
    }>;
    getTransaction(id: string, req: any): Promise<{
        success: boolean;
        transaction: {
            marketplaceItem: {
                description: string;
                title: string;
                isActive: boolean;
                id: string;
                rating: number;
                totalSales: number;
                totalRevenue: number;
                tags: string[];
                currency: string;
                contentId: string | null;
                creatorId: string;
                thumbnailUrl: string | null;
                price: number;
                category: import(".prisma/client").$Enums.MarketplaceCategory;
                totalRatings: number;
                previewUrl: string | null;
                dateCreated: Date;
                lastUpdated: Date;
                isFeatured: boolean;
                isRecommended: boolean;
                commissionRate: number;
            };
            buyer: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
            seller: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.EscrowStatus;
            currency: string;
            marketplaceItemId: string;
            paymentReference: string | null;
            buyerId: string;
            amount: number;
            sellerId: string;
            paymentProvider: string | null;
            paidAt: Date | null;
            releasedAt: Date | null;
            refundedAt: Date | null;
        };
    }>;
    handlePaymentWebhook(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
