import mongoose from "mongoose";

const db = async() => {
    
    try {
        const connectionURL = `mongodb+srv://aasifiqbal3000:XLIpjpExPH9mKj8p@bookmydoc.vu6ea.mongodb.net/?retryWrites=true&w=majority&appName=BookMyDoc`;
        
        const localURL = `mongodb://localhost:27017/BookMyDoc`;
        
        const dbConnection = await mongoose.connect(localURL);   
        // const dbConnection = await mongoose.connect(connectionURL);   
        
        return dbConnection; 
    } catch (error) {
        console.log(error);
        process.exit(1);
    }        
}

export default db;