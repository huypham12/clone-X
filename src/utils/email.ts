import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerifyEmail = async (email: string, token: string) => {
  const verifyUrl = `http://localhost:3000/users/verify-email?email_verify_token=${token}`

  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Xác thực email tài khoản của bạn',
    html: `
      <p>Chào bạn,</p>
      <p>Nhấn vào link bên dưới để xác thực email của bạn:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
    `
  })

  return result
}
