const ErrorMessage = ({ children, className = '' }) => (
  <p className={`ui-message ui-message-error ${className}`} role="alert">
    {children}
  </p>
);

export default ErrorMessage;
