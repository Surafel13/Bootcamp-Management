import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from './app/store';
import { queryClient } from './lib/queryClient';
import AppRouter from './app/router';
import ToastContainer from './components/shared/ToastContainer';
// import ThemeSync from '../components/shared/ThemeSync'; 

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* <ThemeSync />    */}
          <AppRouter />
          <ToastContainer />
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  );
}