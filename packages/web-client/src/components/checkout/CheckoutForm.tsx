import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@e3d/shared';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  CreditCardIcon, 
  TruckIcon, 
  UserIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useCart, useCartTotals } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

// Validation schemas
const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  saveAddress: z.boolean().optional(),
});

const billingSchema = z.object({
  sameAsShipping: z.boolean(),
  fullName: z.string().min(2, 'Full name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  address1: z.string().min(5, 'Address is required').optional(),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().min(2, 'State is required').optional(),
  postalCode: z.string().min(5, 'Postal code is required').optional(),
  country: z.string().min(2, 'Country is required').optional(),
}).refine(
  (data) => {
    // If sameAsShipping is true, we don't need to validate the other fields
    if (data.sameAsShipping) return true;
    
    // Otherwise, all fields are required
    return !!(
      data.fullName && 
      data.email && 
      data.phone && 
      data.address1 && 
      data.city && 
      data.state && 
      data.postalCode && 
      data.country
    );
  },
  {
    message: "Billing address is required",
    path: ["fullName"],
  }
);

const paymentSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'paypal', 'apple_pay']),
  cardHolder: z.string().min(2, 'Cardholder name is required').optional(),
  cardNumber: z.string().regex(/^\d{16}$/, 'Valid card number is required').optional(),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Valid expiry date (MM/YY) is required').optional(),
  cvv: z.string().regex(/^\d{3,4}$/, 'Valid CVV is required').optional(),
  savePaymentMethod: z.boolean().optional(),
}).refine(
  (data) => {
    // Only validate card details if credit_card is selected
    if (data.paymentMethod !== 'credit_card') return true;
    
    return !!(data.cardHolder && data.cardNumber && data.expiryDate && data.cvv);
  },
  {
    message: "Card details are required",
    path: ["cardHolder"],
  }
);

