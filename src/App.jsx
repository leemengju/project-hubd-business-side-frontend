import AppRouter from "./routers/Routers.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4CAF50',
              color: '#fff',
            }
          },
          error: {
            duration: 4000,
            style: {
              background: '#F44336',
              color: '#fff',
            }
          }
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
