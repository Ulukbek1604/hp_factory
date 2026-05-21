// Finance pages: budget, salary list, credits list, credit_add, credit_pay, payment_schedule, reports

const BudgetPage = () => {
  const M = MOCK;
  const flow = [
    { date: '01.05', kind: 'in', label: 'Продажа лепёшек', sum: 2160 },
    { date: '01.05', kind: 'in', label: 'Продажа самсы', sum: 2000 },
    { date: '01.05', kind: 'out', label: 'Закупка муки', sum: -6200 },
    { date: '30.04', kind: 'out', label: 'Зарплаты (5 сотр.)', sum: -46000 },
    { date: '30.04', kind: 'in', label: 'Продажа лепёшек', sum: 2560 },
    { date: '30.04', kind: 'out', label: 'Закупка масла', sum: -7200 },
    { date: '29.04', kind: 'in', label: 'Продажа сухарей', sum: 480 },
    { date: '28.04', kind: 'out', label: 'Закупка мяса', sum: -16000 },
  ];
  return (
    <>
      <PageHead
        eyebrow="Финансы"
        title="Бюджет предприятия"
        desc="Текущий остаток на счёте предприятия. Изменяется автоматически при закупках, продажах, выплатах и кредитных операциях."
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div className="panel" style={{padding:'28px 32px'}}>
          <div className="page-eyebrow">Текущий бюджет</div>
          <div style={{display:'flex', alignItems:'baseline', gap:14, marginTop:8}}>
            <div style={{fontFamily:'var(--display)', fontSize:64, fontWeight:500, letterSpacing:'-0.03em', lineHeight:1, color:'var(--olive-ink)'}}>
              {M.budget.toLocaleString('ru-RU')}
            </div>
            <div style={{fontSize:18, color:'var(--ink-3)'}}>сом</div>
          </div>
          <div className="muted mt-3" style={{marginTop:10}}>Обновлён 01.05.2026 в 11:24</div>
          <div className="row gap-2 mt-6" style={{marginTop:24}}>
            <Btn kind="primary">Изменить вручную</Btn>
            <Btn icon="download">Выгрузить движения</Btn>
          </div>
        </div>

        <Panel title="Движение за 30 дней">
          <div className="kv-row"><span className="k">Доходы</span><span className="v" style={{color:'var(--olive-ink)'}}>+{M.totals.sales.toLocaleString('ru-RU')} сом</span></div>
          <div className="kv-row"><span className="k">Закупки сырья</span><span className="v" style={{color:'var(--brick-ink)'}}>−{M.totals.purchases.toLocaleString('ru-RU')} сом</span></div>
          <div className="kv-row"><span className="k">Зарплаты</span><span className="v" style={{color:'var(--brick-ink)'}}>−{M.totals.salary.toLocaleString('ru-RU')} сом</span></div>
          <div className="kv-row"><span className="k">Полученные кредиты</span><span className="v" style={{color:'var(--olive-ink)'}}>+{M.totals.credits.toLocaleString('ru-RU')} сом</span></div>
          <div className="kv-row"><span className="k">Выплаты по кредитам</span><span className="v" style={{color:'var(--brick-ink)'}}>−{M.totals.creditPayments.toLocaleString('ru-RU')} сом</span></div>
          <div className="kv-row" style={{borderTop:'2px solid var(--ink)', marginTop:6, paddingTop:10, fontWeight:600}}>
            <span>Чистое движение</span>
            <span style={{color:'var(--olive-ink)'}}>+{(M.totals.sales + M.totals.credits - M.totals.purchases - M.totals.salary - M.totals.creditPayments).toLocaleString('ru-RU')} сом</span>
          </div>
        </Panel>
      </div>

      <Panel title="Лента движений" sub="Все операции, влияющие на бюджет" flush>
        <table className="table">
          <thead><tr><th>Дата</th><th>Операция</th><th>Тип</th><th className="num">Сумма</th></tr></thead>
          <tbody>
            {flow.map((f, i) => (
              <tr key={i}>
                <td className="muted">{f.date}</td>
                <td className="strong">{f.label}</td>
                <td>{f.kind === 'in' ? <Badge kind="olive">Поступление</Badge> : <Badge kind="brick">Расход</Badge>}</td>
                <td className="num" style={{color: f.kind === 'in' ? 'var(--olive-ink)' : 'var(--brick-ink)', fontWeight:600}}>
                  {f.kind === 'in' ? '+' : '−'}{Math.abs(f.sum).toLocaleString('ru-RU')} сом
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="alert alert-info">
        <Icons.info className="ico"/>
        <div>
          <div className="title">Автоматические триггеры</div>
          <div>Бюджет обновляется триггерами БД: <span className="mono">trg_AfterPurchaseInsert</span>, <span className="mono">trg_AfterSaleInsert</span>, <span className="mono">trg_AfterSalaryInsert</span>, <span className="mono">trg_AfterCreditPayment</span>.</div>
        </div>
      </div>
    </>
  );
};

const SalaryListPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Финансы"
        title="Зарплаты"
        desc="Журнал выплат сотрудникам. После каждой выплаты бюджет уменьшается автоматически."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('salary_add')}>Новая выплата</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
        <Stat label="Выплат за месяц" value={M.salaries.length} accent="amber"/>
        <Stat label="ФОТ за месяц" value={M.totals.salary.toLocaleString('ru-RU')} unit="сом" accent="amber"/>
        <Stat label="Средний оклад" value={Math.round(M.totals.salary / M.salaries.length).toLocaleString('ru-RU')} unit="сом"/>
      </div>
      <ListToolbar filters={['Период: 30 дней', 'Сотрудник: все']}/>
      <div className="panel">
        <table className="table">
          <thead><tr><th>#</th><th>Дата</th><th>Сотрудник</th><th className="num">Сумма</th><th></th></tr></thead>
          <tbody>
            {M.salaries.map(s => (
              <tr key={s.id}>
                <td className="id">#{s.id}</td>
                <td className="muted">{s.date}</td>
                <td className="strong">{s.employee}</td>
                <td className="num"><Badge kind="brick">−{s.amount.toLocaleString('ru-RU')} сом</Badge></td>
                <td><Btn sm icon="eye"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const CreditsListPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Финансы"
        title="Кредиты"
        desc="Журнал кредитов предприятия. Активные, погашенные и просроченные кредиты с графиками платежей."
        actions={<Btn kind="primary" icon="plus" onClick={() => go('credit_add')}>Взять кредит</Btn>}
      />

      <div className="stats" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>
        <Stat label="Всего кредитов" value={M.credits.length} accent="gray"/>
        <Stat label="Активных" value={M.credits.filter(c => c.status === 'active').length} accent="amber"/>
        <Stat label="Получено" value={M.totals.credits.toLocaleString('ru-RU')} unit="сом" accent="steel"/>
        <Stat label="Остаток к погашению" value={M.totals.remainingCredit.toLocaleString('ru-RU')} unit="сом" accent="brick"/>
      </div>

      <div className="alert alert-warn">
        <Icons.warn className="ico"/>
        <div style={{flex:1}}>
          <div className="title">Подходит срок платежа</div>
          <div>Кредит #3 на 50 000 сом — оплатить до 15.05.2026.</div>
        </div>
        <Btn sm kind="ghost" onClick={() => go('credit_pay')}>Погасить</Btn>
      </div>

      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th className="num">Сумма</th><th className="num">Ставка</th><th className="num">Срок</th>
              <th className="num">К выплате</th><th className="num">Выплачено</th><th className="num">Остаток</th>
              <th>Статус</th><th>Дата</th><th></th>
            </tr>
          </thead>
          <tbody>
            {M.credits.map(c => (
              <tr key={c.id}>
                <td className="id">#{c.id}</td>
                <td className="num strong">{c.amount.toLocaleString('ru-RU')} сом</td>
                <td className="num">{c.rate}%</td>
                <td className="num muted">{c.term} мес</td>
                <td className="num">{c.totalToPay.toLocaleString('ru-RU')}</td>
                <td className="num"><Badge kind="olive">{c.paid.toLocaleString('ru-RU')}</Badge></td>
                <td className="num">{c.remaining > 0 ? <Badge kind="brick">{c.remaining.toLocaleString('ru-RU')}</Badge> : <span className="muted">0</span>}</td>
                <td><StatusBadge status={c.status}/></td>
                <td className="muted">{c.date}</td>
                <td>
                  <div className="row gap-2">
                    {c.status === 'active' && <Btn sm icon="check" kind="success" onClick={() => go('credit_pay')}>Платёж</Btn>}
                    <Btn sm icon="calendar" onClick={() => go('schedule')}>График</Btn>
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

const CreditAddPage = ({ go }) => (
  <FormShell
    eyebrow="Кредиты"
    title="Новый кредит"
    desc="Оформите получение кредита. Сумма зачислится в бюджет, будет создан график платежей."
    info={[
      'Бюджет увеличится на сумму кредита',
      'Будет создан график регулярных платежей',
      'Кредит появится в журнале со статусом «Активный»',
    ]}
    onCancel={() => go('credits')}
    onSubmit={() => go('credits')}
    submitLabel="Оформить кредит"
  >
    <div className="form-grid">
      <Field label="Сумма кредита" required>
        <div className="input-group"><input className="input" type="number" defaultValue="100000"/><span className="suffix">сом</span></div>
      </Field>
      <Field label="Процентная ставка" required>
        <div className="input-group"><input className="input" type="number" defaultValue="18" step="0.1"/><span className="suffix">% годовых</span></div>
      </Field>
      <Field label="Срок" required>
        <div className="input-group"><input className="input" type="number" defaultValue="12"/><span className="suffix">мес</span></div>
      </Field>
      <Field label="Дата получения">
        <input className="input" type="date" defaultValue="2026-05-01"/>
      </Field>
      <Field label="Банк/Кредитор">
        <input className="input" placeholder="Узпромстройбанк"/>
      </Field>
      <Field label="Цель кредита">
        <select className="select"><option>Оборотные средства</option><option>Закупка оборудования</option><option>Расширение производства</option></select>
      </Field>
    </div>
    <div className="panel" style={{background:'var(--paper-2)', marginTop:0}}>
      <div className="panel-head"><div className="panel-title" style={{fontSize:14}}>Расчёт платежа</div></div>
      <div className="panel-body">
        <div className="kv-row"><span className="k">Ежемесячный платёж</span><span className="v">9 167 сом</span></div>
        <div className="kv-row"><span className="k">Переплата по процентам</span><span className="v">10 000 сом</span></div>
        <div className="kv-row"><span className="k">Полная стоимость</span><span className="v" style={{fontFamily:'var(--display)', fontSize:18, fontWeight:600}}>110 000 сом</span></div>
      </div>
    </div>
  </FormShell>
);

const CreditPayPage = ({ go }) => (
  <FormShell
    eyebrow="Кредиты"
    title="Погашение кредита #3"
    desc="Оформите платёж по кредиту. Сумма будет списана с бюджета, остаток долга уменьшится."
    info={[
      'Бюджет уменьшится на сумму платежа',
      'Платёж попадёт в график как оплаченный',
      'При полном погашении статус кредита изменится на «Погашен»',
    ]}
    onCancel={() => go('credits')}
    onSubmit={() => go('credits')}
    submitLabel="Провести платёж"
  >
    <div className="panel" style={{background:'var(--paper-2)', marginTop:0, marginBottom:16}}>
      <div className="panel-body">
        <div className="kv-row"><span className="k">Кредит</span><span className="v">#3 на 50 000 сом · 22% · 6 мес</span></div>
        <div className="kv-row"><span className="k">Выплачено</span><span className="v">30 000 сом</span></div>
        <div className="kv-row"><span className="k">Остаток долга</span><span className="v" style={{color:'var(--brick-ink)', fontWeight:600}}>25 500 сом</span></div>
      </div>
    </div>
    <div className="form-grid">
      <Field label="Тип платежа" required>
        <select className="select">
          <option>Совмещённый (тело + проценты)</option>
          <option>Основной долг</option>
          <option>Только проценты</option>
          <option>Штраф</option>
        </select>
      </Field>
      <Field label="Сумма платежа" required>
        <div className="input-group"><input className="input" type="number" defaultValue="9500"/><span className="suffix">сом</span></div>
      </Field>
      <Field label="Дата платежа">
        <input className="input" type="date" defaultValue="2026-05-15"/>
      </Field>
      <Field label="Способ оплаты">
        <select className="select"><option>Безналичный (банк)</option><option>Наличные</option></select>
      </Field>
      <div className="full">
        <Field label="Примечание"><textarea className="textarea" rows={2} placeholder="Платёж за май"/></Field>
      </div>
    </div>
  </FormShell>
);

const ScheduleP = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="Кредиты"
        title="График платежей по кредиту #4"
        desc="200 000 сом · 18% годовых · 12 месяцев. Регулярные платежи каждый 15-й день месяца."
        actions={<Btn icon="print" onClick={() => window.print()}>Печать</Btn>}
      />
      <div className="stats" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>
        <Stat label="Сумма" value="200 000" unit="сом" accent="steel"/>
        <Stat label="Платежей всего" value="12" accent="gray"/>
        <Stat label="Оплачено" value="4 / 12" accent="olive"/>
        <Stat label="Остаток" value="145 200" unit="сом" accent="brick"/>
      </div>
      <Panel title="График" flush>
        <table className="table">
          <thead>
            <tr><th>№</th><th>Дата</th><th className="num">Тело</th><th className="num">Проценты</th><th className="num">Итого</th><th>Статус</th></tr>
          </thead>
          <tbody>
            {M.paymentSchedule.map(p => (
              <tr key={p.n}>
                <td className="id">{String(p.n).padStart(2,'0')}</td>
                <td className="muted">{p.date}</td>
                <td className="num">{p.principal.toLocaleString('ru-RU')}</td>
                <td className="num">{p.interest.toLocaleString('ru-RU')}</td>
                <td className="num strong">{p.total.toLocaleString('ru-RU')} сом</td>
                <td><StatusBadge status={p.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
};

// ----- Reports -----
const ReportsPage = () => {
  const M = MOCK;
  const barRef = React.useRef(null);
  const pieRef = React.useRef(null);
  const charts = React.useRef({ bar: null, pie: null });

  React.useEffect(() => {
    if (!window.Chart) return;
    Chart.defaults.color = 'oklch(0.42 0.012 80)';
    Chart.defaults.font.family = 'Inter, system-ui';
    Chart.defaults.borderColor = 'oklch(0.92 0.008 85)';
    if (charts.current.bar) charts.current.bar.destroy();
    if (charts.current.pie) charts.current.pie.destroy();
    charts.current.bar = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['Продажи', 'Закупки', 'Зарплаты', 'Кредиты получ.', 'Бюджет'],
        datasets: [{
          data: [M.totals.sales, M.totals.purchases, M.totals.salary, M.totals.credits, M.budget],
          backgroundColor: ['oklch(0.55 0.12 130)','oklch(0.55 0.14 35)','oklch(0.66 0.13 75)','oklch(0.48 0.07 240)','oklch(0.40 0.012 80)'],
          borderRadius: 4,
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v.toLocaleString('ru-RU') } } } }
    });
    charts.current.pie = new Chart(pieRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Закупки', 'Зарплаты', 'Выплаты по кредитам'],
        datasets: [{
          data: [M.totals.purchases, M.totals.salary, M.totals.creditPayments],
          backgroundColor: ['oklch(0.55 0.14 35)','oklch(0.66 0.13 75)','oklch(0.48 0.07 240)'],
          borderColor: 'oklch(0.985 0.004 85)', borderWidth: 4,
        }]
      },
      options: { plugins: { legend: { position: 'bottom', labels: { padding: 14, boxWidth: 10 } } }, cutout: '62%' }
    });
    return () => { charts.current.bar?.destroy(); charts.current.pie?.destroy(); };
  }, []);

  return (
    <>
      <PageHead
        eyebrow="Аналитика"
        title="Отчёты по предприятию"
        desc="Сводный отчёт по всем процессам: закупкам, производству, продажам, зарплатам и кредитам."
        actions={<><Btn icon="download">CSV</Btn><Btn kind="primary" icon="print" onClick={() => window.print()}>Печать в PDF</Btn></>}
      />

      <div className="tabs">
        <a className="tab active">Сводка</a>
        <a className="tab">Закупки</a>
        <a className="tab">Производство</a>
        <a className="tab">Продажи</a>
        <a className="tab">Зарплаты</a>
        <a className="tab">Кредиты</a>
      </div>

      <div className="stats" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>
        <Stat label="Доходы (продажи)" value={M.totals.sales.toLocaleString('ru-RU')} unit="сом" accent="olive" trend={<><Icons.trendUp className="ico"/> <span className="up">+12,4%</span></>}/>
        <Stat label="Расходы (закупки)" value={M.totals.purchases.toLocaleString('ru-RU')} unit="сом" accent="brick"/>
        <Stat label="Зарплаты" value={M.totals.salary.toLocaleString('ru-RU')} unit="сом" accent="amber"/>
        <Stat label="Текущий бюджет" value={M.budget.toLocaleString('ru-RU')} unit="сом" accent="steel"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16}}>
        <Panel title="Финансовый обзор">
          <div style={{height: 260}}><canvas ref={barRef}/></div>
        </Panel>
        <Panel title="Структура расходов">
          <div style={{height: 260}}><canvas ref={pieRef}/></div>
        </Panel>
      </div>

      <Panel title="Закупки сырья" sub="Лаба 1 — последние записи" flush>
        <table className="table">
          <thead><tr><th>#</th><th>Дата</th><th>Сырьё</th><th className="num">Кол-во</th><th className="num">Сумма</th><th>Сотрудник</th></tr></thead>
          <tbody>
            {M.purchases.map(p => (
              <tr key={p.id}>
                <td className="id">#{p.id}</td>
                <td className="muted">{p.date}</td>
                <td className="strong">{p.material}</td>
                <td className="num">{p.qty}</td>
                <td className="num"><Badge kind="brick">−{p.sum.toLocaleString('ru-RU')}</Badge></td>
                <td>{p.employee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Panel title="Производство" sub="Лаба 2" flush>
          <table className="table">
            <thead><tr><th>Дата</th><th>Продукция</th><th className="num">Кол-во</th></tr></thead>
            <tbody>{M.productions.map(p => (<tr key={p.id}><td className="muted">{p.date}</td><td className="strong">{p.product}</td><td className="num"><Badge kind="olive">+{p.qty}</Badge></td></tr>))}</tbody>
          </table>
        </Panel>
        <Panel title="Продажи" sub="Лаба 3" flush>
          <table className="table">
            <thead><tr><th>Дата</th><th>Продукция</th><th className="num">Сумма</th></tr></thead>
            <tbody>{M.sales.map(s => (<tr key={s.id}><td className="muted">{s.date}</td><td className="strong">{s.product}</td><td className="num"><Badge kind="olive">+{s.sum.toLocaleString('ru-RU')}</Badge></td></tr>))}</tbody>
          </table>
        </Panel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Panel title="Зарплаты" sub="Лаба 4" flush>
          <table className="table">
            <thead><tr><th>Дата</th><th>Сотрудник</th><th className="num">Сумма</th></tr></thead>
            <tbody>{M.salaries.map(s => (<tr key={s.id}><td className="muted">{s.date}</td><td className="strong">{s.employee}</td><td className="num"><Badge kind="brick">−{s.amount.toLocaleString('ru-RU')}</Badge></td></tr>))}</tbody>
          </table>
        </Panel>
        <Panel title="Кредиты" sub="Лаба 5" flush>
          <table className="table">
            <thead><tr><th>#</th><th className="num">Сумма</th><th className="num">Остаток</th><th>Статус</th></tr></thead>
            <tbody>{M.credits.map(c => (<tr key={c.id}><td className="id">#{c.id}</td><td className="num">{c.amount.toLocaleString('ru-RU')}</td><td className="num">{c.remaining.toLocaleString('ru-RU')}</td><td><StatusBadge status={c.status}/></td></tr>))}</tbody>
          </table>
        </Panel>
      </div>
    </>
  );
};

Object.assign(window, { BudgetPage, SalaryListPage, CreditsListPage, CreditAddPage, CreditPayPage, ScheduleP, ReportsPage });
