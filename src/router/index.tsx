import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import RouteGuard from './RouteGuard';

const router = createBrowserRouter(
  routes.map((route) => ({
    path: route.path,
    element: <RouteGuard route={route} />,
  })),
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

export { router };
