import Image from 'next/image';

const serviceItems = [
    {id:1, name:"Qualité sans compromis", surname:"Nous sélectionnons rigoureusement nos ingrédients", picture:"assets/images/illustrations/histoire/icone-1.png"},
    {id:2, name:"Innovation culinaire", surname:"Nos recettes sont régulièrement renouvelées", picture:"assets/images/illustrations/histoire/icone-2.png"},
    {id:3, name:"Service attentionné", surname:"Notre équipe est formée pour vous offrir le meilleur accueil", picture:"assets/images/illustrations/histoire/icone-3.png"},
]

export default function Quality(){
    return(
        <div className="bg-white px-4 py-10 my-8 flex flex-col justify-center gap-6 items-center">
            <div className="font-title text-4xl">DES VALEURS QUI <span className="text-primary">NOUS ANIMENT</span></div>
            <div className="bg-white relative flex gap-6 justify-center items-center">
                {serviceItems.map((item)=>(
                    <div key={item.id} className="bg-white flex flex-col p-4 justify-between items-center gap-4 rounded-2xl">
                        <div className="relative w-30 h-30">
                            <Image 
                                src={`/${item.picture}`} 
                                alt={item.name}
                                width={120}  
                                height={120} 
                                className="object-contain"
                            />
                        </div>
                        <div className="text-center text-xl text-primary font-semibold">{item.name}</div>
                        <div className="text-center text-sm text-black">{item.surname}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}