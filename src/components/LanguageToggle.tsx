import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Language, getLanguage, setLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const [language, setLang] = useState<Language>('it');

  useEffect(() => {
    const savedLang = getLanguage();
    setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'it' ? 'en' : 'it';
    setLang(newLang);
    setLanguage(newLang);
    window.location.reload(); // Reload to apply translations
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="transition-transform hover:scale-110"
      aria-label="Toggle language"
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{language.toUpperCase()}</span>
    </Button>
  );
}