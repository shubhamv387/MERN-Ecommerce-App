import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo'
import { BREVO_API_KEY } from '../secrets'
import InternalException from '../exceptions/InternalException'

export type SendMailOptionsType = {
  sender?: { name: string; email: string }
  receivers: { name: string; email: string }[]
  replyTo?: { name: string; email: string }
  subject: string
  textContent?: string
  htmlContent?: string
}

export default async function sendMail({
  sender = { email: 'info@skv-ecommerce-app.com', name: 'Shubham K' },
  replyTo = { email: 'noreply@skv-ecommerce-app.com', name: 'Shubham K' },
  receivers,
  subject,
  htmlContent,
  textContent,
}: SendMailOptionsType) {
  const transEmailApi = new TransactionalEmailsApi()
  transEmailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY)

  try {
    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      textContent,
      htmlContent,
      replyTo,
    })
  } catch (error) {
    console.log('Failed to send email:', error)
    throw new InternalException('Failed to send email')
  }
}
