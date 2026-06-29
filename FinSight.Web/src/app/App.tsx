import { AppRoutes } from "./routes";
import { AppLayout } from "../components/layout/AppLayout";

export function App() {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}