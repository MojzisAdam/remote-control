import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const EmptyDeviceState: React.FC<{ onAddDevice: () => void }> = ({ onAddDevice }) => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="flex justify-center items-center p-4 mt-12 
      transition-colors duration-300">
      <Card className="w-full max-w-md 
        border border-gray-200 dark:border-zinc-700 
        shadow-sm dark:shadow-xl 
        rounded-xl 
        bg-gray-50 dark:bg-zinc-900 
        transition-colors duration-300">
        <div className="relative pt-16 pb-8 px-6">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center justify-center w-16 h-16
              bg-gradient-to-r 
              from-neutral-100 to-neutral-200
              dark:from-neutral-700 dark:to-neutral-800
              rounded-full shadow-md
              transition-all duration-300">
              <Layers className="w-8 h-8 
                text-neutral-600 
                dark:text-neutral-300 
                stroke-[1.5]" />
            </div>
          </div>
         
          <h2 className="text-2xl font-bold text-center 
            text-gray-900 dark:text-gray-100 
            mb-4 tracking-tight 
            animate-fade-in-up">
            {t('no-device-added-title')}
          </h2>
         
          <CardContent className="text-center space-y-6 p-0">
            <p className="text-gray-600 dark:text-gray-300 
              leading-relaxed
              max-w-md mx-auto opacity-80 
              animate-fade-in-up animation-delay-200">
              {t('no-device-added-text')}
            </p>
           
            <Button
              onClick={onAddDevice}
              className="w-full max-w-[200px] mx-auto flex items-center justify-center gap-3
             
              transition-all duration-300 ease-in-out
              py-4 rounded-xl
              transform hover:-translate-y-1 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
              <span className="font-semibold text-base">
                {t('add-device-button')}
              </span>
            </Button>
           
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 
                uppercase tracking-wider">
                {t('empty-state-hint', 'Get Started')}
              </span>
              <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default EmptyDeviceState;