import { connect } from 'mongoose';
import { mongoURI } from './config.js';
import { logger } from './logger.js';

export const connectdb = async  () => {
    let count = 0
    console.log("---->", mongoURI)
    try{
        logger.info("Connecting to MongoDB...");
        await connect(mongoURI, { autoIndex: false });
        logger.info("connected successfully!!!"); 
    }
    catch(e){
        logger.error(`DBerror: ${e.message}`);
        if (count < 5)
        {
            count += 1
            setTimeout(() => connectdb(),5000)
        }
        
    }
};
