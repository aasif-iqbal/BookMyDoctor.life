// import bcrypt from "bcrypt";
const signIn = async (req, res) => {
    
    try {
        const { username, password, email } = req.body;
        console.log(username, password, email);
    } catch (error) {
        console.log(error);
    }
};

const signUp = (req, res) => {
    res.send("Sign Up");
};  

export { signIn, signUp };