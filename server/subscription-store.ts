import { db } from "./db";
import { subscriptionPlans, subscriptionSettings } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { SubscriptionPlan, InsertSubscriptionPlan, SubscriptionSettings, InsertSubscriptionSettings } from "@shared/schema";

interface BundleSettings {
  price: number;
  discount: number;
  isActive: boolean;
}

// Default subscription data for initialization
const defaultSubscriptionPlans: InsertSubscriptionPlan[] = [
  {
    id: "market-creator",
    name: "Market Creator Pro",
    price: "19.99",
    description: "Unlock unlimited market creation",
    features: [
      "Create unlimited prediction markets",
      "Advanced market customization",
      "Priority market listing",
      "Detailed creator analytics"
    ],
    isActive: true,
    icon: "zap",
    color: "purple"
  },
  {
    id: "ai-insights",
    name: "AI Insights Pro",
    price: "4.99",
    description: "Smart predictions powered by AI",
    features: [
      "AI-powered bet recommendations",
      "Market trend analysis",
      "Risk assessment tools",
      "Personalized betting strategies"
    ],
    isActive: true,
    icon: "brain",
    color: "blue"
  }
];

const defaultBundleSettings: BundleSettings = {
  price: 21.99,
  discount: 12,
  isActive: true,
};

// Initialize database with default data if empty
async function initializeDatabase() {
  try {
    // Check if plans exist
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length === 0) {
      // Insert default plans
      await db.insert(subscriptionPlans).values(defaultSubscriptionPlans);
      console.log('Initialized subscription plans in database');
    }

    // Check if bundle settings exist
    const existingBundle = await db.select().from(subscriptionSettings).where(eq(subscriptionSettings.key, 'bundle'));
    if (existingBundle.length === 0) {
      // Insert default bundle settings
      await db.insert(subscriptionSettings).values({
        key: 'bundle',
        value: defaultBundleSettings
      });
      console.log('Initialized bundle settings in database');
    }
  } catch (error) {
    console.error('Failed to initialize subscription database:', error);
  }
}

// Initialize on startup
initializeDatabase();

// Define the API response type with number price
interface SubscriptionPlanResponse {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  icon: string;
  color: string;
  updatedAt: Date | null;
}

export const subscriptionStore = {
  async getPlans(): Promise<SubscriptionPlanResponse[]> {
    try {
      const plans = await db.select().from(subscriptionPlans);
      return plans.map(plan => ({
        ...plan,
        price: parseFloat(plan.price)
      }));
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      return [];
    }
  },

  async getBundle(): Promise<BundleSettings> {
    try {
      const [result] = await db.select().from(subscriptionSettings).where(eq(subscriptionSettings.key, 'bundle'));
      return result ? result.value as BundleSettings : defaultBundleSettings;
    } catch (error) {
      console.error('Failed to get bundle settings:', error);
      return defaultBundleSettings;
    }
  },

  async updatePlan(planId: string, updatedPlan: Partial<SubscriptionPlanResponse>): Promise<SubscriptionPlanResponse | null> {
    try {
      const updateData: any = { ...updatedPlan };
      if (updatedPlan.price !== undefined) {
        updateData.price = updatedPlan.price.toString();
      }
      updateData.updatedAt = new Date();

      const [result] = await db
        .update(subscriptionPlans)
        .set(updateData)
        .where(eq(subscriptionPlans.id, planId))
        .returning();

      return result ? {
        id: result.id,
        name: result.name,
        price: parseFloat(result.price),
        description: result.description,
        features: result.features,
        isActive: result.isActive,
        icon: result.icon,
        color: result.color,
        updatedAt: result.updatedAt
      } : null;
    } catch (error) {
      console.error('Failed to update subscription plan:', error);
      return null;
    }
  },

  async updateBundle(updatedBundle: Partial<BundleSettings>): Promise<BundleSettings> {
    try {
      // Get current bundle settings
      const currentBundle = await this.getBundle();
      const newBundle = { ...currentBundle, ...updatedBundle };

      const [result] = await db
        .update(subscriptionSettings)
        .set({
          value: newBundle,
          updatedAt: new Date()
        })
        .where(eq(subscriptionSettings.key, 'bundle'))
        .returning();

      return result ? result.value as BundleSettings : defaultBundleSettings;
    } catch (error) {
      console.error('Failed to update bundle settings:', error);
      return defaultBundleSettings;
    }
  },
};