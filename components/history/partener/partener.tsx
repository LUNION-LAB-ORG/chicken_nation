

const serviceItems = [
    {id:1, name:"TURBO DELIVERY", picture:"assets/images/illustrations/histoire/partenaire-1.png"},
    {id:2, name:"JUMIA FOOD", picture:"assets/images/illustrations/histoire/partenaire-2.png"},
    {id:3, name:"GLOVO", picture:"assets/images/illustrations/histoire/partenaire-3.png"},
    {id:4, name:"YANGO DELI", picture:"assets/images/illustrations/histoire/partenaire-4.png"},
]

export default function partener(){
    return(
        <div className="bg-primary-100 px-8 py-16 flex flex-col justify-center gap-6">
        <div className="font-title text-4xl text-center">NOS PARTENAIRES</div>
        <div className=" relative flex gap-6 justify-around items-center">
            {serviceItems.map((item)=>(
                <div key={item.id} className=" flex flex-col p-4 justify-between items-center gap-4 rounded-2xl">
                    <img src={item.picture} alt={item.name} className="w-30 h-30"/>
                    <div>{item.name}</div>
                </div>
            ))}
            
        </div>
        </div>
    );
}