import Motion from '@/lib/motion';
import Image from 'next/image';

const serviceItems = [
  { id: 1, name: "Passez une commande", picture: "assets/images/illustrations/page-accueil/service1.png", url: "https://app.eatself.com/3787/carte/0" },
  { id: 2, name: "Réservez une table", picture: "assets/images/illustrations/page-accueil/service2.png", url: "https://app.eatself.com/3787/carte/0" },
  { id: 3, name: "Trouver un restaurant", picture: "assets/images/illustrations/page-accueil/service3.png", url: "https://app.eatself.com/3787/carte/0" },
];

export default function Service() {
  return (
    <div className="bg-primary-50 px-4 py-10 my-0 md:my-8 relative flex flex-col md:flex-row gap-6 justify-center items-center">
      {serviceItems.map((item) => (
        <Motion key={item.id}  variant="verticalSlideIn" viewport={{ once: true, amount: 0.2 }}>
        <a 
          key={item.id} 
          href={item.url} 
          className="bg-white flex flex-col p-8 justify-between w-full md:w-auto items-center gap-4 rounded-2xl hover:shadow-lg transition-shadow"
        >
          <div className="relative w-32 h-32">
            <Image 
              src={`/${item.picture}`} 
              alt={item.name} 
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center text-xl text-primary-900">{item.name}</div>
        </a>
        </Motion>
      ))}
      <div className="hidden md:block absolute bottom-20 left-0 mt-4">
        <Motion variant="verticalSlideIn">
        <div className="relative w-48 h-36">
          <Image 
            src="/assets/images/illustrations/page-accueil/paq-chick.png" 
            alt="frite" 
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
        </Motion>
      </div>
    </div>
  );
}
