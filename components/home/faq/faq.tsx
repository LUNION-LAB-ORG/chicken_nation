"use client";

import AccordionComponent from "./accordion";


export default function Faq(){
    return(
        <div className="p-6 m-4">
            <div className="text-center font-title text-primary text-5xl font-bold pt-10 mb-16">FOIRE AUX QUESTIONS</div>
            <div className="flex justify-between items-center text-center gap-6">
                <div className="text-primary-900 text-center">Touvez des réponses aux questions courantes de notre section FAQ</div>
                <AccordionComponent/>
            </div>
        </div>
    );
}