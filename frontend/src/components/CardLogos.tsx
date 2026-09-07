export function VisaLogo() {
  return (
    <svg
      width="30"
      height="19"
      viewBox="0 0 48 30"
      role="img"
      aria-label="Visa"
      className="card-logo"
    >
      <rect width="48" height="30" rx="4" fill="#fff" stroke="#e0e0e0" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="13"
        fill="#1a1f71"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo() {
  return (
    <svg
      width="30"
      height="19"
      viewBox="0 0 48 30"
      role="img"
      aria-label="Mastercard"
      className="card-logo"
    >
      <rect width="48" height="30" rx="4" fill="#fff" stroke="#e0e0e0" />
      <circle cx="20" cy="15" r="8" fill="#EB001B" />
      <circle cx="28" cy="15" r="8" fill="#F79E1B" />
      <path d="M24 8.6a8 8 0 0 1 0 12.8 8 8 0 0 1 0-12.8z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexLogo() {
  return (
    <svg
      width="30"
      height="19"
      viewBox="0 0 48 30"
      role="img"
      aria-label="American Express"
      className="card-logo"
    >
      <rect width="48" height="30" rx="4" fill="#1F72CD" />
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="9"
        fill="#fff"
      >
        AMEX
      </text>
    </svg>
  );
}
