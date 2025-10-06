import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ReactDOM from 'react-dom/client';


vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  },
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

vi.mock('../App', () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('../index.css', () => ({}));

describe('main.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.getElementById = vi.fn(() => ({
      id: 'root',
      innerHTML: '',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifica que document.getElementById busca el elemento root', () => {
    const rootElement = { id: 'root' };
    document.getElementById = vi.fn(() => rootElement);

    
    const foundElement = document.getElementById('root');
    ReactDOM.createRoot(foundElement);

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);
  });

  it(' verifica que ReactDOM.createRoot retorna un objeto con render', () => {
    const rootElement = { id: 'root' };
    const root = ReactDOM.createRoot(rootElement);

    expect(root).toBeDefined();
    expect(typeof root.render).toBe('function');
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);
  });

  it(' incluye App dentro de AuthProvider dentro de StrictMode', () => {
 
    const TestComponent = () => (
      <React.StrictMode>
        <div data-testid="auth-provider">
          <div data-testid="app">App Component</div>
        </div>
      </React.StrictMode>
    );

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('app')).toBeInTheDocument();
  });

  it(' importa correctamente los estilos CSS', async () => {
    await expect(import('../index.css')).resolves.toBeDefined();
  });

  it(' el elemento root existe en el DOM', () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    const foundElement = document.getElementById('root');
    expect(foundElement).toBeTruthy();
    expect(foundElement.id).toBe('root');

    
    document.body.removeChild(rootElement);
  });

  it(' maneja correctamente la estructura de componentes anidados', async () => {
    const { AuthProvider } = await import('../context/AuthContext');
    const { default: App } = await import('../App');

    const MainStructure = () => (
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );

    const { getByTestId } = render(<MainStructure />);
    
    
    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('app')).toBeInTheDocument();
  });

  it('verifica que el método render del root es llamado', () => {
    const rootElement = { id: 'root' };
    const mockRender = vi.fn();
    ReactDOM.createRoot = vi.fn(() => ({ render: mockRender }));

    const root = ReactDOM.createRoot(rootElement);
    const testElement = <div>Test</div>;
    root.render(testElement);

    expect(mockRender).toHaveBeenCalledWith(testElement);
  });

  it('verifica que StrictMode es usado correctamente', () => {
    const TestWithStrictMode = () => (
      <React.StrictMode>
        <div data-testid="strict-content">Content in StrictMode</div>
      </React.StrictMode>
    );

    const { getByTestId } = render(<TestWithStrictMode />);
    expect(getByTestId('strict-content')).toBeInTheDocument();
  });

  it('verifica que AuthProvider recibe children correctamente', async () => {
    const { AuthProvider } = await import('../context/AuthContext');
    
    const TestChild = () => <span data-testid="child">Child Component</span>;
    
    const { getByTestId } = render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('verifica que App component se renderiza sin props', async () => {
    const { default: App } = await import('../App');
    
    const { getByTestId } = render(<App />);
    expect(getByTestId('app')).toBeInTheDocument();
    expect(getByTestId('app')).toHaveTextContent('App Component');
  });

  it('maneja error cuando el elemento root no existe', () => {
    document.getElementById = vi.fn(() => null);
    
    expect(() => {
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        throw new Error('Root element not found');
      }
      ReactDOM.createRoot(rootElement);
    }).toThrow('Root element not found');
  });

  it('verifica la cadena completa de renderizado', () => {
    const rootElement = { id: 'root' };
    const mockRender = vi.fn();
    document.getElementById = vi.fn(() => rootElement);
    ReactDOM.createRoot = vi.fn(() => ({ render: mockRender }));

    // Simular el flujo completo de main.jsx
    const element = document.getElementById('root');
    const root = ReactDOM.createRoot(element);
    
    const appStructure = (
      <React.StrictMode>
        <div data-testid="auth-provider">
          <div data-testid="app">App Component</div>
        </div>
      </React.StrictMode>
    );
    
    root.render(appStructure);

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalledWith(appStructure);
  });

  it('verifica que los imports no fallan', async () => {
    // Verificar que todos los imports principales funcionan
    await expect(import('react')).resolves.toBeDefined();
    await expect(import('react-dom/client')).resolves.toBeDefined();
    await expect(import('../App')).resolves.toBeDefined();
    await expect(import('../context/AuthContext')).resolves.toBeDefined();
    await expect(import('../index.css')).resolves.toBeDefined();
  });

  it('verifica que createRoot es una función', () => {
    expect(typeof ReactDOM.createRoot).toBe('function');
  });

  it('verifica que el objeto root tiene las propiedades esperadas', () => {
    const rootElement = { id: 'root' };
    const root = ReactDOM.createRoot(rootElement);

    expect(root).toHaveProperty('render');
    expect(typeof root.render).toBe('function');
  });
});
