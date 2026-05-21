// Main app + router

const PAGES = {
  dashboard: DashboardPage,
  requests: RequestsPage,
  request_add: RequestAddPage,
  raw: RawPage,
  products: ProductsPage,
  recipes: RecipesPage,
  purchases: PurchasesPage,
  purchase_add: PurchaseAddPage,
  production: ProductionPage,
  production_add: ProductionAddPage,
  sales: SalesPage,
  sales_add: SalesAddPage,
  budget: BudgetPage,
  salary: SalaryListPage,
  salary_add: SalaryAddPage,
  credits: CreditsListPage,
  credit_add: CreditAddPage,
  credit_pay: CreditPayPage,
  schedule: ScheduleP,
  reports: ReportsPage,
  employees: EmployeesPage,
  positions: PositionsPage,
  units: UnitsPage,
  profile: ProfilePage,
  password: PasswordDemoPage,
};

const NARROW = new Set(['profile', 'password']);

const App = () => {
  const initial = (location.hash || '#dashboard').slice(1);
  const [route, setRoute] = React.useState(initial);
  const go = (r) => {
    setRoute(r);
    location.hash = r;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  React.useEffect(() => {
    const onHash = () => setRoute((location.hash || '#dashboard').slice(1));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // auth pages live outside the shell
  if (route === 'login') return <LoginPage go={go}/>;
  if (route === 'register') return <RegisterPage go={go}/>;

  const Page = PAGES[route] || DashboardPage;
  return (
    <Shell route={route} go={go} narrow={NARROW.has(route)}>
      <div data-screen-label={route}>
        <Page go={go}/>
      </div>
    </Shell>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
