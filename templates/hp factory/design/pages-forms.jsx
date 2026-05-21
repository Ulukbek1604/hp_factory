// Form pages: request_add, purchase_add, production_add, sales_add, salary_add, profile, password

const FormShell = ({ title, eyebrow, desc, info, onCancel, onSubmit, submitLabel, children }) => (
  <>
    <PageHead eyebrow={eyebrow} title={title} desc={desc}/>
    <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24}}>
      <Panel>
        <div className="col gap-4">{children}</div>
        <div className="row gap-2 mt-6" style={{justifyContent:'flex-end', paddingTop:16, borderTop:'1px solid var(--rule)', marginTop:24, marginLeft:-20, marginRight:-20, marginBottom:-20, padding:'16px 20px'}}>
          <Btn onClick={onCancel}>Отмена</Btn>
          <Btn kind="primary" icon="check" onClick={onSubmit}>{submitLabel}</Btn>
        </div>
      </Panel>
      <div>
        {info && (
          <div className="alert alert-info">
            <Icons.info className="ico"/>
            <div>
              <div className="title">Что произойдёт при сохранении</div>
              <ul>{info.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);

const RequestAddPage = ({ go }) => (
  <FormShell
    eyebrow="Заявки"
    title="Новая заявка на производство"
    desc="Создайте заявку — система автоматически проверит наличие сырья и поставит заявку в работу."
    info={[
      'Будет проверена рецептура выбранной продукции',
      'Если сырья достаточно — заявка перейдёт в статус «В работе»',
      'Иначе — статус «Ошибка» с указанием недостающего сырья',
    ]}
    onCancel={() => go('requests')}
    onSubmit={() => go('requests')}
    submitLabel="Создать заявку"
  >
    <div className="form-grid">
      <Field label="Продукция" required>
        <select className="select">
          {MOCK.finishedProducts.map(p => <option key={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Количество" required hint="В единицах продукции">
        <div className="input-group">
          <input className="input" type="number" defaultValue="100"/>
          <span className="suffix">шт</span>
        </div>
      </Field>
      <Field label="Заявитель" required>
        <select className="select"><option>{MOCK.user.name}</option></select>
      </Field>
      <Field label="Желаемая дата">
        <input className="input" type="date" defaultValue="2026-05-02"/>
      </Field>
      <div className="full">
        <Field label="Комментарий">
          <textarea className="textarea" rows={3} placeholder="Например: для оптовой партии"/>
        </Field>
      </div>
    </div>
  </FormShell>
);

const PurchaseAddPage = ({ go }) => (
  <FormShell
    eyebrow="Закупки"
    title="Новая закупка сырья"
    desc="Зафиксируйте поступление сырья. Бюджет будет уменьшен автоматически."
    info={[
      'Сырьё добавится на склад (количество увеличится)',
      'Бюджет уменьшится на сумму закупки',
      'Запись попадёт в журнал закупок и отчёты',
    ]}
    onCancel={() => go('purchases')}
    onSubmit={() => go('purchases')}
    submitLabel="Зафиксировать закупку"
  >
    <div className="form-grid">
      <Field label="Сырьё" required>
        <select className="select">{MOCK.rawMaterials.map(m => <option key={m.id}>{m.name}</option>)}</select>
      </Field>
      <Field label="Сотрудник" required>
        <select className="select">{MOCK.employees.map(e => <option key={e.id}>{e.name}</option>)}</select>
      </Field>
      <Field label="Количество" required>
        <div className="input-group"><input className="input" type="number" defaultValue="100"/><span className="suffix">кг</span></div>
      </Field>
      <Field label="Сумма" required>
        <div className="input-group"><input className="input" type="number" defaultValue="6200"/><span className="suffix">сом</span></div>
      </Field>
      <Field label="Дата закупки">
        <input className="input" type="datetime-local" defaultValue="2026-05-01T09:00"/>
      </Field>
      <Field label="Поставщик">
        <input className="input" placeholder="ООО Алтын Дон"/>
      </Field>
    </div>
  </FormShell>
);

const ProductionAddPage = ({ go }) => (
  <FormShell
    eyebrow="Производство"
    title="Новая производственная операция"
    desc="Зафиксируйте производство партии готовой продукции."
    info={[
      'Будет проверена рецептура',
      'Сырьё спишется со склада автоматически',
      'Готовая продукция добавится на склад',
    ]}
    onCancel={() => go('production')}
    onSubmit={() => go('production')}
    submitLabel="Произвести"
  >
    <div className="form-grid">
      <Field label="Продукция" required>
        <select className="select">{MOCK.finishedProducts.map(p => <option key={p.id}>{p.name}</option>)}</select>
      </Field>
      <Field label="Количество" required>
        <div className="input-group"><input className="input" type="number" defaultValue="240"/><span className="suffix">шт</span></div>
      </Field>
      <Field label="Сотрудник" required>
        <select className="select">{MOCK.employees.map(e => <option key={e.id}>{e.name}</option>)}</select>
      </Field>
      <Field label="Дата производства">
        <input className="input" type="datetime-local" defaultValue="2026-05-01T10:00"/>
      </Field>
    </div>

    <div className="panel" style={{marginTop:0, background:'var(--paper-2)'}}>
      <div className="panel-head"><div className="panel-title" style={{fontSize:14}}>Расход сырья по рецептуре (на 240 шт)</div></div>
      <div className="panel-body">
        {MOCK.ingredients.filter(i => i.product === 'Лепёшка тандырная').map(i => (
          <div key={i.material} className="kv-row">
            <span className="k">{i.material}</span>
            <span className="v">{(i.qty * 240).toFixed(2)} {i.unit}</span>
          </div>
        ))}
      </div>
    </div>
  </FormShell>
);

const SalesAddPage = ({ go }) => (
  <FormShell
    eyebrow="Продажи"
    title="Новая продажа"
    desc="Зафиксируйте продажу готовой продукции. Выручка добавится в бюджет."
    info={[
      'Продукция спишется со склада',
      'Бюджет увеличится на сумму выручки',
      'Запись попадёт в журнал продаж',
    ]}
    onCancel={() => go('sales')}
    onSubmit={() => go('sales')}
    submitLabel="Зафиксировать продажу"
  >
    <div className="form-grid">
      <Field label="Продукция" required>
        <select className="select">{MOCK.finishedProducts.map(p => <option key={p.id}>{p.name}</option>)}</select>
      </Field>
      <Field label="Сотрудник" required>
        <select className="select">{MOCK.employees.filter(e => e.position === 'Бухгалтер').map(e => <option key={e.id}>{e.name}</option>)}</select>
      </Field>
      <Field label="Количество" required>
        <div className="input-group"><input className="input" type="number" defaultValue="180"/><span className="suffix">шт</span></div>
      </Field>
      <Field label="Сумма выручки" required>
        <div className="input-group"><input className="input" type="number" defaultValue="2160"/><span className="suffix">сом</span></div>
      </Field>
      <Field label="Дата продажи">
        <input className="input" type="datetime-local" defaultValue="2026-05-01T11:20"/>
      </Field>
      <Field label="Покупатель">
        <input className="input" placeholder="ИП Анваров"/>
      </Field>
    </div>
  </FormShell>
);

const SalaryAddPage = ({ go }) => (
  <FormShell
    eyebrow="Зарплата"
    title="Выплата зарплаты"
    desc="Зафиксируйте выплату оклада сотруднику."
    info={[
      'Бюджет уменьшится на сумму выплаты',
      'Запись попадёт в журнал зарплат',
    ]}
    onCancel={() => go('salary')}
    onSubmit={() => go('salary')}
    submitLabel="Выплатить"
  >
    <div className="form-grid">
      <Field label="Сотрудник" required>
        <select className="select">{MOCK.employees.map(e => <option key={e.id}>{e.name}</option>)}</select>
      </Field>
      <Field label="Сумма" required>
        <div className="input-group"><input className="input" type="number" defaultValue="8500"/><span className="suffix">сом</span></div>
      </Field>
      <Field label="Дата выплаты">
        <input className="input" type="date" defaultValue="2026-05-01"/>
      </Field>
      <Field label="Период">
        <input className="input" placeholder="Апрель 2026"/>
      </Field>
    </div>
  </FormShell>
);

const ProfilePage = () => {
  const u = MOCK.user;
  return (
    <>
      <PageHead eyebrow="Аккаунт" title="Профиль"/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Panel title="Личные данные">
          <div className="row gap-4 mb-4">
            <div className="user-avatar" style={{width:64, height:64, fontSize:20}}>{u.initials}</div>
            <div>
              <div style={{fontFamily:'var(--display)', fontSize:22, fontWeight:600, letterSpacing:'-0.01em'}}>{u.name}</div>
              <div className="muted">{u.role} · с 12.01.2024</div>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Имя"><input className="input" defaultValue="Алишер"/></Field>
            <Field label="Фамилия"><input className="input" defaultValue="Турсунов"/></Field>
            <Field label="Логин"><input className="input" defaultValue="aturson"/></Field>
            <Field label="Email"><input className="input" defaultValue="aturson@hpfactory.uz"/></Field>
            <div className="full"><Btn kind="primary">Сохранить изменения</Btn></div>
          </div>
        </Panel>

        <Panel title="Безопасность">
          <Field label="Текущий пароль" required><input className="input" type="password" placeholder="••••••••"/></Field>
          <Field label="Новый пароль" required hint="Минимум 8 символов"><input className="input" type="password"/></Field>
          <Field label="Подтверждение" required><input className="input" type="password"/></Field>
          <div className="alert alert-info" style={{marginTop:12}}>
            <Icons.lock className="ico"/>
            <div>
              <div className="title">Хеширование паролей</div>
              <div>Пароли хранятся в виде bcrypt-хешей. Сам пароль никогда не сохраняется в открытом виде.</div>
            </div>
          </div>
          <Btn kind="primary">Изменить пароль</Btn>
        </Panel>
      </div>

      <Panel title="История действий" sub="Последние входы и операции">
        <table className="table">
          <thead><tr><th>Дата</th><th>Действие</th><th>IP-адрес</th><th>Браузер</th></tr></thead>
          <tbody>
            <tr><td className="muted">01.05.2026 09:01</td><td>Вход в систему</td><td className="mono">192.168.1.42</td><td className="muted">Chrome 124 / macOS</td></tr>
            <tr><td className="muted">30.04.2026 18:22</td><td>Создана заявка #1284</td><td className="mono">192.168.1.42</td><td className="muted">Chrome 124 / macOS</td></tr>
            <tr><td className="muted">30.04.2026 14:51</td><td>Зафиксирована закупка #246</td><td className="mono">192.168.1.42</td><td className="muted">Chrome 124 / macOS</td></tr>
            <tr><td className="muted">30.04.2026 09:14</td><td>Вход в систему</td><td className="mono">192.168.1.42</td><td className="muted">Chrome 124 / macOS</td></tr>
          </tbody>
        </table>
      </Panel>
    </>
  );
};

const PasswordDemoPage = () => {
  const [pw, setPw] = React.useState('passw0rd');
  const hash = '$2b$12$' + btoa(pw + 'salt').slice(0, 22) + 'KqL9zEfYGqgCJZBR3Qv5uX7yY1F2';
  return (
    <>
      <PageHead
        eyebrow="Безопасность"
        title="Демо хеширования паролей"
        desc="Демонстрация: пароль превращается в необратимый хеш bcrypt. Хеш безопасно хранить в БД — восстановить из него исходный пароль практически невозможно."
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Panel title="Введите пароль">
          <Field label="Пароль">
            <input className="input mono" value={pw} onChange={e => setPw(e.target.value)}/>
          </Field>
          <div className="muted" style={{fontSize:12, marginTop:8}}>Длина: {pw.length} символов</div>
          <div className="bar mt-3" style={{marginTop:12}}>
            <i style={{width: Math.min(100, pw.length * 10) + '%', background: pw.length < 6 ? 'var(--brick)' : pw.length < 10 ? 'var(--amber)' : 'var(--olive)'}}/>
          </div>
          <div className="muted mt-3" style={{fontSize:12}}>Сложность: {pw.length < 6 ? 'слабый' : pw.length < 10 ? 'средний' : 'хороший'}</div>
        </Panel>

        <Panel title="Результат хеширования (bcrypt)">
          <div className="mono" style={{padding:'12px 14px', background:'var(--paper-2)', border:'1px solid var(--rule)', borderRadius:5, fontSize:12, wordBreak:'break-all'}}>
            {hash}
          </div>
          <div className="kv-row mt-3"><span className="k">Алгоритм</span><span className="v">bcrypt (Blowfish)</span></div>
          <div className="kv-row"><span className="k">Cost factor</span><span className="v">12</span></div>
          <div className="kv-row"><span className="k">Соль</span><span className="v">случайная, 16 байт</span></div>
          <div className="kv-row"><span className="k">Длина хеша</span><span className="v">60 символов</span></div>
        </Panel>
      </div>

      <div className="alert alert-info">
        <Icons.info className="ico"/>
        <div>
          <div className="title">Почему bcrypt?</div>
          <div>Алгоритм адаптивно медленный — даже на быстром железе подбор миллионов вариантов занимает годы. Соль защищает от атак по радужным таблицам.</div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { RequestAddPage, PurchaseAddPage, ProductionAddPage, SalesAddPage, SalaryAddPage, ProfilePage, PasswordDemoPage });
