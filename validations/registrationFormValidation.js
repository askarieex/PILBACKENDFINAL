const { z } = require('zod');

const dobSchema = z.object({
  day: z.string().length(2, "Day must be 2 digits"),
  month: z.string().length(2, "Month must be 2 digits"),
  year: z.string().length(4, "Year must be 4 digits"),
  in_words: z.string().nonempty("Date of birth in words is required")
});

const siblingDetailsSchema = z.object({
  name: z.string().nonempty("Sibling name is required when sibling is studying"),
  class: z.string().nonempty("Sibling class is required when sibling is studying")
}).optional();

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  class: z.string().optional(),
  dated: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid date"),
  student_name: z.string().nonempty("Student name is required"),
  dob: dobSchema, 
  school_last_attended: z.string().optional(),
  father_name: z.string().nonempty("Father's name is required"),
  father_profession: z.string().optional(),
  mother_name: z.string().nonempty("Mother's name is required"),
  mother_profession: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_profession: z.string().optional(),
  monthly_income: z.string().optional(),
  father_contact: z.string().min(10).max(15),
  mother_contact: z.string().min(10).max(15).or(z.literal('')).optional(),
  father_qualification: z.string().optional(),
  mother_qualification: z.string().optional(),
  residence: z.string().nonempty("Residence is required"),
  village: z.string().nonempty("Village is required"),
  tehsil: z.string().nonempty("Tehsil is required"),
  district: z.string().nonempty("District is required"),
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
