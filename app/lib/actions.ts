'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) { 
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    /* `const amountInCents = amount * 100;` is converting the `amount` value from the form data into
    cents. It multiplies the `amount` by 100 to convert it from a dollar amount to a cent amount.
    This is a common practice when dealing with financial transactions to ensure consistency in the
    unit of currency being used. */
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    // Test it out:
    // console.log(rawFormData);
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}