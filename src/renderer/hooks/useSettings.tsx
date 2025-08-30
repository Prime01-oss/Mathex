import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useSettings = () => {
    const { i18n } = useTranslation();
    
    // This is the key change that prevents the loop.
    // We get the changeLanguage function itself, which doesn't change on every render.
    const { changeLanguage } = i18n;

    const [lang, setLang] = useState(i18n.language || 'en');
    const [theme, setTheme] = useState<'light' | 'dark'>(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    const [accentColor, setAccentColor] = useState<string>('#8c4bff');

    useEffect(() => {
        // This effect now only runs when the `lang` variable changes, breaking the loop.
        changeLanguage(lang);
    }, [lang, changeLanguage]);

    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        document.body.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    return {
        lang,
        setLang,
        theme,
        setTheme,
        accentColor,
        setAccentColor
    }
}

