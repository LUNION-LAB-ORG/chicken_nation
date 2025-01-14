

const serviceItems = [
    {id:1, name:"Passez une commande", picture:"assets/images/illustrations/page-accueil/repas-1.png"},
    {id:2, name:"Réservez une table", picture:"assets/images/illustrations/page-accueil/repas-2.png"},
    {id:3, name:"Trouver un restaurant", picture:"assets/images/illustrations/page-accueil/repas-3.png"},
]

export default function Service(){
    return(
        <div className="bg-primary-50 px-4 py-6 my-8 relative flex gap-4 justify-around items-center">
            {serviceItems.map((item)=>(
                <div key={item.id} className="bg-white flex flex-col p-4 justify-between items-center gap-4 rounded-2xl">
                    <img src={item.picture} alt={item.name} className="w-30 h-30"/>
                    <div className="text-center text-xl text-primary-900">{item.name}</div>
                </div>
            ))}
        </div>
    );
}