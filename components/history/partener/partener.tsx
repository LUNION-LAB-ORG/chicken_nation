import Motion from '@/lib/motion';
import Image from 'next/image';

const serviceItems = [
    {id:1, name:"TURBO", picture:"assets/images/illustrations/histoire/partenaire-1.png"},
    {id:2, name:"GLOVO", picture:"assets/images/illustrations/histoire/partenaire-3.png"},
    {id:3, name:"YANGO DELIVERY", picture:"assets/images/illustrations/histoire/partenaire-4.png"},
]

export default function Partner() {  // Fixed capitalization for component name
    return(
        <div className="bg-primary-100 px-8 py-16 flex flex-col justify-center gap-6">
            <Motion variant="verticalSlideIn">
            <div className="font-title text-4xl text-center">NOS PARTENAIRES</div>
            </Motion>
            <Motion variant="verticalSlideIn">
            <div className="relative flex flex-row justify-center md:justify-evenly text-center gap-2 md:gap-6 items-center">
                {serviceItems.map((item)=>(
                    <div key={item.id} className="flex flex-col p-4 justify-between items-center gap-4 rounded-2xl">
                        <div className="relative w-30 h-30">
                            <Image 
                                src={`/${item.picture}`} 
                                alt={item.name}
                                width={120}  
                                height={120} 
                                className="object-contain"
                            />
                        </div>
                        <div>{item.name}</div>
                    </div>
                ))}
            </div>
            </Motion>
        </div>
    );
}