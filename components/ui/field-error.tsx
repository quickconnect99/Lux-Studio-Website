/**
 * Inline validation error message.
 *
 * Uses `var(--error)` so the colour stays within the design-system token
 * instead of being hardcoded to a Tailwind red shade.
 *
 * @example
 * {errors.email && <FieldError id="email-error" message={errors.email} />}
 */
export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="text-sm text-error">
      {message}
    </p>
  );
}
