import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const creditCardSchema = z
  .object({
    card_number: z
      .string()
      .regex(/^\d+$/, 'Card number must contain only digits')
      .min(13, 'Card number must be at least 13 digits')
      .max(19, 'Card number must not exceed 19 digits'),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    expiry_date: z.object({
      month: z
        .number()
        .int()
        .min(1, 'Month must be between 1 and 12')
        .max(12, 'Month must be between 1 and 12'),
      year: z.number().int().min(currentYear, 'Year must not be in the past')
    }),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    surname: z
      .string()
      .min(2, 'Surname must be at least 2 characters')
      .max(50, 'Surname must not exceed 50 characters'),
    address: z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(100, 'Address must not exceed 100 characters')
  })
  .refine(
    (data) => {
      // Check if the card has not expired
      const currentDate = new Date();
      const expiryDate = new Date(
        data.expiry_date.year,
        data.expiry_date.month - 1
      );
      return expiryDate > currentDate;
    },
    {
      message: 'Card has expired',
      path: ['expiry_date']
    }
  )
  .refine(
    (data) => {
      // Implement Luhn algorithm for card number validation
      const digits = data.card_number.split('').map(Number);
      let sum = 0;
      let isEven = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    },
    {
      message: 'Invalid card number',
      path: ['card_number']
    }
  );

export type CreditCard = z.infer<typeof creditCardSchema>;
