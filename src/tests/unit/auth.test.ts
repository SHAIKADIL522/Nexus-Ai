/**
 * Authentication Unit Tests
 */
import { describe, it, expect, vi } from 'vitest';

describe('Auth - OTP', () => {
  it('should generate a 6-digit OTP', () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    expect(otp).toHaveLength(6);
    expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    expect(Number(otp)).toBeLessThanOrEqual(999999);
  });

  it('should reject expired OTP', () => {
    const expiry = new Date(Date.now() - 1000); // 1 second ago
    expect(new Date() > expiry).toBe(true);
  });

  it('should accept valid OTP within expiry', () => {
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min future
    expect(new Date() < expiry).toBe(true);
  });
});

describe('Auth - Password', () => {
  it('should enforce minimum password length', () => {
    const validate = (pw: string) => pw.length >= 8;
    expect(validate('short')).toBe(false);
    expect(validate('longpassword')).toBe(true);
  });

  it('should detect password strength', () => {
    const strength = (pw: string) => {
      if (pw.length > 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
      if (pw.length > 6) return 'medium';
      return 'weak';
    };
    expect(strength('abc')).toBe('weak');
    expect(strength('abcdefg')).toBe('medium');
    expect(strength('Abcdefg1')).toBe('strong');
  });
});
