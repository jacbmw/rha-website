'use client';

export default function SuburbScorecardPanel({ variant, snapshot, qualifiers, onSubmit, formStatus, formError }) {
  const { props } = variant;
  const interpolate = (value) => String(value || '').replace(/\{name\}/g, snapshot.name);

  return (
    <div className="suburb-gate">
      <p className="suburb-gate-heading">{interpolate(props.heading)}</p>
      <p className="suburb-gate-copy">{props.copy}</p>
      <form className="suburb-gate-form" onSubmit={onSubmit}>
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
        <div className="suburb-gate-fields">
          <input type="text" name="firstName" placeholder={props.firstNamePlaceholder} autoComplete="given-name" />
          <input type="email" name="email" required placeholder={props.emailPlaceholder} autoComplete="email" />
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
