// App shell: sidebar, topbar, router

const NAV = [
  {
    section: 'Главное',
    items: [
      { id: 'dashboard', label: 'Дашборд', icon: 'home' },
      { id: 'requests', label: 'Заявки', icon: 'clipboard' },
    ],
  },
  {
    section: 'Склад',
    items: [
      { id: 'raw', label: 'Сырьё', icon: 'cube' },
      { id: 'products', label: 'Готовая продукция', icon: 'package' },
      { id: 'recipes', label: 'Рецептуры', icon: 'recipe' },
    ],
  },
  {
    section: 'Операции',
    items: [
      { id: 'purchases', label: 'Закупки', icon: 'cart' },
      { id: 'production', label: 'Производство', icon: 'factory' },
      { id: 'sales', label: 'Продажи', icon: 'cash' },
    ],
  },
  {
    section: 'Финансы',
    items: [
      { id: 'budget', label: 'Бюджет', icon: 'wallet' },
      { id: 'salary', label: 'Зарплата', icon: 'briefcase' },
      { id: 'credits', label: 'Кредиты', icon: 'bank' },
    ],
  },
  {
    section: 'Аналитика',
    items: [
      { id: 'reports', label: 'Отчёты', icon: 'chart' },
    ],
  },
  {
    section: 'Справочники',
    items: [
      { id: 'employees', label: 'Сотрудники', icon: 'users' },
      { id: 'positions', label: 'Должности', icon: 'tag' },
      { id: 'units', label: 'Единицы измерения', icon: 'ruler' },
    ],
  },
];

const PAGE_INFO = {
  dashboard:  { crumbs: ['Главное', 'Дашборд'] },
  requests:   { crumbs: ['Главное', 'Заявки на производство'] },
  request_add:{ crumbs: ['Главное', 'Заявки', 'Новая заявка'] },
  raw:        { crumbs: ['Склад', 'Сырьё'] },
  products:   { crumbs: ['Склад', 'Готовая продукция'] },
  recipes:    { crumbs: ['Склад', 'Рецептуры'] },
  purchases:  { crumbs: ['Операции', 'Закупки'] },
  purchase_add:{ crumbs: ['Операции', 'Закупки', 'Новая закупка'] },
  production: { crumbs: ['Операции', 'Производство'] },
  production_add: { crumbs: ['Операции', 'Производство', 'Новое производство'] },
  sales:      { crumbs: ['Операции', 'Продажи'] },
  sales_add:  { crumbs: ['Операции', 'Продажи', 'Новая продажа'] },
  budget:     { crumbs: ['Финансы', 'Бюджет'] },
  salary:     { crumbs: ['Финансы', 'Зарплата'] },
  salary_add: { crumbs: ['Финансы', 'Зарплата', 'Новая выплата'] },
  credits:    { crumbs: ['Финансы', 'Кредиты'] },
  credit_add: { crumbs: ['Финансы', 'Кредиты', 'Новый кредит'] },
  credit_pay: { crumbs: ['Финансы', 'Кредиты', 'Погашение'] },
  schedule:   { crumbs: ['Финансы', 'Кредиты', 'График платежей'] },
  reports:    { crumbs: ['Аналитика', 'Отчёты'] },
  employees:  { crumbs: ['Справочники', 'Сотрудники'] },
  positions:  { crumbs: ['Справочники', 'Должности'] },
  units:      { crumbs: ['Справочники', 'Единицы измерения'] },
  profile:    { crumbs: ['Профиль'] },
  password:   { crumbs: ['Безопасность', 'Демо хеширования'] },
};

const Sidebar = ({ route, go }) => (
  <aside className="sidebar">
    <div className="sidebar-head">
      <div className="brand-mark">F</div>
      <div>
        <div className="brand-name">Фабрика</div>
        <div className="brand-sub">HP · с 2024</div>
      </div>
    </div>
    <nav className="nav">
      {NAV.map(s => (
        <div key={s.section}>
          <div className="nav-section">{s.section}</div>
          {s.items.map(it => {
            const Ic = Icons[it.icon];
            const active = route === it.id || (it.id === 'requests' && route === 'request_add')
                        || (it.id === 'purchases' && route === 'purchase_add')
                        || (it.id === 'production' && route === 'production_add')
                        || (it.id === 'sales' && route === 'sales_add')
                        || (it.id === 'salary' && route === 'salary_add')
                        || (it.id === 'credits' && (route === 'credit_add' || route === 'credit_pay' || route === 'schedule'));
            return (
              <a key={it.id} className={`nav-item${active ? ' active' : ''}`} onClick={() => go(it.id)}>
                <Ic className="ico"/>
                <span>{it.label}</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
    <div className="sidebar-foot">
      <div className="user-pill" onClick={() => go('profile')}>
        <div className="user-avatar">{MOCK.user.initials}</div>
        <div className="user-meta">
          <div className="user-name">{MOCK.user.name}</div>
          <div className="user-role">{MOCK.user.role}</div>
        </div>
        <Icons.more className="ico" style={{color:'var(--ink-3)'}}/>
      </div>
    </div>
  </aside>
);

const Topbar = ({ route, go }) => {
  const info = PAGE_INFO[route] || { crumbs: [] };
  return (
    <div className="topbar">
      <div className="crumbs">
        <Icons.home className="ico" style={{width:14,height:14,color:'var(--ink-3)'}}/>
        {info.crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === info.crumbs.length - 1 ? 'now' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-actions">
        <div className="search">
          <Icons.search className="ico" style={{width:14,height:14}}/>
          <input placeholder="Поиск по системе…"/>
          <span className="kbd">⌘K</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Уведомления">
          <Icons.bell className="ico"/>
        </button>
        <button className="btn btn-ghost" onClick={() => go('login')}>
          <Icons.logout className="ico"/>
          Выход
        </button>
      </div>
    </div>
  );
};

const Shell = ({ route, go, children, narrow }) => (
  <div className="app">
    <Sidebar route={route} go={go}/>
    <div className="main">
      <Topbar route={route} go={go}/>
      <div className={`content${narrow ? ' narrow' : ''}`}>{children}</div>
    </div>
  </div>
);

Object.assign(window, { Shell });
