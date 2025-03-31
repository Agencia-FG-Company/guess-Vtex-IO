import React, { useEffect } from "react";

interface ICategoryValidator {
  children: React.ReactNode;
}

const CategoryValidator = ({ children }: ICategoryValidator) => {
  useEffect(() => {
    const validPaths = [
      '/bolsas',
      '/bolsas/transversal',
      '/bolsas/tiracolo',
      '/bolsas/satchel',
      '/bolsas/tote',
      '/feminino',
      '/masculino',
      '/feminino/roupas/camisetas',
      '/feminino/roupas/blusas',
      '/masculino/roupas/camisetas',
      '/sale',
    ];
    console.log("teste path" , window.location.pathname);
    if (validPaths.includes(window.location.pathname)) {
      const container = document.querySelector('.vtex-search-result-3-x-orderByOptionsContainer');
      const orderByOptionItems = Array.from(document.querySelectorAll('.vtex-search-result-3-x-orderByOptionItem'));

      const maisRecentes = orderByOptionItems.find(item => item.textContent?.trim() === 'Mais recentes');
      console.log("mais recentes", maisRecentes)
      if (container && maisRecentes) { 
        
        container.removeChild(maisRecentes);
        container.insertBefore(maisRecentes, container.firstChild);
      if(maisRecentes instanceof HTMLElement){
        maisRecentes.click();
      }
      }
    }
  }, []);

  return <>{children}</>;
};

export default CategoryValidator;
