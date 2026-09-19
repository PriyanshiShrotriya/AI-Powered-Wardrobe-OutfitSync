const EmptyState = ({ title, description, action }) => (
  <div className="ui-empty-state">
    <div className="ui-empty-state-icon" aria-hidden="true">✦</div>
    <h3 className="text-xl text-[var(--ink)]">{title}</h3>
    <p className="mt-2 max-w-md text-sm">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
