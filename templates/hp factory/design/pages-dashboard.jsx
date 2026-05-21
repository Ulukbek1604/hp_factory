// Dashboard page

const DashboardPage = ({ go }) => {
  const M = MOCK;
  return (
    <>
      <PageHead
        eyebrow="01.05.2026 · Пятница"
        title="Дашборд"
        desc="Сводка по производству, заявкам и финансам за последние 30 дней."
        actions={
          <>
            <Btn icon="download">Экспорт</Btn>
            <Btn kind="primary" icon="plus" onClick={() => go('request_add')}>Новая заявка</Btn>
          </>
        }
      />

      {/* Top row: hero number + sparkline-like grid */}
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, marginBottom:24}}>
        <div className="panel" style={{padding:'28px 32px'}}>
          <div className="page-eyebrow">Бюджет предприятия</div>
          <div style={{display:'flex', alignItems:'baseline', gap:14, marginTop:8}}>
            <div style={{fontFamily:'var(--display)', fontSize:64, fontWeight:500, letterSpacing:'-0.03em', lineHeight:1}}>
              {M.budget.toLocaleString('ru-RU')}
            </div>
            <div style={{fontSize:18, color:'var(--ink-3)'}}>сом</div>
          </div>
          <div style={{display:'flex', gap:24, marginTop:18, fontSize:13}}>
            <div><span className="muted">Доходы за месяц: </span><span className="num" style={{color:'var(--olive-ink)', fontWeight:600}}>+{M.totals.sales.toLocaleString('ru-RU')}</span></div>
            <div><span className="muted">Расходы: </span><span className="num" style={{color:'var(--brick-ink)', fontWeight:600}}>−{(M.totals.purchases + M.totals.salary).toLocaleString('ru-RU')}</span></div>
            <div><span className="muted">К оплате по кредитам: </span><span className="num" style={{fontWeight:600}}>{M.totals.remainingCredit.toLocaleString('ru-RU')}</span></div>
          </div>
          <Sparkline/>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Заявки</div>
            <Btn sm onClick={() => go('requests')}>Все →</Btn>
          </div>
          <div className="panel-body">
            <RequestDonut total={M.totalRequests} done={M.completed} progress={M.inProgress} err={M.errors}/>
          </div>
        </div>
      </div>

      {/* Strip stats */}
      <div className="stats">
        <Stat label="Видов сырья" value={M.rawCount} accent="steel" hint="2 позиции на исходе"/>
        <Stat label="Видов продукции" value={M.productCount} accent="olive"/>
        <Stat label="Сотрудников" value={M.employeeCount} accent="amber" hint="3 на смене"/>
        <Stat label="Активных кредитов" value={M.activeCredits} accent="brick" hint={`Долг ${M.creditDebt.toLocaleString('ru-RU')} сом`}/>
      </div>

      {/* Alert */}
      <div className="alert alert-warn">
        <Icons.warn className="ico"/>
        <div style={{flex:1}}>
          <div className="title">Подходит срок платежа по кредиту</div>
          <div>Кредит #3 на 50 000 сом — оплатить до 15.05.2026.</div>
        </div>
        <Btn sm kind="ghost" onClick={() => go('credit_pay')}>Погасить</Btn>
      </div>

      {/* Two-column data */}
      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16}}>
        <Panel
          title="Последние заявки на производство"
          action={<Btn sm onClick={() => go('requests')}>Открыть журнал →</Btn>}
          flush
        >
          <table className="table">
            <thead>
              <tr><th>№</th><th>Дата</th><th>Продукция</th><th className="num">Кол-во</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {M.recentRequests.slice(0, 6).map(r => (
                <tr key={r.id}>
                  <td className="id">#{r.id}</td>
                  <td className="muted">{r.date}</td>
                  <td className="strong">{r.product}</td>
                  <td className="num">{r.qty}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Последние закупки" action={<Btn sm onClick={() => go('purchases')}>Все →</Btn>}>
          <div>
            {M.purchases.slice(0, 5).map(p => (
              <div key={p.id} className="kv-row" style={{padding:'10px 0', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:500}}>{p.material}</div>
                  <div className="muted" style={{fontSize:12, marginTop:2}}>{p.date} · {p.employee}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="num" style={{fontWeight:600}}>{p.qty}</div>
                  <div className="muted num" style={{fontSize:12}}>−{p.sum.toLocaleString('ru-RU')} сом</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16}}>
        <Panel title="Низкие остатки сырья" sub="Меньше 10% от средней закупки">
          {M.rawMaterials.filter(r => r.low || r.qty < 30).slice(0, 4).map(r => {
            const max = 200;
            const pct = Math.min(100, (r.qty / max) * 100);
            return (
              <div key={r.id} style={{marginBottom:14}}>
                <div className="row between" style={{marginBottom:6}}>
                  <div style={{fontWeight:500}}>{r.name}</div>
                  <div className="num muted">{r.qty} {r.unit}</div>
                </div>
                <div className={`bar ${r.qty < 5 ? 'brick' : 'steel'}`}><i style={{width: pct + '%'}}/></div>
              </div>
            );
          })}
          <Btn sm onClick={() => go('purchase_add')} icon="plus" kind="soft">Заказать</Btn>
        </Panel>
        <Panel title="Топ-5 продукции по продажам" sub="За последние 30 дней">
          {[
            { name: 'Лепёшка тандырная', sold: 4280, sum: 51360 },
            { name: 'Самса с мясом', sold: 1820, sum: 45500 },
            { name: 'Лепёшка обычная', sold: 5400, sum: 43200 },
            { name: 'Чак-чак', sold: 96, sum: 17280 },
            { name: 'Самса с тыквой', sold: 720, sum: 15840 },
          ].map((p, i) => {
            const max = 51360;
            return (
              <div key={p.name} style={{marginBottom:12}}>
                <div className="row between" style={{marginBottom:6}}>
                  <div style={{fontWeight:500}}><span className="muted mono" style={{marginRight:8}}>{String(i+1).padStart(2,'0')}</span>{p.name}</div>
                  <div className="num"><span style={{fontWeight:600}}>{p.sum.toLocaleString('ru-RU')}</span> <span className="muted">сом</span></div>
                </div>
                <div className="bar"><i style={{width: (p.sum/max*100) + '%'}}/></div>
              </div>
            );
          })}
        </Panel>
      </div>
    </>
  );
};

const Sparkline = () => {
  // just an inline svg of a friendly trend line
  const pts = [40,42,44,43,46,49,52,50,55,58,57,62,65,68,72,70,75,80,82,85];
  const max = Math.max(...pts), min = Math.min(...pts);
  const w = 700, h = 80;
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i/(pts.length-1))*w} ${h - ((p-min)/(max-min))*h}`).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h+10}`} style={{width:'100%', height:90, marginTop:18}} preserveAspectRatio="none">
      <path d={area} fill="oklch(0.93 0.04 130)"/>
      <path d={path} fill="none" stroke="var(--olive)" strokeWidth="1.6"/>
      {pts.map((p, i) => i % 4 === 0 && (
        <circle key={i} cx={(i/(pts.length-1))*w} cy={h - ((p-min)/(max-min))*h} r="2.2" fill="var(--olive)"/>
      ))}
    </svg>
  );
};

