'use client';

export default function SuburbScorecardPanel({
  variant,
  snapshot,
  qualifiers,
  onSubmit,
  onFieldFocus,
  onFieldBlur,
  onFieldInput,
  onClose,
  emailRef,
  formStatus,
  formError,
}) {
  const { props } = variant;
  const interpolate = (value) => String(value || '').replace(/\{name\}/g, snapshot.name);
  const bullets = [
    `18-month R-Score history for ${snapshot.name}`,
    `All 4 score pillars (Demand, Supply, Momentum, Yield)`,
    `3-year median house price, weekly rent & days-on-market charts`,
    `Also unlocks every Street Score report in ${snapshot.name}`,
  ];

  return (
    <div className="suburb-gate street-gate">
      {onClose && <button type="button" className="street-sheet-close" aria-label="Close" onClick={onClose}>×</button>}
      <p className="suburb-gate-heading">{interpolate(props.heading)}</p>
      <p className="suburb-gate-copy">{props.copy}</p>
      <ul className="street-gate-bullets">
        {bullets.map((item) => (
          <li key={item}><span aria-hidden="true">✓</span>{item}</li>
        ))}
      </ul>
      <form className="suburb-gate-form" onSubmit={onSubmit}>
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
        <div className="suburb-gate-fields">
          <input ref={emailRef} type="email" name="email" required placeholder={props.emailPlaceholder} autoComplete="email" inputMode="email" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
          <input type="text" name="firstName" placeholder={props.firstNamePlaceholder} autoComplete="given-name" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
        </div>
        <select name="qualifier" defaultValue="" aria-label={props.qualifierPlaceholder}>
          <option value="" disabled>{props.qualifierPlaceholder}</option>
          {qualifiers.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <label className="suburb-gate-consent">
          <input type="checkbox" name="scoreWatch" defaultChecked />
          <span>{interpolate(props.scoreWatchLabel)}</span>
        </label>
        <button type="submit" disabled={formStatus === 'sending'}>
          {formStatus === 'sending' ? props.buttonSendingLabel : props.buttonLabel}
        </button>
        {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
        <p className="suburb-gate-fine">{props.finePrint}</p>
      </form>
    </div>
  );
}
