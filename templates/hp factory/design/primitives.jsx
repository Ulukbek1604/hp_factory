// Reusable primitive components

const Btn = ({ kind = 'ghost', sm, icon, children, ...p }) => {
  const Ic = icon ? Icons[icon] : null;
  return (
    <button className={`btn btn-${kind}${sm ? ' btn-sm' : ''}`} {...p}>
      {Ic && <Ic className="ico"/>}
      {children}
    </button>
  );
};

const Badge = ({ kind = 'gray', flat, children }) => (
  <span className={`badge badge-${kind}${flat ? ' flat' : ''}`}>{children}</span>
);

const StatusBadge = ({ status }) => {
  const map = {
    'Создана':   { kind: 'gray',  label: 'Создана' },
    'В работе':  { kind: 'steel', label: 'В работе' },
    'Выполнена': { kind: 'olive', label: 'Выполнена' },
    'Ошибка':    { kind: 'brick', label: 'Ошибка' },
    'active':    { kind: 'amber', label: 'Активный' },
    'paid':      { kind: 'olive', label: 'Погашен' },
    'overdue':   { kind: 'brick', label: 'Просрочен' },
    'pending':   { kind: 'gray',  label: 'Ожидает' },
    'due':       { kind: 'amber', label: 'К оплате' },
  };
  const cfg = map[status] || { kind: 'gray', label: status };
  return <Badge kind={cfg.kind}>{cfg.label}</Badge>;
};

const Money = ({ value, sign, currency = 'сом' }) => {
  const v = (sign === '+' ? '+' : sign === '-' ? '−' : '') + Math.abs(value).toLocaleString('ru-RU');
  return <span className="num">{v} <span className="muted" style={{fontSize:'.85em'}}>{currency}</span></span>;
};

const Field = ({ label, hint, required, children }) => (
  <div className="field">
    <label className="label">{label}{required && <span className="req">*</span>}</label>
    {children}
    {hint && <div className="help">{hint}</div>}
  </div>
);

const Panel = ({ title, sub, action, children, flush }) => (
  <div className="panel mb-4">
    {(title || action) && (
      <div className="panel-head">
        <div>
          {title && <div className="panel-title">{title}</div>}
          {sub && <div className="panel-sub mt-3" style={{marginTop: 4}}>{sub}</div>}
        </div>
        {action}
      </div>
    )}
    <div className={`panel-body${flush ? ' flush' : ''}`}>{children}</div>
  </div>
);

const PageHead = ({ eyebrow, title, desc, actions }) => (
  <header className="page-head">
    <div>
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
      <h1 className="page-title">{title}</h1>
      {desc && <p className="page-desc">{desc}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>
);

const Stat = ({ label, value, unit, accent, trend, hint }) => (
  <div className="stat">
    <div className="stat-label">
      {accent && <span className={`accent-dot dot ${accent}`}></span>}
      {label}
    </div>
    <div className="stat-value">
      {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      {unit && <span className="unit">{unit}</span>}
    </div>
    {trend && <div className="stat-trend">{trend}</div>}
    {hint && <div className="stat-trend muted">{hint}</div>}
  </div>
);

const EmptyRow = ({ cols, children = 'Нет данных' }) => (
  <tr className="empty-row"><td colSpan={cols}>{children}</td></tr>
);

const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">{title}</div></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

Object.assign(window, { Btn, Badge, StatusBadge, Money, Field, Panel, PageHead, Stat, EmptyRow, Modal });
