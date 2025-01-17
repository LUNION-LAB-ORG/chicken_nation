

const Items = [
    {
        id:"1", 
        text:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Qui animi quas dolorem, sed harum adipisci voluptate fugit facere ex delectus distinctio impedit expedita necessitatibus molestiae libero! Eligendi omnis consequatur et.",
        name:"Paul Aka",
        picture:"assets/images/illustrations/page-accueil/frite-2.png"
    },
    {
        id:"2", 
        text:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Qui animi quas dolorem, sed harum adipisci voluptate fugit facere ex delectus distinctio impedit expedita necessitatibus molestiae libero! Eligendi omnis consequatur et.",
        name:"Paul Aka",
        picture:"assets/images/illustrations/page-accueil/frite-2.png"
    },
    {
        id:"3", 
        text:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Qui animi quas dolorem, sed harum adipisci voluptate fugit facere ex delectus distinctio impedit expedita necessitatibus molestiae libero! Eligendi omnis consequatur et.",
        name:"Paul Aka",
        picture:"assets/images/illustrations/page-accueil/frite-2.png"
    },
]


export default function Testimonial(){
    return(
        <div className="bg-primary-50">
            <div className="text-center font-title text-primary text-5xl font-bold pt-10 mb-16">FEEDBACK DES CONSOMMATEURS</div>
            <div className="flex justify-center">
            {Items.map((list)=>(
                <div key={list.id} className="relative bg-white flex flex-col gap-6 justify-between text-start items-start m-8 p-2 rounded-2xl">
                <div className="text-primary pl-4">★★★★<span>★</span></div>
                <div>{list.text}</div>
                <div>
                    <div>{list.name}</div>
                </div>
                <img src={list.picture} alt="frite" className="absolute bottom-0 right-0 overflow-hidden" /> 
            </div>
            ))}
            </div>
        </div>
    );
}