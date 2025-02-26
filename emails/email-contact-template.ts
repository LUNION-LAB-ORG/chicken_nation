import React from "react";

interface EmailTemplateProps {
    nom: string;
    prenom: string;
    email: string;
    tel: number;
    message: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = async ({ nom, prenom, email, tel, message }) => {
  return (
    
  );
};
