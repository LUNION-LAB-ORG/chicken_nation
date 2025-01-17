import { Button } from "@nextui-org/react";


export default function Team(){
    return (
        <div className="flex flex-col gap-4 p-6 m-4">
        <div className="font-title text-3xl text-center text-primary my-8">NOTRE EQUIPE</div>
        <div className="flex flex-row justify-between gap-4">
            <div className="">
                <img src="assets/images/illustrations/histoire/histoire-4.png" alt="histoire-4" className="object-contain h-full w-full" />
            </div>
            <div className="flex flex-col justify-around gap-8">
                <div className="flex flex-col gap-8">
                    <div className="text-primary text-lg font-semibold">Une Famille Passionnée</div>
                    <div>
                    Derrière chaque burger et chaque plat se cache une équipe de 15<br /> travaillent main dans la main pour vous garantir une expérience <br /> unique à chaque visite.
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="text-primary text-lg font-semibold">Formation Continue</div>
                    <div>
                    Nous investissons dans la formation régulière de notre personnel <br /> pour maintenir un niveau d'excellence constant. Chaque membre de <br /> notre équipe est un expert dans son domaine.
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}