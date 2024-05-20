const mongoose = require('mongoose');

function mongoDbConfig() {
    try {
        mongoose.connect('mongodb+srv://blackedg6969:blackedg6969@cluster0.lfalu9x.mongodb.net/starDb?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
    } catch (error) {
        console.error('Error in mongoDbConfig:', error);
    }
}

module.exports = mongoDbConfig;
