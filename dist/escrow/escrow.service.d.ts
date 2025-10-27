import { PrismaService } from '../prisma/prisma.service';
export declare class EscrowService {
    private prisma;
    constructor(prisma: PrismaService);
    createEscrowTransaction(data: {
        marketplaceItemId: string;
        buyerId: string;
        sellerId: string;
        amount: number;
        currency?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.EscrowStatus;
        currency: string;
        marketplaceItemId: string;
        paymentReference: string | null;
        amount: number;
        buyerId: string;
        sellerId: string;
        paymentProvider: string | null;
        paidAt: Date | null;
        releasedAt: Date | null;
        refundedAt: Date | null;
    }>;
    updateEscrowStatus(transactionId: string, status: 'PAID' | 'RELEASED' | 'REFUNDED' | 'DISPUTED', paymentReference?: string, paymentProvider?: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.EscrowStatus;
        currency: string;
        marketplaceItemId: string;
        paymentReference: string | null;
        amount: number;
        buyerId: string;
        sellerId: string;
        paymentProvider: string | null;
        paidAt: Date | null;
        releasedAt: Date | null;
        refundedAt: Date | null;
    }>;
    getSellerBalance(sellerId: string): Promise<{
        id: string;
        updatedAt: Date;
        total: number;
        sellerId: string;
        pending: number;
        available: number;
    }>;
    updateSellerBalance(sellerId: string, amount: number, type: 'add_pending' | 'move_to_available' | 'add_total'): Promise<{
        id: string;
        updatedAt: Date;
        total: number;
        sellerId: string;
        pending: number;
        available: number;
    }>;
    getEscrowTransaction(transactionId: string): Promise<({
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
        amount: number;
        buyerId: string;
        sellerId: string;
        paymentProvider: string | null;
        paidAt: Date | null;
        releasedAt: Date | null;
        refundedAt: Date | null;
    }) | null>;
    getUserEscrowTransactions(userId: string): Promise<({
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
        amount: number;
        buyerId: string;
        sellerId: string;
        paymentProvider: string | null;
        paidAt: Date | null;
        releasedAt: Date | null;
        refundedAt: Date | null;
    })[]>;
}
