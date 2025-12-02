/**
 * Plan limits and features configuration
 * Simple and centralized - easy to update
 */

export interface PlanLimits {
  name: string;
  platformFee: number;
  maxProducts: number; // -1 = unlimited
  storage: number; // MB
  promoDaysPerMonth: number;
  features: {
    discountCodes: boolean;
    productBundles: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    featuredBadge: boolean;
  };
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    name: 'Free',
    platformFee: 10,
    maxProducts: 5,
    storage: 500, // MB
    promoDaysPerMonth: 0,
    features: {
      discountCodes: false,
      productBundles: false,
      advancedAnalytics: false,
      prioritySupport: false,
      featuredBadge: false,
    },
  },
  mid: {
    name: 'Mid Tier',
    platformFee: 5,
    maxProducts: 30,
    storage: 5000, // MB (5GB)
    promoDaysPerMonth: 10,
    features: {
      discountCodes: true,
      productBundles: false,
      advancedAnalytics: false,
      prioritySupport: true,
      featuredBadge: false,
    },
  },
  top: {
    name: 'Top Tier',
    platformFee: 2,
    maxProducts: -1, // unlimited
    storage: 20000, // MB (20GB)
    promoDaysPerMonth: 30,
    features: {
      discountCodes: true,
      productBundles: true,
      advancedAnalytics: true,
      prioritySupport: true,
      featuredBadge: true,
    },
  },
};

/**
 * Get plan limits for a given plan type
 */
export function getPlanLimits(planType: string): PlanLimits {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

