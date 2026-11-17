import { useEffect, useState } from 'react';

// Tap once to arm, tap again within 3s to confirm. Avoids window.confirm,
// which some embedded browsers block.
export default function ConfirmButton({ label, confirmLabel, onConfirm, className = 'danger' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${className}${armed ? ' armed' : ''}`}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
