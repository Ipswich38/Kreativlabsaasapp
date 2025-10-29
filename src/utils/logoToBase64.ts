const logo = 'https://i.imgur.com/I768xBG.png';

export async function getLogoAsBase64(): Promise<string> {
  try {
    const response = await fetch(logo);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = reject;
      
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting logo to base64:', error);
    throw error;
  }
}

export { logo };
