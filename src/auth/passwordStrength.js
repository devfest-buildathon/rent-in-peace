// Password Strength Validator - Owned by Agent A per COORDINATION.md

/**
 * Evaluates password strength against Philippine security guidelines:
 * - Minimum 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character / symbol (!@#$%^&*...)
 * 
 * @param {string} password 
 * @returns {{
 *   score: number, // 0 - 4
 *   label: 'Weak' | 'Fair' | 'Good' | 'Strong',
 *   color: string,
 *   isStrong: boolean,
 *   checks: {
 *     hasMinLength: boolean,
 *     hasLower: boolean,
 *     hasUpper: boolean,
 *     hasNumber: boolean,
 *     hasSymbol: boolean
 *   }
 * }}
 */
export function checkPasswordStrength(password = '') {
  const p = typeof password === 'string' ? password : '';

  const checks = {
    hasMinLength: p.length >= 8,
    hasLower: /[a-z]/.test(p),
    hasUpper: /[A-Z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSymbol: /[^A-Za-z0-9]/.test(p)
  };

  let count = 0;
  if (checks.hasMinLength) count++;
  if (checks.hasLower && checks.hasUpper) count++;
  if (checks.hasNumber) count++;
  if (checks.hasSymbol) count++;

  const isStrong = checks.hasMinLength && 
                   checks.hasLower && 
                   checks.hasUpper && 
                   checks.hasNumber && 
                   checks.hasSymbol;

  let label = 'Weak';
  let color = '#EF4444'; // Red

  if (!p) {
    return { score: 0, label: 'Too short', color: '#CBD5E1', isStrong: false, checks };
  }

  if (isStrong) {
    label = 'Strong';
    color = '#10B981'; // Emerald
  } else if (count >= 3 && checks.hasMinLength) {
    label = 'Good';
    color = '#F59E0B'; // Amber
  } else if (count >= 2) {
    label = 'Fair';
    color = '#F97316'; // Orange
  } else {
    label = 'Weak';
    color = '#EF4444';
  }

  return {
    score: isStrong ? 4 : count,
    label,
    color,
    isStrong,
    checks
  };
}
