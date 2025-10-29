const logoImage = 'https://i.imgur.com/I768xBG.png';

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <img 
      src={logoImage} 
      alt="Happy Teeth Support Services" 
      className={className}
    />
  );
};

export const logoSrc = logoImage;
