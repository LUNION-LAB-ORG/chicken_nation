import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_sasybe9';
const EMAILJS_TEMPLATE_ID = 'template_syx5wbf';
const EMAILJS_PUBLIC_KEY = 'riYd5sEOr1V2Ty_xU';

export async function sendOrderEmail(values: any) {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID!,
      EMAILJS_TEMPLATE_ID!,
      {
        to_email: values.phone,
        from_name: 'AstraOne',
        to_name: values.name,
        message: ` nouveau message de ${values.name}
        

subject:
${values.subject}

message:
 ${values.message}

Téléphone: ${values.phone}

email: ${values.email}
`,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response;
  } 
  catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}