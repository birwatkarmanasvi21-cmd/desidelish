import nodemailer from 'nodemailer';

export class EmailService {
  private static getTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email service will run in simulated (dry-run) mode.');
      return null;
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Generates a premium responsive HTML template for food invoices
   */
  private static generateInvoiceHtml(order: any, customerName: string): string {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const itemsHtml = order.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-b: 1px solid #edf2f7; text-align: left; font-size: 14px; color: #2d3748;">
          <div style="font-weight: 600;">${item.menuItem?.name || 'Delicious Food Item'}</div>
        </td>
        <td style="padding: 12px 0; border-b: 1px solid #edf2f7; text-align: center; font-size: 14px; color: #718096;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-b: 1px solid #edf2f7; text-align: right; font-size: 14px; color: #2d3748; font-weight: 600;">
          ₹${Number(item.unitPrice).toFixed(2)}
        </td>
        <td style="padding: 12px 0; border-b: 1px solid #edf2f7; text-align: right; font-size: 14px; color: #dd6b20; font-weight: 700;">
          ₹${Number(item.totalPrice).toFixed(2)}
        </td>
      </tr>`
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DesiDelish Invoice - Order ${order.orderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f7fafc; padding: 40px 0; }
        .main-card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #dd6b20 0%, #ed8936 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px; font-weight: 500; }
        .content { padding: 32px 24px; }
        .status-badge { display: inline-block; background-color: #feebc8; color: #c05621; font-weight: 700; font-size: 12px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 24px; }
        .meta-grid { display: flex; justify-content: space-between; margin-bottom: 32px; border-bottom: 1px solid #edf2f7; padding-bottom: 20px; }
        .meta-col { flex: 1; }
        .meta-col-right { flex: 1; text-align: right; }
        .label { font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 14px; color: #2d3748; font-weight: 600; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        .summary-box { background-color: #f7fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; margin-bottom: 32px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #4a5568; }
        .summary-row-bold { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #dd6b20; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
        .address-box { background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 32px; }
        .address-box p { margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5; }
        .footer { background-color: #edf2f7; padding: 24px; text-align: center; font-size: 12px; color: #718096; }
        .footer a { color: #dd6b20; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-card">
          <!-- Banner Header -->
          <div class="header">
            <h1>DesiDelish</h1>
            <p>Your premium hot meal order is confirmed!</p>
          </div>
          
          <!-- Core Content -->
          <div class="content">
            <div style="text-align: center;">
              <span class="status-badge">${order.status}</span>
            </div>
            
            <p style="font-size: 16px; color: #2d3748; line-height: 1.5; margin-bottom: 24px;">
              Hi <strong>${customerName}</strong>,<br>
              Thank you for ordering with DesiDelish! We've received your order and the restaurant is currently preparing it. Below is your detailed digital invoice.
            </p>
            
            <!-- Metadata Info -->
            <div class="meta-grid">
              <div class="meta-col">
                <div class="label">Order Number</div>
                <div class="value">${order.orderNumber}</div>
              </div>
              <div class="meta-col-right">
                <div class="label">Order Date</div>
                <div class="value">${formattedDate}</div>
              </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr style="border-bottom: 2px solid #edf2f7;">
                  <th style="padding-bottom: 8px; text-align: left; font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 700;">Item Details</th>
                  <th style="padding-bottom: 8px; text-align: center; font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 700; width: 40px;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right; font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 700; width: 80px;">Rate</th>
                  <th style="padding-bottom: 8px; text-align: right; font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 700; width: 80px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <!-- Total Sums Box -->
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>CGST (2.5%)</span>
                <span>₹${(Number(order.subtotal) * 0.025).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>SGST (2.5%)</span>
                <span>₹${(Number(order.subtotal) * 0.025).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Fee</span>
                <span>₹${Number(order.deliveryFee).toFixed(2)}</span>
              </div>
              <div class="summary-row-bold">
                <span>Grand Total</span>
                <span>₹${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Delivery Address -->
            <div class="label" style="margin-bottom: 8px;">Delivery Address</div>
            <div class="address-box">
              <p>
                <strong>${customerName}</strong><br>
                ${order.address?.addressLine1 || 'Default Delivery Street'}, ${order.address?.addressLine2 || ''}<br>
                ${order.address?.city || 'Tech City'}, ${order.address?.state || 'State'} - ${order.address?.postalCode || '000000'}
              </p>
            </div>
            
            <p style="font-size: 13px; color: #718096; text-align: center; margin-top: 32px;">
              You can track your delivery status in real-time on your dashboard.
            </p>
          </div>
          
          <!-- Bottom Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #4a5568;">DesiDelish Inc.</p>
            <p style="margin: 0 0 12px 0;">123 Street Road, Tech City, Karnataka</p>
            <p style="margin: 0;">Need help? <a href="mailto:support@desidelish.com">Contact Support</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Dispatches the invoice email to the customer
   */
  static async sendInvoiceEmail(order: any, customerEmail: string) {
    try {
      const transporter = this.getTransporter();
      const customerName = order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Valued Customer'
        : 'Valued Customer';

      const subject = `DesiDelish Digital Invoice - Order #${order.orderNumber}`;
      const html = this.generateInvoiceHtml(order, customerName);

      if (!transporter) {
        console.log(`[Email Dry-Run] Mail would be sent to: ${customerEmail}`);
        console.log(`[Email Dry-Run] Subject: ${subject}`);
        console.log(`[Email Dry-Run] Total Bill Amount: ₹${Number(order.total).toFixed(2)}`);
        return;
      }

      const mailOptions = {
        from: `"DesiDelish" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Invoice email sent successfully to ${customerEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
      // Log errors safely so checkout does NOT fail if mail credentials or internet is down.
      console.error('❌ Failed to send invoice email:', error);
    }
  }
}
