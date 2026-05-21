// List pages: requests, raw, products, recipes, employees, positions, units, purchases, production, sales

const ListToolbar = ({ search = 'Поиск…', filters = [], onAdd, addLabel }) => (
  <div className="toolbar">
    <div className="search" style={{width: 280}}>
      <Icons.search className="ico" style={{width:14,height:14}}/>
      <input placeholder={search}/>
    </div>
    {filters.map(f => (
      <div key={f} className="filter-chip">
        <Icons.filter className="ico" style={{width:12,height:12}}/>
        <span>{f}</span>
      </div>
    ))}
    <div className="grow"/>
    <Btn icon="download" sm>Экспорт</Btn>
    {onAdd && <Btn kind="primary" icon="plus" onClick={onAdd}>{addLabel || 'Добавить'}</Btn>}
  </div>
);

// ----- Requests -----
const RequestsPage = ({ go }) => {
  const M = MOCK;
  const stats = [
    { label: 'Всего', n: M.totalRequests, accent: 'gray' },
    { label: 'Создано', n: M.totalRequests - M.completed - M.inProgress - M.errors, accent: 'gray' },
    { label: 'В работе', n: M.inProgress, accent: 'steel' },
    { label: 'Выполнено', n: M.completed, accent: 'olive' },
    { label: 'Ошибки', n: M.errors, accent: 'brick' },
  ];
  return (
    <>
      <PageHead
        eyebrow="Производство"
        title="Заявки на производство"
        desc="Автоматическое проведение заявок через этапы производства. Вы видите все заявки (режим администратора)."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('request_add')}>Создать заявку</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(5, 1fr)'}}>
        {stats.map(s => <Stat key={s.label} label={s.label} value={s.n} accent={s.accent}/>)}
      </div>
      <ListToolbar search="Поиск по заявкам…" filters={['Статус: все', 'Период: 30 дней', 'Заявитель: все']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>№</th><th>Создана</th><th>Обновлена</th><th>Заявитель</th>
              <th>Продукция</th><th className="num">Кол-во</th><th>Статус</th><th>Причина</th><th></th>
            </tr>
          </thead>
          <tbody>
            {M.recentRequests.map(r => (
              <tr key={r.id}>
                <td className="id">#{r.id}</td>
                <td className="muted">{r.date}</td>
                <td className="muted">{r.date}</td>
                <td>{r.applicant}</td>
                <td className="strong">{r.product}</td>
                <td className="num">{r.qty}</td>
                <td><StatusBadge status={r.status}/></td>
                <td className="muted" style={{maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {r.reason || '—'}
                </td>
                <td><Btn sm icon="eye">Открыть</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Raw materials -----
const RawPage = () => {
  const [open, setOpen] = React.useState(false);
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Склад"
        title="Сырьё"
        desc="Журнал сырья на складе. Количество обновляется автоматически при закупках и производстве."
        actions={<Btn kind="primary" icon="plus" onClick={() => setOpen(true)}>Добавить вид сырья</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>
        <Stat label="Видов сырья" value={M.rawMaterials.length} accent="steel"/>
        <Stat label="Низкий остаток" value={M.rawMaterials.filter(r => r.low).length} accent="brick"/>
        <Stat label="Стоимость склада" value={M.rawMaterials.reduce((s, r) => s + r.sum, 0).toLocaleString('ru-RU')} unit="сом" accent="olive"/>
        <Stat label="Закупок за месяц" value={M.purchases.length * 4} accent="amber"/>
      </div>
      <ListToolbar search="Поиск по сырью…" filters={['Категория: все', 'Только низкий остаток']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Наименование</th><th>Ед. изм.</th><th className="num">Количество</th><th className="num">Стоимость</th><th></th></tr>
          </thead>
          <tbody>
            {M.rawMaterials.map(r => (
              <tr key={r.id}>
                <td className="id">{String(r.id).padStart(3,'0')}</td>
                <td>
                  <div className="strong">{r.name}</div>
                  {r.low && <Badge kind="brick">Низкий остаток</Badge>}
                </td>
                <td className="muted">{r.unit}</td>
                <td className="num">{r.qty}</td>
                <td className="num">{r.sum.toLocaleString('ru-RU')} <span className="muted">сом</span></td>
                <td>
                  <div className="row gap-2">
                    <Btn sm icon="edit"/>
                    <Btn sm icon="trash" kind="danger"/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={open}
        title="Добавить вид сырья"
        onClose={() => setOpen(false)}
        footer={<><Btn onClick={() => setOpen(false)}>Отмена</Btn><Btn kind="primary" onClick={() => setOpen(false)}>Добавить</Btn></>}
      >
        <Field label="Наименование" required><input className="input" placeholder="Мука высшего сорта"/></Field>
        <Field label="Единица измерения">
          <select className="select">
            {MOCK.units.map(u => <option key={u.id}>{u.desc} ({u.name})</option>)}
          </select>
        </Field>
      </Modal>
    </>
  );
};

// ----- Finished products -----
const ProductsPage = () => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Склад"
        title="Готовая продукция"
        desc="Виды продукции, которые производит фабрика. Цены, остатки и рецептуры."
        actions={<Btn kind="primary" icon="plus">Добавить продукцию</Btn>}
      />
      <ListToolbar search="Поиск по продукции…"/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Наименование</th><th>Ед.</th><th className="num">На складе</th><th className="num">Цена</th><th className="num">Стоимость</th><th></th></tr>
          </thead>
          <tbody>
            {M.finishedProducts.map(p => (
              <tr key={p.id}>
                <td className="id">{String(p.id).padStart(3,'0')}</td>
                <td className="strong">{p.name}</td>
                <td className="muted">{p.unit}</td>
                <td className="num">{p.qty.toLocaleString('ru-RU')}</td>
                <td className="num">{p.price} <span className="muted">сом</span></td>
                <td className="num">{(p.qty * p.price).toLocaleString('ru-RU')} <span className="muted">сом</span></td>
                <td><div className="row gap-2"><Btn sm icon="recipe">Рецепт</Btn><Btn sm icon="edit"/></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Recipes (ingredients) -----
const RecipesPage = () => {
  const M = MOCK;
  const products = [...new Set(M.ingredients.map(i => i.product))];
  return (
    <>
      <PageHead
        eyebrow="Склад"
        title="Рецептуры"
        desc="Сколько сырья требуется на единицу готовой продукции. Используется при производстве для автосписания."
        actions={<Btn kind="primary" icon="plus">Новая рецептура</Btn>}
      />
      <ListToolbar search="Поиск рецептур…"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:16}}>
        {products.map(prod => {
          const items = M.ingredients.filter(i => i.product === prod);
          return (
            <div className="panel" key={prod}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">{prod}</div>
                  <div className="panel-sub" style={{marginTop:4}}>{items.length} компонентов</div>
                </div>
                <Btn sm icon="edit"/>
              </div>
              <div className="panel-body">
                {items.map(i => (
                  <div key={i.material} className="kv-row">
                    <span className="k">{i.material}</span>
                    <span className="v">{i.qty} {i.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ----- Purchases -----
const PurchasesPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Операции"
        title="Закупки сырья"
        desc="Журнал всех закупок. Бюджет уменьшается автоматически после каждой закупки."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('purchase_add')}>Новая закупка</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
        <Stat label="Закупок за месяц" value={M.purchases.length} accent="brick"/>
        <Stat label="Сумма за месяц" value={M.totals.purchases.toLocaleString('ru-RU')} unit="сом" accent="brick"/>
        <Stat label="Средний чек" value={Math.round(M.totals.purchases / M.purchases.length).toLocaleString('ru-RU')} unit="сом" accent="gray"/>
      </div>
      <ListToolbar filters={['Период: 30 дней', 'Сырьё: все', 'Сотрудник: все']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Дата</th><th>Сырьё</th><th className="num">Кол-во</th><th className="num">Сумма</th><th>Сотрудник</th><th></th></tr>
          </thead>
          <tbody>
            {M.purchases.map(p => (
              <tr key={p.id}>
                <td className="id">#{p.id}</td>
                <td className="muted">{p.date}</td>
                <td className="strong">{p.material}</td>
                <td className="num">{p.qty}</td>
                <td className="num"><Badge kind="brick">−{p.sum.toLocaleString('ru-RU')} сом</Badge></td>
                <td>{p.employee}</td>
                <td><Btn sm icon="eye"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Production -----
const ProductionPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Операции"
        title="Производство"
        desc="Журнал производственных операций. При записи система автоматически списывает сырьё по рецептуре."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('production_add')}>Новая операция</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
        <Stat label="Операций за месяц" value={M.productions.length} accent="olive"/>
        <Stat label="Произведено единиц" value={M.productions.reduce((s, p) => s + p.qty, 0).toLocaleString('ru-RU')} accent="olive"/>
        <Stat label="Выполнено заявок" value={M.completed} accent="olive"/>
      </div>
      <ListToolbar filters={['Период: 30 дней', 'Продукция: все']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Дата</th><th>Продукция</th><th className="num">Произведено</th><th>Сотрудник</th><th></th></tr>
          </thead>
          <tbody>
            {M.productions.map(p => (
              <tr key={p.id}>
                <td className="id">#{p.id}</td>
                <td className="muted">{p.date}</td>
                <td className="strong">{p.product}</td>
                <td className="num"><Badge kind="olive">+{p.qty} ед.</Badge></td>
                <td>{p.employee}</td>
                <td><Btn sm icon="eye"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Sales -----
const SalesPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Операции"
        title="Продажи"
        desc="Журнал продаж готовой продукции. Выручка автоматически зачисляется в бюджет."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('sales_add')}>Новая продажа</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
        <Stat label="Продаж за месяц" value={M.sales.length} accent="olive"/>
        <Stat label="Выручка" value={M.totals.sales.toLocaleString('ru-RU')} unit="сом" accent="olive" trend={<><Icons.trendUp className="ico"/> <span className="up">+12,4%</span> к прошлому месяцу</>}/>
        <Stat label="Средний чек" value={Math.round(M.totals.sales / M.sales.length).toLocaleString('ru-RU')} unit="сом"/>
      </div>
      <ListToolbar filters={['Период: 30 дней']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Дата</th><th>Продукция</th><th className="num">Кол-во</th><th className="num">Выручка</th><th>Сотрудник</th><th></th></tr>
          </thead>
          <tbody>
            {M.sales.map(s => (
              <tr key={s.id}>
                <td className="id">#{s.id}</td>
                <td className="muted">{s.date}</td>
                <td className="strong">{s.product}</td>
                <td className="num">{s.qty}</td>
                <td className="num"><Badge kind="olive">+{s.sum.toLocaleString('ru-RU')} сом</Badge></td>
                <td>{s.employee}</td>
                <td><Btn sm icon="eye"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Employees -----
const EmployeesPage = () => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Справочники"
        title="Сотрудники"
        desc="Все сотрудники предприятия с должностями, контактами и окладом."
        actions={<Btn kind="primary" icon="plus">Добавить сотрудника</Btn>}
      />
      <ListToolbar search="Поиск по сотрудникам…" filters={['Должность: все', 'Только активные']}/>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>#</th><th>ФИО</th><th>Должность</th><th>Телефон</th><th className="num">Оклад, сом</th><th></th></tr>
          </thead>
          <tbody>
            {M.employees.map(e => (
              <tr key={e.id}>
                <td className="id">{String(e.id).padStart(3,'0')}</td>
                <td>
                  <div className="row gap-2">
                    <div className="user-avatar" style={{width:30, height:30, fontSize:11}}>
                      {e.name.split(' ').slice(0,2).map(s => s[0]).join('')}
                    </div>
                    <div className="strong">{e.name}</div>
                  </div>
                </td>
                <td><Badge kind="steel" flat>{e.position}</Badge></td>
                <td className="muted mono">{e.phone}</td>
                <td className="num">{e.salary.toLocaleString('ru-RU')}</td>
                <td>
                  <div className="row gap-2">
                    <Btn sm icon="edit"/>
                    <Btn sm icon="trash" kind="danger"/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Positions -----
const PositionsPage = () => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Справочники"
        title="Должности"
        desc="Список должностей сотрудников."
        actions={<Btn kind="primary" icon="plus">Добавить должность</Btn>}
      />
      <div className="panel">
        <table className="table">
          <thead><tr><th>#</th><th>Название</th><th className="num">Сотрудников</th><th></th></tr></thead>
          <tbody>
            {M.positions.map(p => (
              <tr key={p.id}>
                <td className="id">{String(p.id).padStart(3,'0')}</td>
                <td className="strong">{p.name}</td>
                <td className="num">{p.employees}</td>
                <td><div className="row gap-2"><Btn sm icon="edit"/><Btn sm icon="trash" kind="danger"/></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ----- Units -----
const UnitsPage = () => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Справочники"
        title="Единицы измерения"
        desc="Используются для сырья и готовой продукции."
        actions={<Btn kind="primary" icon="plus">Добавить единицу</Btn>}
      />
      <div className="panel">
        <table className="table">
          <thead><tr><th>#</th><th>Сокращение</th><th>Описание</th><th></th></tr></thead>
          <tbody>
            {M.units.map(u => (
              <tr key={u.id}>
                <td className="id">{String(u.id).padStart(2,'0')}</td>
                <td className="strong mono">{u.name}</td>
                <td>{u.desc}</td>
                <td><div className="row gap-2"><Btn sm icon="edit"/><Btn sm icon="trash" kind="danger"/></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

Object.assign(window, { RequestsPage, RawPage, ProductsPage, RecipesPage, PurchasesPage, ProductionPage, SalesPage, EmployeesPage, PositionsPage, UnitsPage });
