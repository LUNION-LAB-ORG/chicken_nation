

const serviceItems = [
    {id:1, name:"Passez une commande", picture:"assets/images/illustrations/page-accueil/repas-1.png"},
    {id:2, name:"Réservez une table", picture:"assets/images/illustrations/page-accueil/repas-2.png"},
    {id:3, name:"Trouver un restaurant", picture:"assets/images/illustrations/page-accueil/repas-3.png"},
]

export default function Service(){
    return(
        <div className="bg-primary-50 px-4 py-10 my-0 md:my-8 relative flex flex-col md:flex-row gap-6 justify-center items-center">
            {serviceItems.map((item)=>(
                <div key={item.id} className="bg-white flex flex-col p-4 justify-between w-full md:w-auto items-center gap-4 rounded-2xl">
                    <img src={item.picture} alt={item.name} className="w-30 h-30"/>
                    <div className="text-center text-xl text-primary-900">{item.name}</div>
                </div>
            ))}
            <div className="hidden md:block absolute bottom-0 left-0 mt-4">
                <img src="assets/images/illustrations/page-accueil/frite-1.png" alt="frite" className=" w-full h-full" />
            </div>
        </div>
    );
}