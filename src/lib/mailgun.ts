interface MailgunConfig {
  apiKey: string
  domain: string
  fromEmail: string
  fromName: string
}

interface EmailAttachment {
  filename: string
  content: string // base64 content
  contentType: string
  size: number
}

interface EmailRecipient {
  id: number
  name: string
  email: string
  company?: string
}

interface EmailBlastResult {
  success: boolean
  successCount: number
  failureCount: number
  results: {
    email: string
    success: boolean
    messageId?: string
    error?: string
  }[]
}

export class MailgunService {
  private config: MailgunConfig

  constructor(config: MailgunConfig) {
    this.config = config
  }

  async sendBulkEmail(
    recipients: EmailRecipient[],
    subject: string,
    htmlBody: string,
    textBody?: string,
    attachments?: EmailAttachment[]
  ): Promise<EmailBlastResult> {
    const results: EmailBlastResult['results'] = []
    let successCount = 0
    let failureCount = 0

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const batchPromises = batch.map(recipient =>
        this.sendSingleEmail(recipient, subject, htmlBody, textBody, attachments)
      )

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        const recipient = batch[index]
        if (result.status === 'fulfilled') {
          results.push({
            email: recipient.email,
            success: true,
            messageId: result.value.messageId
          })
          successCount++
        } else {
          results.push({
            email: recipient.email,
            success: false,
            error: result.reason.message
          })
          failureCount++
        }
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results
    }
  }

  private async sendSingleEmail(
    recipient: EmailRecipient,
    subject: string,
    htmlBody: string,
    textBody?: string,
    attachments?: EmailAttachment[]
  ): Promise<{ messageId: string }> {
    const formData = new FormData()

    // Basic email data
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`)
    formData.append('to', `${recipient.name} <${recipient.email}>`)
    formData.append('subject', subject)
    formData.append('html', this.personalizeContent(htmlBody, recipient))

    if (textBody) {
      formData.append('text', this.personalizeContent(textBody, recipient))
    }

    // Add tracking
    formData.append('o:tracking', 'yes')
    formData.append('o:tracking-clicks', 'yes')
    formData.append('o:tracking-opens', 'yes')

    // Add attachments
    if (attachments && attachments.length > 0) {
      attachments.forEach((attachment, index) => {
        const blob = this.base64ToBlob(attachment.content, attachment.contentType)
        formData.append(`attachment[${index}]`, blob, attachment.filename)
      })
    }

    const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mailgun API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    return { messageId: result.id }
  }

  private personalizeContent(content: string, recipient: EmailRecipient): string {
    return content
      .replace(/\{name\}/g, recipient.name)
      .replace(/\{email\}/g, recipient.email)
      .replace(/\{company\}/g, recipient.company || 'your practice')
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64

    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: contentType })
  }

  async verifyDomain(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.mailgun.net/v3/domains/${this.config.domain}`, {
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
        }
      })

      return response.ok
    } catch {
      return false
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/stats/total`, {
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch {
      return null
    }
  }
}

// Default configuration - these should be set via environment variables
const DEFAULT_CONFIG: MailgunConfig = {
  apiKey: process.env.VITE_MAILGUN_API_KEY || '',
  domain: process.env.VITE_MAILGUN_DOMAIN || '',
  fromEmail: process.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: process.env.VITE_FROM_NAME || 'Happy Teeth Support Services'
}

export const mailgunService = new MailgunService(DEFAULT_CONFIG)

export { type EmailRecipient, type EmailAttachment, type EmailBlastResult }