import { z } from 'zod';

export const SaaSPlan = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export type SaaSPlanType = (typeof SaaSPlan)[keyof typeof SaaSPlan];

export const registerSchema = z
  .object({
    // SaaS Subscription Plan (Chapter 19.2)
    plan: z.enum(['starter', 'professional', 'enterprise'], {
      message: 'Please choose a subscription plan tier',
    }),
    billingCycle: z.enum(['monthly', 'annual']).default('monthly'),

    // Property / Company Details (Chapter 4.1.1 & 19.1)
    companyName: z.string().min(2, 'Hotel or company name is required'),
    propertyType: z.string().min(1, 'Property type is required'),
    subdomain: z
      .string()
      .min(2, 'Subdomain slug is required')
      .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),

    // Master Account Credentials (Chapter 3.2 IAM)
    fullName: z.string().min(2, 'Full legal name is required'),
    email: z.string().email('Please enter a valid business email address'),
    phone: z.string().min(6, 'Contact phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Enterprise Master Services Agreement & Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