const RequestDonut = ({ total, done, progress, err }) => {
  const created = total - done - progress - err;
  const segs = [
    { v: done, c: 'var(--olive)', label: 'Выполнено', n: done },
    { v: progress, c: 'var(--steel)', label: 'В работе', n: progress },
    { v: err, c: 'var(--brick)', label: 'Ошибка', n: err },
    { v: created, c: 'oklch(0.85 0.01 80)', label: 'Создано', n: created },
  ];
  const cx = 60, cy = 60, r = 48, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{display:'flex', alignItems:'center', gap:20}}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--paper-3)" strokeWidth="14"/>
        {segs.map((s, i) => {
          const len = (s.v/total) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -off;
          off += len;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth="14" strokeDasharray={dasharray} strokeDashoffset={dashoffset} transform={`rotate(-90 ${cx} ${cy})`}/>;
        })}
        <text x={cx} y={cy-2} textAnchor="middle" fontFamily="var(--display)" fontSize="28" fontWeight="500" fill="var(--ink)">{total}</text>
        <text x={cx} y={cy+16} textAnchor="middle" fontSize="10" fill="var(--ink-3)" letterSpacing="0.1em">ВСЕГО</text>
      </svg>
      <div style={{flex:1}}>
        {segs.map(s => (
          <div key={s.label} className="row between" style={{padding:'5px 0', fontSize:13}}>
            <div className="row gap-2">
              <span style={{width:8, height:8, borderRadius:2, background:s.c}}/>
              <span>{s.label}</span>
            </div>
            <span className="num" style={{fontWeight:600}}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { DashboardPage });
