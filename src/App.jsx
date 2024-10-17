import React from 'react';
import { ToastProvider } from './components/ui/toast';
import Footer from './components/ui/footer';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <div className="App">
    <ToastProvider>
      <Dashboard />
      <Footer />
    </ToastProvider>
    </div>
  );
};

export default App;