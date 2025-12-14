import { z } from "zod";

//test zod installation
export const emailValidator = z.string().email("Invalid email address");