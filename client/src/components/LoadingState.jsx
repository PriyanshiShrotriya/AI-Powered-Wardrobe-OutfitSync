const LoadingState = ({ label = 'Loading...' }) => (
  <span className="ui-loading" role="status" aria-live="polite">
    <span className="ui-loading-dot" aria-hidden="true" />
    {label}
  </span>
);

export default LoadingState;
