// import Image from 'next/image';

const Items = [
    {
        id: "1", 
        text: "Les meilleures",
        name: "444davs_",
        picture: "assets/images/illustrations/page-accueil/frite-2.png"
    },
    {
        id: "2", 
        text: "Vous êtes top j'ai beaucoup aimé délicieux continuer ainsi merci e €",
        name: "ass_bing",
        picture: "assets/images/illustrations/page-accueil/frite-2.png"
    },
    {
        id: "3", 
        text: "Merveilleux poulets gros bien croustillants cuisinés avec une touche d'originalité culinaire parfait",
        name: "Niako Dally",
        picture: "assets/images/illustrations/page-accueil/frite-2.png"
    },
];

export default function Testimonial() {
    return (
        <div className="bg-primary-50 overflow-hidden px-4 py-16 xl:p-20">
            <div className="container mx-auto px-4">
                <div className="text-center font-title text-primary text-4xl md:text-5xl font-bold pt-10 mb-16 fade-in">
                    FEEDBACK DES CONSOMMATEURS
                </div>

                {/* Conteneur de défilement horizontal uniquement sur mobile */}
                <div className="overflow-x-auto md:overflow-x-hidden hide-scroll smooth-scroll pb-4 flex snap-x">
                    <div className="flex gap-6 snap-x snap-mandatory">
                        {Items.map((list) => (
                            <div
                                key={list.id}
                                className="relative bg-white flex flex-col gap-6 justify-between text-start items-start m-8 p-2 rounded-2xl overflow-hidden min-w-[280px] md:min-w-[350px] lg:min-w-[400px] transition-transform duration-300"
                            >
                                <div className="text-primary pl-4">
                                    ★★★★<span className="text-gray-400">★</span>
                                </div>
                                <div>{list.text}</div>
                                <div>
                                    <div>{list.name}</div>
                                </div>
                                {/* <Image
                                    src={`/${list.picture}`}
                                    alt="frite"
                                    width={100}
                                    height={100}
                                    className="absolute bottom-0 right-0 overflow-hidden"
                                /> */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
