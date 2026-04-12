import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const defaultTitle = 'ParkAdmin';
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;
  }, [title]);
}
