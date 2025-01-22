'use client';
import Image from 'next/image';

export default function Paiement() {
  const paymentData = [
    {
      icon: "assets/images/illustrations/page-accueil/card-1.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-2.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    },
    {
      icon: "assets/images/illustrations/page-accueil/card-3.png",
      description: "Cartes acceptées au restaurant pour tous paiements"
    }
  ];

  return (
    <div className="relative min-h-[70vh] bg-primary-100 pt-16 md:py-0">
      {/* Background Image */}
      <div className="h-full w-full hidden md:block">
        <Image
          src="/assets/images/backgrounds/special-menu.png"
          alt="Food background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Background overlay */}
      <div className="hidden md:block bg-primary-100 md:bg-primary w-full h-40 absolute bottom-0"></div>      
      
      {/* Cards container */}
      <div className="relative md:absolute my-auto md:my-auto bottom-10 w-full px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 max-w-6xl mx-auto">
          {paymentData.map((item, index) => (
            <div 
              key={index} 
              className="w-full md:flex-1 md:min-w-[250px] max-w-sm"
            >
              <div className="bg-[#FFF5EE] rounded-3xl p-6 md:p-4 flex flex-col items-center text-center md:bg-transparent">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                  <Image
                    src={`/${item.icon}`}
                    alt="Payment method"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-primary md:text-white">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>    
    </div>
  );
}