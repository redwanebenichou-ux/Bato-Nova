const helpers = require('./helpers');

class OTPService {
  constructor() {
    this.useSms = false;
  }

  async sendOTP(phone, otpCode) {
    console.log(`[OTP] Code for ${phone}: ${otpCode}`);

    if (this.useSms) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (accountSid && authToken && accountSid !== 'your_twilio_sid') {
          const twilio = require('twilio')(accountSid, authToken);
          await twilio.messages.create({
            body: `BATI Nova - Votre code de vérification est: ${otpCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+213${phone.replace(/^0/, '')}`
          });
          return true;
        }
      } catch (error) {
        console.error('[OTP] SMS error:', error.message);
      }
    }

    return false;
  }

  async verifyOTP(inputOtp, storedOtp, otpExpires) {
    if (!storedOtp || !otpExpires) return false;
    if (new Date() > new Date(otpExpires)) return false;
    return inputOtp === storedOtp;
  }
}

module.exports = new OTPService();
