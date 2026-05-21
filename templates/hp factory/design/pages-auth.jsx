// Auth: Login + Register

const PosterArt = () => (
  <svg viewBox="0 0 400 280" style={{width:'100%', maxWidth: 420, marginTop: 40}}>
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0v20" fill="none" stroke="oklch(0.40 0.05 130)" strokeWidth="0.5" opacity="0.4"/>
      </pattern>
    </defs>
    <rect width="400" height="280" fill="url(#grid)" opacity="0.3"/>
    {/* simple factory silhouette */}
    <g stroke="oklch(0.85 0.08 130)" strokeWidth="1.5" fill="none">
      <path d="M40 240 L40 160 L100 180 L100 140 L160 170 L160 110 L260 160 L260 240 Z"/>
      <rect x="280" y="100" width="36" height="140"/>
      <rect x="320" y="80" width="36" height="160"/>
      <path d="M280 120 Q290 100 290 80 M320 100 Q330 80 330 60"/>
      <line x1="20" y1="240" x2="380" y2="240"/>
      {/* windows */}
      <rect x="60" y="190" width="14" height="14"/>
      <rect x="90" y="190" width="14" height="14"/>
      <rect x="120" y="190" width="14" height="14"/>
      <rect x="180" y="180" width="14" height="14"/>
      <rect x="210" y="180" width="14" height="14"/>
      <rect x="240" y="180" width="14" height="14"/>
    </g>
  </svg>
);

const LoginPage = ({ go }) => (
  <div className="auth-shell">
    <div className="auth-poster">
      <div className="grain"></div>
      <div className="top">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="brand-mark" style={{background:'var(--paper)', color:'var(--ink)'}}>F</div>
          <div>
            <div style={{fontFamily:'var(--display)', fontWeight:600, fontSize:18}}>Фабрика</div>
            <div style={{fontSize:11, color:'oklch(0.70 0.01 85)', textTransform:'uppercase', letterSpacing:'.1em'}}>HP · Управление производством</div>
          </div>
        </div>
        <h1 className="auth-headline" style={{marginTop: 80}}>
          Каждая <em>лепёшка</em><br/>учтена.<br/>Каждый <em>сом</em> — на месте.
        </h1>
        <p className="auth-sub">
          Система для пекарного производства: сырьё, рецептуры, заявки, продажи, финансы. Всё в одном месте.
        </p>
        <PosterArt/>
      </div>
      <div className="bottom" style={{fontSize:12, color:'oklch(0.65 0.01 85)'}}>
        © 2024–2026 HP Factory. Учебный проект.
      </div>
    </div>

    <div className="auth-card-wrap">
      <div className="auth-card">
        <div style={{fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12}}>
          Вход в систему
        </div>
        <h2>Добро пожаловать</h2>
        <p className="lead">Войдите, чтобы продолжить работу.</p>

        <div className="auth-fields">
          <Field label="Логин" required>
            <input className="input" placeholder="ivanov" defaultValue="aturson"/>
          </Field>
          <Field label="Пароль" required>
            <input className="input" type="password" placeholder="••••••••" defaultValue="passw0rd"/>
          </Field>

          <div className="row between" style={{marginTop:4}}>
            <label style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--ink-2)'}}>
              <input type="checkbox" defaultChecked/> Запомнить меня
            </label>
            <a className="btn-link" style={{fontSize:13}}>Забыли пароль?</a>
          </div>

          <button className="btn btn-primary" style={{justifyContent:'center', padding:'11px', marginTop:8}} onClick={() => go('dashboard')}>
            Войти
            <Icons.arrowR className="ico"/>
          </button>
        </div>

        <div className="divider">или</div>

        <button className="btn btn-ghost" style={{width:'100%', justifyContent:'center', padding:'10px'}} onClick={() => go('register')}>
          Создать новый аккаунт
        </button>

        <div className="auth-foot">
          Защита: CSRF · хеш bcrypt · Django-сессии
        </div>
      </div>
    </div>
  </div>
);

const RegisterPage = ({ go }) => (
  <div className="auth-shell">
    <div className="auth-poster">
      <div className="grain"></div>
      <div className="top">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="brand-mark" style={{background:'var(--paper)', color:'var(--ink)'}}>F</div>
          <div>
            <div style={{fontFamily:'var(--display)', fontWeight:600, fontSize:18}}>Фабрика</div>
            <div style={{fontSize:11, color:'oklch(0.70 0.01 85)', textTransform:'uppercase', letterSpacing:'.1em'}}>HP · Регистрация</div>
          </div>
        </div>
        <h1 className="auth-headline" style={{marginTop: 80}}>
          Один аккаунт<br/>— <em>вся</em> фабрика.
        </h1>
        <p className="auth-sub">
          После создания аккаунта администратор назначит вам роль: пекарь, бухгалтер или директор.
        </p>
      </div>
      <div className="bottom" style={{fontSize:12, color:'oklch(0.65 0.01 85)'}}>
        © 2024–2026 HP Factory.
      </div>
    </div>

    <div className="auth-card-wrap">
      <div className="auth-card" style={{maxWidth: 440}}>
        <div style={{fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12}}>
          Новый аккаунт
        </div>
        <h2>Создание учётной записи</h2>
        <p className="lead">Заполните данные, чтобы зарегистрироваться.</p>

        <div className="auth-fields">
          <div className="form-grid">
            <Field label="Имя"><input className="input" placeholder="Алишер"/></Field>
            <Field label="Фамилия"><input className="input" placeholder="Турсунов"/></Field>
          </div>
          <Field label="Логин" required hint="Латиница, без пробелов">
            <input className="input" placeholder="aturson"/>
          </Field>
          <Field label="Пароль" required hint="Минимум 8 символов, цифры и буквы">
            <input className="input" type="password" placeholder="••••••••"/>
          </Field>
          <Field label="Подтверждение пароля" required>
            <input className="input" type="password" placeholder="••••••••"/>
          </Field>
          <Field label="Должность">
            <select className="select">
              <option>— выберите —</option>
              <option>Директор</option>
              <option>Пекарь</option>
              <option>Кондитер</option>
              <option>Бухгалтер</option>
              <option>Кладовщик</option>
            </select>
          </Field>

          <button className="btn btn-primary" style={{justifyContent:'center', padding:'11px', marginTop:8}} onClick={() => go('login')}>
            Зарегистрироваться
          </button>
        </div>

        <div className="auth-foot">
          Уже есть аккаунт? <a className="btn-link" onClick={() => go('login')}>Войти</a>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { LoginPage, RegisterPage });
