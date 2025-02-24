import ProgressComponent from "../progress/progress"
import Image from "next/image";

export default function Home(){
    return(
        <div className="bg-primary-200 min-h-screen w-full flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-4 flex flex-row justify-around items-stretch gap-4 h-2/5 w-3/4 m-8">
                <div className="flex flex-col justify-between w-2/3">
                    <div className="text-4xl font-bold text-primary flex flex-col gap-2"><div> Eh bien, tenez-vous prêts! </div>   <div className="mt-3">L&apos;application de commande <br /> sera bientôt disponible</div> 
                    </div>
                    <div className="text-2xl">Nous vous réservons bien de surprises.</div>
                    <div className="flex flex-col gap-0">
                        <div className="text-primary">Niveau de développement</div>
                        <ProgressComponent/>
                    </div>
                </div>
                <div className="object-contain">
                    <Image
                    src="/assets/images/illustrations/page-introuvable/commande.png"
                    alt="mobile"
                    height={80}
                    width={130}
                    // objectFit="contain"  
                    />
                </div>
            </div>
        </div>
    );
}