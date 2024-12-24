// backend/validations/registrationFormValidation.js

const { z } = require('zod');

const dobSchema = z.object({
  day: z.string().length(2, { message: "Day must be 2 digits" }),
  month: z.string().length(2, { message: "Month must be 2 digits" }),
  year: z.string().length(4, { message: "Year must be 4 digits" }),
  in_words: z.string().nonempty({ message: "Date of birth in words is required" })
});

const siblingDetailsSchema = z.object({
  name: z.string().nonempty({ message: "Sibling name is required when sibling is studying" }),
  class: z.string().nonempty({ message: "Sibling class is required when sibling is studying" })
}).optional();

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: "Password must include uppercase, lowercase, and number" }),
  class: z.string().nonempty({ message: "Class is required" }),
  dated: z.string().refine(date => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  student_name: z.string().nonempty({ message: "Student name is required" }),
  dob: dobSchema, 
  school_last_attended: z.string().nonempty({ message: "Last school attended is required" }),
  father_name: z.string().nonempty({ message: "Father's name is required" }),
  father_profession: z.string().nonempty({ message: "Father's profession is required" }),
  mother_name: z.string().nonempty({ message: "Mother's name is required" }),
  mother_profession: z.string().nonempty({ message: "Mother's profession is required" }),
  guardian_name: z.string().optional(),
  guardian_profession: z.string().optional(),
  monthly_income: z.string().optional(),
  
  father_contact: z.string()
    .min(10, { message: "Father contact must be at least 10 digits" })
    .max(15, { message: "Father contact must be at most 15 digits" })
    .regex(/^\d+$/, { message: "Father contact must contain only digits" }),
  
  mother_contact: z.string()
    .min(10, { message: "Mother contact must be at least 10 digits" })
    .max(15, { message: "Mother contact must be at most 15 digits" })
    .regex(/^\d+$/, { message: "Mother contact must contain only digits" })
    .optional(),
  
  father_qualification: z.string().optional(),
  mother_qualification: z.string().optional(),
  residence: z.string().nonempty({ message: "Residence is required" }),
  village: z.string().nonempty({ message: "Village is required" }),
  tehsil: z.string().nonempty({ message: "Tehsil is required" }),
  district: z.string().nonempty({ message: "District is required" }),
  
  sibling_studying: z.boolean().optional(),
  
  sibling_details: siblingDetailsSchema.refine((data, context) => {
    if (context?.parent?.sibling_studying && !data) {
      return false;
    }
    return true;
  }, {
    message: "Sibling details are required if sibling is studying",
    path: ["sibling_details"]
  }),
  
  pen_no: z.string().optional(),
  blood_group: z.string().optional()
});

module.exports = registerSchema;
