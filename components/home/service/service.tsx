import Image from 'next/image';

const serviceItems = [
    {id: 1, name: "Passez une commande", picture: "assets/images/illustrations/page-accueil/repas-1.png"},
    {id: 2, name: "Réservez une table", picture: "assets/images/illustrations/page-accueil/repas-2.png"},
    {id: 3, name: "Trouver un restaurant", picture: "assets/images/illustrations/page-accueil/repas-3.png"},
];

export default function Service() {
    return (
        <div className="bg-primary-50 px-4 py-10 my-0 md:my-8 relative flex flex-col md:flex-row gap-6 justify-center items-center">
            {serviceItems.map((item) => (
                <div key={item.id} className="bg-white flex flex-col p-4 justify-between w-full md:w-auto items-center gap-4 rounded-2xl">
                    <div className="relative w-30 h-30">
                        <Image 
                            src={`/${item.picture}`} 
                            alt={item.name} 
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                    </div>
                    <div className="text-center text-xl text-primary-900">{item.name}</div>
                </div>
            ))}
            <div className="hidden md:block absolute bottom-0 left-0 mt-4">
                <div className="relative w-32 h-32">
                    <Image 
                        src="/assets/images/illustrations/page-accueil/frite-1.png" 
                        alt="frite" 
                        width={65}
                        height={65}
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    );
}