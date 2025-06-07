'use server'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })
const CreateInvoice = z.object({
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
})

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  await sql `INSERT INTO invoices (customer_id, amount, status, date)
             VALUES (${customerId}, ${amount * 100}, ${status}, CURRENT_DATE)`
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}