// Combined schema for the entire checkout process
const checkoutSchema = z.object({
  shipping: shippingSchema,
  billing: billingSchema,
  payment: paymentSchema,
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Step components
const ShippingStep = () => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormData>();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Shipping Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="shipping.fullName" className="block text-sm font-medium text-neutral-700 mb-1">
            Full Name
          </label>
          <input
            id="shipping.fullName"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.fullName ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="John Doe"
            {...register('shipping.fullName')}
          />
          {errors.shipping?.fullName && (
            <p className="mt-1 text-sm text-error">{errors.shipping.fullName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="shipping.email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <input
            id="shipping.email"
            type="email"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.email ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="you@example.com"
            {...register('shipping.email')}
          />
          {errors.shipping?.email && (
            <p className="mt-1 text-sm text-error">{errors.shipping.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="shipping.phone" className="block text-sm font-medium text-neutral-700 mb-1">
            Phone Number
          </label>
          <input
            id="shipping.phone"
            type="tel"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.phone ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="(123) 456-7890"
            {...register('shipping.phone')}
          />
          {errors.shipping?.phone && (
            <p className="mt-1 text-sm text-error">{errors.shipping.phone.message}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label htmlFor="shipping.address1" className="block text-sm font-medium text-neutral-700 mb-1">
            Address Line 1
          </label>
          <input
            id="shipping.address1"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.address1 ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="123 Main St"
            {...register('shipping.address1')}
          />
          {errors.shipping?.address1 && (
            <p className="mt-1 text-sm text-error">{errors.shipping.address1.message}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label htmlFor="shipping.address2" className="block text-sm font-medium text-neutral-700 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            id="shipping.address2"
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Apt 4B, Floor 2, etc."
            {...register('shipping.address2')}
          />
        </div>
        
        <div>
          <label htmlFor="shipping.city" className="block text-sm font-medium text-neutral-700 mb-1">
            City
          </label>
          <input
            id="shipping.city"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.city ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="San Francisco"
            {...register('shipping.city')}
          />
          {errors.shipping?.city && (
            <p className="mt-1 text-sm text-error">{errors.shipping.city.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="shipping.state" className="block text-sm font-medium text-neutral-700 mb-1">
            State / Province
          </label>
          <input
            id="shipping.state"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.state ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="California"
            {...register('shipping.state')}
          />
          {errors.shipping?.state && (
            <p className="mt-1 text-sm text-error">{errors.shipping.state.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="shipping.postalCode" className="block text-sm font-medium text-neutral-700 mb-1">
            Postal / ZIP Code
          </label>
          <input
            id="shipping.postalCode"
            type="text"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.postalCode ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="94103"
            {...register('shipping.postalCode')}
          />
          {errors.shipping?.postalCode && (
            <p className="mt-1 text-sm text-error">{errors.shipping.postalCode.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="shipping.country" className="block text-sm font-medium text-neutral-700 mb-1">
            Country
          </label>
          <select
            id="shipping.country"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              errors.shipping?.country ? 'border-error' : 'border-neutral-300'
            }`}
            {...register('shipping.country')}
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option value="UK">United Kingdom</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
          </select>
          {errors.shipping?.country && (
            <p className="mt-1 text-sm text-error">{errors.shipping.country.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        <input
          id="shipping.saveAddress"
          type="checkbox"
          className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary-600"
          {...register('shipping.saveAddress')}
        />
        <label htmlFor="shipping.saveAddress" className="ml-2 block text-sm text-neutral-700">
          Save this address for future orders
        </label>
      </div>
    </div>
  );
};

const BillingStep = () => {
  const { register, watch, formState: { errors } } = useFormContext<CheckoutFormData>();
  const sameAsShipping = watch('billing.sameAsShipping');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Billing Information</h3>
      
      <div className="flex items-center mb-4">
        <input
          id="billing.sameAsShipping"
          type="checkbox"
          className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary-600"
          {...register('billing.sameAsShipping')}
        />
        <label htmlFor="billing.sameAsShipping" className="ml-2 block text-sm text-neutral-700">
          Same as shipping address
        </label>
      </div>
      
      {!sameAsShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="billing.fullName" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              id="billing.fullName"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.fullName ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="John Doe"
              {...register('billing.fullName')}
            />
            {errors.billing?.fullName && (
              <p className="mt-1 text-sm text-error">{errors.billing.fullName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billing.email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              id="billing.email"
              type="email"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.email ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="you@example.com"
              {...register('billing.email')}
            />
            {errors.billing?.email && (
              <p className="mt-1 text-sm text-error">{errors.billing.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billing.phone" className="block text-sm font-medium text-neutral-700 mb-1">
              Phone Number
            </label>
            <input
              id="billing.phone"
              type="tel"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.phone ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="(123) 456-7890"
              {...register('billing.phone')}
            />
            {errors.billing?.phone && (
              <p className="mt-1 text-sm text-error">{errors.billing.phone.message}</p>
            )}
          </div>
          
          <div className="col-span-2">
            <label htmlFor="billing.address1" className="block text-sm font-medium text-neutral-700 mb-1">
              Address Line 1
            </label>
            <input
              id="billing.address1"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.address1 ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="123 Main St"
              {...register('billing.address1')}
            />
            {errors.billing?.address1 && (
              <p className="mt-1 text-sm text-error">{errors.billing.address1.message}</p>
            )}
          </div>
          
          <div className="col-span-2">
            <label htmlFor="billing.address2" className="block text-sm font-medium text-neutral-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              id="billing.address2"
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Apt 4B, Floor 2, etc."
              {...register('billing.address2')}
            />
          </div>
          
          <div>
            <label htmlFor="billing.city" className="block text-sm font-medium text-neutral-700 mb-1">
              City
            </label>
            <input
              id="billing.city"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.city ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="San Francisco"
              {...register('billing.city')}
            />
            {errors.billing?.city && (
              <p className="mt-1 text-sm text-error">{errors.billing.city.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billing.state" className="block text-sm font-medium text-neutral-700 mb-1">
              State / Province
            </label>
            <input
              id="billing.state"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.state ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="California"
              {...register('billing.state')}
            />
            {errors.billing?.state && (
              <p className="mt-1 text-sm text-error">{errors.billing.state.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billing.postalCode" className="block text-sm font-medium text-neutral-700 mb-1">
              Postal / ZIP Code
            </label>
            <input
              id="billing.postalCode"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.postalCode ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="94103"
              {...register('billing.postalCode')}
            />
            {errors.billing?.postalCode && (
              <p className="mt-1 text-sm text-error">{errors.billing.postalCode.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billing.country" className="block text-sm font-medium text-neutral-700 mb-1">
              Country
            </label>
            <select
              id="billing.country"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.billing?.country ? 'border-error' : 'border-neutral-300'
              }`}
              {...register('billing.country')}
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="MX">Mexico</option>
              <option value="UK">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="JP">Japan</option>
              <option value="AU">Australia</option>
            </select>
            {errors.billing?.country && (
              <p className="mt-1 text-sm text-error">{errors.billing.country.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentStep = () => {
  const { register, watch, formState: { errors }, control } = useFormContext<CheckoutFormData>();
  const paymentMethod = watch('payment.paymentMethod');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Method</h3>
      
      <div className="space-y-4">
        <Controller
          name="payment.paymentMethod"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="payment-credit-card"
                  type="radio"
                  className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary-600"
                  value="credit_card"
                  checked={field.value === 'credit_card'}
                  onChange={() => field.onChange('credit_card')}
                />
                <label htmlFor="payment-credit-card" className="ml-3 block text-sm font-medium text-neutral-700">
                  <span className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-neutral-400 mr-2" />
                    Credit / Debit Card
                  </span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="payment-paypal"
                  type="radio"
                  className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary-600"
                  value="paypal"
                  checked={field.value === 'paypal'}
                  onChange={() => field.onChange('paypal')}
                />
                <label htmlFor="payment-paypal" className="ml-3 block text-sm font-medium text-neutral-700">
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.539h6.964c2.075 0 3.747.517 4.966 1.53 1.219 1.013 1.83 2.345 1.83 3.997 0 .794-.151 1.562-.455 2.307-.303.744-.744 1.416-1.324 2.015-.579.599-1.288 1.096-2.127 1.49-.839.395-1.8.593-2.883.593h-4.89l-1.083 6.122a.64.64 0 0 1-.632.54h-.866v.062zM8.521 7.772h-2.95l-.866 4.962h2.264c1.324 0 2.338-.303 3.043-.909.704-.606 1.057-1.466 1.057-2.58 0-.794-.227-1.378-.682-1.752-.454-.374-1.173-.561-2.157-.561h-.709v.84z" />
                    </svg>
                    PayPal
                  </span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="payment-apple-pay"
                  type="radio"
                  className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary-600"
                  value="apple_pay"
                  checked={field.value === 'apple_pay'}
                  onChange={() => field.onChange('apple_pay')}
                />
                <label htmlFor="payment-apple-pay" className="ml-3 block text-sm font-medium text-neutral-700">
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-black mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.72 7.39c-.75.96-1.94 1.7-3.07 1.59-.15-1.18.43-2.42 1.11-3.19.75-.9 2.02-1.56 3.06-1.61.09 1.22-.35 2.4-1.1 3.21m1.1 1.98c-1.69-.1-3.13.96-3.93.96-.82 0-2.05-.92-3.38-.9-1.74.03-3.36 1.01-4.25 2.58-1.81 3.15-.47 7.8 1.28 10.36.86 1.25 1.89 2.63 3.23 2.58 1.29-.05 1.78-.83 3.34-.83 1.55 0 1.99.83 3.35.8 1.39-.02 2.27-1.25 3.11-2.51.96-1.39 1.35-2.73 1.37-2.8-.03-.01-2.64-1.02-2.66-4.04-.02-2.53 2.06-3.72 2.15-3.78-1.18-1.73-3-1.92-3.61-1.97" />
                    </svg>
                    Apple Pay
                  </span>
                </label>
              </div>
            </div>
          )}
        />
        
        {paymentMethod === 'credit_card' && (
          <div className="mt-4 p-4 border border-neutral-200 rounded-md bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="payment.cardHolder" className="block text-sm font-medium text-neutral-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  id="payment.cardHolder"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.payment?.cardHolder ? 'border-error' : 'border-neutral-300'
                  }`}
                  placeholder="John Doe"
                  {...register('payment.cardHolder')}
                />
                {errors.payment?.cardHolder && (
                  <p className="mt-1 text-sm text-error">{errors.payment.cardHolder.message}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="payment.cardNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                  Card Number
                </label>
                <input
                  id="payment.cardNumber"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.payment?.cardNumber ? 'border-error' : 'border-neutral-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                  {...register('payment.cardNumber')}
                />
                {errors.payment?.cardNumber && (
                  <p className="mt-1 text-sm text-error">{errors.payment.cardNumber.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="payment.expiryDate" className="block text-sm font-medium text-neutral-700 mb-1">
                  Expiry Date
                </label>
                <input
                  id="payment.expiryDate"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.payment?.expiryDate ? 'border-error' : 'border-neutral-300'
                  }`}
                  placeholder="MM/YY"
                  {...register('payment.expiryDate')}
                />
                {errors.payment?.expiryDate && (
                  <p className="mt-1 text-sm text-error">{errors.payment.expiryDate.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="payment.cvv" className="block text-sm font-medium text-neutral-700 mb-1">
                  CVV
                </label>
                <input
                  id="payment.cvv"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.payment?.cvv ? 'border-error' : 'border-neutral-300'
                  }`}
                  placeholder="123"
                  {...register('payment.cvv')}
                />
                {errors.payment?.cvv && (
                  <p className="mt-1 text-sm text-error">{errors.payment.cvv.message}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center">
                  <input
                    id="payment.savePaymentMethod"
                    type="checkbox"
                    className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary-600"
                    {...register('payment.savePaymentMethod')}
                  />
                  <label htmlFor="payment.savePaymentMethod" className="ml-2 block text-sm text-neutral-700">
                    Save this card for future purchases
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === 'paypal' && (
          <div className="mt-4 p-4 border border-neutral-200 rounded-md bg-neutral-50 text-center">
            <p className="text-sm text-neutral-700">
              You will be redirected to PayPal to complete your payment.
            </p>
          </div>
        )}
        
        {paymentMethod === 'apple_pay' && (
          <div className="mt-4 p-4 border border-neutral-200 rounded-md bg-neutral-50 text-center">
            <p className="text-sm text-neutral-700">
              You will be prompted to confirm payment with Apple Pay.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
          Order Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          placeholder="Special instructions for delivery or any other notes..."
          {...register('notes')}
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="termsAccepted"
          type="checkbox"
          className={`h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary-600 ${
            errors.termsAccepted ? 'border-error' : ''
          }`}
          {...register('termsAccepted')}
        />
        <label htmlFor="termsAccepted" className="ml-2 block text-sm text-neutral-700">
          I agree to the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
        </label>
      </div>
      {errors.termsAccepted && (
        <p className="mt-1 text-sm text-error">{errors.termsAccepted.message}</p>
      )}
    </div>
  );
};

const ReviewStep = () => {
  const { watch } = useFormContext<CheckoutFormData>();
  const { items } = useCart();
  const { subtotal, shipping, tax, total } = useCartTotals();
  
  const formData = watch();
  const shippingInfo = formData.shipping;
  const billingInfo = formData.billing.sameAsShipping ? formData.shipping : formData.billing;
  const paymentMethod = formData.payment.paymentMethod;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Order Review</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Information */}
          <div className="border border-neutral-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-neutral-700">Shipping Information</h4>
              <TruckIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="text-sm text-neutral-600">
              <p className="font-medium">{shippingInfo.fullName}</p>
              <p>{shippingInfo.address1}</p>
              {shippingInfo.address2 && <p>{shippingInfo.address2}</p>}
              <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
              <p>{shippingInfo.country}</p>
              <p className="mt-2">{shippingInfo.email}</p>
              <p>{shippingInfo.phone}</p>
            </div>
          </div>
          
          {/* Billing Information */}
          <div className="border border-neutral-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-neutral-700">Billing Information</h4>
              <UserIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="text-sm text-neutral-600">
              <p className="font-medium">{billingInfo.fullName}</p>
              <p>{billingInfo.address1}</p>
              {billingInfo.address2 && <p>{billingInfo.address2}</p>}
              <p>{billingInfo.city}, {billingInfo.state} {billingInfo.postalCode}</p>
              <p>{billingInfo.country}</p>
              <p className="mt-2">{billingInfo.email}</p>
              <p>{billingInfo.phone}</p>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="border border-neutral-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-neutral-700">Payment Method</h4>
              <CreditCardIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="text-sm text-neutral-600">
              {paymentMethod === 'credit_card' && (
                <>
                  <p className="font-medium">Credit Card</p>
                  <p>Card ending in {formData.payment.cardNumber?.slice(-4)}</p>
                  <p>Expires {formData.payment.expiryDate}</p>
                </>
              )}
              {paymentMethod === 'paypal' && (
                <p className="font-medium">PayPal</p>
              )}
              {paymentMethod === 'apple_pay' && (
                <p className="font-medium">Apple Pay</p>
              )}
            </div>
          </div>
          
          {/* Order Notes */}
          {formData.notes && (
            <div className="border border-neutral-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-neutral-700">Order Notes</h4>
              </div>
              <div className="text-sm text-neutral-600">
                <p>{formData.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="border border-neutral-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Order Summary</h4>
          
          <div className="divide-y divide-neutral-200">
            {/* Items */}
            <div className="space-y-3 pb-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex items-start">
                    <div className="text-sm">
                      <p className="font-medium text-neutral-700">{item.name}</p>
                      <p className="text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Subtotal */}
            <div className="py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-neutral-600">Subtotal</p>
                <p className="font-medium text-neutral-700">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-neutral-600">Shipping</p>
                <p className="font-medium text-neutral-700">{formatCurrency(shipping)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-neutral-600">Tax</p>
                <p className="font-medium text-neutral-700">{formatCurrency(tax)}</p>
              </div>
            </div>
            
            {/* Total */}
            <div className="pt-3">
              <div className="flex justify-between">
                <p className="text-base font-medium text-neutral-900">Total</p>
                <p className="text-base font-bold text-neutral-900">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step configuration
const steps = [
  { id: 'shipping', title: 'Shipping', component: ShippingStep, icon: TruckIcon },
  { id: 'billing', title: 'Billing', component: BillingStep, icon: UserIcon },
  { id: 'payment', title: 'Payment', component: PaymentStep, icon: CreditCardIcon },
  { id: 'review', title: 'Review', component: ReviewStep, icon: CheckCircleIcon },
];

interface CheckoutFormProps {
  /**
   * Callback when checkout is successful
   */
  onSuccess?: (orderId: string) => void;
  /**
   * Redirect URL after successful checkout
   */
  successUrl?: string;
}

/**
 * Checkout form with multi-step process
 */
export default function CheckoutForm({ onSuccess, successUrl = '/checkout/success' }: CheckoutFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { items, clearCart } = useCart();
  const { total } = useCartTotals();
  
  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        fullName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        saveAddress: false,
      },
      billing: {
        sameAsShipping: true,
        fullName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      payment: {
        paymentMethod: 'credit_card',
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        savePaymentMethod: false,
      },
      notes: '',
      termsAccepted: false,
    },
    mode: 'onChange',
  });
  
  const CurrentStepComponent = steps[currentStep].component;
  
  // Handle next step
  const handleNext = async () => {
    const fieldsToValidate = [];
    
    // Determine which fields to validate based on current step
    switch (currentStep) {
      case 0: // Shipping
        fieldsToValidate.push('shipping');
        break;
      case 1: // Billing
        fieldsToValidate.push('billing');
        break;
      case 2: // Payment
        fieldsToValidate.push('payment');
        break;
      case 3: // Review
        fieldsToValidate.push('termsAccepted');
        break;
    }
    
    // Validate the fields for the current step
    const result = await methods.trigger(fieldsToValidate as any);
    
    if (result) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        await handleSubmit();
      }
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit the form data
      const formData = methods.getValues();
      
      // Make API call to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: formData.shipping,
          billingAddress: formData.billing.sameAsShipping ? formData.shipping : formData.billing,
          paymentMethod: formData.payment.paymentMethod,
          notes: formData.notes,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const data = await response.json();
      setOrderId(data.orderId);
      
      // Clear cart
      clearCart();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.orderId);
      }
      
      // Redirect to success page
      router.push(`${successUrl}?orderId=${data.orderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if cart is empty
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your cart is empty</h2>
        <p className="text-neutral-600 mb-6">Add some products to your cart to proceed with checkout.</p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/products')}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="hidden sm:block">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => index < currentStep && setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      index === currentStep
                        ? 'border-primary text-primary'
                        : index < currentStep
                        ? 'border-primary-200 text-primary-600 hover:text-primary hover:border-primary'
                        : 'border-transparent text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                        index <= currentStep ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      {step.title}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Mobile Steps */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between py-4 border-b border-neutral-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center text-sm font-medium ${
                currentStep === 0 ? 'text-neutral-400 cursor-not-allowed' : 'text-primary'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
            <span className="text-sm font-medium text-neutral-700">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </span>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center text-sm font-medium text-primary"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Checkout Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form>
                  <CurrentStepComponent />
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-start">
                        <div className="text-sm">
                          <p className="font-medium text-neutral-700">
                            {item.name} <span className="text-neutral-500">x{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-neutral-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div className="border-t border-neutral-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-neutral-600">Subtotal</p>
                    <p className="font-medium text-neutral-700">{formatCurrency(useCartTotals().subtotal)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-neutral-600">Shipping</p>
                    <p className="font-medium text-neutral-700">{formatCurrency(useCartTotals().shipping)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-neutral-600">Tax</p>
                    <p className="font-medium text-neutral-700">{formatCurrency(useCartTotals().tax)}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <p className="text-base font-medium text-neutral-900">Total</p>
                    <p className="text-base font-bold text-neutral-900">{formatCurrency(useCartTotals().total)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation Buttons */}
          <div className="mt-6 space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              isLoading={isSubmitting}
              loadingText={currentStep === steps.length - 1 ? "Processing..." : "Next..."}
              rightIcon={currentStep < steps.length - 1 ? <ChevronRightIcon className="h-5 w-5" /> : undefined}
            >
              {currentStep === steps.length - 1 ? 'Place Order' : 'Continue to ' + steps[currentStep + 1].title}
            </Button>
            
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handlePrevious}
                disabled={isSubmitting}
                leftIcon={<ChevronLeftIcon className="h-5 w-5" />}
              >
                Back to {steps[currentStep - 1].title}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
