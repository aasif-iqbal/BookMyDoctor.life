import { userSchema } from '../helpers/validators.js';

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
};  

export { validateUser };
