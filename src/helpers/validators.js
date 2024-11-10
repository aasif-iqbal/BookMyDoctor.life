import Joi from "joi";

//Schema validation for Auth controller
const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required(),
    email: Joi.string().email().required()    
});

export { userSchema };
