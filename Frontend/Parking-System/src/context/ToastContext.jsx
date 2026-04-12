import { createContext, useCallback, useContext, useReducer, useMemo } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [action.toast, ...state];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const dismiss = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++nextId;
    dispatch({ type: 'ADD', toast: { id, type, title, message } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    }
    return id;
  }, []);

  const value = useMemo(() => {
    const wrappedToast = Object.assign(
      (opts) => toast(opts),
      {
        success: (title, message, opts) => toast({ type: 'success', title, message, ...opts }),
        error:   (title, message, opts) => toast({ type: 'error',   title, message, ...opts }),
        warning: (title, message, opts) => toast({ type: 'warning', title, message, ...opts }),
        info:    (title, message, opts) => toast({ type: 'info',    title, message, ...opts }),
      }
    );
    return { toast: wrappedToast, dismiss, toasts };
  }, [toast, dismiss, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
