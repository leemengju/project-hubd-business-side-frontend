import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../views/Dashboard';
import CashFlowDashboard from '../views/CashFlowDashboard';
import CashFlow from '../views/CashFlow';
import CashFlowSettings from '../components/cash-flow/CashFlowSettings';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'cash-flow',
        element: <CashFlowDashboard />,
        children: [
          {
            path: '',
            element: <CashFlow />
          },
          {
            path: 'settings',
            element: <CashFlowSettings />
          }
        ]
      }
    ]
  }
]);

export default routes; 