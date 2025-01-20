import Image from 'next/image';

export default function About(){
    return(
        <div className="flex flex-row justify-between gap-4 p-6 m-4">
            <div className="relative">
                <Image 
                    src="/assets/images/illustrations/histoire/histoire-1.png" 
                    alt="histoire-1" 
                    width={500}  
                    height={600} 
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-8">
                    <div className="font-title text-xl text-primary">A PROPOS DE CHICKEN NATION</div>
                    <div>
                    Fondé en 2020, <span className="font-title">CHICKEN NATION</span> est né d`&apos;`une passion partagée <br /> pour la cuisine rapide de qualité. Tout a commencé lorsque nos <br /> deux fondateurs, Marie et Thomas, ont décidé de révolutionner <br /> le concept du fast-food traditionnel. Leur vision : proposer une <br /> cuisine rapide mais authentique, où la qualité des produits prime.
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="font-title text-xl text-primary">LA VISION</div>
                    <div>
                    Une Nouvelle Approche du Fast-Food. <br />
                    Nous croyons qu`&apos;`un repas rapide peut aussi être un moment <br /> de plaisir gustatif. Notre mission est de vous servir une cuisine qui allie<br /> rapidité, qualité et authenticité, le tout dans une ambiance chaleureuse et moderne.
                    </div>
                </div>
            </div>
        </div>
    );
}