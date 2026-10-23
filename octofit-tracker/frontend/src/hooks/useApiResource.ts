import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ResourceState<T> = {
  data?: T;
  loading: boolean;
  error: boolean;
};

export function useApiResource<T>(path: string): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ loading: true, error: false });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: false });
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ data, loading: false, error: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: true });
      });
    return () => { active = false; };
  }, [path]);

  return state;
}