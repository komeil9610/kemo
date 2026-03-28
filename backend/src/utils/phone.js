const normalizeSaudiPhoneNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('966')) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return `0${digits}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  return digits.length === 9 ? `0${digits}` : digits;
};

const isSaudiPhoneNumber = (value) => /^05\d{8}$/.test(normalizeSaudiPhoneNumber(value));

module.exports = {
  normalizeSaudiPhoneNumber,
  isSaudiPhoneNumber,
};
