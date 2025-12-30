const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Default sender email (Resend provides a free onboarding domain)
const FROM_EMAIL = process.env.EMAIL_FROM || 'Restaurant RMS <onboarding@resend.dev>';
const ALERT_RECIPIENTS = process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [];

/**
 * Send low stock alert email
 * @param {Array} lowStockItems - Array of items below minimum threshold
 */
const sendLowStockAlert = async (lowStockItems) => {
  if (!resend) {
    console.warn('[Email] Resend not configured. Set RESEND_API_KEY in .env');
    return { success: false, error: 'Resend not configured' };
  }

  if (!ALERT_RECIPIENTS.length) {
    console.warn('[Email] No alert recipients configured. Set ALERT_EMAIL_RECIPIENTS in .env');
    return { success: false, error: 'No recipients configured' };
  }

  if (!lowStockItems.length) {
    return { success: true, message: 'No low stock items to report' };
  }

  const itemRows = lowStockItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.ten}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.soLuongTon} ${item.donViTinh}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #e53e3e;">${item.mucTonToiThieu} ${item.donViTinh}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cảnh báo tồn kho</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e53e3e, #c53030); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Cảnh báo tồn kho thấp</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
            Có <strong style="color: #e53e3e;">${lowStockItems.length} nguyên vật liệu</strong> đang dưới mức tồn kho tối thiểu. Vui lòng kiểm tra và đặt hàng bổ sung.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #2d3748;">Nguyên vật liệu</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #2d3748;">Tồn kho</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #2d3748;">Ngưỡng tối thiểu</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
          
          <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; color: #c53030; font-size: 14px;">
              💡 <strong>Gợi ý:</strong> Truy cập hệ thống để tạo đơn mua hàng (PO) cho các nguyên vật liệu trên.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f7fafc; padding: 16px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #718096; font-size: 12px;">
            Email tự động từ hệ thống Restaurant RMS<br>
            Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ALERT_RECIPIENTS,
      subject: `⚠️ Cảnh báo: ${lowStockItems.length} nguyên vật liệu sắp hết hàng`,
      html,
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Low stock alert sent successfully:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error('[Email] Error sending email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send test email to verify configuration
 */
const sendTestEmail = async (to) => {
  if (!resend) {
    return { success: false, error: 'Resend not configured. Set RESEND_API_KEY in .env' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '✅ Test email từ Restaurant RMS',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🎉 Cấu hình email thành công!</h2>
          <p>Hệ thống Restaurant RMS đã được cấu hình gửi email thành công.</p>
          <p>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
        </div>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendLowStockAlert,
  sendTestEmail,
};
