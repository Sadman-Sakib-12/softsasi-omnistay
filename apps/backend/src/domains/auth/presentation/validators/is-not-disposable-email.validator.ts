import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * High-risk disposable / temporary / spam email domains blocked on Softsasi OmniStay Enterprise.
 * Source: Sakib_Project_Plan.pdf (Chapter 19.5 Enterprise Security & Tenant Isolation)
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'dispostable.com',
  'getnada.com',
  'fake.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'mohmal.com',
  'crazymailing.com',
  'mytemp.email',
  'tempinbox.com',
  'generator.email',
  'tempail.com',
  'emailondeck.com',
  'burnermail.io',
  'dropmail.me',
  'inboxkitten.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotDisposableEmail',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Disposable or temporary email addresses are not permitted on SoftSasi OmniStay Enterprise.',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return !isDisposableEmail(value);
        },
      },
    });
  };
}
