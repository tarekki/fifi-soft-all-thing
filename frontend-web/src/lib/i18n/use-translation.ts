import { useLanguage } from './context';

export function useTranslation() {
    const { t, language, setLanguage, direction } = useLanguage();
    return { t, language, setLanguage, direction };
}
