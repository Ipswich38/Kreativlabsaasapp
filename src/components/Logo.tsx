import logoImage from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';

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
